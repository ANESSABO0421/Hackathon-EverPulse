// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import Admin from "../models/Admin.js";

// // ✅ Admin Signup
// export const registerAdmin = async (req, res) => {
//   try {
//     const { email, password, ...rest } = req.body;
//     const existingAdmin = await Admin.findOne({ email });
//     if (existingAdmin) return res.status(400).json({ message: "Admin already exists" });

//     const passwordHash = await bcrypt.hash(password, 10);
//     const admin = await Admin.create({ email, passwordHash, ...rest });

//     res.status(201).json({ message: "Admin registered successfully", admin });
//   } catch (error) {
//     res.status(500).json({ message: "Error registering admin", error: error.message });
//   }
// };

// // ✅ Admin Login
// export const loginAdmin = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const admin = await Admin.findOne({ email });
//     if (!admin) return res.status(404).json({ message: "Admin not found" });

//     const isMatch = await bcrypt.compare(password, admin.passwordHash);
//     if (!isMatch) return res.status(400).json({ message: "Invalid password" });

//     const token = jwt.sign(
//       { id: admin._id, role: "admin" },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     res.json({ message: "Admin login successful", token, role:admin.role });
//   } catch (error) {
//     res.status(500).json({ message: "Login error", error: error.message });
//   }
// };

// phase 2



import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Doctor from "../models/Doctors.js";
import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";
import MedicalRecord from "../models/MedicalRecord.js";

// ✅ Admin Signup
export const registerAdmin = async (req, res) => {
  try {
    const { email, password, ...rest } = req.body;
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin)
      return res.status(400).json({ message: "Admin already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ email, passwordHash, ...rest });

    res.status(201).json({ message: "Admin registered successfully", admin });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering admin", error: error.message });
  }
};

// ✅ Admin Login
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Admin login successful",
      token,
      role: "admin",
    });
  } catch (error) {
    res.status(500).json({ message: "Login error", error: error.message });
  }
};

// ✅ Admin Dashboard Overview
export const getAdminDashboard = async (req, res) => {
  try {
    const [doctorCount, patientCount, appointmentCount, recordCount] =
      await Promise.all([
        Doctor.countDocuments(),
        Patient.countDocuments(),
        Appointment.countDocuments(),
        MedicalRecord.countDocuments(),
      ]);

    res.status(200).json({
      success: true,
      message: "Admin dashboard data fetched successfully",
      data: {
        totalDoctors: doctorCount,
        totalPatients: patientCount,
        totalAppointments: appointmentCount,
        totalRecords: recordCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching admin dashboard data",
      error: error.message,
    });
  }
};

// ✅ Get All Doctors
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().select("-passwordHash");
    res.status(200).json({ success: true, doctors });
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctors", error: error.message });
  }
};

// ✅ Get All Patients
export const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find().select("-passwordHash");
    res.status(200).json({ success: true, patients });
  } catch (error) {
    res.status(500).json({ message: "Error fetching patients", error: error.message });
  }
};

// ✅ Get All Appointments
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("doctorId", "name specialization")
      .populate("patientId", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ message: "Error fetching appointments", error: error.message });
  }
};

// ✅ Delete Doctor
export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json({ success: true, message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting doctor", error: error.message });
  }
};

// ✅ Delete Patient
export const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json({ success: true, message: "Patient deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting patient", error: error.message });
  }
};







