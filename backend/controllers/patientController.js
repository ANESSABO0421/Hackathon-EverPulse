import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Patient from "../models/Patient.js";

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
