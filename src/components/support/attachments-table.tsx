import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, FileText, Image, Video, File } from "lucide-react"
import type { Attachment } from "@/types/support"

interface AttachmentsTableProps {
  attachments: Attachment[]
}

export function AttachmentsTable({ attachments }: AttachmentsTableProps) {
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox />
          </TableHead>
          <TableHead className="text-black">File name</TableHead>
          <TableHead className="text-black">File size</TableHead>
          <TableHead className="text-black">Date uploaded</TableHead>
          <TableHead className="w-12"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {attachments.map((attachment) => (
          <TableRow key={attachment.id}>
            <TableCell>
              <Checkbox />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                {getFileIcon(attachment.type)}
                <div>
                  <div className="font-medium">{attachment.fileName}</div>
                  <div className="text-sm text-muted-foreground">{attachment.fileSize}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>{attachment.fileSize}</TableCell>
            <TableCell>{attachment.dateUploaded}</TableCell>
            <TableCell>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

