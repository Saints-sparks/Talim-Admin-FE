"use client"
import AnnouncementForm from "@/components/announcement/AnnouncementForm";
import AnnouncementList from "@/components/announcement/AnnouncementList";
import DateRangePicker from "@/components/announcement/DatePicker";
import { adminProfiles } from "@/data/adminProfiles";
import { Announcement, announcements as initialAnnouncements } from "@/data/announcements";
import React, { useState } from "react";



const AnnouncementPage = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);

  // Function to add a new announcement
  const handlePostAnnouncement = (newAnnouncement: Announcement) => {
    setAnnouncements((prev) => [newAnnouncement, ...prev]); // Add new announcement at the top
  };

 

    const admin = adminProfiles[0]; // Get first admin (for now)

    

  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-black">Announcement</h1>
        <DateRangePicker />
      </div>
      <AnnouncementForm onPost={handlePostAnnouncement} />
      <AnnouncementList announcements={announcements} />
    </div>
  );
};

export default AnnouncementPage;
