import express from "express";
import {
  authUser,
  registerUser,
  logoutUser,
} from "../controllers/userController.js";
import { splitName } from "../middleware/nameMiddleware.js"; // ✅ Import Middleware

const router = express.Router();

// ✅ Add splitName before registerUser
router.post("/", splitName, registerUser);

router.post("/auth", authUser);
router.post("/logout", logoutUser);

export default router;
