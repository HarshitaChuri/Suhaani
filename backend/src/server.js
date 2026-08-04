import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import predictionRoutes from "./routes/predictionRoutes.js";
import cycleRoutes from "./routes/cycleRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());
app.use(morgan("dev"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "PCOS platform backend is running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/cycles", cycleRoutes);
app.use("/api/chatbot", chatRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
