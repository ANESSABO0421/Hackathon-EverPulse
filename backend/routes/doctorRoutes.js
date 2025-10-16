import express from "express";
import { 
  registerDoctor, 
  loginDoctor, 
  getAllDoctors, 
  getDoctorById,
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorDashboard,
  getDoctorPatients,
  getDoctorAppointments,
  getPatientDetails,
  getPatientMedicalRecords,
  getPatientAppointmentHistory,
  createMedicalRecord
} from "../controllers/doctorController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const doctorRouter = express.Router();

// Public routes
doctorRouter.post("/signup", registerDoctor);
doctorRouter.post("/login", loginDoctor);
doctorRouter.get("/", getAllDoctors);
doctorRouter.get("/:id", getDoctorById);

// Protected routes - require authentication
doctorRouter.use(authMiddleware);

// Doctor profile management
doctorRouter.get("/profile/me", getDoctorProfile);
doctorRouter.put("/profile/me", updateDoctorProfile);

// Doctor dashboard
doctorRouter.get("/dashboard/overview", getDoctorDashboard);
doctorRouter.get("/dashboard/patients", getDoctorPatients);
doctorRouter.get("/dashboard/appointments", getDoctorAppointments);

// Patient management
doctorRouter.get("/patients/:patientId", getPatientDetails);
doctorRouter.get("/patients/:patientId/medical-records", getPatientMedicalRecords);
doctorRouter.get("/patients/:patientId/appointments", getPatientAppointmentHistory);
doctorRouter.post("/patients/:patientId/medical-records", createMedicalRecord);

export default doctorRouter;
