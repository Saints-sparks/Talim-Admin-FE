// Talim-Admin-FE\src\components\schools\SchoolDetails.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { schools } from "@/data/school";

interface SchoolDetailsProps {
  schoolId: string;
}

const SchoolDetails: React.FC<SchoolDetailsProps> = ({ schoolId }) => {
  const router = useRouter();
  const school = schools.find((s) => s.id === schoolId);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: school?.name || "",
    primaryContact: school?.primaryContact || "",
    id: school?.id || "",
    email: school?.email || "",
    location: school?.location || "",
    dateRegistered: school?.dateRegistered || "",
    currentSession: school?.currentSession || "",
    currentTerm: school?.currentTerm || "",
    termStartDate: school?.termStartDate || "",
    termEndDate: school?.termEndDate || "",
    nextTermStart: school?.nextTermStart || "",
    nextTermEnd: school?.nextTermEnd || "",
  });

  if (!school) {
    return <p className="text-red-500">School not found.</p>;
  }

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle save (for now, just exit edit mode)
  const handleSave = () => {
    setIsEditing(false);
    console.log("Updated School Data:", formData); // Replace with API call later
  };

  // Handle cancel (reset values)
  const handleCancel = () => {
    setFormData({
      name: school.name,
      primaryContact: school.primaryContact,
      id: school.id,
      email: school.email,
      location: school.location,
      dateRegistered: school.dateRegistered,
      currentSession: school.currentSession,
      currentTerm: school.currentTerm,
      termStartDate: school.termStartDate,
      termEndDate: school.termEndDate,
      nextTermStart: school.nextTermStart,
      nextTermEnd: school.nextTermEnd,
    });
    setIsEditing(false);
  };


  return (
    <div className="p-6">
      {/* Back Button */}
      <button onClick={() => router.back()} className="text-blue-600 mb-4">
        ← Back
      </button>

      {/* School Name and ID */}
      <h1 className="text-2xl font-semibold text-black">{formData.name}</h1>
      <p className="text-gray-600">School ID: {formData.id}</p>

     {/* School Overview */}
<div className="bg-gray-50 rounded-lg mt-6">
  <div className="bg-gray-200 py-2 px-4 rounded-t-md">
    <h2 className="text-lg text-black font-semibold">School Overview</h2>
  </div>

  <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mt-3 px-4 pb-4">
          {[
            { label: "🏫 School Name", key: "name" },
            { label: "👤 Primary Contact", key: "primaryContact" },
            { label: "🆔 School ID", key: "id" },
            { label: "📧 School Email", key: "email" },
            { label: "📍 Location", key: "location" },
            { label: "📅 Date Registered", key: "dateRegistered" },
          ].map(({ label, key }) => (
            <div key={key}>
              <p className="font-semibold">{label}</p>
              {isEditing ? (
                <input
                  type="text"
                  name={key}
                  value={formData[key as keyof typeof formData]}
                  onChange={handleChange}
                  className="border p-1 rounded w-full"
                />
              ) : (
                <p>{formData[key as keyof typeof formData]}</p>
              )}
            </div>
          ))}
        </div>
      </div>

 {/* Academic Session */}
 <div className="bg-gray-100 rounded-lg mt-6">
        <div className="bg-gray-200 py-2 px-4 rounded-t-md">
          <h2 className="text-lg text-black font-semibold">📚 Academic Session</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mt-3 px-4 pb-4">
          {[
            { label: "📅 Current Session", key: "currentSession" },
            { label: "📅 Current Term", key: "currentTerm" },
            { label: "📅 Term Start Date", key: "termStartDate" },
            { label: "📅 Term End Date", key: "termEndDate" },
            { label: "📅 Next Term Start Date", key: "nextTermStart" },
            { label: "📅 Next Term End Date", key: "nextTermEnd" },
          ].map(({ label, key }) => (
            <div key={key}>
              <p className="font-semibold">{label}</p>
              {isEditing ? (
                <input
                  type="text"
                  name={key}
                  value={formData[key as keyof typeof formData]}
                  onChange={handleChange}
                  className="border p-1 rounded w-full"
                />
              ) : (
                <p>{formData[key as keyof typeof formData]}</p>
              )}
            </div>
          ))}
        </div>
      </div>
     {/* Edit & Save Buttons */}
     {!isEditing ? (
        <button
          onClick={() => setIsEditing(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700"
        >
          <FaEdit size={20} />
        </button>
      ) : (
        <div className="fixed bottom-6 right-6 flex gap-3">
          <button
            onClick={handleSave}
            className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700"
          >
            <FaSave size={20} />
          </button>
          <button
            onClick={handleCancel}
            className="bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700"
          >
            <FaTimes size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default SchoolDetails;
