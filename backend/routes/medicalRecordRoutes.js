import express from "express";
import { 
  createMedicalRecord, 
  getMedicalRecordsByPatient, 
  getMedicalRecordsByDoctor,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord,
  getPatientMedicalHistory,
  getDoctorMedicalRecords,
  getDoctorMedicalRecordsStats,
  getDoctorRecentRecords,
  searchMedicalRecords,
  getDoctorMedicalRecordById,
  updateDoctorMedicalRecord,
  deleteDoctorMedicalRecord
} from "../controllers/medicalRecordController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const medicalRecordRouter = express.Router();

// Protected routes - require authentication
medicalRecordRouter.use(authMiddleware);

// Create a new medical record (doctor only)
medicalRecordRouter.post("/", createMedicalRecord);

// Get medical records by patient ID
medicalRecordRouter.get("/patient/:patientId", getMedicalRecordsByPatient);

// Get medical records by doctor ID
medicalRecordRouter.get("/doctor/:doctorId", getMedicalRecordsByDoctor);

// Get patient's complete medical history
medicalRecordRouter.get("/patient/:patientId/history", getPatientMedicalHistory);

// Get specific medical record by ID
medicalRecordRouter.get("/:id", getMedicalRecordById);

// Update medical record
medicalRecordRouter.put("/:id", updateMedicalRecord);

// Delete medical record
medicalRecordRouter.delete("/:id", deleteMedicalRecord);

// Doctor-specific medical record routes
medicalRecordRouter.get("/doctor/records", getDoctorMedicalRecords);
medicalRecordRouter.get("/doctor/stats", getDoctorMedicalRecordsStats);
medicalRecordRouter.get("/doctor/recent", getDoctorRecentRecords);
medicalRecordRouter.get("/doctor/search", searchMedicalRecords);
medicalRecordRouter.get("/doctor/:id", getDoctorMedicalRecordById);
medicalRecordRouter.put("/doctor/:id", updateDoctorMedicalRecord);
medicalRecordRouter.delete("/doctor/:id", deleteDoctorMedicalRecord);

export default medicalRecordRouter;
