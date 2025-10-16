// src/pages/dashboard/doctor/DoctorSidebar.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  Brain,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

export default function DoctorSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Overview", icon: <LayoutDashboard size={20} />, path: "doctoroverview" },
    { name: "My Patients", icon: <Users size={20} />, path: "doctorpatients" },
    { name: "Appointments", icon: <CalendarDays size={20} />, path: "doctorappointments" },
    { name: "Records", icon: <FileText size={20} />, path: "doctorrecords" },
    { name: "AI Insights", icon: <Brain size={20} />, path: "doctorai-insights" },
    { name: "Messages", icon: <MessageSquare size={20} />, path: "doctormessages" },
    { name: "Settings", icon: <Settings size={20} />, path: "doctorsettings" },
  ];

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-[#0047AB] text-white p-2 rounded-lg shadow-md"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen bg-[#0047AB] text-white shadow-xl flex flex-col transition-transform duration-300 z-40
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 w-64`}
      >
        <div className="p-5 text-center text-2xl font-bold border-b border-blue-700">
          EverPulse Doctor
        </div>

        <nav className="flex-1 mt-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => {
            localStorage.clear();
            toast.success("Logged out successfully!");
            window.location.href = "/login";
          }}
          className="flex items-center gap-3 px-5 py-3 mt-auto mb-4 text-sm text-red-200 hover:bg-red-600/30 hover:text-white transition-all duration-200"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </>
  );
}
