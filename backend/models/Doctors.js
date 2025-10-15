import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
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
    specialization: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    yearsOfExperience: { type: Number, required: true },
    qualifications: [String],
    hospitalAffiliation: String,
    role: { type: String, default: "doctor" },

    availability: {
      days: [String],
      timeSlots: [String],
    },
    bio: String,
    consultationFee: Number,
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema);
