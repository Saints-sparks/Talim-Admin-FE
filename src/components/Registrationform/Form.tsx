"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingModal } from "@/components/ui/loading-modal"
import { UploadProgress } from "@/components/ui/upload-progress"
import type { School } from "@/app/services/school.service"
import { FormHeader } from "./FormHeader"
import { LogoUpload } from "./LogoUpload"
import { PrimaryContactFields } from "./PrimaryContactFields"
import { SchoolDetailsFields } from "./SchoolDetailsFields"
import { useSchoolRegistration } from "./useSchoolRegistration"

interface SchoolRegistrationFormProps {
  mode?: "create" | "edit"
  initialData?: School
  schoolId?: string
}

/**
 * Registers a school or edits one: general information with the logo, and the
 * primary contacts. Submit uploads a newly picked logo, then saves.
 *
 * @param props.mode - "create" (default) or "edit".
 * @param props.initialData - The school being edited.
 * @param props.schoolId - Its id, required to save an edit.
 */
export function SchoolRegistrationForm({ mode = "create", initialData, schoolId }: SchoolRegistrationFormProps) {
  const form = useSchoolRegistration({ mode, initialData, schoolId })

  return (
    <form onSubmit={form.handleSubmit} className="container mx-auto p-6 space-y-6">
      <LoadingModal
        isOpen={form.isLoading && !form.showUploadProgress}
        message={mode === "edit" ? "Saving changes…" : "Registering school…"}
      />
      {form.showUploadProgress && (
        <UploadProgress
          progress={form.uploadProgress}
          status={form.uploadStatus}
          errorMessage={form.uploadError}
        />
      )}

      <FormHeader mode={mode} isLoading={form.isLoading} onBack={() => form.router.back()} />

      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <LogoUpload
            previewUrl={form.previewUrl}
            inputRef={form.fileInputRef}
            onFileSelect={form.handleFileSelect}
            onRemove={form.handleRemoveLogo}
          />
          <SchoolDetailsFields values={form.formData} fieldErrors={form.fieldErrors} onChange={form.setField} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Primary Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <PrimaryContactFields contacts={form.formData.primaryContacts} onChange={form.setContactField} />
        </CardContent>
      </Card>
    </form>
  )
}
