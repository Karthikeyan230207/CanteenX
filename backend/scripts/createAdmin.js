import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import dotenv from "dotenv";

import Admin from "../models/Admin.js";
import { MONGO_URI } from "../config/env.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected");

    const email = "admin@canteen.com";
    const password = "Admin@123";

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Admin.create({
      name: "Canteen Admin",
      email,
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin created successfully");

    console.log("Email:", email);
    console.log("Password:", password);

    process.exit(0);
  } catch (error) {
    console.error("Failed to create admin:", error);
    process.exit(1);
  }
};

createAdmin();