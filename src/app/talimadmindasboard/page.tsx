"use client";

import React, { useState } from "react";
import Register from "../talimregister/page";

const SchoolOverview = () => {
  const [showRegister, setShowRegister] = useState(false); // State to toggle Register view

  const handleRegisterClick = () => {
    setShowRegister(true); // Show the Register component
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Main Content */}
      <main className="flex-1 p-4">
        {!showRegister ? (
          <>
            <header className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">School Overview</h1>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
                onClick={handleRegisterClick} // Set the click handler
              >
                + Register School
              </button>
            </header>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-white p-4 rounded-md shadow-md">
                <h2 className="text-xl font-semibold">Total Schools</h2>
                <p className="text-3xl font-bold">220</p>
                <p className="text-green-500">+40% vs last month</p>
              </div>
              <div className="bg-white p-4 rounded-md shadow-md">
                <h2 className="text-xl font-semibold">Active now</h2>
                <p className="text-3xl font-bold">32</p>
                <p className="text-green-500">+20% vs last month</p>
              </div>
            </div>

            {/* Filters Section */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <button className="bg-blue-100 text-blue-500 px-4 py-2 rounded-md">
                  BN, LG, +4
                </button>
                <button className="ml-2 bg-gray-100 px-4 py-2 rounded-md">
                  More Filters
                </button>
              </div>
              <input
                type="text"
                placeholder="Search"
                className="p-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* School Cards */}
            <div className="grid grid-cols-1 gap-4">
              {[1, 2].map((item, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-md shadow-md flex flex-col md:flex-row justify-between"
                >
                  <div>
                    <h3 className="text-xl font-semibold">
                      University Preparatory Secondary School
                    </h3>
                    <p className="text-gray-500">#UPS-10001</p>
                    <p className="text-gray-500">
                      36, 37, 45 & 49 Garrick Layout, Off, Siluko Rd, Benin City
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="text-sm text-gray-500">Principal</p>
                      <p className="text-md font-semibold">Juliet Urevbu</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Teachers</p>
                      <p className="text-md font-semibold">40</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Students</p>
                      <p className="text-md font-semibold">324</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <Register /> // Render the Register component
        )}
      </main>
    </div>
  );
};

export default SchoolOverview;
