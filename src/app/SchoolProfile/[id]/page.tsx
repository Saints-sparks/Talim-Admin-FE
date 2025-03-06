"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ArrowLeft, MapPin, Calendar, School2, User, Mail, Pencil, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { useToast } from "../../../types/use-toast"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

interface School {
  id: string
  name: string
  email: string
  contact: string
  location: string
  dateRegistered: string
  currentSession: string
  currentTerm: string
  termStartDate: string
  termEndDate: string
  nextTermStartDate: string
}

const formSchema = z.object({
  name: z.string().min(2, { message: "School name must be at least 2 characters." }),
  email: z.string().min(2, { message: "Email must be at least 2 characters." }),
  contact: z.string().min(2, { message: "Contact name must be at least 2 characters." }),
  location: z.string().min(2, { message: "Location must be at least 2 characters." }),
  currentSession: z.string().min(2, { message: "Current session must be at least 2 characters." }),
  currentTerm: z.string().min(2, { message: "Current term must be at least 2 characters." }),
  termStartDate: z.string().min(2, { message: "Term start date must be at least 2 characters." }),
  termEndDate: z.string().min(2, { message: "Term end date must be at least 2 characters." }),
  nextTermStartDate: z.string().min(2, { message: "Next term start date must be at least 2 characters." }),
})

export default function SchoolProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [school, setSchool] = useState<School | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      contact: "",
      location: "",
      currentSession: "",
      currentTerm: "",
      termStartDate: "",
      termEndDate: "",
      nextTermStartDate: "",
    },
  })

  useEffect(() => {
    // Simulate API call to get school data based on ID
    setIsLoading(true)
    setTimeout(() => {
      const schoolId = params.id as string

      // Generate school data based on ID
      let schoolData: School

      if (schoolId === "SIS-101") {
        schoolData = {
          id: "SIS-101",
          name: "Sapphire International School",
          email: "SIS-101",
          contact: "Mr. Olumide Adebayo",
          location: "J73F+F4P, Idimu, Lagos",
          dateRegistered: "April 10, 2024",
          currentSession: "2022/2023",
          currentTerm: "1st term",
          termStartDate: "January 10, 2024",
          termEndDate: "January 10, 2024",
          nextTermStartDate: "January 10, 2024",
        }
      } else {
        // Generate data for other schools based on ID
        const schoolNumber = schoolId.split("-")[1] || "0"
        const cities = ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano"]
        const cityIndex = Number.parseInt(schoolNumber) % cities.length

        schoolData = {
          id: schoolId,
          name: `School ${schoolNumber}`,
          email: `SCH-${schoolNumber}`,
          contact: `Principal ${schoolNumber}`,
          location: `Location ${schoolNumber}, ${cities[cityIndex]}`,
          dateRegistered: "April 10, 2024",
          currentSession: "2022/2023",
          currentTerm: "1st term",
          termStartDate: "January 10, 2024",
          termEndDate: "January 10, 2024",
          nextTermStartDate: "January 10, 2024",
        }
      }

      setSchool(schoolData)

      // Set form default values
      form.reset({
        name: schoolData.name,
        email: schoolData.email,
        contact: schoolData.contact,
        location: schoolData.location,
        currentSession: schoolData.currentSession,
        currentTerm: schoolData.currentTerm,
        termStartDate: schoolData.termStartDate,
        termEndDate: schoolData.termEndDate,
        nextTermStartDate: schoolData.nextTermStartDate,
      })

      setIsLoading(false)
    }, 500)
  }, [params.id, form])

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    // Simulate API call to update school
    setTimeout(() => {
      // Update the school state with form values
      setSchool((prev) => {
        if (!prev) return null
        return {
          ...prev,
          ...values,
        }
      })

      setIsEditing(false)
      setIsLoading(false)

      toast({
        description: "School information updated successfully.",
      })
    }, 1000)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading school information...</p>
        </div>
      </div>
    )
  }

  if (!school) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">School Not Found</h2>
          <p className="text-muted-foreground">The school you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {isEditing ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit School
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 bg-purple-100">
            <AvatarFallback className="bg-purple-100 text-purple-700 text-xl">
              {school.name
                .split(" ")
                .map((word) => word[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold">{school.name}</h1>
            <p className="text-muted-foreground">{school.id}</p>
          </div>
        </div>
      </div>

      {isEditing ? (
        <Form {...form}>
          <form className="space-y-6">
            <Card>
              <CardHeader className="bg-gray-100 px-6 py-4">
                <h2 className="text-lg font-semibold">School Overview</h2>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6 p-6">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex gap-2">
                          <School2 className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                          <div className="w-full">
                            <FormLabel>School name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Mail className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">School ID</p>
                      <p className="font-medium">{school.id}</p>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex gap-2">
                          <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                          <div className="w-full">
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="contact"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex gap-2">
                          <User className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                          <div className="w-full">
                            <FormLabel>Primary contact</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex gap-2">
                          <Mail className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                          <div className="w-full">
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date registered</p>
                      <p className="font-medium">{school.dateRegistered}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-gray-100 px-6 py-4">
                <h2 className="text-lg font-semibold">Academic Session</h2>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6 p-6">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="currentSession"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex gap-2">
                          <School2 className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                          <div className="w-full">
                            <FormLabel>Current session</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="termStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex gap-2">
                          <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                          <div className="w-full">
                            <FormLabel>Term start date</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nextTermStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex gap-2">
                          <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                          <div className="w-full">
                            <FormLabel>Next term start date</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="currentTerm"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex gap-2">
                          <School2 className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                          <div className="w-full">
                            <FormLabel>Current term</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="termEndDate"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex gap-2">
                          <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                          <div className="w-full">
                            <FormLabel>Term end date</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader className="bg-gray-100 px-6 py-4">
              <h2 className="text-lg font-semibold">School Overview</h2>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6 p-6">
              <div className="space-y-6">
                <div className="flex gap-2">
                  <School2 className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">School name</p>
                    <p className="font-medium">{school.name}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">School ID</p>
                    <p className="font-medium">{school.id}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{school.location}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex gap-2">
                  <User className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Primary contact</p>
                    <p className="font-medium">{school.contact}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{school.email}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date registered</p>
                    <p className="font-medium">{school.dateRegistered}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-gray-100 px-6 py-4">
              <h2 className="text-lg font-semibold">Academic Session</h2>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6 p-6">
              <div className="space-y-6">
                <div className="flex gap-2">
                  <School2 className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Current session</p>
                    <p className="font-medium">{school.currentSession}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Term start date</p>
                    <p className="font-medium">{school.termStartDate}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Next term start date</p>
                    <p className="font-medium">{school.nextTermStartDate}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex gap-2">
                  <School2 className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Current term</p>
                    <p className="font-medium">{school.currentTerm}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Term end date</p>
                    <p className="font-medium">{school.termEndDate}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

