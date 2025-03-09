"use client";

import { FaMapMarkerAlt, FaClock, FaCalendarAlt } from "react-icons/fa";
import { adminProfiles } from "@/data/adminProfiles"; // Importing the admin profiles data

const RecentActivity = () => {
  // Get the first admin (assuming there's only one admin for now)
  const admin = adminProfiles[0];

  return (
    <div className="text-gray-700 p-6 rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>

      <div className="space-y-4">
        {admin.activities.map((activity, index) => (
          <div key={index} className="border-l-4 border-blue-600 pl-4 py-2">
            <div className="flex items-center space-x-2">
              <FaCalendarAlt className="text-gray-500" />
              <p className="py-2 font-medium text-xs">{activity.date}</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FaMapMarkerAlt className="text-gray-500" />
              <p className="py-2 text-xs">{activity.location}</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FaClock className="text-gray-500" />
              <p className="py-2 text-xs">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
