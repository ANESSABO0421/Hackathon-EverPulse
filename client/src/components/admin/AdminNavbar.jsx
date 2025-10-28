import React from "react";
import { useNavigate } from 'react-router-dom';

export default function AdminNavbar() {
  const navigate = useNavigate();
  
  // In a real app, you would get this from your auth context or state
  const adminName = 'Admin User'; // Replace with dynamic admin name

  const handleLogout = () => {
    // Add your logout logic here
    console.log('Logging out...');
    // Example: Clear auth token, reset state, etc.
    // Then redirect to login
    navigate('/login');
  };

  return (
    <header className="bg-white p-4 flex justify-between items-center shadow-sm">
      <h1 className="text-xl font-bold text-[#0047AB]">Admin Dashboard</h1>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#0047AB] flex items-center justify-center text-white font-medium">
            {adminName.split(' ').map(n => n[0]).join('')}
          </div>
          <span className="font-medium text-gray-700">{adminName}</span>
        </div>
        <button 
          onClick={handleLogout}
          className="ml-2 px-4 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-medium"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
