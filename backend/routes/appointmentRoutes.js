// backend/routes/appointmentRoutes.js
import express from "express";
import {
  createAppointment,
  getAllAppointments,
  getDoctorAppointments,
  getPatientAppointments,
  updateAppointmentStatus,
} from "../controllers/appointmentController.js";
import {
  authenticateUser,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const appointmentRouter = express.Router();

// ✅ Patient creates appointment
appointmentRouter.post(
  "/createappointment",
  authenticateUser,
  authorizeRoles("patient"),
  createAppointment
);

// ✅ Admin can view all appointments
appointmentRouter.get(
  "/allappointmentadmin",
  authenticateUser,
  authorizeRoles("admin"),
  getAllAppointments
);

// ✅ Doctor can view own appointments
appointmentRouter.get(
  "/doctorgetappointment",
  authenticateUser,
  authorizeRoles("doctor"),
  getDoctorAppointments
);

// ✅ Patient can view their appointments
appointmentRouter.get(
  "/patientgettheirappointment",
  authenticateUser,
  authorizeRoles("patient"),
  getPatientAppointments
);

// ✅ Doctor/Admin can update appointment status
appointmentRouter.put(
  "/:id/updatestatusappointment",
  authenticateUser,
  authorizeRoles("doctor", "admin"),
  updateAppointmentStatus
);

export default appointmentRouter;
