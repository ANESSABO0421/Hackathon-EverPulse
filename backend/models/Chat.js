import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: 'participants.userType',
          required: true
        },
        userType: {
          type: String,
          enum: ['Patient', 'Doctor'],
          required: true
        },
        name: {
          type: String,
          required: true
        },
        avatar: String,
        lastSeen: {
          type: Date,
          default: Date.now
        }
      }
    ],
    chatType: {
      type: String,
      enum: ['patient-doctor', 'group'],
      default: 'patient-doctor'
    },
    lastMessage: {
      content: String,
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      senderType: {
        type: String,
        enum: ['patient', 'doctor']
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    metadata: {
      appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
      },
      subject: String,
      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
      }
    }
  },
  { 
    timestamps: true 
  }
);

// Index for efficient queries
chatSchema.index({ 'participants.userId': 1 });
chatSchema.index({ 'participants.userType': 1 });
chatSchema.index({ 'lastMessage.timestamp': -1 });

export default mongoose.model("Chat", chatSchema);
