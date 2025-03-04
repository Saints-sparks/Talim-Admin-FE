"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ProfileImageProps {
  name: string
  image?: string
  onImageChange: (image?: string) => void
}

export function ProfileImage({ name, image, onImageChange }: ProfileImageProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        onImageChange(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="h-32 w-32">
        <AvatarImage src={image || "/placeholder.svg"} alt={name} />
        <AvatarFallback className="text-4xl">{name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex gap-2">
        <Button
          variant="default"
          className="bg-indigo-700 hover:bg-indigo-600"
          onClick={() => setIsOpen(true)}
        >
          Change picture
        </Button>
        <Button
          variant="outline"
          className="text-red-500 hover:text-red-600"
          onClick={() => onImageChange(undefined)}
        >
          Remove picture
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change profile picture</DialogTitle>
            <DialogDescription>
              Choose a new profile picture to upload
            </DialogDescription>
          </DialogHeader>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full"
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

