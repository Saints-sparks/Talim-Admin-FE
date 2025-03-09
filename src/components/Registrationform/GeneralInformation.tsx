"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud } from "lucide-react";

const NIGERIAN_STATES = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo",
    "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
    "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
    "Yobe", "Zamfara"
  ];

export default function GeneralInformation({ formData, setFormData }: any) {
  const [logo, setLogo] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setLogo(event.target.files[0]);
    }
  };

 return (
  <div className="p-6 bg-white rounded-lg shadow-md space-y-6">
    <h2 className="text-lg font-semibold text-gray-800">General Information</h2>

    {/* Logo Upload + School Name + School ID */}
    <div className="grid grid-cols-12 gap-6">
      {/* Logo Upload (Smaller width) */}
      <div className="col-span-3 border border-gray-300 rounded-sm p-4 text-center flex flex-col items-center justify-center">
        {logo ? (
          <img
            src={URL.createObjectURL(logo)}
            alt="School Logo"
            className="h-16 w-16 object-cover rounded-full"
          />
        ) : (
          <>
            <UploadCloud size={40} className="text-gray-400" />
            <p className="text-sm text-gray-500 mt-2">Drop school’s logo here or browse</p>
          </>
        )}
        <input type="file" className="hidden" id="logoUpload" onChange={handleFileUpload} />
        <label htmlFor="logoUpload" className="mt-2 text-blue-500 text-sm cursor-pointer">
          Browse
        </label>
      </div>

    {/* School Name & School ID (Stacked in Rows) */}
<div className="col-span-9 flex flex-col gap-4">
  {/* School Name */}
  <div>
    <label className="text-sm font-medium text-gray-700">School Name*</label>
    <Input
      type="text"
      placeholder="Enter school’s name"
      value={formData.schoolName}
      onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
    />
  </div>

  {/* School ID (Below School Name) */}
  <div>
    <label className="text-sm font-medium text-gray-700">School ID</label>
    <Input type="text" value={formData.schoolId} readOnly className="bg-gray-50 text-gray-700 w-48 cursor-not-allowed" />
  </div>
</div>

    </div>

    {/* Email & Principal Name */}
    <div className="grid grid-cols-2 gap-6">
      <div>
        <label className="text-sm font-medium text-gray-700">School Email Address</label>
        <Input
          type="email"
          placeholder="Enter school’s email address"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Principal / Primary Contact</label>
        <Input
          type="text"
          placeholder="Enter principal name"
          value={formData.principal}
          onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
        />
      </div>
    </div>

    {/* Location & State */}
    <div className="grid grid-cols-2 gap-6 text-gray-700">
      <div>
        <label className="text-sm font-medium text-gray-700">Location*</label>
        <Input
          type="text"
          placeholder="Enter school’s location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">State</label>
        <select
          className="border border-gray-300 bg-gray-50 rounded-md p-2 w-full"
          value={formData.state}
          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
        >
          <option value="">Select</option>
          {NIGERIAN_STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>
      
    </div>
    {/* Academic Session Information */}
<div className="p-6 bg-white rounded-lg shadow-md space-y-6">
  <h2 className="text-lg font-semibold text-gray-800">Academic Session Information</h2>

  {/* Academic Year & Term (Side by Side) */}
  <div className="grid grid-cols-2 gap-6 text-gray-700">
    {/* Academic Year */}
    <div>
      <label className="text-sm font-medium text-gray-700">Which academic year is this for?</label>
      <select
        className="border border-gray-300 bg-gray-50 rounded-md p-2 w-full"
        value={formData.academicYear}
        onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
      >
        <option value="">Select academic year</option>
        {["2023/2024", "2024/2025", "2025/2026"].map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>

    {/* Term Selection */}
    <div>
      <label className="text-sm font-medium text-gray-700">What term is it?</label>
      <select
        className="border border-gray-300 bg-gray-50 rounded-md p-2 w-full"
        value={formData.term}
        onChange={(e) => setFormData({ ...formData, term: e.target.value })}
      >
        <option value="">Select term</option>
        {["First Term", "Second Term", "Third Term"].map((term) => (
          <option key={term} value={term}>
            {term}
          </option>
        ))}
      </select>
    </div>
  </div>
</div>
{/* Class Information */}
<div className="p-6 bg-white rounded-lg shadow-md space-y-6">
  <h2 className="text-lg font-semibold text-gray-800">Class Information</h2>

  {/* Primary & Secondary Class Inputs (Side by Side) */}
  <div className="grid grid-cols-2 gap-6 text-gray-700">
    {/* Primary Classes */}
    <div>
      <label className="text-sm font-medium text-gray-700">How many primary classes?</label>
      <Input
        type="text"
        placeholder="Enter total number"
        value={formData.primaryClasses}
        onChange={(e) => setFormData({ ...formData, primaryClasses: e.target.value })}
      />
    </div>

    {/* Secondary Classes */}
    <div>
      <label className="text-sm font-medium text-gray-700">How many secondary classes?</label>
      <Input
        type="text"
        placeholder="Enter total number"
        value={formData.secondaryClasses}
        onChange={(e) => setFormData({ ...formData, secondaryClasses: e.target.value })}
      />
    </div>
  </div>
</div>


  </div>
);

}
