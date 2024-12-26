'use client';

import React, { useState } from 'react';

const statesInNigeria = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT - Abuja', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara',
];

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    schoolName: '',
    schoolEmail: '',
    principalName: '',
    location: '',
    state: '',
    academicYear: '',
    term: '',
    primaryClasses: '',
    secondaryClasses: '',
  });

  const [selectedImage, setSelectedImage] = useState(null);

  // Handle file upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);

    // Reset form fields
    setFormData({
      schoolName: '',
      schoolEmail: '',
      principalName: '',
      location: '',
      state: '',
      academicYear: '',
      term: '',
      primaryClasses: '',
      secondaryClasses: '',
    });
    setSelectedImage(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-10">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8">
        {/* Page Header */}
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">New School Information</h1>
          <p className="text-sm text-gray-500">Edit school information here</p>
        </header>

        {/* General Information */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">General Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upload School Logo */}
            <div className="col-span-1">
              <label className="block text-gray-700 font-medium mb-2">School Logo</label>
              <div
                className="border-dashed border-2 border-gray-300 text-center py-8 rounded-md cursor-pointer"
                onClick={() => document.getElementById('fileInput').click()}
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
                    <span className="text-blue-600 font-semibold">browse</span>
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
            {/* School Details */}
            <div>
              <label className="block text-gray-700 mb-1">School Name*</label>
              <input
                type="text"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleInputChange}
                placeholder="Enter school's name"
                className="w-full p-3 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">School ID</label>
              <input
                type="text"
                value="10021"
                disabled
                className="w-full p-3 border rounded bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">School Email Address</label>
              <input
                type="email"
                name="schoolEmail"
                value={formData.schoolEmail}
                onChange={handleInputChange}
                placeholder="Enter school's email address"
                className="w-full p-3 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Principal / Primary Contact</label>
              <input
                type="text"
                name="principalName"
                value={formData.principalName}
                onChange={handleInputChange}
                placeholder="Enter principal name"
                className="w-full p-3 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter school's location"
                className="w-full p-3 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">State</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full p-3 border rounded"
              >
                <option value="">Select state</option>
                {statesInNigeria.map((state, index) => (
                  <option key={index} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Academic Session Information */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Academic Session Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-1">Which academic year is this for?</label>
              <select
                name="academicYear"
                value={formData.academicYear}
                onChange={handleInputChange}
                className="w-full p-3 border rounded"
              >
                <option value="">Select academic year</option>
                <option value="2023/2024">2023/2024</option>
                <option value="2024/2025">2024/2025</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">What term is it?</label>
              <select
                name="term"
                value={formData.term}
                onChange={handleInputChange}
                className="w-full p-3 border rounded"
              >
                <option value="">Select term</option>
                <option value="First Term">First Term</option>
                <option value="Second Term">Second Term</option>
              </select>
            </div>
          </div>
        </section>

        {/* Class Information */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Class Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-1">How many primary classes?</label>
              <input
                type="number"
                name="primaryClasses"
                value={formData.primaryClasses}
                onChange={handleInputChange}
                placeholder="Enter total number"
                className="w-full p-3 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">How many secondary classes?</label>
              <input
                type="number"
                name="secondaryClasses"
                value={formData.secondaryClasses}
                onChange={handleInputChange}
                placeholder="Enter total number"
                className="w-full p-3 border rounded"
              />
            </div>
          </div>
        </section>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700"
          >
            Register School
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
