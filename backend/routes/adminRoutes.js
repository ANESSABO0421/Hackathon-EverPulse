import express from "express";
import { 
  registerAdmin, 
  loginAdmin,
  getAdminDashboard,
  getAllDoctors,
  getAllPatients,
  getAllAppointments,
  getAllMedicalRecords,
  deleteDoctor,
  deletePatient,
  updateDoctor,
  updatePatient,
  getAnalytics,
  getFeedback,
  updateFeedback,
  deleteFeedback,
  getAdminProfile,
  updateAdminProfile
} from "../controllers/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const adminRouter = express.Router();

// Public routes
adminRouter.post("/signup", registerAdmin);
adminRouter.post("/login", loginAdmin);

// Protected routes - require authentication
adminRouter.use(authMiddleware);

// Dashboard routes
adminRouter.get("/dashboard", getAdminDashboard);
adminRouter.get("/analytics", getAnalytics);

// Profile management
adminRouter.get("/profile", getAdminProfile);
adminRouter.put("/profile", updateAdminProfile);

// Doctor management
adminRouter.get("/doctors", getAllDoctors);
adminRouter.put("/doctors/:id", updateDoctor);
adminRouter.delete("/doctors/:id", deleteDoctor);

// Patient management
adminRouter.get("/patients", getAllPatients);
adminRouter.put("/patients/:id", updatePatient);
adminRouter.delete("/patients/:id", deletePatient);

// Appointments management
adminRouter.get("/appointments", getAllAppointments);

// Medical records management
adminRouter.get("/medical-records", getAllMedicalRecords);

// Feedback management
adminRouter.get("/feedback", getFeedback);
adminRouter.put("/feedback/:id", updateFeedback);
adminRouter.delete("/feedback/:id", deleteFeedback);

export default adminRouter;
