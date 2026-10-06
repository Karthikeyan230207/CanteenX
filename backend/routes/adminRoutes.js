import express from "express";

import {
  adminLogin,
} from "../controllers/adminController.js";

import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

// ========================================
// ADMIN LOGIN
// ========================================

router.post("/login", adminLogin);

// ========================================
// PROTECTED ADMIN ROUTES
// ========================================

// Future protected admin routes go here

export default router;