import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";

import paymentRoutes from "./routes/paymentRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import { fileURLToPath } from "url";
import aiRoutes from "./routes/aiRoutes.js";
import { MONGO_URI } from "./config/env.js";

import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();

app.use(cookieParser());

// ================================
// MIDDLEWARE
// ================================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "https://smart-canteen-system-fawn.vercel.app","https://canteenxadmin.vercel.app"
    ],
    credentials: true,
  })
);
app.use(express.json());

// ================================
// SERVE FOOD IMAGES
// ================================

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// ================================
// MONGODB CONNECTION
// ================================

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });

// ================================
// ROUTES
// ================================

app.use("/api/payment", paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);

// ================================
// TEST ROUTE
// ================================

app.get("/", (req, res) => {
  res.json({
    message: "canteenX Canteen API is running",
  });
});

// ================================
// SERVER
// ================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});