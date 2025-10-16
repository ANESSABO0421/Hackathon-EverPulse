// src/pages/dashboard/patient/PatientSidebar.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  FileText,
  Stethoscope,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  HeartPulse,
} from "lucide-react";
import { toast } from "react-toastify";

export default function PatientSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Overview", icon: <LayoutDashboard size={20} />, path: "overview" },
    { name: "My Doctors", icon: <Stethoscope size={20} />, path: "doctors" },
    { name: "Appointments", icon: <CalendarCheck size={20} />, path: "appointments" },
    { name: "Health Records", icon: <FileText size={20} />, path: "records" },
    { name: "Consult Chat", icon: <MessageSquare size={20} />, path: "chat" },
    { name: "Settings", icon: <Settings size={20} />, path: "settings" },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-40 bg-[#0047AB] text-white p-2 rounded-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu size={22} />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-[#0047AB] text-white flex flex-col shadow-xl transition-transform duration-300 z-30 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 w-64`}
      >
        <div className="p-5 text-center text-2xl font-bold border-b border-blue-700 flex items-center justify-center gap-2">
          <HeartPulse size={24} className="text-[#A5F3FC]" />
          EverPulse
        </div>

        <nav className="flex-1 mt-4 space-y-1">
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
            toast.success("You have been logged out!");
            window.location.href = "/login";
          }}
          className="flex items-center gap-3 px-5 py-3 mt-auto mb-4 text-sm text-red-200 hover:bg-red-600/30 hover:text-white transition-all duration-200"
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>
    </>
  );
}
