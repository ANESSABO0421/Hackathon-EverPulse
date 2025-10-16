import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Doctor from "../models/Doctors.js";
import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import MedicalRecord from "../models/MedicalRecord.js";

// ✅ Doctor Signup
export const registerDoctor = async (req, res) => {
  try {
    const { email, password, ...rest } = req.body;
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) return res.status(400).json({ message: "Doctor already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const doctor = await Doctor.create({ email, passwordHash, ...rest });

    res.status(201).json({ message: "Doctor registered successfully", doctor });
  } catch (error) {
    res.status(500).json({ message: "Error registering doctor", error: error.message });
  }
};

// ✅ Doctor Login
export const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await Doctor.findOne({ email });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const isMatch = await bcrypt.compare(password, doctor.passwordHash);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: doctor._id, role: "doctor" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Doctor login successful", token, role:doctor.role });
  } catch (error) {
    res.status(500).json({ message: "Login error", error: error.message });
  }
};

// ✅ Get All Doctors (public)
export const getAllDoctors = async (req, res) => {
  try {
    const { search = "", specialization = "" } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { hospital: { $regex: search, $options: "i" } },
        { specialization: { $regex: search, $options: "i" } },
      ];
    }
    if (specialization) {
      query.specialization = { $regex: specialization, $options: "i" };
    }

    const doctors = await Doctor.find(query).select("-passwordHash").sort({ name: 1 });
    res.json({ success: true, doctors });
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctors", error: error.message });
  }
};

// ✅ Get Doctor by ID (public)
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select("-passwordHash");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctor", error: error.message });
  }
};

// ✅ Get Doctor Profile (authenticated)
export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id).select("-passwordHash");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctor profile", error: error.message });
  }
};

// ✅ Update Doctor Profile (authenticated)
export const updateDoctorProfile = async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    
    // If password is being updated, hash it
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const doctor = await Doctor.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-passwordHash");

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    
    res.json({ success: true, message: "Profile updated successfully", doctor });
  } catch (error) {
    res.status(500).json({ message: "Error updating doctor profile", error: error.message });
  }
};

// ✅ Get Doctor Dashboard Stats
export const getDoctorDashboard = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Get today's appointments
    const todayAppointments = await Appointment.find({
      doctorId,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).populate('patientId', 'name email');

    // Get upcoming appointments (next 7 days)
    const upcomingAppointments = await Appointment.find({
      doctorId,
      date: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed'] }
    })
    .populate('patientId', 'name email')
    .sort({ date: 1 })
    .limit(5);

    // Get total patients
    const totalPatients = await Appointment.distinct('patientId', { doctorId });

    // Get recent medical records created by this doctor
    const recentRecords = await MedicalRecord.find({ doctorId })
      .populate('patientId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get appointment statistics
    const appointmentStats = await Appointment.aggregate([
      { $match: { doctorId: doctorId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get monthly appointment trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyStats = await Appointment.aggregate([
      {
        $match: {
          doctorId: doctorId,
          date: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      dashboard: {
        todayAppointments,
        upcomingAppointments,
        totalPatients: totalPatients.length,
        recentRecords,
        appointmentStats,
        monthlyStats
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctor dashboard", error: error.message });
  }
};

// ✅ Get Doctor's Patients
export const getDoctorPatients = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { page = 1, limit = 10, search = '' } = req.query;
    
    // Get unique patient IDs from appointments
    const patientIds = await Appointment.distinct('patientId', { doctorId });
    
    // Build search query
    let searchQuery = { _id: { $in: patientIds } };
    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const patients = await Patient.find(searchQuery)
      .select('-passwordHash')
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Patient.countDocuments(searchQuery);

    res.json({
      success: true,
      patients,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching doctor patients", error: error.message });
  }
};

// ✅ Get Doctor's Appointments
export const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { page = 1, limit = 10, status = '', date = '' } = req.query;
    
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

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

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

// ✅ Get Patient Details for Doctor
export const getPatientDetails = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { patientId } = req.params;

    // Verify that the doctor has treated this patient
    const hasAppointment = await Appointment.findOne({ 
      doctorId, 
      patientId 
    });

    if (!hasAppointment) {
      return res.status(403).json({ 
        message: "You don't have access to this patient's information" 
      });
    }

    // Get patient details
    const patient = await Patient.findById(patientId).select('-passwordHash');
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Get patient's appointments with this doctor
    const appointments = await Appointment.find({ 
      doctorId, 
      patientId 
    })
    .sort({ date: -1 })
    .limit(10);

    // Get patient's medical records created by this doctor
    const medicalRecords = await MedicalRecord.find({ 
      doctorId, 
      patientId 
    })
    .sort({ createdAt: -1 })
    .limit(10);

    res.json({
      success: true,
      patient,
      appointments,
      medicalRecords
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching patient details", error: error.message });
  }
};

// ✅ Get Patient's Medical Records (Doctor's view)
export const getPatientMedicalRecords = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { patientId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Verify that the doctor has treated this patient
    const hasAppointment = await Appointment.findOne({ 
      doctorId, 
      patientId 
    });

    if (!hasAppointment) {
      return res.status(403).json({ 
        message: "You don't have access to this patient's medical records" 
      });
    }

    // Get medical records created by this doctor for this patient
    const medicalRecords = await MedicalRecord.find({ 
      doctorId, 
      patientId 
    })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await MedicalRecord.countDocuments({ 
      doctorId, 
      patientId 
    });

    res.json({
      success: true,
      medicalRecords,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching patient medical records", error: error.message });
  }
};

// ✅ Get Patient's Appointment History with Doctor
export const getPatientAppointmentHistory = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { patientId } = req.params;
    const { page = 1, limit = 10, status = '' } = req.query;

    // Verify that the doctor has treated this patient
    const hasAppointment = await Appointment.findOne({ 
      doctorId, 
      patientId 
    });

    if (!hasAppointment) {
      return res.status(403).json({ 
        message: "You don't have access to this patient's appointment history" 
      });
    }

    let query = { doctorId, patientId };
    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

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
    res.status(500).json({ message: "Error fetching patient appointment history", error: error.message });
  }
};

// ✅ Create Medical Record for Patient
export const createMedicalRecord = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { patientId } = req.params;
    const medicalRecordData = req.body;

    // Verify that the doctor has treated this patient
    const hasAppointment = await Appointment.findOne({ 
      doctorId, 
      patientId 
    });

    if (!hasAppointment) {
      return res.status(403).json({ 
        message: "You can only create medical records for your patients" 
      });
    }

    // Create medical record
    const medicalRecord = await MedicalRecord.create({
      ...medicalRecordData,
      doctorId,
      patientId
    });

    // Populate the created record
    const populatedRecord = await MedicalRecord.findById(medicalRecord._id)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name specialization');

    res.status(201).json({
      success: true,
      message: "Medical record created successfully",
      medicalRecord: populatedRecord
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating medical record", error: error.message });
  }
};