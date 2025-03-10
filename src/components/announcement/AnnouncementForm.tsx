"use client";
import React, { useState, useEffect, useRef } from "react";
import MediaButtons from "./MediaButtons";
import PostTitleModal from "./PostTitleModal";
import PostContentModal from "./PostContentModal";
import { notificationService, Priority, RecipientRole } from "@/app/services/notification.service";
import { School, schoolService } from "@/app/services/school.service";
import { Search, Upload, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AnnouncementFormProps {
  onPost: (response: any) => void;
}

const priorityConfig = {
  low: {
    color: "bg-green-50 text-green-700 border-green-200",
    label: "Low",
    icon: "🔽",
    description: "General updates"
  },
  medium: {
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    label: "Medium",
    icon: "➡️",
    description: "Important notices"
  },
  high: {
    color: "bg-red-50 text-red-700 border-red-200",
    label: "High",
    icon: "🔼",
    description: "Urgent alerts"
  }
};

const AnnouncementForm: React.FC<AnnouncementFormProps> = ({ onPost }) => {
  const [announcement, setAnnouncement] = useState("");
  const [selectedFile, setSelectedFile] = useState<{ file: File | null; type: "photo" | "video" } | null>(null);
  const [selectedSchools, setSelectedSchools] = useState<School[]>([]);
  const [isSchoolDropdownOpen, setIsSchoolDropdownOpen] = useState(false);
  const [schoolSearchQuery, setSchoolSearchQuery] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("low");
  const [recipientRoles, setRecipientRoles] = useState<RecipientRole[]>(["student"]);
  const [isUploading, setIsUploading] = useState(false);

  // Ref for the school dropdown container
  const schoolDropdownRef = useRef<HTMLDivElement>(null);

  // Temporary senderId until authentication is implemented
  const TEMP_SENDER_ID = "6791312085c0aebc84b4252c";

  useEffect(() => {
    const searchSchools = async () => {
      try {
        setIsSearching(true);
        const response = await schoolService.getAllSchools(1, 10, schoolSearchQuery);
        setSchools(response.data);
      } catch (error) {
        console.error('Failed to fetch schools:', error);
      } finally {
        setIsSearching(false);
      }
    };

    // Load initial schools when component mounts
    if (!schoolSearchQuery) {
      searchSchools();
    } else {
      const debounceTimer = setTimeout(searchSchools, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [schoolSearchQuery]);

  // Handle click outside of school dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (schoolDropdownRef.current && !schoolDropdownRef.current.contains(event.target as Node)) {
        setIsSchoolDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePost = async () => {
    try {
      const response = await notificationService.createNotification({
        title: postTitle,
        message: announcement,
        attachments: selectedFile ? [URL.createObjectURL(selectedFile.file!)] : undefined,
        recipientRoles,
        targetSchools: selectedSchools.map(school => school._id),
        senderId: TEMP_SENDER_ID,
        priority,
      });

      onPost(response);

      // Reset form fields
      setPostTitle("");
      setAnnouncement("");
      setSelectedSchools([]);
      setSelectedFile(null);
      setPriority("low");
      setRecipientRoles(["student"]);
    } catch (error) {
      console.error("Failed to create announcement:", error);
    }
  };

  const toggleSchool = (school: School) => {
    setSelectedSchools(prev => 
      prev.some(s => s._id === school._id)
        ? prev.filter(s => s._id !== school._id)
        : [...prev, school]
    );
  };

  const handleFileSelect = (file: File | null, type: "photo" | "video") => {
    setIsUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      setSelectedFile({ file, type });
      setIsUploading(false);
    }, 1000);
  };

  return (
    <div className="space-y-4">
      {/* Title and Content Section */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            placeholder="Enter announcement title..."
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Announcement</label>
          <textarea
            placeholder="Write your announcement here..."
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Priority Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(priorityConfig).map(([key, config]) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPriority(key as Priority)}
              className={`p-2 rounded-lg border ${
                priority === key 
                  ? `${config.color} border-current` 
                  : 'border-gray-200 bg-white text-gray-600'
              } transition-all`}
            >
              <div className="flex items-center justify-center gap-1">
                <span>{config.icon}</span>
                <span className="font-medium text-sm">{config.label}</span>
              </div>
              <div className="text-xs mt-0.5 opacity-75">{config.description}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recipients */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
        <div className="flex flex-wrap gap-2">
          {["student", "teacher", "parent", "admin"].map((role) => (
            <motion.label
              key={role}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className={`inline-flex items-center px-3 py-1.5 rounded-full border cursor-pointer ${
                recipientRoles.includes(role as RecipientRole)
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-600'
              }`}
            >
              <input
                type="checkbox"
                checked={recipientRoles.includes(role as RecipientRole)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setRecipientRoles([...recipientRoles, role as RecipientRole]);
                  } else {
                    setRecipientRoles(recipientRoles.filter((r) => r !== role));
                  }
                }}
                className="sr-only"
              />
              <span className="capitalize text-sm">{role}</span>
            </motion.label>
          ))}
        </div>
      </div>

      {/* School Selection */}
      <div className="relative" ref={schoolDropdownRef}>
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Schools</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search schools..."
            value={schoolSearchQuery}
            onChange={(e) => setSchoolSearchQuery(e.target.value)}
            onFocus={() => setIsSchoolDropdownOpen(true)}
            className="w-full p-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>

        {/* Selected Schools */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          <AnimatePresence>
            {selectedSchools.map((school) => (
              <motion.span
                key={school._id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-sm border border-blue-200"
              >
                {school.name}
                <button
                  onClick={() => toggleSchool(school)}
                  className="ml-1.5 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        {/* School Dropdown */}
        <AnimatePresence>
          {isSchoolDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto"
            >
              {isSearching ? (
                <div className="p-3 text-center text-gray-500">
                  <Loader2 className="animate-spin mx-auto mb-1" size={20} />
                  <span className="text-sm">Searching schools...</span>
                </div>
              ) : schools.length === 0 ? (
                <div className="p-3 text-center text-gray-500 text-sm">No schools found</div>
              ) : (
                schools.map((school) => (
                  <motion.button
                    key={school._id}
                    whileHover={{ backgroundColor: "#F3F4F6" }}
                    onClick={() => toggleSchool(school)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSchools.some(s => s._id === school._id)}
                      onChange={() => {}}
                      className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                    {school.name}
                  </motion.button>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Media Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          {isUploading ? (
            <div className="flex flex-col items-center text-gray-500">
              <Loader2 className="animate-spin mb-1" size={20} />
              <span className="text-sm">Uploading file...</span>
            </div>
          ) : selectedFile?.file ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 text-blue-600"
            >
              <Upload size={18} />
              <span className="text-sm">{selectedFile.file.name}</span>
              <button
                onClick={() => setSelectedFile(null)}
                className="ml-1.5 text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </motion.div>
          ) : (
            <MediaButtons onFileSelect={handleFileSelect} />
          )}
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handlePost}
        className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm text-sm"
      >
        Post Announcement
      </motion.button>
    </div>
  );
};

export default AnnouncementForm;
