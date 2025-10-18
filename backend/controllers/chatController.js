import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctors.js";

// Get all chats for a user
export const getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.role === 'patient' ? 'Patient' : 'Doctor';

    const chats = await Chat.find({
      'participants.userId': userId,
      'participants.userType': userType,
      isActive: true
    })
    .populate('participants.userId', 'name email')
    .sort({ 'lastMessage.timestamp': -1 });

    // Get unread message counts for each chat
    const chatsWithUnreadCount = await Promise.all(
      chats.map(async (chat) => {
        const unreadCount = await Message.countDocuments({
          chatId: chat._id,
          senderId: { $ne: userId },
          'readBy.userId': { $ne: userId }
        });

        return {
          ...chat.toObject(),
          unreadCount
        };
      })
    );

    res.json({
      message: "Chats retrieved successfully",
      chats: chatsWithUnreadCount
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error retrieving chats", 
      error: error.message 
    });
  }
};

// Get or create a chat between patient and doctor
export const getOrCreateChat = async (req, res) => {
  try {
    const { doctorId } = req.body;
    const patientId = req.user.id;

    // Check if chat already exists
    let chat = await Chat.findOne({
      'participants.userId': { $all: [patientId, doctorId] },
      chatType: 'patient-doctor',
      isActive: true
    })
    .populate('participants.userId', 'name email specialization');

    if (chat) {
      return res.json({
        message: "Chat retrieved successfully",
        chat
      });
    }

    // Get participant details
    const [patient, doctor] = await Promise.all([
      Patient.findById(patientId).select('name email'),
      Doctor.findById(doctorId).select('name email specialization')
    ]);

    if (!patient || !doctor) {
      return res.status(404).json({ 
        message: "Patient or doctor not found" 
      });
    }

    // Create new chat
    chat = await Chat.create({
      participants: [
        {
          userId: patientId,
          userType: 'Patient',
          name: patient.name,
          avatar: null
        },
        {
          userId: doctorId,
          userType: 'Doctor',
          name: doctor.name,
          avatar: null
        }
      ],
      chatType: 'patient-doctor',
      metadata: {
        subject: `Consultation with Dr. ${doctor.name}`,
        priority: 'medium'
      }
    });

    const populatedChat = await Chat.findById(chat._id)
      .populate('participants.userId', 'name email specialization');

    res.status(201).json({
      message: "Chat created successfully",
      chat: populatedChat
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error creating chat", 
      error: error.message 
    });
  }
};

