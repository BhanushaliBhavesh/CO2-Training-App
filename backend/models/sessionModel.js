import mongoose from "mongoose";

const sessionSchema = mongoose.Schema(
  {
    // CRITICAL: This links the session to a specific user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    type: {
      type: String, // 'baseline' or 'training'
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    // For Baseline Tests
    maxHold: {
      type: Number,
    },
    // For Training Sessions
    holdDuration: {
      type: Number,
    },
    roundsCompleted: {
      type: Number,
    },
    status: {
      type: String, // 'completed', 'cancelled', etc.
      default: "completed",
    },
  },
  {
    timestamps: true,
  }
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;