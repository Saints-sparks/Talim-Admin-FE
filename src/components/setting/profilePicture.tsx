"use client";

import { adminProfiles } from "@/data/adminProfiles";
import { useState } from "react";

const ProfilePicture = () => {
  const admin = adminProfiles[0]; // Fetch the first admin profile
  const [image, setImage] = useState<string | null>(admin.avatar); // Use avatar from data

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result as string);
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  const removeImage = () => setImage(null);

  return (
    <div className="flex items-start space-x-4 p-4 rounded-lg">
      {/* Profile Picture */}
      <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-300">
        {image ? (
          <img src={image} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <span className="flex items-center justify-center w-full h-full text-gray-500">🖼️</span>
        )}
      </div>

      {/* Profile Details */}
      <div className="flex flex-col">
        <h2 className="text-lg text-black font-semibold">{admin.firstName} {admin.lastName}</h2>

        {/* Buttons */}
        <div className="flex space-x-3 mt-6">
          <label className="cursor-pointer bg-blue-950 text-white px-4 py-1 rounded text-sm">
            Change Picture
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
          <button onClick={removeImage} className="border border-red-500 text-red-600 px-4 py-1 rounded text-sm">
            Remove Picture
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePicture;
