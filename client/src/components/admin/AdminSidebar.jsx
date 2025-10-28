// src/pages/dashboard/admin/components/AdminSidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  ClipboardList,
  FileText,
  BarChart2,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";
import { toast } from "react-toastify";

export default function AdminSidebar() {
  const menuItems = [
    { name: "Overview", icon: <LayoutDashboard size={20} />, path: "overview" },
    { name: "Manage Doctors", icon: <Stethoscope size={20} />, path: "doctors" },
    { name: "Manage Patients", icon: <Users size={20} />, path: "patients" },
    { name: "Appointments", icon: <ClipboardList size={20} />, path: "appointments" },
    { name: "Medical Records", icon: <FileText size={20} />, path: "records" },
    { name: "Analytics", icon: <BarChart2 size={20} />, path: "analytics" },
    { name: "Feedback", icon: <MessageSquare size={20} />, path: "feedback" },
    { name: "Settings", icon: <Settings size={20} />, path: "settings" },
  ];

  return (
    <div className="w-64 bg-[#0047AB] h-screen text-white flex flex-col shadow-xl">
      <div className="p-5 text-center text-2xl font-bold border-b border-blue-700">
        EverPulse Admin
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
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>
      <button
        onClick={() => {
          localStorage.clear();
          toast.success("you have been successfully logged out")
          window.location.href = "/login";
        }}
        className="flex items-center gap-3 px-5 py-3 mt-auto mb-4 text-sm text-red-200 hover:bg-red-600/30 hover:text-white transition-all duration-200"
      >
        <LogOut size={20} />
        Logout
      </button>
    </div>
  );
}
