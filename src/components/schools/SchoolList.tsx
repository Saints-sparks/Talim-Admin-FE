"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreVertical, Search, Filter, Trash2, Lock } from "lucide-react"; // Import icons
import { schools } from "@/data/school";
import { School } from "@/types/dashboard";
import { useRouter } from "next/navigation";

interface SchoolListProps {
    onSelectSchool: (school: School) => void;
    id: string;
  }
  export default function SchoolList() {
  
    const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState<string | null>(null); 
  const [modalType, setModalType] = useState<"delete" | "deactivate" | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<{ id: string; name: string } | null>(null);


  const SCHOOLS_PER_PAGE = 5;
  const totalPages = Math.ceil(schools.length / SCHOOLS_PER_PAGE);
  const startIndex = (currentPage - 1) * SCHOOLS_PER_PAGE;
  const currentSchools = schools.slice(startIndex, startIndex + SCHOOLS_PER_PAGE);

  const openModal = (type: "delete" | "deactivate", school: { id: string; name: string }) => {
      setSelectedSchool(school);
      setModalType(type);
    };


  return (
    <div className="p-6 space-y-4 text-black">
      
      {/* Filters & Search */}
      <div className="flex justify-between items-center">
        {/* Filter Button */}
        <Button variant="outline" className="flex items-center space-x-2">
          <Filter size={16} />
          <span>Filter</span>
        </Button>

        {/* Search Box */}
        <div className="relative w-64 rounded-full border border-gray-200">
          <Input
            className="pl-10 pr-4" 
            placeholder="Search schools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Schools Table */}
      <h1 className="text-md font-normal">Schools <span className="rounded-full bg-blue-300 py-[5px] px-2 text-xs ml-2">{schools.length} users</span></h1>
      <div className="border text-gray-500 font-normal text-xs rounded-lg shadow-sm">
      <table className="w-full text-left">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3">School ID</th>
            <th className="p-3">Name</th>
            <th className="p-3">Email Address</th>
            <th className="p-3">Primary Contact</th>
            <th className="p-3">Students</th>
            <th className="p-3">Teachers</th>
            <th className="p-3">Location</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentSchools.map((school) => (
            <tr
              key={school.id}
              className="border border-t cursor-pointer hover:bg-gray-100"
              onClick={() => router.push(`/talimadmindashboard/schools/SchoolDetail?id=${school.id}`)}
            >
              <td className="p-3">{school.id}</td>
              <td className="p-3">{school.name}</td>
              <td className="p-3">{school.email}</td>
              <td className="p-3">{school.primaryContact}</td>
              <td className="p-3">{school.students}</td>
              <td className="p-3">{school.teachers}</td>
              <td className="p-3">{school.location}</td>
              <td className="p-3 relative" onClick={(e) => e.stopPropagation()}>
                <MoreVertical
                  className="cursor-pointer"
                  onClick={() => setMenuOpen(menuOpen === school.id ? null : school.id)}
                />
                {menuOpen === school.id && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-10">
                    <button className="w-full px-4 py-2 text-left hover:bg-gray-100">Edit</button>
                    <button
                      className="w-full px-4 py-2 text-left hover:bg-gray-100"
                      onClick={() => openModal("deactivate", school)}
                    >
                      Deactivate
                    </button>
                    <button
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
                      onClick={() => openModal("delete", school)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
          Previous
        </Button>
        <span className="text-gray-600 text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
          Next
        </Button>
      </div>
      
       {/* Delete / Deactivate Modal */}
       {modalType && selectedSchool && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
            {modalType === "delete" ? (
              <Trash2 size={30} className="mx-auto text-red-500" />
            ) : (
              <Lock size={40} className="mx-auto text-yellow-500" />
            )}

            <h2 className="text-lg font-semibold mt-3">
              {modalType === "delete" ? "Delete School" : "Deactivate School"}
            </h2>
            <p className="text-gray-600 text-xs mt-2">
              {modalType === "delete"
                ? `Do you want to remove ${selectedSchool.name}?`
                : `Do you want to deactivate ${selectedSchool.name}?`}
            </p>

            <div className="mt-4 flex justify-between">
              <Button variant="outline" onClick={() => setModalType(null)}>
                {modalType === "delete" ? "Cancel" : "Discard"}
              </Button>
              <Button
                className={modalType === "delete" ? "bg-red-600 text-white" : "bg-yellow-500 text-white"}
                onClick={() => {
                  setModalType(null);
                  alert(`${modalType === "delete" ? "Deleted" : "Deactivated"} ${selectedSchool.name}`);
                }}
              >
                {modalType === "delete" ? "Delete" : "Deactivate"}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
