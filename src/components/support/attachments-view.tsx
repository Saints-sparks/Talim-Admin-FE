"use client"

import { useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Download, Upload, MoreHorizontal, FileText, ImageIcon, Video, File } from "lucide-react"
import type { Attachment } from "@/types/support"

const mockAttachments: Attachment[] = [
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
  {
    id: "4",
    fileName: "Dashboard prototype FINAL.fig",
    fileSize: "4.2 MB",
    sizeInBytes: 4200000,
    dateUploaded: "Jan 6, 2022",
    type: "fig",
  },
  {
    id: "5",
    fileName: "UX Design Guidelines.docx",
    fileSize: "400 KB",
    sizeInBytes: 400000,
    dateUploaded: "Jan 8, 2022",
    type: "docx",
  },
  {
    id: "6",
    fileName: "Dashboard interaction.framex",
    fileSize: "12 MB",
    sizeInBytes: 12000000,
    dateUploaded: "Jan 6, 2022",
    type: "framex",
  },
  {
    id: "7",
    fileName: "App inspiration.png",
    fileSize: "800 KB",
    sizeInBytes: 800000,
    dateUploaded: "Jan 4, 2022",
    type: "png",
  },
]

const ITEMS_PER_PAGE = 5

export function AttachmentsView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

const handleUploadClick = () => {
  fileInputRef.current?.click()
}

const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = event.target.files
  if (!files) return

  for (const file of files) {
    console.log("Uploading:", file.name) // Handle file upload logic here
  }
}

  const getFileIcon = (type: Attachment["type"]) => {
    switch (type) {
      case "pdf":
      case "docx":
        return <FileText className="h-5 w-5 text-blue-500" />
      case "jpg":
      case "png":
        return <ImageIcon className="h-5 w-5 text-green-500" />
      case "mp4":
        return <Video className="h-5 w-5 text-purple-500" />
      default:
        return <File className="h-5 w-5 text-gray-500" />
    }
  }

  const filteredAttachments = mockAttachments.filter((attachment) =>
    attachment.fileName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const totalPages = Math.ceil(filteredAttachments.length / ITEMS_PER_PAGE)
  const paginatedAttachments = filteredAttachments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4 text-black" />
          Filters
        </Button>
        <div className="relative w-[300px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="border-[1px] border-dashed border-gray-200 rounded-lg">
        <div className="p-4 flex items-center justify-between border-b border-dashed">
          <h2 className="font-medium">Files uploaded</h2>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download all
            </Button>
            <Button className="gap-2" onClick={handleUploadClick}>
  <Upload className="h-4 w-4" />
  Upload
</Button>

<input
  type="file"
  ref={fileInputRef}
  multiple
  className="hidden"
  onChange={handleFileUpload}
/>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-b border-dashed">
              <TableHead className="w-12">
                <Checkbox />
              </TableHead>
              <TableHead>File name</TableHead>
              <TableHead>File size</TableHead>
              <TableHead>Date uploaded</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAttachments.map((attachment) => (
              <TableRow key={attachment.id} className="border-b border-dashed">
                <TableCell className="border-0">
                  <Checkbox />
                </TableCell>
                <TableCell className="border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      {getFileIcon(attachment.type)}
                    </div>
                    <div>
                      <div className="font-medium">{attachment.fileName}</div>
                      <div className="text-sm text-muted-foreground">{attachment.fileSize}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="border-0 text-gray-600">{attachment.fileSize}</TableCell>
                <TableCell className="border-0 text-gray-600">{attachment.dateUploaded}</TableCell>
                <TableCell className="border-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "secondary" : "ghost"}
              className={`h-8 w-8 p-0 ${currentPage === page ? "bg-blue-100 text-blue-700" : ""}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

