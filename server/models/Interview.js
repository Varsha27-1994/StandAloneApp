// models/Interview.js
const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    candidateName: {
      type: String,
      required: [true, "Please provide candidate name"],
      trim: true,
    },
    candidateEmail: {
      type: String,
      required: [true, "Please provide candidate email"],
      trim: true,
      lowercase: true,
    },
    position: {
      type: String,
      required: [true, "Please provide position"],
      trim: true,
    },
    interviewDate: {
      type: Date,
      required: [true, "Please provide interview date and time"],
    },
    duration: {
      type: Number, // in minutes
      required: [true, "Please provide interview duration"],
      min: [15, "Duration must be at least 15 minutes"],
      max: [240, "Duration cannot exceed 4 hours"],
    },
    interviewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Please provide at least one interviewer"],
      },
    ],
    meetingId: {
      type: String,
      default: null,
    },
    joinUrl: {
      type: String,
      default: null,
    },
    startUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["scheduled", "in-progress", "completed", "cancelled"],
      default: "scheduled",
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comments: String,
      submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      submittedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
interviewSchema.index({ interviewDate: 1 });
interviewSchema.index({ status: 1 });
interviewSchema.index({ candidateEmail: 1 });

module.exports = mongoose.model("Interview", interviewSchema);
