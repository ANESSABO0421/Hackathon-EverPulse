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
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const tryLogin = async (role) => {
    try {
      const url = `https://hackathon-everpulse.onrender.com/api/${role}s/login`;
      const { data } = await axios.post(url, {
        email: formData.email,
        password: formData.password,
      });
      return { success: true, data, role };
    } catch (error) {
      return { success: false, error };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Try logging in with each role
      const roles = ["patient", "doctor", "admin"];
      let loginResult = null;

      // Try each role until one succeeds or all fail
      for (const role of roles) {
        const result = await tryLogin(role);
        if (result.success) {
          loginResult = result;
          break;
        }
      }

      if (!loginResult) {
        throw new Error('Invalid email or password');
      }

      const { data } = loginResult;

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
        <div className="w-full md:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
            <p className="text-gray-600 mb-8">Sign in to your account</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
