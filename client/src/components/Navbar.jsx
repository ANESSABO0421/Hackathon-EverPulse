import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        <h1 className="text-2xl font-bold text-[#0047AB]">🩺 EverPulse</h1>

        <div className="hidden md:flex space-x-6 text-gray-700 font-medium">
          <a
            href="#features"
            className="hover:text-[#0047AB] transition-colors duration-200"
          >
            Features
          </a>
          <a
            href="#about"
            className="hover:text-[#0047AB] transition-colors duration-200"
          >
            About
          </a>
          <a
            href="#contact"
            className="hover:text-[#0047AB] transition-colors duration-200"
          >
            Contact
          </a>
        </div>

        <div className="space-x-3 flex items-center">
          <button className="border border-[#0047AB] text-[#0047AB] px-4 py-2 rounded-md font-semibold hover:bg-[#e0e7ff] hover:text-[#003B8E] transition duration-200">
            <Link to="/login">Login</Link>
          </button>

          <button className="bg-[#0047AB] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#003B8E] transition duration-200">
            <Link to="/signup">Sign Up</Link>
          </button>
        </div>
      </div>
    </nav>
  );
}
