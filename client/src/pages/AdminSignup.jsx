import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaUserShield } from "react-icons/fa";
import { toast } from "react-toastify";

export default function AdminSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    department: "",
    employeeId: "",
    accessLevel: "restricted",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://hackathon-everpulse.onrender.com/api/admins/signup", formData);
      toast.success("🎉 Admin registered successfully!");
      navigate("/login");
    } catch (err) {
      toast.error(
        `⚠️ ${err.response?.data?.message || "Registration failed!"}`
      );
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-[#EFF6FF] via-[#DBEAFE] to-[#BFDBFE] font-sans relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute top-[-120px] left-[-120px] w-[400px] h-[400px] bg-[#0047AB] opacity-20 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-[-150px] right-[-100px] w-[450px] h-[450px] bg-[#60A5FA] opacity-25 blur-[140px] rounded-full"></div>

      {/* LEFT PANEL */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#0047AB] to-[#003B8E] items-center justify-center text-white text-center p-16 shadow-lg">
        <div className="max-w-md space-y-5">
          <FaUserShield className="text-7xl mb-2 mx-auto text-white drop-shadow-lg" />
          <h1 className="text-5xl font-extrabold tracking-tight">
            EverPulse Admin
          </h1>
          <p className="text-lg text-blue-100 leading-relaxed">
            Manage hospital operations, oversee staff access, and maintain
            EverPulse system analytics securely and efficiently.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 px-6 py-16 relative z-10">
        <div className="bg-white backdrop-blur-lg rounded-3xl shadow-2xl border-2 border-[#0047AB]/30 hover:border-[#0047AB]/60 transition-all duration-300 p-12 w-full max-w-lg">
          <h2 className="text-4xl font-extrabold text-[#0047AB] mb-2 text-center">
            Admin Signup
          </h2>
          <p className="text-center text-gray-600 mb-10">
            Register to access your EverPulse admin dashboard.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="label">Full Name</label>
                <input
                  name="name"
                  placeholder="Jane Doe"
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Email Address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="admin@everpulse.com"
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="label">Password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input
                  name="phone"
                  placeholder="+91 9876543210"
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </div>

            {/* Row 3 */}
            <div>
              <label className="label">Department</label>
              <input
                name="department"
                placeholder="Operations / HR / IT"
                onChange={handleChange}
                className="input"
              />
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="label">Employee ID</label>
                <input
                  name="employeeId"
                  placeholder="EMP-1023"
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Access Level</label>
                <select
                  name="accessLevel"
                  onChange={handleChange}
                  className="input bg-white"
                >
                  <option value="restricted">Restricted</option>
                  <option value="full">Full</option>
                </select>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#0047AB] to-[#2563EB] text-white py-3 rounded-xl font-semibold hover:from-[#003B8E] hover:to-[#1E3A8A] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              Register
            </button>

            <p className="text-center text-gray-600 text-sm mt-4">
              Already have an account?{" "}
              <Link
                to="/login/admin"
                className="text-[#0047AB] hover:underline font-semibold"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
