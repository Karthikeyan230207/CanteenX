import Food from "../models/Food.js";
import Order from "../models/Order.js";

const getDashboardStats = async (req, res) => {
  try {
    // ========================================
    // FOOD STATISTICS
    // ========================================

    const totalFoods = await Food.countDocuments();

    const availableFoods = await Food.countDocuments({
      stock: { $gt: 5 },
    });

    const lowStockFoods = await Food.countDocuments({
      stock: {
        $gt: 0,
        $lte: 5,
      },
    });

    const outOfStockFoods = await Food.countDocuments({
      stock: 0,
    });

    // ========================================
    // TODAY
    // ========================================

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // ========================================
    // ORDER STATISTICS
    // ========================================

    const todayOrders = await Order.countDocuments({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    const receivedOrders = await Order.countDocuments({
      orderStatus: "RECEIVED",
    });

    const collectedOrders = await Order.countDocuments({
      orderStatus: "COLLECTED",
    });

    // ========================================
    // TODAY'S SALES
    // ========================================

    const salesResult = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfDay,
            $lte: endOfDay,
          },

          paymentStatus: "PAID",
        },
      },

      {
        $group: {
          _id: null,

          totalSales: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    const todaySales =
      salesResult.length > 0
        ? salesResult[0].totalSales
        : 0;

    // ========================================
    // RECENT ORDERS
    // ========================================

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // ========================================
    // RESPONSE
    // ========================================

    res.status(200).json({
      success: true,

      stats: {
        totalFoods,
        availableFoods,
        lowStockFoods,
        outOfStockFoods,

        todayOrders,
        receivedOrders,
        collectedOrders,

        todaySales,
      },

      recentOrders,
    });
  } catch (error) {
    console.error(
      "Dashboard stats error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard statistics",
      error: error.message,
    });
  }
};

export { getDashboardStats };