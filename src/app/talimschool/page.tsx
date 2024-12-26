"use client";

import React, { useState } from "react";


const SchoolManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionMenu, setActionMenu] = useState<string | null>(null); // Tracks the active action menu
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const entriesPerPage = 10; // Limit entries to 10 per page

  const [schools, setSchools] = useState([
    {
      id: "SIS-101",
      name: "Sapphire International School",
      email: "info@sapphireintl.edu.ng",
      contact: "Mr. Olumide Adebayo",
      students: 1100,
      teachers: 95,
      location: "Lagos",
      status: "Active", // Added status field
    },
    // Additional schools
    ...Array(50).fill(null).map((_, index) => ({
      id: `SCH-${index + 102}`,
      name: `Sample School ${index + 1}`,
      email: `sample${index + 1}@school.edu.ng`,
      contact: `Mr. Sample ${index + 1}`,
      students: 1000 + index,
      teachers: 50 + index,
      location: `City ${index + 1}`,
      status: "Active", // Added status field
    })),
  ]);

  const [showDeleteModal, setShowDeleteModal] = useState(false); // Tracks modal visibility
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null); // Tracks the school to delete
  const [statusChangeMessage, setStatusChangeMessage] = useState<string | null>(null); // Track status change message
  const [confirmToggleModal, setConfirmToggleModal] = useState(false); // Tracks toggle modal visibility
  const [schoolToToggle, setSchoolToToggle] = useState<string | null>(null); // Tracks the school to toggle

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const filteredSchools = schools.filter((school) =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredSchools.length / entriesPerPage);
  const paginatedSchools = filteredSchools.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const handleActionClick = (schoolId: string) => {
    setActionMenu((prev) => (prev === schoolId ? null : schoolId));
  };

  const handleToggleStatusClick = (schoolId: string) => {
    setSchoolToToggle(schoolId);
    setConfirmToggleModal(true);
  };

  const confirmToggleStatus = () => {
    if (schoolToToggle) {
      setSchools((prev) =>
        prev.map((school) =>
          school.id === schoolToToggle
            ? {
                ...school,
                status: school.status === "Active" ? "Deactivated" : "Active",
              }
            : school
        )
      );
      const updatedSchool = schools.find((school) => school.id === schoolToToggle);
      setStatusChangeMessage(
        `School ${schoolToToggle} is now ${updatedSchool?.status === "Active" ? "Active" : "Deactivated"}.`
      );
      setConfirmToggleModal(false);
      setSchoolToToggle(null);
    }
  };

  const handleDeleteClick = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedSchoolId) {
      setSchools((prev) => prev.filter((school) => school.id !== selectedSchoolId));
    }
    setShowDeleteModal(false);
    setSelectedSchoolId(null);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      <main className="flex-1 p-6">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <h1 className="text-2xl font-bold w-full sm:w-auto">Schools</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4 sm:mt-0">
            + Add a student
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap justify-between items-center mb-4">
            <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 mb-2 sm:mb-0">
              Filters
            </button>
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearch}
              className="border rounded px-4 py-2 w-full sm:w-64"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="border border-gray-300 px-4 py-2">School ID</th>
                  <th className="border border-gray-300 px-4 py-2">Name</th>
                  <th className="border border-gray-300 px-4 py-2">Email Address</th>
                  <th className="border border-gray-300 px-4 py-2">Primary Contact</th>
                  <th className="border border-gray-300 px-4 py-2">Students</th>
                  <th className="border border-gray-300 px-4 py-2">Teachers</th>
                  <th className="border border-gray-300 px-4 py-2">Location</th>
                  <th className="border border-gray-300 px-4 py-2">Status</th>
                  <th className="border border-gray-300 px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSchools.map((school) => (
                  <tr key={school.id} className="hover:bg-gray-100 relative">
                    <td className="border border-gray-300 px-4 py-2">{school.id}</td>
                    <td className="border border-gray-300 px-4 py-2">{school.name}</td>
                    <td className="border border-gray-300 px-4 py-2">{school.email}</td>
                    <td className="border border-gray-300 px-4 py-2">{school.contact}</td>
                    <td className="border border-gray-300 px-4 py-2">{school.students}</td>
                    <td className="border border-gray-300 px-4 py-2">{school.teachers}</td>
                    <td className="border border-gray-300 px-4 py-2">{school.location}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {school.status}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center relative">
                      <button
                        className="text-gray-700 hover:text-blue-600"
                        onClick={() => handleActionClick(school.id)}
                      >
                        ⋮
                      </button>
                      {actionMenu === school.id && (
                        <div className="absolute bg-white border rounded shadow z-10 top-12 right-0 w-40">
                          <button
                            className="w-full text-left px-4 py-2 hover:bg-gray-100"
                          >
                            Edit
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 hover:bg-gray-100"
                          >
                            Archive
                          </button>
                          <button
                            onClick={() => handleToggleStatusClick(school.id)}
                            className="text-yellow-500 hover:underline"
                          >
                            {school.status === "Active" ? "Deactivate" : "Reactivate"}
                          </button>

                          <button
                            className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-100"
                            onClick={() => handleDeleteClick(school.id)}
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
          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
        {/* Status Change Notification */}
        {statusChangeMessage && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            {statusChangeMessage}
          </div>
        )}
        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <div className="text-center">
                <div className="text-red-500 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-12 h-12 mx-auto"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v4m0 4h.01m6.938-7.938A9 9 0 1112 3a9 9 0 016.938 2.938z"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-bold">Delete school</h2>
                <p>Do you want to remove this school?</p>
              </div>
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Confirm Toggle Modal */}
        {confirmToggleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <div className="text-center">
                <div className="text-yellow-500 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-12 h-12 mx-auto"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18.364 5.636a9 9 0 11-12.728 12.728 9 9 0 0112.728-12.728z"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-bold">Change School Status</h2>
                <p>Are you sure you want to {schoolToToggle && schools.find(s => s.id === schoolToToggle)?.status === "Active" ? "deactivate" : "reactivate"} this school?</p>
              </div>
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                  onClick={() => setConfirmToggleModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                  onClick={confirmToggleStatus}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SchoolManagement;
