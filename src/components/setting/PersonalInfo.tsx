"use client";

import { useState, useEffect } from "react";
import { FaUser, FaUsers, FaPhone, FaEnvelope, FaBriefcase, FaCalendarAlt } from "react-icons/fa";
import { adminProfiles } from "@/data/adminProfiles"; 

interface PersonalInfoProps {
  isEditing: boolean;
}

const PersonalInfo = ({ isEditing }: PersonalInfoProps) => {
  const [admin, setAdmin] = useState<{
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    role: string;
    dateRegistered: string;
  } | null>(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulating delay
      setAdmin(adminProfiles[0]); // Fetch the first admin from data
    };

    fetchAdminData();
  }, []);

  const editedAdminInitialState = admin ? { ...admin } : {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    role: "",
    dateRegistered: "",
  };
  
  const [editedAdmin, setEditedAdmin] = useState(editedAdminInitialState);
  
  if (!admin) {
    return <p className="text-gray-500">Loading personal information...</p>;
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedAdmin({ ...editedAdmin, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-6 rounded-sm text-gray-700">
      <div className="bg-gray-400 py-2 px-4 rounded-t-md">
        <h2 className="text-lg font-semibold mb-2 text-black">Personal Information</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-2">
        {/* First Name */}
        <div className="flex items-center space-x-2">
          <FaUser className="text-gray-500" />
          <div>
            <p className="text-gray-600 text-sm">First Name</p>
            {isEditing ? (
              <input
                type="text"
                name="firstName"
                value={editedAdmin.firstName}
                onChange={handleChange}
                className="w-full px-2 py-1 border rounded-md text-xs"
              />
            ) : (
              <p className="font-medium text-xs">{admin.firstName}</p>
            )}
          </div>
        </div>

        {/* Last Name */}
        <div className="flex items-center space-x-2">
          <FaUsers className="text-gray-500" />
          <div>
            <p className="text-gray-600 text-sm">Last Name</p>
            {isEditing ? (
              <input
                type="text"
                name="lastName"
                value={editedAdmin.lastName}
                onChange={handleChange}
                className="w-full px-2 py-1 border rounded-md text-xs"
              />
            ) : (
              <p className="font-medium text-xs">{admin.lastName}</p>
            )}
          </div>
        </div>

        {/* Phone Number */}
        <div className="flex items-center space-x-2">
          <FaPhone className="text-gray-500" />
          <div>
            <p className="text-gray-600 text-sm">Phone Number</p>
            {isEditing ? (
              <input
                type="text"
                name="phone"
                value={editedAdmin.phone}
                onChange={handleChange}
                className="w-full px-2 py-1 border rounded-md text-xs"
              />
            ) : (
              <p className="font-medium text-xs">{admin.phone}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center space-x-2">
          <FaEnvelope className="text-gray-500" />
          <div>
            <p className="text-gray-600 text-sm">Email</p>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={editedAdmin.email}
                onChange={handleChange}
                className="w-full px-2 py-1 border rounded-md text-xs"
              />
            ) : (
              <p className="font-medium text-xs">{admin.email}</p>
            )}
          </div>
        </div>

        {/* Role */}
        <div className="flex items-center space-x-2">
          <FaBriefcase className="text-gray-500" />
          <div>
            <p className="text-gray-600 text-sm">Role</p>
            <p className="font-medium text-xs">{admin.role}</p>
          </div>
        </div>

        {/* Date Registered */}
        <div className="flex items-center space-x-2">
          <FaCalendarAlt className="text-gray-500" />
          <div>
            <p className="text-gray-600 text-sm">Date Registered</p>
            <p className="font-medium text-xs">{admin.dateRegistered}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
