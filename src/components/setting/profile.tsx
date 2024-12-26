"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { User, Phone, Mail, Briefcase, MapPin, Clock } from 'lucide-react'

interface Activity {
  date: string
  location: string
  time?: string
}

const recentActivity: Activity[] = [
  {
    date: "June 09, 2024",
    location: "Edo State, Benin City",
    time: "12:45pm"
  },
  {
    date: "June 04, 2024",
    location: "Edo State, Benin City"
  }
]

export function ProfilePage() {
  const [profileImage, setProfileImage] = useState("/placeholder.svg")

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setProfileImage(imageUrl)
    }
  }

  const handleImageRemove = () => {
    setProfileImage("/placeholder.svg")
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      {/* Profile Section */}
      <div className="flex flex-col sm:flex-row items-start gap-6">
        <Avatar className="w-32 h-32">
          <AvatarImage src={profileImage} alt="Profile picture" />
          <AvatarFallback>OE</AvatarFallback>
        </Avatar>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Olivia Eromosele</h2>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="default" 
              className="bg-indigo-700 hover:bg-indigo-800"
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              Change picture
            </Button>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <Button 
              variant="outline" 
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleImageRemove}
            >
              Remove picture
            </Button>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader className="bg-gray-100">
          <CardTitle>Personal information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 pt-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" />
                First name;
              </Label>
              <p className="text-lg">Olivia</p>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Last name;
              </Label>
              <p className="text-lg">Eromosele</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone number;
              </Label>
              <p className="text-lg">09022794720</p>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email;
              </Label>
              <p className="text-lg">olivia.eromos@talim.com</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Role;
            </Label>
            <p className="text-lg">Talim administrator</p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-6">
              {recentActivity.map((activity, index) => (
                <div key={index} className="relative pl-8">
                  <div className="absolute left-2.5 top-2 w-2 h-2 rounded-full bg-indigo-600 -translate-x-1/2" />
                  <div className="space-y-1">
                    <p className="font-medium text-indigo-600">{activity.date}</p>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {activity.location}
                    </div>
                    {activity.time && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        {activity.time}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

