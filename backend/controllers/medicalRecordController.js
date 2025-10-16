import MedicalRecord from "../models/MedicalRecord.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctors.js";

// Create a new medical record
export const createMedicalRecord = async (req, res) => {
  try {
    const { patientId, diagnosis, treatment, prescriptions, notes } = req.body;
    const doctorId = req.user.id; // From auth middleware

    // Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const medicalRecord = await MedicalRecord.create({
      patientId,
      doctorId,
      diagnosis,
      treatment,
      prescriptions: prescriptions || [],
      notes,
      visitDate: new Date()
    });

    // Populate the response with patient and doctor details
    const populatedRecord = await MedicalRecord.findById(medicalRecord._id)
      .populate('patientId', 'name email phone dateOfBirth')
      .populate('doctorId', 'name specialization email');

    res.status(201).json({
      message: "Medical record created successfully",
      record: populatedRecord
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error creating medical record", 
      error: error.message 
    });
  }
};

// Get medical records by patient ID
export const getMedicalRecordsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const userRole = req.user.role;

    // Patients can only access their own records
    // Doctors and admins can access any patient's records
    if (userRole === 'patient' && req.user.id !== patientId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const records = await MedicalRecord.find({ patientId })
      .populate('patientId', 'name email phone dateOfBirth bloodGroup')
      .populate('doctorId', 'name specialization email')
      .sort({ visitDate: -1 });

    res.json({
      message: "Medical records retrieved successfully",
      records,
      count: records.length
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error retrieving medical records", 
      error: error.message 
    });
  }
};

// Get medical records by doctor ID
export const getMedicalRecordsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const userRole = req.user.role;

    // Doctors can only access their own records
    // Admins can access any doctor's records
    if (userRole === 'doctor' && req.user.id !== doctorId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const records = await MedicalRecord.find({ doctorId })
      .populate('patientId', 'name email phone dateOfBirth')
      .populate('doctorId', 'name specialization email')
      .sort({ visitDate: -1 });

    res.json({
      message: "Medical records retrieved successfully",
      records,
      count: records.length
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error retrieving medical records", 
      error: error.message 
    });
  }
};

// Get patient's complete medical history with additional patient data
export const getPatientMedicalHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const userRole = req.user.role;

    // Patients can only access their own records
    // Doctors and admins can access any patient's records
    if (userRole === 'patient' && req.user.id !== patientId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get patient information
    const patient = await Patient.findById(patientId)
      .select('-passwordHash');

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Get medical records
    const records = await MedicalRecord.find({ patientId })
      .populate('doctorId', 'name specialization email')
      .sort({ visitDate: -1 });

    res.json({
      message: "Patient medical history retrieved successfully",
      patient,
      medicalRecords: records,
      recordCount: records.length
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error retrieving patient medical history", 
      error: error.message 
    });
  }
};

// Get specific medical record by ID
export const getMedicalRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;

    const record = await MedicalRecord.findById(id)
      .populate('patientId', 'name email phone dateOfBirth bloodGroup')
      .populate('doctorId', 'name specialization email');

    if (!record) {
      return res.status(404).json({ message: "Medical record not found" });
    }

    // Patients can only access their own records
    // Doctors can access records they created or for their patients
    // Admins can access any record
    if (userRole === 'patient' && record.patientId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (userRole === 'doctor' && 
        record.doctorId._id.toString() !== req.user.id && 
        record.patientId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({
      message: "Medical record retrieved successfully",
      record
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error retrieving medical record", 
      error: error.message 
    });
  }
};

// Update medical record
export const updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userRole = req.user.role;

    const record = await MedicalRecord.findById(id);
    if (!record) {
      return res.status(404).json({ message: "Medical record not found" });
    }

    // Only the doctor who created the record or admin can update it
    if (userRole === 'doctor' && record.doctorId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedRecord = await MedicalRecord.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('patientId', 'name email phone dateOfBirth')
     .populate('doctorId', 'name specialization email');

    res.json({
      message: "Medical record updated successfully",
      record: updatedRecord
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error updating medical record", 
      error: error.message 
    });
  }
};

// Delete medical record
export const deleteMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;

    const record = await MedicalRecord.findById(id);
    if (!record) {
      return res.status(404).json({ message: "Medical record not found" });
    }

    // Only the doctor who created the record or admin can delete it
    if (userRole === 'doctor' && record.doctorId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    await MedicalRecord.findByIdAndDelete(id);

    res.json({
      message: "Medical record deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error deleting medical record", 
      error: error.message 
    });
  }
};

