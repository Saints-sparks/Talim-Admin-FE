import { adminProfiles } from "@/data/adminProfiles";
import React, { useState } from "react";
import { FaTimes, FaImage, FaCalendarAlt, FaFileAlt, FaClock } from "react-icons/fa"; // Import icons

interface PostTitleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: (title: string) => void;
  selectedSchools: string[];
}

const PostTitleModal: React.FC<PostTitleModalProps> = ({ isOpen, onClose, onNext, selectedSchools }) => {
  const [postTitle, setPostTitle] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-[500px] relative"> {/* Increased width */}

        {/* Close Button (Top Right) */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          <FaTimes size={20} />
        </button>

        {/* Admin Profile & Post Info */}
        <div className="flex items-center gap-3 mb-4">
          <img src="/img/admin-avatar.png" alt="Admin" className="w-12 h-12 rounded-full" />
          <div>
            <p className="font-semibold text-lg text-gray-500">{adminProfiles[0].name}</p>
            <p className="text-black text-sm text-gray-500">
              Post to {selectedSchools.length > 1 ? `${selectedSchools[0]}... +${selectedSchools.length - 1}` : selectedSchools[0]}
            </p>
          </div>
        </div>

        {/* Post Title Input */}
        <label className="block text-black text-sm font-semibold mb-1text-gray-700">Enter header here</label>
        <input
          type="text"
          value={postTitle}
          onChange={(e) => setPostTitle(e.target.value)}
          placeholder="Enter post title..."
          className="w-full h-32 border border-gray-300 p-3 rounded-md text-black mb-4"
        />

        {/* Action Buttons */}
        <div className="flex gap-3 mb-4">
          <button className="flex items-center gap-2 px-3 py-2 border rounded-md bg-gray-100 hover:bg-gray-200">
            <FaImage className="text-blue-600" />
            <span className="text-black text-xs">Add Media</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border rounded-md bg-gray-100 hover:bg-gray-200">
            <FaCalendarAlt className="text-green-600" />
            <span className="text-black text-xs">Add Event</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border rounded-md bg-gray-100 hover:bg-gray-200">
            <FaFileAlt className="text-yellow-600" />
            <span className="text-black text-xs">Add Document</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border rounded-md bg-gray-100 hover:bg-gray-200">
            <FaClock className="text-purple-600" />
            <span className="text-black text-xs">Schedule Post</span>
          </button>
        </div>

         {/* Next Button */}
         <div className="flex justify-end mt-6">
          <button className="px-5 py-2 bg-blue-600 text-white rounded-md"
          onClick={() => onNext(postTitle)} 
          disabled={!postTitle.trim()} >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostTitleModal;
