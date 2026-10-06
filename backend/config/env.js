
import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 5000;

export const MONGO_URI = process.env.MONGO_URI;

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
export const GEMINI_MODEL = process.env.GEMINI_MODEL;

export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;