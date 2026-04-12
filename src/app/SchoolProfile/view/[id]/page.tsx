"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { School, schoolService } from "@/app/services/school.service"
import { LoadingModal } from "@/components/ui/loading-modal"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Mail, MapPin, Phone, User } from "lucide-react"
import { useNavigationLoading } from "@/app/context/NavigationLoadingContext"

const DEFAULT_SCHOOL_LOGO = "/default-school-logo.png" // You'll need to add this image to your public folder

interface ViewSchoolProps {
  id: string
}

function ViewSchoolContent({ id }: ViewSchoolProps) {
  const router = useRouter()
  const [school, setSchool] = useState<School | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const { setIsNavigating } = useNavigationLoading()

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const data = await schoolService.getSchool(id)
        setSchool(data)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch school details'
        toast.error(errorMessage)
        router.push('/talimschool')
      } finally {
        setIsLoading(false)
        setIsNavigating(false)
      }
    }

    fetchSchool()
  }, [id, router, setIsNavigating])

  const handleEditClick = () => {
    setIsNavigating(true)
    router.push(`/SchoolProfile/${school?._id}`)
  }

  const handleBackClick = () => {
    setIsNavigating(true)
    router.back()
  }

  if (isLoading) {
    return <LoadingModal isOpen={true} message="Loading school details..." />
  }

  if (!school) {
    return null
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={handleBackClick} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div>
          <h1 className="text-2xl font-bold">School Details</h1>
          <p className="text-muted-foreground">View school information</p>
        </div>
        
        <Button 
          onClick={handleEditClick}
          className="bg-[#002244] hover:bg-[#002244]"
        >
          Edit School
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Logo and Basic Info */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>School Logo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="relative w-48 h-48">
              <Image
                src={imageError || !school.logo ? DEFAULT_SCHOOL_LOGO : school.logo}
                alt={school.name}
                fill
                className="object-contain"
                onError={() => setImageError(true)}
              />
            </div>
            <Badge 
              variant={school.active ? "default" : "destructive"}
              className={school.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
            >
              {school.active ? "Active" : "Inactive"}
            </Badge>
          </CardContent>
        </Card>

        {/* School Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>School Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">School Name</p>
                <p className="font-medium">{school.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">School Prefix</p>
                <p className="font-medium">{school.schoolPrefix}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{school.email}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Location</p>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{school.location.state}, {school.location.country}</p>
                </div>
              </div>
              <div className="md:col-span-2 space-y-1">
                <p className="text-sm text-muted-foreground">Physical Address</p>
                <p className="font-medium">{school.physicalAddress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Primary Contacts */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Primary Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {school.primaryContacts.map((contact, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.role}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{contact.phone}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{contact.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Registration Info */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Registration Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Created At</p>
                <p className="font-medium">
                  {new Date(school.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">
                  {new Date(school.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Page component that receives the params
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  return <ViewSchoolContent id={id} />
} 