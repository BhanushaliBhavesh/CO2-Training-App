import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import zohoRoutes from "./routes/zohoRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

connectDB();

const app = express();
const port = process.env.PORT || 5000;

// ✅ 1. TRUST PROXY (Critical for Render)
app.set("trust proxy", 1);

// ✅ 2. CORS CONFIGURATION (Must be at the top)
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://co2-tolerance-trainer.vercel.app",
    "https://co-2-training-app.vercel.app", // Your blocked origin
  ],
  credentials: true, // Allows cookies/headers
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Explicitly allow OPTIONS
  allowedHeaders: ["Content-Type", "Authorization"], // Allow headers
};

app.use(cors(corsOptions));

// ✅ 3. HANDLE PREFLIGHT REQUESTS (The Magic Fix)
// This tells Express to answer the browser's "Can I connect?" check immediately.
app.options("*", cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/zoho", zohoRoutes);

app.get("/", (req, res) => res.send("Server is ready"));

// Error Handlers
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));
