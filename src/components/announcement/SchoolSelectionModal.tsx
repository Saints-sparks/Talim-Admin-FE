import React, { useState } from "react";
import { schools } from "@/data/schoolsData";
import { Search } from "lucide-react";

interface SchoolSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selected: string[]) => void;
}

const SchoolSelectionModal: React.FC<SchoolSelectionModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
 

  // Toggle school selection
  const handleToggleSchool = (school: string) => {
    setSelectedSchools((prev) =>
      prev.includes(school) ? prev.filter((s) => s !== school) : [...prev, school]
    );
  };

  // Filtered list based on search input
  const filteredSchools = schools.filter((school) =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    isOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg w-[320px]">
          <h2 className="text-lg font-semibold mb-2 text-gray-600">Select School</h2>

        {/* Search Box with Icon */}
<div className="relative mb-3">
  <input
    type="text"
    placeholder="Search for a school..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full p-2 pl-10 border border-gray-300 text-gray-600 rounded-md"
  />
  <span className="absolute left-3 top-3 text-gray-400">
  <Search />
  </span>
</div>

          {/* Selected Schools (Above the List) */}
          {selectedSchools.length > 0 && (
            <div className="mb-3 p-2 bg-gray-100 rounded-md text-sm text-gray-700">
              {selectedSchools.length === 1
                ? selectedSchools[0]
                : `${selectedSchools[0]}... +${selectedSchools.length - 1} others`}
            </div>
          )}

          {/* School List with Checkboxes */}
          <div className="max-h-[200px] overflow-y-auto border border-gray-200 rounded-md p-2">
            {filteredSchools.map((school) => (
              <label key={school.id} className="flex items-center gap-2 py-1 text-gray-600 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSchools.includes(school.name)}
                  onChange={() => handleToggleSchool(school.name)}
                  className="cursor-pointer"
                />
                {school.name}
              </label>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex justify-between mt-4">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-black rounded-md">
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm(selectedSchools);
                onClose();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default SchoolSelectionModal;
