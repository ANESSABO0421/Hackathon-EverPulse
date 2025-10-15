import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Doctor from "../models/Doctors.js";

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
