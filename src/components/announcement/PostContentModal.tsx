import React, { useState } from "react";
import { FaTimes, FaImage, FaCalendarAlt, FaFileAlt, FaClock } from "react-icons/fa"; // Import icons
import UploadMediaModal from "./UploadMediaModal";
import { Announcement } from "@/data/announcements";
import { adminProfiles } from "@/data/adminProfiles";

interface PostContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  postTitle: string;
  postContent: string;
  selectedSchools: string[];
  onPost: (content: string) => void;
}

const PostContentModal: React.FC<PostContentModalProps> = ({ isOpen, onClose, postTitle, selectedSchools, onPost}) => {

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [postContent, setPostContent] = useState("");


  if (!isOpen) return null;

  const handlePost = () => {
    if (!postContent.trim()) return;
    onPost(postContent);  // Send the content back to parent
    setPostContent("");
  };

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
            <p className="font-semibold text-sm text-gray-500">{adminProfiles[0].name}</p>
            <p className="text-xs text-black">
              Post to {selectedSchools.length > 1 ? `${selectedSchools[0]}... +${selectedSchools.length - 1}` : selectedSchools[0]}
            </p>
          </div>
        </div>

        {/* Post Content Input (Textarea) */}
        <label className="block text-sm font-semibold mb-1 text-gray-700">{postTitle}</label>
        <textarea
          onChange={(e) => setPostContent(e.target.value)}
          placeholder="Write your announcement..."
          className="w-full border border-gray-300 p-3 rounded-md text-black mb-4 h-32 resize-none"
        />

        {/* Action Buttons (Add Media, Add Event, etc.) */}
               <div className="flex gap-3 mb-4">
                 <button  onClick={() => setIsUploadModalOpen(true)}  className="flex items-center gap-2 px-3 py-2 border rounded-md bg-gray-100 hover:bg-gray-200">
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
        {/* Post Button (Bottom Right) */}
        <div className="flex justify-end mt-6">
          <button    
            onClick={handlePost} 
            disabled={!postTitle.trim() || !postContent.trim()} className="px-5 py-2 bg-blue-600 text-white rounded-md">
            Post
          </button>
        </div>
         {/* Upload Media Modal */}
         <UploadMediaModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
     
      </div>
    </div>
  );
};

export default PostContentModal;
