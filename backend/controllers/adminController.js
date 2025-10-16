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
import Feedback from "../models/Feedback.js";

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

// ✅ Update Doctor
export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData.passwordHash;
    delete updateData.role;

    const doctor = await Doctor.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json({
      success: true,
      message: "Doctor updated successfully",
      doctor
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error updating doctor", 
      error: error.message 
    });
  }
};

// ✅ Update Patient
export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData.passwordHash;
    delete updateData.role;

    const patient = await Patient.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json({
      success: true,
      message: "Patient updated successfully",
      patient
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error updating patient", 
      error: error.message 
    });
  }
};

// ✅ Get All Medical Records
export const getAllMedicalRecords = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { diagnosis: { $regex: search, $options: 'i' } },
          { treatment: { $regex: search, $options: 'i' } },
          { notes: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const records = await MedicalRecord.find(query)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialization')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await MedicalRecord.countDocuments(query);

    res.json({
      success: true,
      records,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching medical records", 
      error: error.message 
    });
  }
};

// ✅ Get Analytics Data
export const getAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Basic counts
    const [totalDoctors, totalPatients, totalAppointments, totalRecords] = await Promise.all([
      Doctor.countDocuments(),
      Patient.countDocuments(),
      Appointment.countDocuments(),
      MedicalRecord.countDocuments()
    ]);

    // Recent activity
    const [recentDoctors, recentPatients, recentAppointments, recentRecords] = await Promise.all([
      Doctor.countDocuments({ createdAt: { $gte: daysAgo } }),
      Patient.countDocuments({ createdAt: { $gte: daysAgo } }),
      Appointment.countDocuments({ createdAt: { $gte: daysAgo } }),
      MedicalRecord.countDocuments({ createdAt: { $gte: daysAgo } })
    ]);

    // Appointments by status
    const appointmentsByStatus = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Appointments by month for the last 12 months
    const appointmentsByMonth = await Appointment.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Doctor specializations
    const doctorSpecializations = await Doctor.aggregate([
      {
        $group: {
          _id: '$specialization',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Patient demographics
    const patientDemographics = await Patient.aggregate([
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      analytics: {
        overview: {
          totalDoctors,
          totalPatients,
          totalAppointments,
          totalRecords,
          recentDoctors,
          recentPatients,
          recentAppointments,
          recentRecords
        },
        appointmentsByStatus,
        appointmentsByMonth,
        doctorSpecializations,
        patientDemographics
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching analytics", 
      error: error.message 
    });
  }
};

// ✅ Get Admin Profile
export const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.id;
    const admin = await Admin.findById(adminId).select('-passwordHash');
    
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({
      success: true,
      admin
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error retrieving admin profile", 
      error: error.message 
    });
  }
};

// ✅ Update Admin Profile
export const updateAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.id;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData.passwordHash;
    delete updateData.role;

    const admin = await Admin.findByIdAndUpdate(
      adminId,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({
      success: true,
      message: "Admin profile updated successfully",
      admin
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error updating admin profile", 
      error: error.message 
    });
  }
};

// ✅ Get Feedback
export const getFeedback = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = '', rating = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;
    if (rating) query.rating = parseInt(rating);

    const feedback = await Feedback.find(query)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name specialization')
      .populate('appointmentId', 'date status')
      .populate('respondedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Feedback.countDocuments(query);

    // Get feedback statistics
    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalFeedback: { $sum: 1 },
          pendingCount: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          reviewedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'reviewed'] }, 1, 0] }
          }
        }
      }
    ]);

    const ratingDistribution = await Feedback.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      feedback,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      stats: stats[0] || {
        averageRating: 0,
        totalFeedback: 0,
        pendingCount: 0,
        reviewedCount: 0
      },
      ratingDistribution
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching feedback", 
      error: error.message 
    });
  }
};

// ✅ Update Feedback
export const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, response } = req.body;
    const adminId = req.user.id;

    const updateData = { status, adminNotes };
    
    if (response) {
      updateData.response = response;
      updateData.respondedBy = adminId;
      updateData.respondedAt = new Date();
    }

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('patientId', 'name email')
    .populate('doctorId', 'name specialization')
    .populate('appointmentId', 'date status')
    .populate('respondedBy', 'name');

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.json({
      success: true,
      message: "Feedback updated successfully",
      feedback
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error updating feedback", 
      error: error.message 
    });
  }
};

// ✅ Delete Feedback
export const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) return res.status(404).json({ message: "Feedback not found" });
    
    res.json({ 
      success: true, 
      message: "Feedback deleted successfully" 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error deleting feedback", 
      error: error.message 
    });
  }
};



