'use client';

import React from 'react';
import { useState } from 'react'; 

const RegistrationForm = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  // Handle file upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };
  return (
    <div className="w-[8 0%]  -left-14 relative mx-auto md:ml-64">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">New School Information</h1>
        
        <p className="text-sm text-gray-500 mb-6">Edit school information here</p>

        {/* General Information */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">General information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload School Logo */}
          <div className="col-span-1">
            <label className="block mb-2 font-medium">School Logo</label>
            <div
              className="border-dashed border-2 border-gray-300 text-center py-6 relative"
              onClick={() => document.getElementById("fileInput").click()}
            >
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt="School Logo"
                  className="w-32 h-32 mx-auto object-cover rounded-md"
                />
              ) : (
                <div>
                  <p className="text-gray-400 mb-2">Drop school’s logo here or</p>
                  <span className="text-blue-600 font-semibold cursor-pointer">
                    browse
                  </span>
                </div>
              )}
              <input
                type="file"
                id="fileInput"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">School Name*</label>
              <input
                type="text"
                placeholder="Enter school's name"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">School ID</label>
              <input
                type="text"
                value="10021"
                disabled
                className="w-full p-2 border rounded bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">School Email Address</label>
              <input
                type="email"
                placeholder="Enter school's email address"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Principal / Primary Contact</label>
              <input
                type="text"
                placeholder="Enter principal name"
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>

        {/* Academic Session Information */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Academic session information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-1">Which academic year is this for?</label>
              <select className="w-full p-2 border rounded">
                <option>Select academic year</option>
                <option>2023/2024</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">What term is it?</label>
              <select className="w-full p-2 border rounded">
                <option>Select term</option>
                <option>First Term</option>
              </select>
            </div>
          </div>
        </div>

        {/* Class Information */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Class information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-1">How many primary classes?</label>
              <input
                type="number"
                placeholder="Enter total number"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">How many secondary classes?</label>
              <input
                type="number"
                placeholder="Enter total number"
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">
            Register School
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
