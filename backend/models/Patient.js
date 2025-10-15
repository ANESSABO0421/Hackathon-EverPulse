import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    dateOfBirth: { type: Date, required: true },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    emergencyContact: {
      name: String,
      relation: String,
      phone: String,
    },
    insuranceProvider: String,
    insurancePolicyNumber: String,
    maritalStatus: {
      type: String,
      enum: ["single", "married", "divorced", "widowed"],
    },
    height: Number,
    weight: Number,
    role: { type: String, default: "patient" },

    allergies: [String],
    chronicConditions: [String],
    currentMedications: [String],
    medicalHistory: [
      {
        condition: String,
        diagnosisDate: Date,
        notes: String,
      },
    ],
    familyMedicalHistory: [
      {
        relation: String,
        condition: String,
      },
    ],
    preferredDoctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Patient", patientSchema);
