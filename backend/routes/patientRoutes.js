import express from "express";
import { 
  registerPatient, 
  loginPatient, 
  getPatientProfile, 
  updatePatientProfile, 
  getPatientRecordsSummary 
} from "../controllers/patientController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const patientRouter = express.Router();

// Public routes
patientRouter.post("/signup", registerPatient);
patientRouter.post("/login", loginPatient);

// Protected routes - require authentication
patientRouter.use(authMiddleware);

// Patient profile management
patientRouter.get("/profile", getPatientProfile);
patientRouter.put("/profile", updatePatientProfile);
patientRouter.get("/records-summary", getPatientRecordsSummary);

export default patientRouter;
