// backend/controllers/appointmentController.js
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctors.js";
import Patient from "../models/Patient.js";

// ✅ Create Appointment (Patient)
export const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;
    const patientId = req.user.id; // from JWT

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date,
      time,
      reason,
    });

    res.status(201).json({
      message: "Appointment created successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating appointment", error: error.message });
  }
};

// ✅ Get All Appointments (Admin)
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patientId", "name email")
      .populate("doctorId", "name specialization");
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching appointments", error: error.message });
  }
};

// ✅ Get Appointments for Doctor
export const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const appointments = await Appointment.find({ doctorId })
      .populate("patientId", "name email phone");
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctor appointments", error: error.message });
  }
};

// ✅ Get Appointments for Patient
export const getPatientAppointments = async (req, res) => {
  try {
    const patientId = req.user.id;
    const appointments = await Appointment.find({ patientId })
      .populate("doctorId", "name specialization");
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching patient appointments", error: error.message });
  }
};

// ✅ Update Appointment Status (Doctor or Admin)
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status, notes },
      { new: true }
    );

    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    res.json({ message: "Appointment updated successfully", appointment });
  } catch (error) {
    res.status(500).json({ message: "Error updating appointment", error: error.message });
  }
};
