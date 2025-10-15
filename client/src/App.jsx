import React from "react";
import { Route, Routes } from "react-router-dom";
import LandingPages from "./pages/LandingPages";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SignupRoleSelect from "./components/SignupRoleSelect";
import DoctorSignup from "./pages/DoctorSignup";
import AdminSignup from "./pages/AdminSignup";
import PatientSignup from "./pages/PatientSignup";
import { ToastContainer } from "react-toastify";
import DoctorDashboard from "./pages/dashboard/DoctorDashboard";
import PatientDashboard from "./pages/dashboard/PatientDashboard";
import AdminDashboard from "./pages/dashboard/Admin/AdminDashboard";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<LandingPages />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignupRoleSelect />} />
        <Route path="/signup/doctor" element={<DoctorSignup />} />
        <Route path="/signup/admin" element={<AdminSignup />} />
        <Route path="/signup/patient" element={<PatientSignup />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
        <Route path="/dashboard/patient" element={<PatientDashboard />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default App;
