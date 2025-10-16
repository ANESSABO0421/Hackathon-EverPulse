// backend/routes/appointmentRoutes.js
import express from "express";
import {
  createAppointment,
  getAllAppointments,
  getDoctorAppointments,
  getPatientAppointments,
  updateAppointmentStatus,
  rescheduleOwnAppointment,
  cancelOwnAppointment,
  updateDoctorAppointmentStatus,
  getDoctorTodayAppointments,
  getDoctorUpcomingAppointments,
  getDoctorAppointmentStats,
} from "../controllers/appointmentController.js";
import {
  authenticateUser,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const appointmentRouter = express.Router();

// Conventional endpoints used by client
appointmentRouter.get("/", authenticateUser, getAllAppointments); // Admin should filter; patient will get all unless we change client
appointmentRouter.get("/patient/:id", authenticateUser, getPatientAppointments); // id ignored, uses token
appointmentRouter.post("/", authenticateUser, authorizeRoles("patient"), createAppointment);
appointmentRouter.put("/:id", authenticateUser, updateAppointmentStatus);

// Existing specific endpoints (kept for compatibility)
appointmentRouter.post(
  "/createappointment",
  authenticateUser,
  authorizeRoles("patient"),
  createAppointment
);

appointmentRouter.get(
  "/allappointmentadmin",
  authenticateUser,
  authorizeRoles("admin"),
  getAllAppointments
);

appointmentRouter.get(
  "/doctorgetappointment",
  authenticateUser,
  authorizeRoles("doctor"),
  getDoctorAppointments
);

appointmentRouter.get(
  "/patientgettheirappointment",
  authenticateUser,
  authorizeRoles("patient"),
  getPatientAppointments
);

appointmentRouter.put(
  "/:id/updatestatusappointment",
  authenticateUser,
  authorizeRoles("doctor", "admin"),
  updateAppointmentStatus
);

// Patient self-service
appointmentRouter.put(
  "/:id/reschedule",
  authenticateUser,
  authorizeRoles("patient"),
  rescheduleOwnAppointment
);

appointmentRouter.put(
  "/:id/cancel",
  authenticateUser,
  authorizeRoles("patient"),
  cancelOwnAppointment
);

// Doctor-specific appointment routes
appointmentRouter.put(
  "/:id/doctor-update",
  authenticateUser,
  authorizeRoles("doctor"),
  updateDoctorAppointmentStatus
);

appointmentRouter.get(
  "/doctor/today",
  authenticateUser,
  authorizeRoles("doctor"),
  getDoctorTodayAppointments
);

appointmentRouter.get(
  "/doctor/upcoming",
  authenticateUser,
  authorizeRoles("doctor"),
  getDoctorUpcomingAppointments
);

appointmentRouter.get(
  "/doctor/stats",
  authenticateUser,
  authorizeRoles("doctor"),
  getDoctorAppointmentStats
);

export default appointmentRouter;
