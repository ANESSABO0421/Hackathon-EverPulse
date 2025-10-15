// src/pages/dashboard/admin/components/AdminNavbar.jsx
import React from "react";

export default function AdminNavbar() {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-[#0047AB]">Admin Dashboard</h1>
      <div className="flex items-center gap-3">
        <img
          src="/assets/admin-avatar.png"
          alt="Admin"
          className="w-10 h-10 rounded-full border-2 border-[#0047AB]"
        />
        <span className="font-medium text-gray-700">Admin</span>
      </div>
    </header>
  );
}
