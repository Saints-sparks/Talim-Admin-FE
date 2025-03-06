"use client";

import { schoolsData } from "@/data/schoolsData";
import { Card, CardContent } from "@/components/ui/card";
import { School, Badge, MapPin, User, Users, GraduationCap } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

export function SchoolsCard() {
  const [currentPage, setCurrentPage] = useState(1);
  const SCHOOLS_PER_PAGE = 5;

  // Calculate total pages
  const totalPages = Math.ceil(schoolsData.length / SCHOOLS_PER_PAGE);

  // Get the schools for the current page
  const startIndex = (currentPage - 1) * SCHOOLS_PER_PAGE;
  const currentSchools = schoolsData.slice(startIndex, startIndex + SCHOOLS_PER_PAGE);

  return (
    <div className="flex flex-col gap-4 mt-6">
      {/* map over `currentSchools` */}
      {currentSchools.map((school) => (
        <Card key={school.id} className="w-full p-4 border bg-white shadow-sm text-black">
          <CardContent className="space-y-3">
            {/* School Name */}
            <div className="flex items-center gap-2 font-semibold text-xs">
              <School className="w-5 h-5 text-gray-500" />
              {school.name}
            </div>

            {/* School ID */}
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Badge className="w-4 h-4 text-gray-500" />
              <span>{school.id}</span>
            </div>

            {/* Address */}
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span>{school.address}</span>
            </div>

            {/* Bottom Section: Principal, Teachers, Students */}
            <div className="flex justify-between items-center text-sm text-gray-700 border-t pt-3">
              {/* Principal */}
              <div className="flex items-center gap-1">
                <div className="flex flex-col text-xs text-gray-500">
                  <span className="font-medium ">Principal</span>
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-semibold pt-2 text-black">{school.principal}</span>
                </div>
              </div>

              <span className="text-gray-400">|</span>

              {/* Teachers */}
              <div className="flex items-center gap-1 ">
                <Users className="w-4 h-4 text-gray-500" />
                <div className="flex flex-col">
                  <span className="font-medium">Teachers</span>
                  <span className="font-semibold pt-2 text-black">{school.teachers}</span>
                </div>
              </div>

              <span className="text-gray-400">|</span>

              {/* Students */}
              <div className="flex items-center gap-1">
                <GraduationCap className="w-4 h-4 text-gray-500" />
                <div className="flex flex-col">
                  <span className="font-medium">Students</span>
                  <span className="font-semibold pt-2 text-black">{school.students}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Pagination Controls */}
      <div className="flex justify-between text-black items-center mt-4">
        <Button 
          variant="outline" 
          disabled={currentPage === 1} 
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </Button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <Button 
          variant="outline" 
          disabled={currentPage >= totalPages} 
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
