import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Patient from "../models/Patient.js";
import MedicalRecord from "../models/MedicalRecord.js";

export const registerPatient = async (req, res) => {
  try {
    const { email, password, ...rest } = req.body;
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) return res.status(400).json({ message: "Patient already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const patient = await Patient.create({ email, passwordHash, ...rest });

    res.status(201).json({ message: "Patient registered successfully", patient });
  } catch (error) {
    res.status(500).json({ message: "Error registering patient", error: error.message });
  }
};

// ✅ Patient Login
export const loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;
    const patient = await Patient.findOne({ email });
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const isMatch = await bcrypt.compare(password, patient.passwordHash);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: patient._id, role: "patient" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Patient login successful", token, role:patient.role });
  } catch (error) {
    res.status(500).json({ message: "Login error", error: error.message });
  }
};

// Get patient profile
export const getPatientProfile = async (req, res) => {
  try {
    const patientId = req.user.id;
    const patient = await Patient.findById(patientId).select('-passwordHash');
    
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json({
      message: "Patient profile retrieved successfully",
      patient
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error retrieving patient profile", 
      error: error.message 
    });
  }
};

// Update patient profile
export const updatePatientProfile = async (req, res) => {
  try {
    const patientId = req.user.id;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData.passwordHash;
    delete updateData.role;

    const patient = await Patient.findByIdAndUpdate(
      patientId,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json({
      message: "Patient profile updated successfully",
      patient
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error updating patient profile", 
      error: error.message 
    });
  }
};

// Get patient's medical records summary
export const getPatientRecordsSummary = async (req, res) => {
  try {
    const patientId = req.user.id;

    // Get patient info
    const patient = await Patient.findById(patientId).select('-passwordHash');
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Get medical records count
    const recordsCount = await MedicalRecord.countDocuments({ patientId });

    // Get latest medical record
    const latestRecord = await MedicalRecord.findOne({ patientId })
      .populate('doctorId', 'name specialization')
      .sort({ visitDate: -1 });

    // Get medical records by month for the last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const recordsByMonth = await MedicalRecord.aggregate([
      { $match: { patientId: patient._id, visitDate: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$visitDate" },
            month: { $month: "$visitDate" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.json({
      message: "Patient records summary retrieved successfully",
      summary: {
        patient,
        totalRecords: recordsCount,
        latestRecord,
        recordsByMonth
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error retrieving patient records summary", 
      error: error.message 
    });
  }
};
