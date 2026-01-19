import asyncHandler from "express-async-handler";
import Session from "../models/sessionModel.js";

// @desc    Get all sessions for the LOGGED-IN user
// @route   GET /api/sessions
// @access  Private
const getSessions = asyncHandler(async (req, res) => {
  // SECURITY FIX: Only find sessions where the 'user' field matches the current user
  const sessions = await Session.find({ user: req.user._id });
  res.status(200).json(sessions);
});

// @desc    Create a new training/baseline session
// @route   POST /api/sessions
// @access  Private
const createSession = asyncHandler(async (req, res) => {
  const { type, date, maxHold, holdDuration, roundsCompleted, status } = req.body;

  if (!type) {
    res.status(400);
    throw new Error("Please add a session type");
  }

  const session = await Session.create({
    user: req.user._id, // <--- STAMP THE SESSION WITH USER ID
    type,
    date: date || Date.now(),
    maxHold,
    holdDuration,
    roundsCompleted,
    status,
  });

  res.status(201).json(session);
});

export { getSessions, createSession };