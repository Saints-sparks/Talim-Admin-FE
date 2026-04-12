"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { User, Phone, Mail, Briefcase, MapPin, Clock, Pencil } from "lucide-react";

interface Activity {
  date: string;
  location: string;
  time?: string;
}

const recentActivity: Activity[] = [
  {
    date: "June 09, 2024",
    location: "Edo State, Benin City",
    time: "12:45pm",
  },
  {
    date: "June 04, 2024",
    location: "Edo State, Benin City",
  },
];

export function ProfilePage() {
  const [profileImage, setProfileImage] = useState("/placeholder.svg");
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    firstName: "Olivia",
    lastName: "Eromosele",
    phone: "09022794720",
    email: "olivia.eromos@talim.com",
    role: "Talim Administrator",
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const handleImageRemove = () => {
    setProfileImage("/placeholder.svg");
  };

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

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
          <h2 className="text-xl font-semibold">{userData.firstName} {userData.lastName}</h2>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="default"
              className="bg-[#002244] hover:bg-[#002244]"
              onClick={() => document.getElementById("image-upload")?.click()}
            >
              Change Picture
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
              Remove Picture
            </Button>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader className="bg-gray-100 flex justify-between items-center">
          <CardTitle>Personal Information</CardTitle>
          <Button variant="ghost" onClick={handleEditToggle} className="flex items-center text-black hover:bg-gray-600">
            <Pencil className="w-4 h-4 mr-1" />
            {isEditing ? "Save" : "Edit"}
          </Button>
        </CardHeader>
        <CardContent className="grid gap-6 pt-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" />
                First Name:
              </Label>
              {isEditing ? (
                <input
                  type="text"
                  name="firstName"
                  value={userData.firstName}
                  onChange={handleChange}
                  className="border rounded p-2 w-full"
                />
              ) : (
                <p className="text-lg">{userData.firstName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Last Name:
              </Label>
              {isEditing ? (
                <input
                  type="text"
                  name="lastName"
                  value={userData.lastName}
                  onChange={handleChange}
                  className="border rounded p-2 w-full"
                />
              ) : (
                <p className="text-lg">{userData.lastName}</p>
              )}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number:
              </Label>
              {isEditing ? (
                <input
                  type="text"
                  name="phone"
                  value={userData.phone}
                  onChange={handleChange}
                  className="border rounded p-2 w-full"
                />
              ) : (
                <p className="text-lg">{userData.phone}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email:
              </Label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleChange}
                  className="border rounded p-2 w-full"
                />
              ) : (
                <p className="text-lg">{userData.email}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Role:
            </Label>
            <p className="text-lg">{userData.role}</p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-6">
              {recentActivity.map((activity, index) => (
                <div key={index} className="relative pl-8">
                  <div className="absolute left-2.5 top-2 w-2 h-2 rounded-full bg-[#003366] -translate-x-1/2" />
                  <div className="space-y-1">
                    <p className="font-medium text-[#003366]">{activity.date}</p>
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
  );
}