// ✅ Get Doctor's Medical Records with Advanced Filtering
export const getDoctorMedicalRecords = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      patientId = '', 
      diagnosis = '',
      dateFrom = '',
      dateTo = '',
      sortBy = 'visitDate',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = { doctorId };
    
    if (patientId) {
      query.patientId = patientId;
    }
    
    if (diagnosis) {
      query.diagnosis = { $regex: diagnosis, $options: 'i' };
    }
    
    if (dateFrom || dateTo) {
      query.visitDate = {};
      if (dateFrom) {
        query.visitDate.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.visitDate.$lte = new Date(dateTo);
      }
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    let records = await MedicalRecord.find(query)
      .populate('patientId', 'name email phone dateOfBirth bloodGroup')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Apply search filter if provided
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      records = records.filter(record => 
        record.patientId?.name?.match(searchRegex) ||
        record.patientId?.email?.match(searchRegex) ||
        record.diagnosis?.match(searchRegex) ||
        record.treatment?.match(searchRegex)
      );
    }

    const total = await MedicalRecord.countDocuments(query);

    res.json({
      success: true,
      records,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching doctor medical records", 
      error: error.message 
    });
  }
};

// ✅ Get Doctor's Medical Records Statistics
export const getDoctorMedicalRecordsStats = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { period = 30 } = req.query; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get total records count
    const totalRecords = await MedicalRecord.countDocuments({ doctorId });

    // Get records count for the period
    const periodRecords = await MedicalRecord.countDocuments({
      doctorId,
      visitDate: { $gte: startDate }
    });

    // Get unique patients count
    const uniquePatients = await MedicalRecord.distinct('patientId', { doctorId });

    // Get most common diagnoses
    const commonDiagnoses = await MedicalRecord.aggregate([
      { $match: { doctorId } },
      { $group: { _id: '$diagnosis', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get monthly records trend
    const monthlyStats = await MedicalRecord.aggregate([
      {
        $match: {
          doctorId,
          visitDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$visitDate' },
            month: { $month: '$visitDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get records by patient
    const recordsByPatient = await MedicalRecord.aggregate([
      { $match: { doctorId } },
      {
        $group: {
          _id: '$patientId',
          count: { $sum: 1 },
          lastVisit: { $max: '$visitDate' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Populate patient names for records by patient
    const populatedRecordsByPatient = await MedicalRecord.populate(recordsByPatient, {
      path: '_id',
      select: 'name email'
    });

    res.json({
      success: true,
      stats: {
        totalRecords,
        periodRecords,
        uniquePatients: uniquePatients.length,
        commonDiagnoses,
        monthlyStats,
        recordsByPatient: populatedRecordsByPatient
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching medical records statistics", 
      error: error.message 
    });
  }
};

// ✅ Get Doctor's Recent Medical Records
export const getDoctorRecentRecords = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { limit = 10 } = req.query;

    const records = await MedicalRecord.find({ doctorId })
      .populate('patientId', 'name email phone')
      .sort({ visitDate: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      records
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching recent medical records", 
      error: error.message 
    });
  }
};

// ✅ Search Medical Records
export const searchMedicalRecords = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { 
      query: searchQuery, 
      page = 1, 
      limit = 10 
    } = req.query;

    if (!searchQuery) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const searchRegex = new RegExp(searchQuery, 'i');
    
    const records = await MedicalRecord.find({
      doctorId,
      $or: [
        { diagnosis: searchRegex },
        { treatment: searchRegex },
        { notes: searchRegex },
        { prescriptions: { $in: [searchRegex] } }
      ]
    })
    .populate('patientId', 'name email phone')
    .sort({ visitDate: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await MedicalRecord.countDocuments({
      doctorId,
      $or: [
        { diagnosis: searchRegex },
        { treatment: searchRegex },
        { notes: searchRegex },
        { prescriptions: { $in: [searchRegex] } }
      ]
    });

    res.json({
      success: true,
      records,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error searching medical records", 
      error: error.message 
    });
  }
};

// ✅ Get Medical Record by ID (Doctor's view)
export const getDoctorMedicalRecordById = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { id } = req.params;

    const record = await MedicalRecord.findOne({ _id: id, doctorId })
      .populate('patientId', 'name email phone dateOfBirth bloodGroup allergies chronicConditions currentMedications')
      .populate('doctorId', 'name specialization email');

    if (!record) {
      return res.status(404).json({ message: "Medical record not found or access denied" });
    }

    res.json({
      success: true,
      record
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching medical record", 
      error: error.message 
    });
  }
};

// ✅ Update Medical Record (Doctor's view)
export const updateDoctorMedicalRecord = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { id } = req.params;
    const updateData = req.body;

    const record = await MedicalRecord.findOne({ _id: id, doctorId });
    if (!record) {
      return res.status(404).json({ message: "Medical record not found or access denied" });
    }

    const updatedRecord = await MedicalRecord.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('patientId', 'name email phone dateOfBirth')
     .populate('doctorId', 'name specialization email');

    res.json({
      success: true,
      message: "Medical record updated successfully",
      record: updatedRecord
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error updating medical record", 
      error: error.message 
    });
  }
};

// ✅ Delete Medical Record (Doctor's view)
export const deleteDoctorMedicalRecord = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { id } = req.params;

    const record = await MedicalRecord.findOne({ _id: id, doctorId });
    if (!record) {
      return res.status(404).json({ message: "Medical record not found or access denied" });
    }

    await MedicalRecord.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Medical record deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error deleting medical record", 
      error: error.message 
    });
  }
};
