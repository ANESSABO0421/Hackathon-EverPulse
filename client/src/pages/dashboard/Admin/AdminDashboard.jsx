import React from 'react'
import { Outlet } from "react-router-dom";
import AdminSidebar from '../../../components/admin/AdminSidebar';
import AdminNavbar from '../../../components/admin/AdminNavbar';

export default function AdminDashboard() {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-10">
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Fixed Navbar */}
        <div className="fixed top-0 right-0 left-64 bg-white shadow-sm z-10">
          <AdminNavbar />
        </div>
        
        {/* Scrollable Content */}
        <main className="flex-1 p-6 mt-16 overflow-y-auto">
          <Outlet /> {/* This renders nested routes */}
        </main>
      </div>
    </div>
  );
}