"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import GeneralInformation from "@/components/Registrationform/GeneralInformation";

export default function RegisterSchool() {
  const [formData, setFormData] = useState({
    schoolName: "",
    schoolId: "10021",
    email: "",
    principal: "",
    location: "",
    state: "",
  });

  return (
    <div className="p-6 space-y-6">
         <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-lg text-black font-bold">New School Information</h1>
                  <p className="text-gray-500 text-sm">Edit school information here</p>
                </div>
                <Button className="bg-[#002244] text-white">
          + Add a School
        </Button>
              </div>
      <h1 className="text-xl font-semibold">Register New School</h1>

      {/* General Information */}
      <GeneralInformation formData={formData} setFormData={setFormData} />

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button variant="outline">Previous</Button>
        <Button className="bg-blue-600 text-white">Next</Button>
      </div>
    </div>
  );
}
