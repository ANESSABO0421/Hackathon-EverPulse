import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaLock } from "react-icons/fa";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let url = "";

      if (formData.role === "patient")
        url = "http://localhost:3000/api/patients/login";
      else if (formData.role === "doctor")
        url = "http://localhost:3000/api/doctors/login";
      else if (formData.role === "admin")
        url = "http://localhost:3000/api/admins/login";
      else return toast.error("Please select your role.");

      const { data } = await axios.post(url, {
        email: formData.email,
        password: formData.password,
      });

      console.log('Login response:', data);
      
      if (!data.token) {
        throw new Error('No token received from server');
      }

      // ✅ Save token, role, and user ID
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      
      // Store the user ID if available in the response
      if (data.userId) {
        localStorage.setItem("userId", data.userId);
        console.log('Saved userId to localStorage. User ID:', data.userId);
      } else if (data.user && data.user._id) {
        // Handle case where user data is nested in a user object
        localStorage.setItem("userId", data.user._id);
        console.log('Saved userId to localStorage. User ID:', data.user._id);
      } else if (data.patientId) {
        // Handle case where it's named patientId in the response
        localStorage.setItem("userId", data.patientId);
        console.log('Saved userId to localStorage. User ID:', data.patientId);
      } else if (data.doctorId) {
        // Handle case where it's named doctorId in the response
        localStorage.setItem("userId", data.doctorId);
        console.log('Saved userId to localStorage. User ID:', data.doctorId);
      } else {
        console.warn('No user ID found in login response');
      }
      
      console.log('Saved token to localStorage. Token:', data.token);
      console.log('Saved role to localStorage. Role:', data.role);

      toast.success("Login successful!");

      // ✅ Redirect based on role
      setTimeout(() => {
        if (data.role === "patient") navigate("/dashboard/patient");
        else if (data.role === "doctor") navigate("/dashboard/doctor");
        else if (data.role === "admin") navigate("/dashboard/admin");
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-[#EFF6FF] via-[#DBEAFE] to-[#BFDBFE] font-sans relative overflow-hidden">
      <ToastContainer position="top-right" autoClose={2500} />

      {/* Decorative background glow */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-[#0047AB] opacity-20 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-[-150px] right-[-100px] w-[450px] h-[450px] bg-[#60A5FA] opacity-25 blur-[140px] rounded-full"></div>

      {/* LEFT PANEL */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#0047AB] to-[#003B8E] items-center justify-center text-white text-center p-16 shadow-lg">
        <div className="max-w-md space-y-5">
          <FaLock className="text-7xl mb-2 mx-auto text-white drop-shadow-lg" />
          <h1 className="text-5xl font-extrabold tracking-tight">EverPulse</h1>
          <p className="text-lg text-blue-100 leading-relaxed">
            Log in securely to your EverPulse dashboard — whether you’re a
            patient, doctor, or admin.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 px-8 py-16 relative z-10 overflow-y-auto">
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border-2 border-[#0047AB]/30 hover:border-[#0047AB]/60 transition-all duration-300 p-12 w-full max-w-lg">
          <h2 className="text-4xl font-extrabold text-[#0047AB] mb-2 text-center">
            Login
          </h2>
          <p className="text-center text-gray-600 mb-10">
            Access your EverPulse account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="label">Select Role</label>
              <select
                name="role"
                onChange={handleChange}
                value={formData.role}
                className="input bg-white"
                required
              >
                <option value="">-- Choose Role --</option>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <input
                name="email"
                type="email"
                placeholder="example@everpulse.com"
                value={formData.email}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#0047AB] to-[#2563EB] text-white py-3 rounded-xl font-semibold hover:from-[#003B8E] hover:to-[#1E3A8A] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
