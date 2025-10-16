import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./configs/db.js";

import doctorRoutes from "./routes/doctorRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import appointmentRouter from "./routes/appointmentRoutes.js";
import medicalRecordRoutes from "./routes/medicalRecordRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

import { authenticateSocket, handleSocketConnection } from "./socket/socketHandler.js";

dotenv.config();
connectDB();

const app = express();
const server = createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.IO authentication middleware
io.use(authenticateSocket);

// Socket.IO connection handler
handleSocketConnection(io);

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors());
app.use(express.json());

app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/appointments", appointmentRouter);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => res.send("🚀 API is running successfully!"));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO server is ready for real-time communication`);
});
