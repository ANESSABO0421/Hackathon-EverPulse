import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaUserMd } from "react-icons/fa";
import { toast } from "react-toastify";

export default function DoctorSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    bloodGroup: "",
    specialization: "",
    licenseNumber: "",
    yearsOfExperience: "",
    qualifications: "",
    hospitalAffiliation: "",
    bio: "",
    consultationFee: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        qualifications: formData.qualifications
          ? formData.qualifications.split(",").map((q) => q.trim())
          : [],
        yearsOfExperience: Number(formData.yearsOfExperience),
        consultationFee: Number(formData.consultationFee),
      };

      await axios.post("https://hackathon-everpulse.onrender.com/api/doctors/signup", payload);
      toast.success("Doctor registered successfully!");
      navigate("/login");
    } catch (err) {
      toast.error("Error: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-[#EFF6FF] via-[#DBEAFE] to-[#BFDBFE] font-sans relative overflow-hidden">
      {/* Fixed LEFT PANEL */}
      <div className="hidden md:flex md:fixed md:inset-y-0 md:left-0 md:w-1/2 bg-gradient-to-br from-[#0047AB] to-[#003B8E] items-center justify-center text-white text-center p-16 shadow-2xl">
        <div className="max-w-md space-y-6">
          <FaUserMd className="text-7xl mb-4 mx-auto text-white drop-shadow-lg" />
          <h1 className="text-5xl font-extrabold tracking-tight">
            EverPulse Doctor
          </h1>
          <p className="text-lg text-blue-100 leading-relaxed">
            Simplify your practice with AI-powered insights, patient records,
            and smart scheduling — all in one secure EverPulse dashboard.
          </p>
        </div>
      </div>

      {/* Scrollable RIGHT PANEL */}
      <div className="flex justify-center items-start w-full md:ml-[50%] px-6 py-16 overflow-y-auto relative z-10">
        <div className="bg-white backdrop-blur-lg rounded-3xl shadow-2xl border-2 border-[#0047AB]/30 hover:border-[#0047AB]/60 transition-all duration-300 p-12 w-full max-w-2xl mb-20">
          <h2 className="text-4xl font-extrabold text-[#0047AB] mb-2 text-center">
            Doctor Signup
          </h2>
          <p className="text-center text-gray-600 mb-10">
            Register to access your EverPulse doctor dashboard.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name & Email */}
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="label">Full Name</label>
                <input
                  name="name"
                  placeholder="Dr. John Smith"
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
                  placeholder="doctor@everpulse.com"
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </div>

            {/* Password & Phone */}
            <div className="grid md:grid-cols-2 gap-5">
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

            {/* Gender & DOB */}
            <div className="grid md:grid-cols-2 gap-5">
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

            {/* Blood Group & Specialization */}
            <div className="grid md:grid-cols-2 gap-5">
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
              <div>
                <label className="label">Specialization</label>
                <input
                  name="specialization"
                  placeholder="e.g., Cardiology"
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </div>

            {/* License & Experience */}
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="label">License Number</label>
                <input
                  name="licenseNumber"
                  placeholder="DOC-12345"
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Years of Experience</label>
                <input
                  name="yearsOfExperience"
                  type="number"
                  placeholder="10"
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </div>

            {/* Qualifications & Hospital */}
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="label">Qualifications</label>
                <input
                  name="qualifications"
                  placeholder="MBBS, MD - Cardiology"
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Hospital Affiliation</label>
                <input
                  name="hospitalAffiliation"
                  placeholder="EverPulse Medical Center"
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>

            {/* Bio & Fee */}
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="label">Consultation Fee (₹)</label>
                <input
                  name="consultationFee"
                  type="number"
                  placeholder="1000"
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Bio</label>
                <textarea
                  name="bio"
                  placeholder="Brief professional bio..."
                  onChange={handleChange}
                  className="input h-24 resize-none"
                ></textarea>
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
                to="/login/doctor"
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
