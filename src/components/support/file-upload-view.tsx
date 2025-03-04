import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FileText, Image, Video, File, X, Upload } from "lucide-react"
import type { Attachment } from "@/types/support"

interface FileUploadViewProps {
  onClose: () => void
  onUpload: (files: Attachment[]) => void
}

export function FileUploadView({ onClose, onUpload }: FileUploadViewProps) {
  const [uploadingFiles, setUploadingFiles] = useState<Attachment[]>([
    {
      id: "1",
      fileName: "Tech requirements.pdf",
      fileSize: "200 KB",
      sizeInBytes: 200000,
      dateUploaded: "Jan 4, 2022",
      type: "pdf",
    },
    {
      id: "2",
      fileName: "Dashboard screenshot.jpg",
      fileSize: "720 KB",
      sizeInBytes: 720000,
      dateUploaded: "Jan 4, 2022",
      type: "jpg",
    },
    {
      id: "3",
      fileName: "Dashboard prototype recording.mp4",
      fileSize: "16 MB",
      sizeInBytes: 16000000,
      dateUploaded: "Jan 2, 2022",
      type: "mp4",
    },
  ])

  const getFileIcon = (type: Attachment["type"]) => {
    switch (type) {
      case "pdf":
      case "docx":
        return <FileText className="h-5 w-5 text-blue-500" />
      case "jpg":
      case "png":
        return <Image className="h-5 w-5 text-green-500" />
      case "mp4":
        return <Video className="h-5 w-5 text-purple-500" />
      default:
        return <File className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Upload and attach files</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Upload and attach files to this project.</p>
        <div className="border-2 border-dashed rounded-lg p-6 text-center mb-4">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2">Click to upload or drag and drop</p>
          <p className="text-xs text-muted-foreground mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
        </div>
        <div className="space-y-2 mb-4">
          {uploadingFiles.map((file) => (
            <div key={file.id} className="flex items-center space-x-2 p-2 bg-muted rounded-md">
              {getFileIcon(file.type)}
              <div className="flex-1">
                <div className="text-sm font-medium">{file.fileName}</div>
                <div className="text-xs text-muted-foreground">{file.fileSize}</div>
                <Progress value={Math.random() * 100} className="h-1 mt-1" />
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onUpload(uploadingFiles)}>Attach files</Button>
        </div>
      </div>
    </div>
  )
}

