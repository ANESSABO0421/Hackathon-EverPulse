import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, required: true },
    department: String,
    role: { type: String, default: "admin" },

    accessLevel: {
      type: String,
      enum: ["full", "restricted"],
      default: "restricted",
    },
    employeeId: String,
  },
  { timestamps: true }
);

export default mongoose.model("Admin", adminSchema);
