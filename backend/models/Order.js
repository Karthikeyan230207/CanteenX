import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "students",
      required: true,
    },

    token: {
      type: Number,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    section: {
      type: String,
      required: true,
      trim: true,
    },

    items: [
      {
        foodId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Food",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },

        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    razorpayOrderId: {
      type: String,
      default: null,
    },

    paymentId: {
      type: String,
      default: null
    },

    paymentStatus: {
      type: String,
      enum: [
        "PAID",
        "REFUND_PENDING",
        "REFUNDED",
      ],
      default: "PENDING",
    },

    orderStatus: {
      type: String,
      enum: [
        "RECEIVED",
        "ACCEPTED",
        "REJECTED",
        "COLLECTED",
      ],
      default: "RECEIVED",
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model(
  "Order",
  orderSchema
);

export default Order;