import jwt from "jsonwebtoken";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctors.js";

// Socket.IO authentication middleware
export const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user details based on role
    let user;
    if (decoded.role === 'patient') {
      user = await Patient.findById(decoded.id).select('name email');
    } else if (decoded.role === 'doctor') {
      user = await Doctor.findById(decoded.id).select('name email specialization');
    }

    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    socket.userName = user.name;
    
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
};

// Socket.IO connection handler
export const handleSocketConnection = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userName} (${socket.userRole})`);

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Join chat rooms
    socket.on('joinChat', (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.userName} joined chat ${chatId}`);
      
      // Notify other participants
      socket.to(chatId).emit('userJoined', {
        userId: socket.userId,
        userName: socket.userName,
        userRole: socket.userRole
      });
    });

    // Leave chat rooms
    socket.on('leaveChat', (chatId) => {
      socket.leave(chatId);
      console.log(`User ${socket.userName} left chat ${chatId}`);
      
      // Notify other participants
      socket.to(chatId).emit('userLeft', {
        userId: socket.userId,
        userName: socket.userName,
        userRole: socket.userRole
      });
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { chatId, isTyping, userId, userName } = data;
      socket.to(chatId).emit('typing', {
        userId: userId || socket.userId,
        userName: userName || socket.userName,
        userRole: socket.userRole,
        isTyping
      });
    });

    // Handle message delivery confirmation
    socket.on('messageDelivered', (messageId) => {
      // Update message status in database
      // This would typically update the Message model
      console.log(`Message ${messageId} delivered to ${socket.userName}`);
    });

    // Handle message read confirmation
    socket.on('messageRead', (data) => {
      const { messageId, chatId } = data;
      // Update message read status in database
      // This would typically update the Message model
      console.log(`Message ${messageId} read by ${socket.userName}`);
      
      // Notify sender
      socket.to(chatId).emit('messageReadBy', {
        messageId,
        readBy: {
          userId: socket.userId,
          userName: socket.userName,
          userRole: socket.userRole
        }
      });
    });

    // Handle online status
    socket.on('setOnlineStatus', (status) => {
      socket.onlineStatus = status;
      // Broadcast status to relevant contacts
      socket.broadcast.emit('userStatusChanged', {
        userId: socket.userId,
        userName: socket.userName,
        status
      });
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${socket.userName} (${reason})`);
      
      // Broadcast offline status
      socket.broadcast.emit('userStatusChanged', {
        userId: socket.userId,
        userName: socket.userName,
        status: 'offline'
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.userName}:`, error);
    });
  });
};

// Utility function to emit to specific users
export const emitToUser = (io, userId, event, data) => {
  io.to(`user_${userId}`).emit(event, data);
};

// Utility function to emit to chat room
export const emitToChat = (io, chatId, event, data) => {
  io.to(chatId).emit(event, data);
};

// Utility function to broadcast to all users
export const broadcastToAll = (io, event, data) => {
  io.emit(event, data);
};
