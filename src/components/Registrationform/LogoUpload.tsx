import Image from "next/image"
import { Upload, X } from "lucide-react"
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/app/services/upload.service"

interface LogoUploadProps {
  /** The logo to preview (a saved URL or a local object URL), or "". */
  previewUrl: string
  inputRef: React.RefObject<HTMLInputElement | null>
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void
  onRemove: () => void
}

/** The dashed logo box: a preview with a remove button, or the browse prompt. */
export function LogoUpload({ previewUrl, inputRef, onFileSelect, onRemove }: LogoUploadProps) {
  return (
    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 max-w-[200px] mx-auto relative">
      {previewUrl ? (
        <div className="relative w-full aspect-square">
          <Image src={previewUrl} alt="School logo preview" fill className="object-contain" />
          <button
            type="button"
            onClick={onRemove}
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
            Drop school&apos;s logo here or{" "}
            <span className="text-[#003366] hover:underline">browse</span>
          </p>
          <p className="text-xs text-gray-500">
            JPEG, PNG, GIF, or WebP (max. {MAX_IMAGE_BYTES / 1024 / 1024}MB)
          </p>
        </label>
      )}
      <input
        id="logo-upload"
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={onFileSelect}
      />
    </div>
  )
}
