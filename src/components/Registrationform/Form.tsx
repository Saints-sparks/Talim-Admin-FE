"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Upload } from 'lucide-react'

// Nigerian states
const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
  "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
  "Yobe", "Zamfara"
]

const ACADEMIC_YEARS = ["2023/2024", "2024/2025", "2025/2026"]
const TERMS = ["First Term", "Second Term", "Third Term"]

interface FormData {
  schoolLogo: string
  schoolName: string
  schoolId: string
  emailAddress: string
  principalName: string
  location: string
  state: string
  academicYear: string
  term: string
  primaryClasses: string
  secondaryClasses: string
}

export function SchoolRegistrationForm() {
  const [formData, setFormData] = useState<FormData>({
    schoolLogo: "",
    schoolName: "",
    schoolId: "10021",
    emailAddress: "",
    principalName: "",
    location: "",
    state: "",
    academicYear: "",
    term: "",
    primaryClasses: "",
    secondaryClasses: ""
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
        setFormData(prev => ({ ...prev, schoolLogo: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the formData to your backend
    console.log("Form submitted:", formData)
    
    // Reset form
    setFormData({
      schoolLogo: "",
      schoolName: "",
      schoolId: "10021",
      emailAddress: "",
      principalName: "",
      location: "",
      state: "",
      academicYear: "",
      term: "",
      primaryClasses: "",
      secondaryClasses: ""
    })
    setPreviewUrl("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <form onSubmit={handleSubmit} className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">New School Information</h1>
          <p className="text-muted-foreground">Edit school information here</p>
        </div>
        <Button type="submit" className="bg-indigo-700 hover:bg-indigo-800">
          Register School
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Upload */}
          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 max-w-[200px]">
            {previewUrl ? (
              <div className="relative w-full aspect-square">
                <Image
                  src={previewUrl}
                  alt="School logo preview"
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="text-center space-y-2">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <div className="text-sm">
                  Drop school&apos;s logo here or{" "}
                  <span 
                    className="text-indigo-600 cursor-pointer hover:underline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    browse
                  </span>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* School Details */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="schoolName">School Name*</Label>
              <Input
                id="schoolName"
                value={formData.schoolName}
                onChange={e => setFormData(prev => ({ ...prev, schoolName: e.target.value }))}
                placeholder="Enter school's name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schoolId">School ID</Label>
              <Input
                id="schoolId"
                value={formData.schoolId}
                onChange={e => setFormData(prev => ({ ...prev, schoolId: e.target.value }))}
                placeholder="10021"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailAddress">School email address</Label>
              <Input
                id="emailAddress"
                type="email"
                value={formData.emailAddress}
                onChange={e => setFormData(prev => ({ ...prev, emailAddress: e.target.value }))}
                placeholder="Enter school's email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="principalName">Principal / primary contact</Label>
              <Input
                id="principalName"
                value={formData.principalName}
                onChange={e => setFormData(prev => ({ ...prev, principalName: e.target.value }))}
                placeholder="Enter principal name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location*</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Enter school's location"
                required
              />
            </div>
            <div className="space-y-2 ">
              <Label htmlFor="state">State</Label>
              <Select 
                value={formData.state}
                onValueChange={value => setFormData(prev => ({ ...prev, state: value }))}
              >
                <SelectTrigger >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className=" bg-gray-300">
                  {NIGERIAN_STATES.map(state => (
                    <SelectItem className="hover:bg-gray-600" key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Academic session information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Which academic year is this for?</Label>
              <Select
                value={formData.academicYear}
                onValueChange={value => setFormData(prev => ({ ...prev, academicYear: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent className="bg-gray-300">
                  {ACADEMIC_YEARS.map(year => (
                    <SelectItem className="hover:bg-gray-600" key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>What term is it?</Label>
              <Select
                value={formData.term}
                onValueChange={value => setFormData(prev => ({ ...prev, term: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent className="bg-gray-300">
                  {TERMS.map(term => (
                    <SelectItem className="hover:bg-gray-600" key={term} value={term}>
                      {term}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Class information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primaryClasses">How many primary classes?</Label>
              <Input
                id="primaryClasses"
                type="number"
                value={formData.primaryClasses}
                onChange={e => setFormData(prev => ({ ...prev, primaryClasses: e.target.value }))}
                placeholder="Enter total number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryClasses">How many secondary classes?</Label>
              <Input
                id="secondaryClasses"
                type="number"
                value={formData.secondaryClasses}
                onChange={e => setFormData(prev => ({ ...prev, secondaryClasses: e.target.value }))}
                placeholder="Enter total number"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

