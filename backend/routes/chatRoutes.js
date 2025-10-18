import express from "express";
import {
  getUserChats,
  getOrCreateChat,
  getChatMessages,
  sendMessage,
  markMessagesAsRead,
  getAvailableDoctors,
  getDoctorPatients,
  deleteMessage,
  editMessage
} from "../controllers/chatController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const chatRouter = express.Router();

// All routes require authentication
chatRouter.use(authMiddleware);

// Chat management routes
chatRouter.get("/chats", getUserChats);
chatRouter.post("/chats", getOrCreateChat);
chatRouter.get("/doctors", getAvailableDoctors);
chatRouter.get("/patients", getDoctorPatients);

// Message routes
chatRouter.get("/chats/:chatId/messages", getChatMessages);
chatRouter.post("/chats/:chatId/messages", sendMessage);
chatRouter.put("/chats/:chatId/read", markMessagesAsRead);

// Message actions
chatRouter.delete("/messages/:messageId", deleteMessage);
chatRouter.put("/messages/:messageId", editMessage);

export default chatRouter;
