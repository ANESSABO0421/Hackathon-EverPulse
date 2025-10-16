// src/pages/dashboard/doctor/DoctorDashboard.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import DoctorSidebar from "../../../components/Doctor/DoctorSidebar";
import DoctorNavbar from "../../../components/Doctor/DoctorNavbar";

export default function DoctorDashboard() {
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Sidebar */}
      <DoctorSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-0 md:ml-64 flex flex-col transition-all duration-300">
        <DoctorNavbar />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
