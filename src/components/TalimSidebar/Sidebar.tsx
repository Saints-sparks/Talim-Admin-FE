"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  HiHome,
  HiOutlineCalendar,
  HiOutlineChartBar,
  HiOutlineClipboardList,
} from "react-icons/hi";
import { MdOutlineMessage, MdOutlineNotifications } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";

type SidebarProps = {
  className?: string;
};

const Sidebartalim: React.FC<SidebarProps> = ({ className }) => {
  const router = useRouter();

  // Mock login state
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const handleLogout = () => {
    // Perform logout logic here (e.g., clear auth tokens, reset state)
    setIsLoggedIn(false);
    router.push("/talimadminlogin");
  };

  const handleLogin = () => {
    // Mock login logic (e.g., redirect to login page or set login state)
    setIsLoggedIn(true);
    router.push("/talimadmindasboard");
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
          onClick={() => handleNavigate("/talimadmindasboard")}
        >
          <HiHome className="text-xl" />
          <span>Dashboard</span>
        </div>

        <div
          className="p-4 hover:bg-gray-200 flex items-center gap-4 cursor-pointer"
          onClick={() => handleNavigate("/talimschool")}
        >
          <HiOutlineCalendar className="text-xl" />
          <span>School Management</span>
        </div>

        <div
          className="p-4 hover:bg-gray-200 flex items-center gap-4 cursor-pointer"
          onClick={() => handleNavigate("/messages")}
        >
          <MdOutlineMessage className="text-xl" />
          <span>User Management</span>
        </div>

        <div
          className="p-4 hover:bg-gray-200 flex items-center gap-4 cursor-pointer"
          onClick={() => handleNavigate("/grades")}
        >
          <HiOutlineChartBar className="text-xl" />
          <span>Announcement</span>
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
        {isLoggedIn ? (
          <>
            <div className="flex items-center gap-4">
              <FaUserCircle className="text-3xl text-gray-600" />
              <div>
                <div className="font-semibold">Admin</div>
                <div
                  className="text-sm text-gray-600 cursor-pointer"
                  onClick={handleLogout}
                >
                  Logout
                </div>
              </div>
            </div>
            <FiLogOut
              className="text-xl cursor-pointer"
              onClick={handleLogout}
            />
          </>
        ) : (
          <div
            className="text-blue-600 font-semibold cursor-pointer"
            onClick={handleLogin}
          >
            Login
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebartalim;
