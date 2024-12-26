"use client"; // Import the client hook from Blitz.js
import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Import the useRouter hook
import {
  HiHome,
  HiOutlineCalendar,
  HiOutlineBookOpen,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineClipboardList,
} from "react-icons/hi";
import { MdOutlineMessage, MdOutlineNotifications } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import { FiChevronDown, FiChevronRight, FiLogOut } from "react-icons/fi";

type SidebarProps = {
  className?: string; // Make className optional
};

const Sidebartalim: React.FC<SidebarProps> = ({ className }) => {
 

  const router = useRouter(); // Initialize the router

  const handleNavigate = (path: string) => {
    console.log(`Navigating to: ${path}`); // Debugging statement
    router.push(path); // Navigate to the specified path
  };

  return (
    <div
      className={`bg-white text-gray-800 w-64 h-full flex flex-col justify-between ${className}`}
    >
      <div className="py-7 hover:bg-gray-200 flex items-center gap-4 cursor-pointer border-b-2">
        <HiHome className="text-xl" />
        <span>Talim</span>
      </div>
      {/* Main Menu */}
      <div>
        <div
          className="p-4 hover:bg-gray-200 flex items-center gap-4 cursor-pointer"
          onClick={() => handleNavigate("/talimadmindasboard")} // Navigate to the Dashboard page
        >
          <HiHome className="text-xl" />
          <span>Dashboard</span>
        </div>

        {/* Manage & Track */}
        <div>
          <div
            className="p-4 hover:bg-gray-200 flex items-center justify-between cursor-pointer"
            onClick={() => handleNavigate("/talimschool")}
          >
            <div className="flex items-center gap-4">
              <HiOutlineCalendar className="text-xl" />
              <span>School Management</span>
            </div>
          </div>
         
              
             
        </div>

        <div
          className="p-4 hover:bg-gray-200 flex items-center gap-4 cursor-pointer"
          onClick={() => handleNavigate("/messages")}
        >
          <MdOutlineMessage className="text-xl" />
          <span>User Management </span>
        </div>
        <div
          className="p-4 hover:bg-gray-200 flex items-center gap-4 cursor-pointer"
          onClick={() => handleNavigate("/grades")}
        >
          <HiOutlineChartBar className="text-xl" />
          <span>Announcement </span>
        </div>
        <div
          className="p-4 hover:bg-gray-200 flex items-center gap-4 cursor-pointer"
          onClick={() => handleNavigate("/notifications")}
        >
          <MdOutlineNotifications className="text-xl" />
          <span>Support</span>
        </div>
        <div
          className="p-4 hover:bg-gray-200 flex items-center gap-4 cursor-pointer"
          onClick={() => handleNavigate("/settings")}
        >
          <HiOutlineClipboardList className="text-xl" />
          <span>Settings</span>
        </div>
      </div>

      {/* Profile Section */}
      <div className="p-4 bg-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <FaUserCircle className="text-3xl text-gray-600" />
          <div>
            <div className="font-semibold">Admin</div>
            <div className="text-sm text-gray-600">Logout</div>
          </div>
        </div>
        <FiLogOut
          className="text-xl cursor-pointer"
          onClick={() => handleNavigate("/logout")}
        />
      </div>
    </div>
  );
};

export default Sidebartalim;
