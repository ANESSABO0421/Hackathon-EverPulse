// src/pages/dashboard/patient/PatientDashboard.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import PatientSidebar from "../../../components/Patient/PatientSidebar";
import PatientNavbar from "../../../components/Patient/PatientNavbar";

export default function PatientDashboard() {
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Sidebar */}
      <PatientSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-0 md:ml-64 flex flex-col transition-all duration-300">
        <PatientNavbar />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
