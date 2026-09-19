"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { schoolService, type School } from "@/app/services/school.service"
import { uploadImage, validateImageFile } from "@/app/services/upload.service"
import { ApiError, getErrorMessage } from "@/lib/apiError"
import { queryKeys } from "@/lib/queryKeys"
import {
  buildCreatePayload,
  buildSchoolPayload,
  initialFormValues,
  updateContact,
  type SchoolFormValues,
  type SchoolTextField,
} from "./schoolForm"

interface UseSchoolRegistrationArgs {
  mode: "create" | "edit"
  initialData?: School
  schoolId?: string
}

/**
 * The state and submit flow of the school registration form.
 *
 * A picked logo is uploaded first (with progress), then the school is created
 * or updated, the schools cache is invalidated and the page returns to the
 * schools list. A `VALIDATION_FAILED` response fills `fieldErrors` per field.
 *
 * @param args - Create or edit, the school being edited and its id.
 * @returns Form values and setters, logo handling, upload/submit state and handlers.
 */
export function useSchoolRegistration({ mode, initialData, schoolId }: UseSchoolRegistrationArgs) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"uploading" | "success" | "error">("uploading")
  const [uploadError, setUploadError] = useState<string | undefined>()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState<SchoolFormValues>(() => initialFormValues(initialData))
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string>(initialData?.logo || "")
  const [showUploadProgress, setShowUploadProgress] = useState(false)

  /** Sets one text field of the general-information card. */
  const setField = (field: SchoolTextField, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }))

  /** Sets one field of one primary contact. */
  const setContactField = (index: number, field: "name" | "phone" | "email" | "role", value: string) =>
    setFormData((prev) => ({ ...prev, primaryContacts: updateContact(prev.primaryContacts, index, field, value) }))

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const problem = validateImageFile(file)
    if (problem) {
      toast.error(problem)
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleRemoveLogo = () => {
    setPreviewUrl("")
    setSelectedFile(null)
    setFormData((prev) => ({ ...prev, schoolLogo: "" }))
    if (fileInputRef.current) fileInputRef.current.value = ""
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
        setUploadStatus("uploading")
        setUploadProgress(0)
        setUploadError(undefined)
        try {
          logoUrl = await uploadImage(selectedFile, setUploadProgress)
          setUploadStatus("success")
          setTimeout(() => setShowUploadProgress(false), 1000)
        } catch (error) {
          setUploadStatus("error")
          setUploadError(getErrorMessage(error, "The logo could not be uploaded."))
          toast.error(getErrorMessage(error, "The logo could not be uploaded."))
          return
        }
      }

      if (mode === "edit" && schoolId) {
        await schoolService.updateSchool(schoolId, buildSchoolPayload(formData, logoUrl, initialData?.active ?? true))
        toast.success("School updated")
      } else {
        await schoolService.createSchool(buildCreatePayload(formData, logoUrl))
        toast.success("School registered")
      }

      await queryClient.invalidateQueries({ queryKey: queryKeys.schools.all })
      router.push("/talimschool")
    } catch (error) {
      if (error instanceof ApiError && error.code === "VALIDATION_FAILED") {
        setFieldErrors(error.fieldErrors())
      }
      toast.error(
        mode === "edit" ? "The school could not be updated" : "The school could not be registered",
        { description: getErrorMessage(error) },
      )
    } finally {
      setIsLoading(false)
      setUploadProgress(0)
      setShowUploadProgress(false)
    }
  }

  return {
    router,
    formData,
    setField,
    setContactField,
    fieldErrors,
    isLoading,
    uploadProgress,
    uploadStatus,
    uploadError,
    showUploadProgress,
    previewUrl,
    fileInputRef,
    handleFileSelect,
    handleRemoveLogo,
    handleSubmit,
  }
}
