import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// ✅ Correct Imports (Pointing to your new folders)
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import zohoRoutes from "./routes/zohoRoutes.js"; // <--- ADDED THIS 1/2

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load env from the current folder (backend/.env)
dotenv.config();

connectDB();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Correct CORS (Allows both your Laptop AND Vercel)
app.use(
  cors({
    origin: [
      "http://localhost:3000", // For local Vite
      "http://localhost:5173", // Alternate local Vite
      "https://co2-tolerance-trainer.vercel.app", // Your Vercel App
    ],
    credentials: true,
  })
);

// Routes
app.use("/api/users", userRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/zoho", zohoRoutes); // <--- ADDED THIS 2/2

app.get("/", (req, res) => res.send("Server is ready"));

app.listen(port, () => console.log(`Server started on port ${port}`));
