import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUserMd, FaUserInjured, FaUserShield } from "react-icons/fa";

export default function SignupRoleSelect() {
  const navigate = useNavigate();

  const roles = [
    {
      title: "Patient",
      description:
        "Create your EverPulse account to book appointments, track health records, and connect with doctors securely.",
      icon: <FaUserInjured className="text-5xl mb-4 text-[#0047AB]" />,
      path: "/signup/patient",
      color: "from-[#93C5FD] to-[#3B82F6]",
    },
    {
      title: "Doctor",
      description:
        "Join EverPulse to manage patient data, appointments, and AI-driven medical insights with ease.",
      icon: <FaUserMd className="text-5xl mb-4 text-[#0047AB]" />,
      path: "/signup/doctor",
      color: "from-[#93C5FD] to-[#2563EB]",
    },
    {
      title: "Admin",
      description:
        "Register as an admin to manage users, hospital operations, and overall EverPulse system analytics.",
      icon: <FaUserShield className="text-5xl mb-4 text-[#0047AB]" />,
      path: "/signup/admin",
      color: "from-[#60A5FA] to-[#1D4ED8]",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#E0F2FE] via-[#BFDBFE] to-[#93C5FD] text-[#0F172A] px-6 py-16">
      <h1 className="text-5xl font-extrabold mb-10 text-center text-[#0047AB] drop-shadow-lg">
        Join <span className="text-[#1E3A8A]">EverPulse</span>
      </h1>
      <p className="text-lg text-center max-w-2xl text-[#1E293B] mb-14">
        Choose your role to begin your registration journey.
      </p>

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl w-full">
        {roles.map((role) => (
          <div
            key={role.title}
            onClick={() => navigate(role.path)}
            className={`cursor-pointer bg-gradient-to-br ${role.color} rounded-2xl p-10 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-white flex flex-col justify-center items-center text-center`}
          >
            {role.icon}
            <h2 className="text-3xl font-bold mb-3">{role.title}</h2>
            <p className="text-base leading-relaxed text-blue-50">
              {role.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
