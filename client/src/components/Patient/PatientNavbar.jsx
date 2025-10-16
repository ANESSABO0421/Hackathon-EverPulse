// src/pages/dashboard/patient/PatientNavbar.jsx
import React from "react";
import { Bell, Search, UserCircle } from "lucide-react";

export default function PatientNavbar() {
  return (
    <header className="w-full bg-white shadow-md border-b border-gray-200 flex justify-between items-center px-6 py-3 sticky top-0 z-20">
      {/* Left: Search */}
      <div className="flex items-center w-full md:w-1/2">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search doctors, appointments..."
            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0047AB]"
          />
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          />
        </div>
      </div>

      {/* Right: Notification + Profile */}
      <div className="flex items-center gap-6">
        <button className="relative text-gray-600 hover:text-[#0047AB] transition">
          <Bell size={22} />
          <span className="absolute top-[-2px] right-[-2px] bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
            2
          </span>
        </button>

        <div className="flex items-center gap-2 cursor-pointer">
          <UserCircle size={36} className="text-[#0047AB]" />
          <div className="hidden md:block">
            <p className="font-semibold text-gray-800 text-sm">John Doe</p>
            <p className="text-xs text-gray-500">Patient</p>
          </div>
        </div>
      </div>
    </header>
  );
}
