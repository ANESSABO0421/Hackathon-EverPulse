// backend/controllers/appointmentController.js
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctors.js";
import Patient from "../models/Patient.js";

// ✅ Create Appointment (Patient)
export const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, reason, notes } = req.body;
    const patientId = req.user.id; // from JWT

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date,
      time,
      reason,
      notes,
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
    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ message: "Error fetching appointments", error: error.message });
  }
};

// ✅ Get Appointments for Doctor
export const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { page = 1, limit = 10, status = '', date = '', search = '' } = req.query;
    
    let query = { doctorId };
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    let appointments = await Appointment.find(query)
      .populate("patientId", "name email phone")
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Apply search filter if provided
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      appointments = appointments.filter(appointment => 
        appointment.patientId?.name?.match(searchRegex) ||
        appointment.patientId?.email?.match(searchRegex) ||
        appointment.reason?.match(searchRegex)
      );
    }

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      appointments,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctor appointments", error: error.message });
  }
};

// ✅ Get Appointments for Patient
export const getPatientAppointments = async (req, res) => {
  try {
    const patientId = req.user.id;
    const appointments = await Appointment.find({ patientId })
      .populate("doctorId", "name specialization email");
    res.json({ appointments });
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

// ✅ Patient Reschedule Own Appointment (date/time/notes)
export const rescheduleOwnAppointment = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { id } = req.params;
    const { date, time, notes } = req.body;

    const appointment = await Appointment.findOne({ _id: id, patientId });
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    if (date) appointment.date = date;
    if (time) appointment.time = time;
    if (typeof notes !== 'undefined') appointment.notes = notes;

    await appointment.save();

    res.json({ message: "Appointment rescheduled", appointment });
  } catch (error) {
    res.status(500).json({ message: "Error rescheduling appointment", error: error.message });
  }
};

// ✅ Patient Cancel Own Appointment
export const cancelOwnAppointment = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { id } = req.params;

    const appointment = await Appointment.findOne({ _id: id, patientId });
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ message: "Appointment cancelled", appointment });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling appointment", error: error.message });
  }
};

// ✅ Doctor Update Appointment Status
export const updateDoctorAppointmentStatus = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { id } = req.params;
    const { status, notes, diagnosis, treatment, prescriptions } = req.body;

    const appointment = await Appointment.findOne({ _id: id, doctorId });
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found or not authorized" });
    }

    // Update appointment fields
    if (status) appointment.status = status;
    if (notes) appointment.notes = notes;
    if (diagnosis) appointment.diagnosis = diagnosis;
    if (treatment) appointment.treatment = treatment;
    if (prescriptions) appointment.prescriptions = prescriptions;

    // Set completion date if status is completed
    if (status === 'completed') {
      appointment.completedAt = new Date();
    }

    await appointment.save();

    // Populate the updated appointment
    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate("patientId", "name email phone")
      .populate("doctorId", "name specialization");

    res.json({ 
      success: true,
      message: "Appointment updated successfully", 
      appointment: updatedAppointment 
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating appointment", error: error.message });
  }
};

// ✅ Get Doctor's Today's Appointments
export const getDoctorTodayAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const appointments = await Appointment.find({
      doctorId,
      date: { $gte: startOfDay, $lte: endOfDay }
    })
    .populate("patientId", "name email phone")
    .sort({ time: 1 });

    res.json({
      success: true,
      appointments
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching today's appointments", error: error.message });
  }
};

// ✅ Get Doctor's Upcoming Appointments
export const getDoctorUpcomingAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { limit = 10 } = req.query;

    const appointments = await Appointment.find({
      doctorId,
      date: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed'] }
    })
    .populate("patientId", "name email phone")
    .sort({ date: 1, time: 1 })
    .limit(parseInt(limit));

    res.json({
      success: true,
      appointments
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching upcoming appointments", error: error.message });
  }
};

// ✅ Get Doctor's Appointment Statistics
export const getDoctorAppointmentStats = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { period = 30 } = req.query; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get appointment statistics
    const stats = await Appointment.aggregate([
      {
        $match: {
          doctorId: doctorId,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get daily appointment counts for the period
    const dailyStats = await Appointment.aggregate([
      {
        $match: {
          doctorId: doctorId,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.json({
      success: true,
      stats,
      dailyStats
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching appointment statistics", error: error.message });
  }
};
