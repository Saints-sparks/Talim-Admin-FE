"use client"

import { useState } from "react"
import { ProfileImage } from "../../components/announcement component/profile-image"
import { ActivityTimeline } from "../../components/announcement component/activity-timeline"
import type { UserProfile, Activity } from "../../components/announcement component/profile"

const initialProfile: UserProfile = {
  firstName: "Olivia",
  lastName: "Eromosele",
  phoneNumber: "09022794720",
  email: "olivia.eromos@talim.com",
  role: "Talim administrator",
  avatar: "/placeholder.svg"
}

const recentActivities: Activity[] = [
  {
    id: "1",
    date: "June 09, 2024",
    time: "12:45pm",
    location: "Edo State, Benin City",
  },
  {
    id: "2",
    date: "June 04, 2024",
    location: "Edo State, Benin City",
  },
]

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(initialProfile)

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Profile</h1>

      <div className="grid gap-8 md:grid-cols-[300px,1fr]">
        <ProfileImage
          name={`${profile.firstName} ${profile.lastName}`}
          image={profile.avatar}
          onImageChange={(image) =>
            setProfile((prev) => ({ ...prev, avatar: image }))
          }
        />

        <div className="space-y-6">
          <div>
            <div className="bg-muted px-4 py-2 text-sm font-medium">
              Personal information
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  First name:
                </label>
                <div className="font-medium">{profile.firstName}</div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Last name:
                </label>
                <div className="font-medium">{profile.lastName}</div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  Phone number:
                </label>
                <div className="font-medium">{profile.phoneNumber}</div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  Email:
                </label>
                <div className="font-medium">{profile.email}</div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Role:
                </label>
                <div className="font-medium">{profile.role}</div>
              </div>
            </div>
          </div>

          <ActivityTimeline activities={recentActivities} />
        </div>
      </div>
    </div>
  )
}

