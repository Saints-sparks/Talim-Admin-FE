"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Pencil } from "lucide-react";
import Image from "next/image";

interface School {
  id: string;
  name: string;
  email: string;
  contact: string;
  location: string;
  dateRegistered: string;
  currentSession: string;
  currentTerm: string;
  termStartDate: string;
  termEndDate: string;
  nextTermStartDate: string;
}

const mockSchool: School = {
  id: "SIS-101",
  name: "Sapphire International School",
  email: "info@sapphireintl.edu.ng",
  contact: "Mr. Olumide Adebayo",
  location: "J73F+F4P, Idimu, Lagos",
  dateRegistered: "April 10, 2024",
  currentSession: "2022/2023",
  currentTerm: "1st term",
  termStartDate: "January 10, 2024",
  termEndDate: "January 10, 2024",
  nextTermStartDate: "January 10, 2024",
};

export default function SchoolProfile({ onBack }: { onBack: () => void }) {
  const [school] = useState<School>(mockSchool);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Back Button */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft size={20} /> Back
        </Button>
      </div>

      {/* School Header */}
      <div className="flex items-center gap-4">
        <Image src="/school-logo.png" alt="School Logo" width={50} height={50} className="rounded-full" />
        <div>
          <h1 className="text-2xl font-bold">{school.name}</h1>
          <p className="text-gray-500">{school.id}</p>
        </div>
      </div>

      {/* School Overview */}
      <Card className="p-6 mt-6">
        <h2 className="text-lg font-semibold bg-gray-200 p-2 rounded">School Overview</h2>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="font-semibold">🏫 School name</p>
            <p>{school.name}</p>
          </div>
          <div>
            <p className="font-semibold">👤 Primary contact</p>
            <p>{school.contact}</p>
          </div>
          <div>
            <p className="font-semibold">🆔 School ID</p>
            <p>{school.id}</p>
          </div>
          <div>
            <p className="font-semibold">📧 Email</p>
            <p>{school.email}</p>
          </div>
          <div>
            <p className="font-semibold">📍 Location</p>
            <p>{school.location}</p>
          </div>
          <div>
            <p className="font-semibold">📅 Date registered</p>
            <p>{school.dateRegistered}</p>
          </div>
        </div>
      </Card>

      {/* Academic Session */}
      <Card className="p-6 mt-6">
        <h2 className="text-lg font-semibold bg-gray-200 p-2 rounded">Academic Session</h2>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="font-semibold">📚 Current session</p>
            <p>{school.currentSession}</p>
          </div>
          <div>
            <p className="font-semibold">📅 Current term</p>
            <p>{school.currentTerm}</p>
          </div>
          <div>
            <p className="font-semibold">📅 Term start date</p>
            <p>{school.termStartDate}</p>
          </div>
          <div>
            <p className="font-semibold">📅 Term end date</p>
            <p>{school.termEndDate}</p>
          </div>
          <div>
            <p className="font-semibold">📅 Next term start date</p>
            <p>{school.nextTermStartDate}</p>
          </div>
        </div>
      </Card>

      {/* Edit Button */}
      <div className="fixed bottom-6 right-6 ">
        <Button variant="outline" className="p-4 rounded-full shadow-lg hover:bg-green-400">
          <Pencil size={20} />
        </Button>
      </div>
    </div>
  );
}
