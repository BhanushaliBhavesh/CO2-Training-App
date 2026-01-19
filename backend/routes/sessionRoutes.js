import express from "express";
import {
  getSessions,
  createSession,
} from "../controllers/sessionController.js";
import { protect } from "../middleware/authMiddleware.js"; // <--- Import the Gatekeeper

const router = express.Router();

// Apply 'protect' to both GET and POST
router.route("/")
  .get(protect, getSessions)
  .post(protect, createSession);

export default router;