import React, { useRef } from "react";
import { Image, Video, CalendarPlus } from "lucide-react";

const MediaButtons = ({ onFileSelect }: { 
  onFileSelect: (file: File | null, type: "photo" | "video") => void;
}) => {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: "photo" | "video") => {
    if (event.target.files && event.target.files.length > 0) {
      onFileSelect(event.target.files[0], type);
    }
  };

  return (
    <div className="flex gap-4 mt-2 text-gray-400">
      {/* Photo Upload Button */}
      <button 
        className="flex items-center gap-2 px-3 py-2 bg-gray-300 rounded-lg" 
        onClick={() => photoInputRef.current?.click()}
      >
        <Image size={18} /> Photos
      </button>
      <input 
        type="file" 
        accept="image/*" 
        ref={photoInputRef} 
        className="hidden" 
        onChange={(e) => handleFileChange(e, "photo")} 
      />

      {/* Video Upload Button */}
      <button 
        className="flex items-center gap-2 px-3 py-2 bg-gray-300 rounded-lg" 
        onClick={() => videoInputRef.current?.click()}
      >
        <Video size={18} /> Video
      </button>
      <input 
        type="file" 
        accept="video/*" 
        ref={videoInputRef} 
        className="hidden" 
        onChange={(e) => handleFileChange(e, "video")} 
      />

      {/* Event Button */}
      <button 
        className="flex items-center gap-2 px-3 py-2 bg-gray-300 rounded-lg" 
       
      >
        <CalendarPlus size={18} /> Event
      </button>
    </div>
  );
};

export default MediaButtons;
