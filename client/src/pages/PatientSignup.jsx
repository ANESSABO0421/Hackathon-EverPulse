import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaUserInjured } from "react-icons/fa";
import { toast } from "react-toastify";

export default function PatientSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    bloodGroup: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://hackathon-everpulse.onrender.com/api/patients/signup", formData);
      toast.success("Patient registered successfully!");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed!");
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-[#EFF6FF] via-[#DBEAFE] to-[#BFDBFE] font-sans relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-[#60A5FA] opacity-25 blur-[130px] rounded-full"></div>
      <div className="absolute bottom-[-120px] right-[-100px] w-[350px] h-[350px] bg-[#0047AB] opacity-25 blur-[140px] rounded-full"></div>

      {/* LEFT PANEL */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#0047AB] to-[#003B8E] items-center justify-center text-white text-center p-14 shadow-lg">
        <div className="max-w-md space-y-5">
          <FaUserInjured className="text-7xl mb-2 mx-auto text-white drop-shadow-lg" />
          <h1 className="text-5xl font-extrabold tracking-tight">
            EverPulse Patient
          </h1>
          <p className="text-lg text-blue-100 leading-relaxed">
            Join EverPulse to access your medical records, appointments, and
            AI-powered insights for better healthcare.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 px-6 py-16 relative z-10">
        <div className="bg-white backdrop-blur-lg rounded-3xl shadow-2xl border-2 border-[#0047AB]/30 hover:border-[#0047AB]/60 transition-all duration-300 p-10 md:p-12 w-full max-w-lg">
          <h2 className="text-4xl font-extrabold text-[#0047AB] mb-2 text-center">
            Patient Signup
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Create your secure EverPulse health account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="label">Full Name</label>
                <input
                  name="name"
                  placeholder="John Doe"
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
                  placeholder="john@example.com"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="label">Gender</label>
                <select
                  name="gender"
                  onChange={handleChange}
                  className="input bg-white"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="label">Date of Birth</label>
                <input
                  name="dateOfBirth"
                  type="date"
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </div>

            {/* Row 4 */}
            <div>
              <label className="label">Blood Group</label>
              <select
                name="bloodGroup"
                onChange={handleChange}
                className="input bg-white"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
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
                to="/login/patient"
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
