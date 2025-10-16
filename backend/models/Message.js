import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    senderType: {
      type: String,
      enum: ['patient', 'doctor'],
      required: true
    },
    senderName: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'prescription', 'appointment'],
      default: 'text'
    },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String,
        fileSize: Number
      }
    ],
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent'
    },
    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true
        },
        userType: {
          type: String,
          enum: ['patient', 'doctor'],
          required: true
        },
        readAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    replyTo: {
      messageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
      },
      content: String
    },
    editedAt: Date,
    isEdited: {
      type: Boolean,
      default: false
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date
  },
  { 
    timestamps: true 
  }
);

// Index for efficient queries
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ status: 1 });

export default mongoose.model("Message", messageSchema);
