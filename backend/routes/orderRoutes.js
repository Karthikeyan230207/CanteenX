import express from "express";

import {
  createOrder,
  getAllOrders,
  getMyOrders,
  acceptOrder,
  rejectOrder,
  getSalesReport,
  downloadSalesReport,
  getSalesAnalytics,
} from "../controllers/orderController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Student must be logged in to create an order
router.post(
  "/create",
  authMiddleware,
  createOrder
);

// Admin routes
router.get("/all", getAllOrders);

router.patch("/:id/accept", acceptOrder);

router.patch("/:id/reject", rejectOrder);

router.get(
  "/report",
  getSalesReport
);

router.get(
  "/report/download",
  downloadSalesReport
);

router.get(
  "/analytics",
  getSalesAnalytics
);

// Student orders
router.get(
  "/my-orders",
  authMiddleware,
  getMyOrders
);

export default router;