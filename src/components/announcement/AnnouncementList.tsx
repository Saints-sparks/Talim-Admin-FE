import { adminProfiles } from "@/data/adminProfiles";
import { Announcement } from "@/data/announcements";
import React from "react";


interface AnnouncementListProps {
  announcements: Announcement[];
}

const AnnouncementList: React.FC<AnnouncementListProps> = ({ announcements }) => {
  return (
    <div className="mt-6">
      {announcements.map((announcement) => {
        const admin = adminProfiles.find((a) => a.adminId === announcement.adminId) || {
          name: "Unknown Admin",
          role: "Unknown Role",
          avatar: "/img/default-avatar.png",
        };

        return (
          <div key={announcement.id} className="border border-gray-300 p-4 rounded-lg mb-4">
            {/* First Row */}
            <div className="flex items-center gap-3">
              <img src={admin.avatar} alt="Admin Profile" className="w-10 h-10 rounded-full" />
              <div>
                <p className="text-gray-700 text-xs font-semibold">{admin.name}</p>
                <p className="text-gray-500 text-sm">
                  {admin.role} • {announcement.school ? `${announcement.school} •` : ""} {announcement.date}
                </p>
              </div>
            </div>

            {/* Second Row */}
            <h2 className="text-sm font-semibold text-gray-700 mt-2">{announcement.title}</h2>

            {/* Third Row */}
            <p className="text-gray-700 mt-1 text-xs">{announcement.content}</p>
          </div>
        );
      })}
    </div>
  );
};

export default AnnouncementList;
