// src/pages/dashboard/admin/components/AdminSidebar.jsx
import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
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

// Skeleton loader component for menu items
const SidebarSkeleton = () => (
  <div className="animate-pulse space-y-2 px-5 py-3">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="h-6 bg-blue-800/30 rounded-md"></div>
    ))}
  </div>
);

export default function AdminSidebar() {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [activePath, setActivePath] = useState('');

  // Simulate loading effect
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Update active path when location changes
  useEffect(() => {
    setActivePath(location.pathname.split('/').pop() || 'overview');
  }, [location]);

  const menuItems = [
    { name: "Overview", icon: <LayoutDashboard size={20} />, path: "overview" },
    { name: "Manage Doctors", icon: <Stethoscope size={20} />, path: "doctors" },
    { 
      name: "Add Doctor", 
      icon: <Stethoscope size={20} />, 
      path: "add-doctor",
      className: "bg-blue-600 hover:bg-blue-700 mt-4"
    },
    { name: "Manage Patients", icon: <Users size={20} />, path: "patients" },
    { name: "Appointments", icon: <ClipboardList size={20} />, path: "appointments" },
    { name: "Medical Records", icon: <FileText size={20} />, path: "records" },
    { name: "Analytics", icon: <BarChart2 size={20} />, path: "analytics" },
    { name: "Settings", icon: <Settings size={20} />, path: "settings" },
  ];

  return (
    <div className="w-64 bg-[#0047AB] h-screen text-white flex flex-col shadow-xl">
      <div className="p-5 text-center text-2xl font-bold border-b border-blue-700">
        {loading ? (
          <div className="h-8 bg-blue-800/30 rounded-md animate-pulse"></div>
        ) : (
          "EverPulse Admin"
        )}
      </div>
      <nav className="flex-1 mt-4 space-y-1">
        {loading ? (
          <SidebarSkeleton />
        ) : (
          menuItems.map((item) => {
            const isActive = activePath === item.path;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all duration-200 ${item.className || ''} ${
                  isActive && !item.className
                    ? "bg-white/20 text-white"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                {React.cloneElement(item.icon, {
                  className: `transition-transform duration-200 ${
                    isActive ? 'scale-110' : ''
                  }`
                })}
                <span className="transition-all duration-200">
                  {item.name}
                </span>
              </NavLink>
            );
          })
        )}
      </nav>
      <div className="p-4 border-t border-blue-700 mt-auto">
        <button
          onClick={() => {
            localStorage.clear();
            toast.success("You have been successfully logged out");
            window.location.href = '/login';
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-100 hover:bg-red-600/20 rounded-md transition-colors duration-200"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}
