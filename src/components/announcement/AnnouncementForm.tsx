"use client";
import React, { useState } from "react";
import MediaButtons from "./MediaButtons";
import SchoolSelectionModal from "./SchoolSelectionModal";
import PostTitleModal from "./PostTitleModal";
import PostContentModal from "./PostContentModal";
import { Announcement } from "../../data/announcements"; // Import correct type
import { adminProfiles } from "../../data/adminProfiles"; // Import admin data

interface AnnouncementFormProps {
  onPost: (newAnnouncement: Announcement) => void;
}

const AnnouncementForm: React.FC<AnnouncementFormProps> = ({ onPost }) => {
  const [announcement, setAnnouncement] = useState("");
  const [selectedFile, setSelectedFile] = useState<{ file: File | null; type: "photo" | "video" } | null>(null);
  const [eventDetails, setEventDetails] = useState<{ title: string; date: string; description: string } | null>(null);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");

  // Get current admin ID (assuming the first admin is the logged-in user)
  const currentAdmin = adminProfiles[0];
  const currentAdminId = currentAdmin?.adminId ?? 1; 

  const handlePost = (content: string) => {
    const newAnnouncement: Announcement = {
      id: Date.now(),
      adminId: currentAdminId,
      school: selectedSchools.length > 0 ? selectedSchools.join(", ") : "All Schools",
      date: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }),
      title: postTitle,
      content: content, // Now content is passed correctly
    };
  
    onPost(newAnnouncement);
  
    // Reset form fields
    setPostTitle("");
    setPostContent("");
    setSelectedSchools([]);
    setSelectedFile(null);
    setEventDetails(null);
    setIsContentModalOpen(false);
  };
  

  return (
    <div className="border border-gray-300 p-4 rounded-lg mt-4">   
      {/* First Row */}
      <div className="flex flex-wrap gap-4 items-center mb-8">
        {/* Profile Image */}
        <img
          src={currentAdmin.avatar}
          alt="Admin Profile"
          className="w-10 h-10 rounded-full"
        />
        {/* Announcement Input */}
        <textarea
          placeholder="Write your announcement here..."
          value={announcement}
          onChange={(e) => setAnnouncement(e.target.value)}
          className="flex-1 border border-gray-300 p-2 rounded-md text-black h-[40px] overflow-y-auto resize-none"
        />
        {/* School Selection Button */}
        <button
          onClick={() => setIsSchoolModalOpen(true)}
          className="border border-gray-300 p-2 rounded-md bg-gray-50 w-[180px] text-black text-sm truncate"
          title={selectedSchools.join(", ")}
        >
          {selectedSchools.length === 0
            ? "Select School"
            : selectedSchools.length === 1
            ? selectedSchools[0].length > 15
              ? selectedSchools[0].slice(0, 15) + "..."
              : selectedSchools[0]
            : `${selectedSchools[0].slice(0, 12)}... +${selectedSchools.length - 1}`}
        </button>
      </div>

      {/* Media Buttons */}
      <MediaButtons onFileSelect={(file, type) => setSelectedFile({ file, type })} />

      {/* Display Selected File */}
      {selectedFile?.file && (
        <div className="mt-2 text-sm text-gray-600">
          Selected {selectedFile.type}: {selectedFile.file.name}
        </div>
      )}

      {/* Display Event Details */}
      {eventDetails && (
        <div className="mt-3 p-3 bg-gray-50 border rounded-md">
          <h3 className="font-semibold text-lg text-black">{eventDetails.title}</h3>
          <p className="text-sm text-gray-500">{eventDetails.date}</p>
          <p className="text-sm text-black">{eventDetails.description}</p>
        </div>
      )}

      {/* School Selection Modal */}
      <SchoolSelectionModal
        isOpen={isSchoolModalOpen}
        onClose={() => setIsSchoolModalOpen(false)}
        onConfirm={(schools) => {
          setSelectedSchools(schools);
          setIsSchoolModalOpen(false);
          setIsTitleModalOpen(true);
        }}
      />

      {/* Post Title Modal */}
      <PostTitleModal
        isOpen={isTitleModalOpen}
        onClose={() => setIsTitleModalOpen(false)}
        onNext={(title) => {
          setPostTitle(title);
          setIsTitleModalOpen(false);
          setIsContentModalOpen(true);
        }}
        selectedSchools={selectedSchools}
      />

      {/* Post Content Modal */}
      <PostContentModal
        isOpen={isContentModalOpen}
        onClose={() => setIsContentModalOpen(false)}
        postTitle={postTitle}
        selectedSchools={selectedSchools}
        onPost={handlePost} 
        postContent={postContent}
        />
    </div>
  );
};

export default AnnouncementForm;
