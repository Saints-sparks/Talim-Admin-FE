"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SchoolRegistrationForm } from "@/components/Registrationform/Form"
import { School, schoolService } from "@/app/services/school.service"
import { LoadingModal } from "@/components/ui/loading-modal"
import { toast } from "sonner"
import { useNavigationLoading } from "@/app/context/NavigationLoadingContext"

interface EditSchoolProps {
  id: string
}

function EditSchoolContent({ id }: EditSchoolProps) {
  const router = useRouter()
  const [school, setSchool] = useState<School | null>(null)
  const [isLoading, setIsLoading] = useState(true)
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

  if (isLoading) {
    return <LoadingModal isOpen={true} message="Loading school details..." />
  }

  if (!school) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="w-[100%] bg-gray-200">
        <SchoolRegistrationForm 
          mode="edit" 
          schoolId={id} 
          initialData={school}
        />
      </main>
    </div>
  )
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  return <EditSchoolContent id={id} />
}

