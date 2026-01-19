import express from "express";
import { createZohoEntry } from "../controllers/zohoController.js";

const router = express.Router();

// This defines the URL: http://localhost:5000/api/zoho/lead
router.post("/lead", createZohoEntry);

export default router;
