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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { API_BASE_URL } from "@/app/lib/api/config"

// Nigerian states
const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
  "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
  "Yobe", "Zamfara",
]

// File upload constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

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

  const validateFile = (file: File): string | null => {
    if (!file) return "No file selected";
    
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return "File type not supported. Please upload a JPEG, PNG, GIF, or WebP image.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return `File is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`;
    }

    return null;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Store the file for later upload
    setSelectedFile(file);

    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleRemoveLogo = () => {
    setPreviewUrl("")
    setSelectedFile(null)
    setFormData(prev => ({ ...prev, schoolLogo: "" }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      setShowUploadProgress(true)
      setUploadStatus('uploading')
      setUploadProgress(0)
      setUploadError(undefined)

      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      xhr.onload = () => {
        try {
          if (xhr.status === 0) {
            setUploadStatus('error')
            setUploadError('Network error occurred. Please check your connection.')
            reject(new Error('Network error occurred'))
            return
          }

          const response = JSON.parse(xhr.responseText);
          console.log('Upload response:', response);

          if (xhr.status >= 200 && xhr.status < 300 && response.url) {
            setUploadStatus('success')
            setTimeout(() => {
              setShowUploadProgress(false)
            }, 1000)
            resolve(response.url);
          } else {
            setUploadStatus('error')
            setUploadError(response.message || 'Upload failed')
            reject(new Error(response.message || 'Upload failed'));
          }
        } catch (error) {
          console.error('Response parsing error:', xhr.responseText);
          setUploadStatus('error')
          setUploadError('Invalid server response')
          reject(new Error('Invalid response format'));
        }
      };

      xhr.onerror = () => {
        setUploadStatus('error')
        setUploadError('Network error occurred. Please check your connection.')
        reject(new Error('Network error occurred'));
      };

      xhr.open('POST', `${API_BASE_URL}/upload/image`);
      xhr.send(formData);
    });
  };

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
    
    try {
      setIsLoading(true)
      
      // Upload image if selected
      let logoUrl = formData.schoolLogo;
      if (selectedFile) {
        try {
          logoUrl = await uploadImage(selectedFile);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
          toast.error(errorMessage);
          return;
        }
      } else if (!formData.schoolLogo) {
        toast.error('Please select a school logo');
        return;
      }

      const payload = {
        name: formData.schoolName,
        email: formData.emailAddress,
        physicalAddress: formData.physicalAddress,
        location: {
          country: "Nigeria",
          state: formData.state
        },
        schoolPrefix: formData.schoolPrefix,
        primaryContacts: formData.primaryContacts,
        active: initialData?.active ?? true,
        logo: logoUrl
      }

      console.log('Submitting payload:', payload)

      let response;
      if (mode === 'edit' && schoolId) {
        response = await schoolService.updateSchool(schoolId, payload);
        toast.success('School updated successfully!');
      } else {
        response = await fetch(`${API_BASE_URL}/schools/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create school');
        }

        toast.success('School registered successfully!');
      }

      router.push('/talimschool')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process school'
      toast.error(errorMessage)
      console.error('Form submission error:', error)
    } finally {
      setIsLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="container mx-auto p-6 space-y-6">
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
    className="w-full md:w-auto bg-indigo-700 hover:bg-indigo-800"
  >
    {mode === 'edit' ? 'Save Changes' : 'Register School'}
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
            <span className="text-indigo-600 hover:underline">browse</span>
          </p>
          <p className="text-xs text-gray-500">
            JPEG, PNG, GIF, or WebP (max. {MAX_FILE_SIZE / 1024 / 1024}MB)
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
          placeholder="Enter school's name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="schoolPrefix">School Prefix*</Label>
        <Input
          id="schoolPrefix"
          value={formData.schoolPrefix}
          onChange={e => setFormData(prev => ({ ...prev, schoolPrefix: e.target.value }))}
          placeholder="Enter school prefix"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="emailAddress">School Email Address*</Label>
        <Input
          id="emailAddress"
          type="email"
          value={formData.emailAddress}
          onChange={e => setFormData(prev => ({ ...prev, emailAddress: e.target.value }))}
          placeholder="Enter school's email address"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="physicalAddress">Physical Address*</Label>
        <Input
          id="physicalAddress"
          value={formData.physicalAddress}
          onChange={e => setFormData(prev => ({ ...prev, physicalAddress: e.target.value }))}
          placeholder="Enter physical address"
          required
        />
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

