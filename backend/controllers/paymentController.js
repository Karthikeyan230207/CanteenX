import Razorpay from "razorpay";
import crypto from "crypto";

import menu from "../data/menu.js";

import {
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
} from "../config/env.js";

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});


// ======================================
// CREATE RAZORPAY ORDER
// ======================================

export const createPaymentOrder = async (req, res) => {
  try {

    const { items } = req.body;

    if (
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }


    // ==============================
    // CALCULATE TOTAL FROM SERVER
    // ==============================

    let totalAmount = 0;

    const verifiedItems = [];

    for (const cartItem of items) {

      const menuItem = menu.find(
        (item) => item.id === cartItem.id
      );

      if (!menuItem) {

        return res.status(400).json({
          message: `Invalid food item: ${cartItem.id}`,
        });

      }


      const quantity = Number(
        cartItem.quantity
      );

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {

        return res.status(400).json({
          message: "Invalid quantity",
        });

      }


      totalAmount +=
        menuItem.price * quantity;


      verifiedItems.push({
        id: menuItem.id,

        name: menuItem.name,

        price: menuItem.price,

        quantity,
      });
    }


    // ==============================
    // CREATE RAZORPAY ORDER
    // ==============================

    const razorpayOrder =
      await razorpay.orders.create({

        amount:
          totalAmount * 100,

        currency: "INR",

        receipt:
          `canteen_${Date.now()}`,

      });


    res.status(200).json({

      success: true,

      razorpayOrderId:
        razorpayOrder.id,

      amount:
        razorpayOrder.amount,

      currency:
        razorpayOrder.currency,

      key:
        process.env.RAZORPAY_KEY_ID,

      items: verifiedItems,

      totalAmount,
    });


  } catch (error) {

    console.error(
      "Create payment order error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to create payment order",
    });
  }
};



// ======================================
// VERIFY RAZORPAY PAYMENT
// ======================================

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details",
      });
    }

    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          RAZORPAY_KEY_SECRET
        )
        .update(
          razorpay_order_id +
          "|" +
          razorpay_payment_id
        )
        .digest("hex");

    const isValid =
      crypto.timingSafeEqual(
        Buffer.from(generatedSignature),
        Buffer.from(razorpay_signature)
      );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
    });

  } catch (error) {
    console.error(
      "Payment verification error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};