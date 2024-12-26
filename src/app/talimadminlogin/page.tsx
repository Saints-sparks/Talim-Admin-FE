'use client'
import React, { useState } from "react";

 // Replace with the actual path to your image

const LoginPage: React.FC = () => {
  // State for form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // State for password visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Validate form fields (simple validation example)
    if (!formData.name || !formData.email || !formData.password) {
      alert("Please fill in all fields.");
      return;
    }
    if (formData.password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }
    // Simulate a successful submission
    console.log("Form submitted successfully:", formData);
    alert("Login successful!");
  };

  return (

   <section>

    
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left Section: Form */}
      <div className="flex flex-col justify-center items-center md:w-1/2 w-full px-6 sm:px-12 lg:px-20">
        <div className="w-full max-w-md">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-800">
            Welcome to TALIM
          </h1>
          <p className="text-sm text-gray-600 mb-8">Login with your email</p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name*
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"
              />
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email*
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password*
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-sm text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters.
              </p>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-gray-800"
              >
                Keep me signed in
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-700 text-white font-medium rounded-md shadow-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Log in
            </button>

            {/* Sign in with Google */}
            <button
              type="button"
              className="w-full py-2 px-4 border border-gray-300 text-gray-700 font-medium rounded-md shadow-md flex items-center justify-center hover:bg-gray-100"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                alt="Google Logo"
                className="w-5 h-5 mr-2"
              />
              Sign up with Google
            </button>
          </form>

          <footer className="mt-8 text-xs text-gray-500 text-center">
            © TALIM 2024 <span className="mx-2">|</span> help@talim.com
          </footer>
        </div>
      </div>

      {/* Right Section: Illustration */}
      <div className="hidden md:flex justify-center items-center md:w-1/2 w-full bg-gray-100">
        <img
          src="img/illustration.jpg"
          alt="Illustration"
          className="max-w-sm md:max-w-md lg:max-w-lg"
        />
      </div>
    </div>
    </section>
  );
};

export default LoginPage;
