"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Upload, X } from "lucide-react"
import { LoadingModal } from "@/components/ui/loading-modal"
import { toast } from "sonner"
import { UploadProgress } from "@/components/ui/upload-progress"
import { School, schoolService } from "@/app/services/school.service"
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  uploadImage,
  validateImageFile,
} from "@/app/services/upload.service"
import { ApiError, getErrorMessage } from "@/lib/apiError"
import { queryKeys } from "@/lib/queryKeys"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useQueryClient } from "@tanstack/react-query"

// Nigerian states
const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
  "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
  "Yobe", "Zamfara",
]

interface FormData {
  schoolLogo: string
  schoolName: string
  schoolPrefix: string
  emailAddress: string
  physicalAddress: string
  state: string
  primaryContacts: Array<{
    name: string
    phone: string
    email: string
    role: string
  }>
}

interface SchoolRegistrationFormProps {
  mode?: 'create' | 'edit'
  initialData?: School
  schoolId?: string
}

export function SchoolRegistrationForm({ mode = 'create', initialData, schoolId }: SchoolRegistrationFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'uploading' | 'success' | 'error'>('uploading')
  const [uploadError, setUploadError] = useState<string | undefined>()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState<FormData>({
    schoolLogo: initialData?.logo || "",
    schoolName: initialData?.name || "",
    schoolPrefix: initialData?.schoolPrefix || "",
    emailAddress: initialData?.email || "",
    physicalAddress: initialData?.physicalAddress || "",
    state: initialData?.location.state || "",
    primaryContacts: initialData?.primaryContacts.map(contact => ({
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      role: contact.role
    })) || [
      {
        name: "",
        phone: "",
        email: "",
        role: ""
      }
    ]
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string>(initialData?.logo || "")
  const [showUploadProgress, setShowUploadProgress] = useState(false)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const problem = validateImageFile(file)
    if (problem) {
      toast.error(problem)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleRemoveLogo = () => {
    setPreviewUrl("")
    setSelectedFile(null)
    setFormData(prev => ({ ...prev, schoolLogo: "" }))
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handlePrimaryContactChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      primaryContacts: prev.primaryContacts.map((contact, i) => 
        i === index ? { ...contact, [field]: value } : contact
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    let logoUrl = formData.schoolLogo
    if (!selectedFile && !logoUrl) {
      toast.error("Add a school logo before saving.")
      return
    }

    setIsLoading(true)
    try {
      if (selectedFile) {
        setShowUploadProgress(true)
        setUploadStatus('uploading')
        setUploadProgress(0)
        setUploadError(undefined)
        try {
          logoUrl = await uploadImage(selectedFile, setUploadProgress)
          setUploadStatus('success')
          setTimeout(() => setShowUploadProgress(false), 1000)
        } catch (error) {
          setUploadStatus('error')
          setUploadError(getErrorMessage(error, 'The logo could not be uploaded.'))
          toast.error(getErrorMessage(error, 'The logo could not be uploaded.'))
          return
        }
      }

      // Exactly the fields CreateSchoolDto / UpdateSchoolDto declare — the API
      // runs forbidNonWhitelisted, so one extra key would be a 400.
      const base = {
        name: formData.schoolName,
        email: formData.emailAddress,
        physicalAddress: formData.physicalAddress,
        location: { country: "Nigeria", state: formData.state },
        primaryContacts: formData.primaryContacts,
        active: initialData?.active ?? true,
        logo: logoUrl,
      }

      if (mode === 'edit' && schoolId) {
        await schoolService.updateSchool(schoolId, base)
        toast.success('School updated')
      } else {
        await schoolService.createSchool({ ...base, schoolPrefix: formData.schoolPrefix })
        toast.success('School registered')
      }

      await queryClient.invalidateQueries({ queryKey: queryKeys.schools.all })
      router.push('/talimschool')
    } catch (error) {
      if (error instanceof ApiError && error.code === 'VALIDATION_FAILED') {
        setFieldErrors(error.fieldErrors())
      }
      toast.error(
        mode === 'edit' ? 'The school could not be updated' : 'The school could not be registered',
        { description: getErrorMessage(error) },
      )
    } finally {
      setIsLoading(false)
      setUploadProgress(0)
      setShowUploadProgress(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="container mx-auto p-6 space-y-6">
      <LoadingModal
        isOpen={isLoading && !showUploadProgress}
        message={mode === 'edit' ? 'Saving changes…' : 'Registering school…'}
      />
      {showUploadProgress && (
        <UploadProgress
          progress={uploadProgress}
          status={uploadStatus}
          errorMessage={uploadError}
        />
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
  {/* Back Button */}
  <Button 
    variant="outline" 
    onClick={() => router.back()} 
    className="w-full md:w-auto flex items-center justify-center"
  >
    <ArrowLeft className="mr-2 h-4 w-4" />
    Back
  </Button>

  {/* Title & Description (Center-Aligned on Mobile) */}
  <div className="text-center md:text-left">
    <h1 className="text-md md:text-2xl font-bold">
      {mode === 'edit' ? 'Edit School Information' : 'New School Information'}
    </h1>
    <p className="text-gray-500">
      {mode === 'edit' ? 'Update school details' : 'Register a new school'}
    </p>
  </div>

  {/* Submit Button */}
  <Button
    type="submit"
    disabled={isLoading}
    className="w-full md:w-auto bg-[#002244] hover:bg-[#002244] disabled:opacity-60"
  >
    {isLoading
      ? mode === 'edit' ? 'Saving…' : 'Registering…'
      : mode === 'edit' ? 'Save Changes' : 'Register School'}
  </Button>
</div>

<Card>
  <CardHeader>
    <CardTitle>General Information</CardTitle>
  </CardHeader>

  <CardContent className="space-y-6">
    {/* Logo Upload */}
    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 max-w-[200px] mx-auto relative">
      {previewUrl ? (
        <div className="relative w-full aspect-square">
          <Image
            src={previewUrl}
            alt="School logo preview"
            fill
            className="object-contain"
          />
          <button
            type="button"
            onClick={handleRemoveLogo}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label 
          htmlFor="logo-upload" 
          className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-center"
        >
          <Upload className="mx-auto h-8 w-8 text-gray-400" />
          <p className="text-sm">
            Drop school's logo here or{" "}
            <span className="text-[#003366] hover:underline">browse</span>
          </p>
          <p className="text-xs text-gray-500">
            JPEG, PNG, GIF, or WebP (max. {MAX_IMAGE_BYTES / 1024 / 1024}MB)
          </p>
        </label>
      )}
      <input
        id="logo-upload"
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>

    {/* School Details */}
    <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="schoolName">School Name*</Label>
        <Input
          id="schoolName"
          value={formData.schoolName}
          onChange={e => setFormData(prev => ({ ...prev, schoolName: e.target.value }))}
          aria-invalid={Boolean(fieldErrors.name)}
          placeholder="Enter school's name"
          required
        />
        {fieldErrors.name && <p className="text-xs text-red-500">{fieldErrors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="schoolPrefix">School Prefix*</Label>
        <Input
          id="schoolPrefix"
          value={formData.schoolPrefix}
          onChange={e => setFormData(prev => ({ ...prev, schoolPrefix: e.target.value }))}
          aria-invalid={Boolean(fieldErrors.schoolPrefix)}
          placeholder="Enter school prefix"
          required
        />
        {fieldErrors.schoolPrefix && <p className="text-xs text-red-500">{fieldErrors.schoolPrefix}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="emailAddress">School Email Address*</Label>
        <Input
          id="emailAddress"
          type="email"
          value={formData.emailAddress}
          onChange={e => setFormData(prev => ({ ...prev, emailAddress: e.target.value }))}
          aria-invalid={Boolean(fieldErrors.email)}
          placeholder="Enter school's email address"
          required
        />
        {fieldErrors.email && <p className="text-xs text-red-500">{fieldErrors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="physicalAddress">Physical Address*</Label>
        <Input
          id="physicalAddress"
          value={formData.physicalAddress}
          onChange={e => setFormData(prev => ({ ...prev, physicalAddress: e.target.value }))}
          aria-invalid={Boolean(fieldErrors.physicalAddress)}
          placeholder="Enter physical address"
          required
        />
        {fieldErrors.physicalAddress && <p className="text-xs text-red-500">{fieldErrors.physicalAddress}</p>}
      </div>

      <div className="space-y-2 relative">
  <Label htmlFor="state">State*</Label>
  <Select 
    value={formData.state}
    onValueChange={value => setFormData(prev => ({ ...prev, state: value }))}
  >
    <SelectTrigger className="z-10 relative">
      <SelectValue placeholder="Select state" />
    </SelectTrigger>
    <SelectContent className="absolute z-50 bg-white shadow-lg border rounded-md max-h-60 overflow-auto">
      {NIGERIAN_STATES.map(state => (
        <SelectItem key={state} value={state}>
          {state}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

    </div>
  </CardContent>
</Card>

<Card>
  <CardHeader>
    <CardTitle>Primary Contact Information</CardTitle>
  </CardHeader>
  <CardContent>
    {formData.primaryContacts.map((contact, index) => (
      <div key={index} className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 mb-6">
        <div className="space-y-2 max-w-lg">
          <Label htmlFor={`contactName${index}`}>Name*</Label>
          <Input
            id={`contactName${index}`}
            value={contact.name}
            onChange={e => handlePrimaryContactChange(index, 'name', e.target.value)}
            placeholder="Enter contact name"
            required
            className="w-full"
          />
        </div>
        <div className="space-y-2 max-w-lg">
          <Label htmlFor={`contactPhone${index}`}>Phone*</Label>
          <Input
            id={`contactPhone${index}`}
            value={contact.phone}
            onChange={e => handlePrimaryContactChange(index, 'phone', e.target.value)}
            placeholder="Enter phone number"
            required
            className="w-full"
          />
        </div>
        <div className="space-y-2 max-w-lg">
          <Label htmlFor={`contactEmail${index}`}>Email*</Label>
          <Input
            id={`contactEmail${index}`}
            type="email"
            value={contact.email}
            onChange={e => handlePrimaryContactChange(index, 'email', e.target.value)}
            placeholder="Enter email address"
            required
            className="w-full"
          />
        </div>
        <div className="space-y-2 max-w-lg">
          <Label htmlFor={`contactRole${index}`}>Role*</Label>
          <Input
            id={`contactRole${index}`}
            value={contact.role}
            onChange={e => handlePrimaryContactChange(index, 'role', e.target.value)}
            placeholder="Enter role"
            required
            className="w-full"
          />
        </div>
      </div>
    ))}
  </CardContent>
</Card>

    </form>
  )
}

