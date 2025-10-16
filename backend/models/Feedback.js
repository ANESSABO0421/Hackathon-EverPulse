import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 1000
    },
    categories: [
      {
        type: String,
        enum: ["service", "communication", "treatment", "waiting_time", "facility"]
      }
    ],
    isAnonymous: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "archived"],
      default: "pending"
    },
    adminNotes: {
      type: String,
      maxlength: 500
    },
    response: {
      type: String,
      maxlength: 500
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin"
    },
    respondedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

// Index for efficient queries
feedbackSchema.index({ patientId: 1 });
feedbackSchema.index({ doctorId: 1 });
feedbackSchema.index({ appointmentId: 1 });
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ createdAt: -1 });

export default mongoose.model("Feedback", feedbackSchema);
