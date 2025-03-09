"use client";
import { useState } from "react";
import { Pencil } from "lucide-react";
import PersonalInfo from "@/components/setting/PersonalInfo";
import RecentActivity from "@/components/setting/RecentActivity";
import { Button } from "@/components/ui/button";
import ProfilePicture from "@/components/setting/profilePicture";

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="relative p-6 space-y-6">
      {/* Profile Picture */}
      <ProfilePicture />
      
      {/* Pass `isEditing` to enable editing mode */}
      <PersonalInfo isEditing={isEditing} />  
      
      <RecentActivity />

      {/* Floating Edit Button */}
      <Button
        onClick={() => setIsEditing((prev) => !prev)}
        className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition"
      >
        <Pencil className="w-4 h-4" />
        {isEditing ? "Done" : "Edit"}
      </Button>
    </div>
  );
};

export default ProfilePage;
