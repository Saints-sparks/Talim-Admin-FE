import React, { useState } from "react";
import { FaTimes, FaCloudUploadAlt } from "react-icons/fa";

interface UploadMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadMediaModal: React.FC<UploadMediaModalProps> = ({ isOpen, onClose }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  if (!isOpen) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files);
      setFiles(selectedFiles);

      // Simulate upload progress
      selectedFiles.forEach((file) => {
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            const newProgress = Math.min((prev[file.name] || 0) + 10, 100);
            if (newProgress === 100) clearInterval(interval);
            return { ...prev, [file.name]: newProgress };
          });
        }, 300);
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 h-96 rounded-lg w-80 relative">

        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          <FaTimes size={20} />
        </button>

        {/* Title */}
        <h2 className="text-md text-black font-semibold mb-3">Upload and Attach Files</h2>

        {/* Upload Area */}
        <label className="w-full border-2 border-dashed h-24 border-gray-300 p-6 flex flex-col items-center justify-center text-gray-500 cursor-pointer">
          <FaCloudUploadAlt size={40} className="mb-2 text-blue-600" />
          <p className="text-sm">Click to upload or drag and drop</p>
          <p className="text-xs text-gray-400">SVG, PNG, JPG or GIF (max. 800x400px)</p>
          <input type="file" multiple className="hidden" onChange={handleFileChange} />
        </label>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-4">
            {files.map((file) => (
              <div key={file.name} className="flex items-center justify-between mb-2 p-2 border rounded-md">
                <span className="text-xs text-black">{file.name}</span>
                <div className="w-24 bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full"
                    style={{ width: `${uploadProgress[file.name]}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-between mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-black rounded-md">
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md" disabled={files.length === 0}>
            Attach Files
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadMediaModal;
