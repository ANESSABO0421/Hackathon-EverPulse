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
import PatientDashboard from "./pages/dashboard/patient/PatientDashboard";
import AdminDashboard from "./pages/dashboard/Admin/AdminDashboard";
import Overview from "./pages/dashboard/Admin/Overview";
import ManageDoctors from "./pages/dashboard/Admin/ManageDoctors";
import ManagePatients from "./pages/dashboard/Admin/ManagePatients";
import MedicalRecords from "./pages/dashboard/Admin/MedicalRecords";
import Analytics from "./pages/dashboard/Admin/Analytics";
import Feedback from "./pages/dashboard/Admin/Feedback";
import Settings from "./pages/dashboard/Admin/Settings";
import Appointment from "./pages/dashboard/Admin/Appointment";
import AdminAddDoctor from "./pages/dashboard/Admin/AdminAddDoctor";
import DoctorDashboard from "./pages/dashboard/Doctor/DoctorDashboard";
import DoctorOverview from "./pages/dashboard/Doctor/DoctorOverview";
import DoctorPatients from "./pages/dashboard/Doctor/DoctorPatients";
import DoctorAppointments from "./pages/dashboard/Doctor/DoctorAppointments";
import DoctorRecords from "./pages/dashboard/Doctor/DoctorRecords";
import DoctorAiInsights from "./pages/dashboard/Doctor/DoctorAiInsights";
import DoctorMessages from "./pages/dashboard/Doctor/DoctorMessages";
import DoctorSettings from "./pages/dashboard/Doctor/DoctorSettings";
import PatientOverview from "./pages/dashboard/patient/PatientOverview";
import PatientAppointments from "./pages/dashboard/patient/PatientAppointments";
import PatientRecords from "./pages/dashboard/patient/PatientRecords";
import PatientDoctors from "./pages/dashboard/patient/PatientDoctors";
import PatientChat from "./pages/dashboard/patient/PatientChat";
import PatientSettings from "./pages/dashboard/patient/PatientSettings";

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
        {/* Admin Dashboard */}
        <Route path="/dashboard/admin" element={<AdminDashboard />}>
          <Route index element={<Overview />} />
          <Route path="overview" element={<Overview />} />
          <Route path="doctors" element={<ManageDoctors />} />
          <Route path="patients" element={<ManagePatients />} />
          <Route path="appointments" element={<Appointment />} />
          <Route path="records" element={<MedicalRecords />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="add-doctor" element={<AdminAddDoctor />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Doctor dashboard */}
        <Route path="/dashboard/doctor" element={<DoctorDashboard />}>
          <Route index path="doctoroverview" element={<DoctorOverview />} />
          <Route path="doctorpatients" element={<DoctorPatients />} />
          <Route path="doctorappointments" element={<DoctorAppointments />} />
          <Route path="doctorrecords" element={<DoctorRecords />} />
          <Route path="doctorai-insights" element={<DoctorAiInsights />} />
          <Route path="doctormessages" element={<DoctorMessages />} />
          <Route path="doctorsettings" element={<DoctorSettings />} />
        </Route>

        {/* patient dashboard */}
        <Route path="/dashboard/patient" element={<PatientDashboard />}>
          <Route index element={<PatientOverview />} />
          <Route path="overview" element={<PatientOverview/>} />
          <Route path="appointments" element={<PatientAppointments />} />
          <Route path="records" element={<PatientRecords />} />
          <Route path="doctors" element={<PatientDoctors />} />
          <Route path="chat" element={<PatientChat />} />
          <Route path="settings" element={<PatientSettings />} />
        </Route>
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