// Get messages for a specific chat
export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;

    // Verify user has access to this chat
    const chat = await Chat.findOne({
      _id: chatId,
      'participants.userId': userId,
      isActive: true
    });

    if (!chat) {
      return res.status(404).json({ 
        message: "Chat not found or access denied" 
      });
    }

    const skip = (page - 1) * limit;
    const messages = await Message.find({
      chatId,
      isDeleted: false
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('replyTo.messageId', 'content senderName');

    res.json({
      message: "Messages retrieved successfully",
      messages: messages.reverse(), // Reverse to get chronological order
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await Message.countDocuments({ chatId, isDeleted: false })
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error retrieving messages", 
      error: error.message 
    });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { content, messageType = 'text', replyTo } = req.body;
    const { chatId } = req.params;
    const userId = req.user.id;
    const userType = req.user.role;

    console.log('Send message request:', { chatId, content, userId, userType });

    // Verify user has access to this chat
    const chat = await Chat.findOne({
      _id: chatId,
      'participants.userId': userId,
      isActive: true
    }).populate('participants.userId', 'name');

    if (!chat) {
      console.log('Chat not found or access denied for user:', userId);
      return res.status(404).json({ 
        message: "Chat not found or access denied" 
      });
    }

    // Get sender name
    const sender = chat.participants.find(p => p.userId.toString() === userId);
    const senderName = sender ? sender.name : 'Unknown';

    console.log('Creating message with sender:', senderName);

    // Create message
    const message = await Message.create({
      chatId,
      senderId: userId,
      senderType: userType,
      senderName,
      content,
      messageType,
      replyTo
    });

    console.log('Message created:', message._id);

    // Update chat's last message
    await Chat.findByIdAndUpdate(chatId, {
      'lastMessage.content': content,
      'lastMessage.senderId': userId,
      'lastMessage.senderType': userType,
      'lastMessage.timestamp': new Date()
    });

    // Mark message as delivered for sender
    await Message.findByIdAndUpdate(message._id, {
      status: 'delivered',
      $push: {
        readBy: {
          userId,
          userType,
          readAt: new Date()
        }
      }
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('replyTo.messageId', 'content senderName');

    console.log('Emitting message to chat:', chatId);

    // Emit to socket (will be handled by socket controller)
    if (req.io) {
      req.io.to(chatId).emit('newMessage', populatedMessage);
    }

    res.status(201).json({
      message: "Message sent successfully",
      message: populatedMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ 
      message: "Error sending message", 
      error: error.message 
    });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const userType = req.user.role;

    // Verify user has access to this chat
    const chat = await Chat.findOne({
      _id: chatId,
      'participants.userId': userId,
      isActive: true
    });

    if (!chat) {
      return res.status(404).json({ 
        message: "Chat not found or access denied" 
      });
    }

    // Mark all unread messages as read
    await Message.updateMany(
      {
        chatId,
        senderId: { $ne: userId },
        'readBy.userId': { $ne: userId }
      },
      {
        $push: {
          readBy: {
            userId,
            userType,
            readAt: new Date()
          }
        },
        status: 'read'
      }
    );

    res.json({
      message: "Messages marked as read successfully"
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error marking messages as read", 
      error: error.message 
    });
  }
};

// Get available doctors for chat
export const getAvailableDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isActive: true })
      .select('name specialization email avatar')
      .sort({ name: 1 });

    console.log('Available doctors:', doctors.length);

    res.json({
      message: "Available doctors retrieved successfully",
      doctors
    });
  } catch (error) {
    console.error('Error retrieving doctors:', error);
    res.status(500).json({ 
      message: "Error retrieving doctors", 
      error: error.message 
    });
  }
};

// Get doctor's patients for chat
export const getDoctorPatients = async (req, res) => {
  try {
    const doctorId = req.user.id;
    
    // Get patients who have chats with this doctor
    const chats = await Chat.find({
      'participants.userId': doctorId,
      'participants.userType': 'Doctor',
      isActive: true
    })
    .populate('participants.userId', 'name email')
    .select('participants');

    // Extract unique patients
    const patientIds = new Set();
    const patients = [];
    
    chats.forEach(chat => {
      chat.participants.forEach(participant => {
        if (participant.userType === 'Patient' && !patientIds.has(participant.userId.toString())) {
          patientIds.add(participant.userId.toString());
          patients.push({
            _id: participant.userId._id,
            name: participant.userId.name,
            email: participant.userId.email
          });
        }
      });
    });

    console.log('Doctor patients:', patients.length);

    res.json({
      message: "Doctor patients retrieved successfully",
      patients
    });
  } catch (error) {
    console.error('Error retrieving doctor patients:', error);
    res.status(500).json({ 
      message: "Error retrieving doctor patients", 
      error: error.message 
    });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findOne({
      _id: messageId,
      senderId: userId,
      isDeleted: false
    });

    if (!message) {
      return res.status(404).json({ 
        message: "Message not found or access denied" 
      });
    }

    // Soft delete the message
    await Message.findByIdAndUpdate(messageId, {
      isDeleted: true,
      deletedAt: new Date(),
      content: 'This message was deleted'
    });

    res.json({
      message: "Message deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error deleting message", 
      error: error.message 
    });
  }
};

// Edit a message
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const message = await Message.findOne({
      _id: messageId,
      senderId: userId,
      isDeleted: false
    });

    if (!message) {
      return res.status(404).json({ 
        message: "Message not found or access denied" 
      });
    }

    // Check if message is too old to edit (e.g., 15 minutes)
    const editTimeLimit = 15 * 60 * 1000; // 15 minutes
    if (new Date() - message.createdAt > editTimeLimit) {
      return res.status(400).json({ 
        message: "Message is too old to edit" 
      });
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      {
        content,
        isEdited: true,
        editedAt: new Date()
      },
      { new: true }
    );

    res.json({
      message: "Message edited successfully",
      message: updatedMessage
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error editing message", 
      error: error.message 
    });
  }
};
