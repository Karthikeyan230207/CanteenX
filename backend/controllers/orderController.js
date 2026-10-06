import Order from "../models/Order.js";
import Food from "../models/Food.js";

// ========================================
// GET ALL ORDERS
// ========================================
export const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = status ? { orderStatus: status } : {};
    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalOrders = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      totalOrders,
      totalPages: Math.ceil(totalOrders / Number(limit)),
      currentPage: Number(page),
      orders,
    });
  } catch (error) {
    console.error("Get all orders failed:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch orders",
    });
  }
};

// ========================================
// CREATE ORDER
// ========================================
export const createOrder = async (req, res) => {
  try {
    const {
      name,
      department,
      section,
      items,
      totalAmount,
      paymentId,
      razorpayOrderId,
    } = req.body;

    // Get logged-in student from JWT
    const studentId = req.studentId;

    if (
      !name ||
      !department ||
      !section ||
      !items ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing order details",
      });
    }

    // Check stock
    for (const item of items) {
      const food = await Food.findById(item.id);

      if (!food) {
        return res.status(404).json({
          success: false,
          message: `${item.name} is no longer available`,
        });
      }

      if (food.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${food.name} has only ${food.stock} item(s) available`,
        });
      }
    }

    // Reduce stock
    for (const item of items) {
      await Food.findByIdAndUpdate(
        item.id,
        {
          $inc: {
            stock: -item.quantity,
          },
        },
        { new: true }
      );
    }

    // Generate token
    const lastOrder = await Order.findOne().sort({
      token: -1,
    });

    const token = lastOrder
      ? lastOrder.token + 1
      : 1;

    const orderId = `ORD-${Date.now()}`;

    // Create order document
    const order = await Order.create({
      orderId,

      // Logged-in student's ID
      studentId,

      token,

      name,
      department,
      section,

      items: items.map((item) => ({
        foodId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),

      totalAmount,

      paymentStatus: "PAID",

      orderStatus: "RECEIVED",
    });

    res.status(201).json({
      success: true,
      message: "Order confirmed successfully",
      order,
    });
  } catch (error) {
    console.error(
      "Order creation failed:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to create order",
    });
  }
};

// ========================================
// GET LOGGED-IN STUDENT ORDERS
// ========================================
export const getMyOrders = async (req, res) => {
  try {
    // Get logged-in student from JWT
    const studentId = req.studentId;

    const orders = await Order.find({
      studentId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error(
      "Get my orders failed:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to fetch your orders",
    });
  }
};

// ========================================
// ACCEPT ORDER
// ========================================
export const acceptOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.orderStatus !== "RECEIVED") {
      return res.status(400).json({
        success: false,
        message: `Order is already ${order.orderStatus}`,
      });
    }

    order.orderStatus = "ACCEPTED";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order accepted successfully",
      order,
    });
  } catch (error) {
    console.error("Accept order failed:", error);
    res.status(500).json({
      success: false,
      message: "Unable to accept order",
    });
  }
};

// ========================================
// REJECT ORDER
// ========================================
export const rejectOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body; // Optional rejection reason from admin/restaurant

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.orderStatus === "REJECTED") {
      return res.status(400).json({
        success: false,
        message: "Order is already rejected",
      });
    }

    // Restore food stock in database
    for (const item of order.items) {
      if (item.foodId) {
        await Food.findByIdAndUpdate(item.foodId, {
          $inc: { stock: item.quantity },
        });
      }
    }

    order.orderStatus = "REJECTED";
    if (reason) order.rejectionReason = reason;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order rejected and stock restored successfully",
      order,
    });
  } catch (error) {
    console.error("Reject order failed:", error);
    res.status(500).json({
      success: false,
      message: "Unable to reject order",
    });
  }
};

// ========================================
// GENERATE SALES REPORT
// ========================================
export const getSalesReport = async (req, res) => {
  try {
    const { from, to } = req.query;

    const query = {};

    // Date filter
    if (from || to) {
      query.createdAt = {};

      if (from) {
        query.createdAt.$gte = new Date(`${from}T00:00:00.000Z`);
      }

      if (to) {
        query.createdAt.$lte = new Date(`${to}T23:59:59.999Z`);
      }
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Only successfully accepted orders count as sales
    const acceptedOrders = orders.filter(
      (order) => order.orderStatus === "ACCEPTED"
    );

    const totalSales = acceptedOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    const totalItemsSold = acceptedOrders.reduce(
      (sum, order) =>
        sum +
        order.items.reduce(
          (itemSum, item) => itemSum + item.quantity,
          0
        ),
      0
    );

    res.status(200).json({
      success: true,

      summary: {
        totalOrders: orders.length,
        acceptedOrders: acceptedOrders.length,
        rejectedOrders: orders.filter(
          (order) => order.orderStatus === "REJECTED"
        ).length,
        totalItemsSold,
        totalSales,
      },

      orders,
    });
  } catch (error) {
    console.error("Sales report failed:", error);

    res.status(500).json({
      success: false,
      message: "Unable to generate sales report",
    });
  }
};

// ========================================
// DOWNLOAD SALES REPORT AS CSV
// ========================================
export const downloadSalesReport = async (req, res) => {
  try {
    const { from, to } = req.query;

    const query = {
      orderStatus: "ACCEPTED",
    };

    // Date filter
    if (from || to) {
      query.createdAt = {};

      if (from) {
        query.createdAt.$gte = new Date(`${from}T00:00:00.000Z`);
      }

      if (to) {
        query.createdAt.$lte = new Date(`${to}T23:59:59.999Z`);
      }
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // CSV header
    const csvRows = [
      [
        "Order ID",
        "Token",
        "Student Name",
        "Department",
        "Section",
        "Items",
        "Total Amount",
        "Status",
        "Order Date",
      ],
    ];

    // Add order data
    orders.forEach((order) => {
      const items = order.items
        .map(
          (item) =>
            `${item.name} x ${item.quantity}`
        )
        .join(" | ");

      csvRows.push([
        order.orderId,
        order.token,
        order.name,
        order.department,
        order.section,
        items,
        order.totalAmount,
        order.orderStatus,
        new Date(order.createdAt).toLocaleString("en-IN"),
      ]);
    });

    // Convert rows to CSV
    const csv = csvRows
      .map((row) =>
        row
          .map((value) => {
            const text = String(value ?? "");
            return `"${text.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");

    res.setHeader(
      "Content-Type",
      "text/csv; charset=utf-8"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="sales-report-${from || "all"}-${to || "all"}.csv"`
    );

    res.status(200).send(csv);
  } catch (error) {
    console.error("Download sales report failed:", error);

    res.status(500).json({
      success: false,
      message: "Unable to download sales report",
    });
  }
};

// ========================================
// SALES ANALYTICS
// ========================================
export const getSalesAnalytics = async (req, res) => {
  try {
    const { from, to } = req.query;

    const match = {
      orderStatus: "ACCEPTED",
    };

    // Date filter
    if (from || to) {
      match.createdAt = {};

      if (from) {
        match.createdAt.$gte = new Date(`${from}T00:00:00.000Z`);
      }

      if (to) {
        match.createdAt.$lte = new Date(`${to}T23:59:59.999Z`);
      }
    }

    // Get accepted orders
    const orders = await Order.find(match).lean();

    // ========================================
    // BASIC SUMMARY
    // ========================================

    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    const totalOrders = orders.length;

    const totalItemsSold = orders.reduce(
      (sum, order) =>
        sum +
        order.items.reduce(
          (itemSum, item) => itemSum + item.quantity,
          0
        ),
      0
    );

    // ========================================
    // BEST SELLING FOOD
    // ========================================

    const foodSales = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!foodSales[item.name]) {
          foodSales[item.name] = {
            name: item.name,
            quantity: 0,
            revenue: 0,
          };
        }

        foodSales[item.name].quantity += item.quantity;

        foodSales[item.name].revenue +=
          item.price * item.quantity;
      });
    });

    const foodWiseSales = Object.values(foodSales).sort(
      (a, b) => b.quantity - a.quantity
    );

    const bestSellingFood =
      foodWiseSales.length > 0
        ? foodWiseSales[0]
        : null;

    // ========================================
    // CATEGORY-WISE SALES
    // ========================================

    // Get all food information
    const foods = await Food.find().lean();

    const foodCategoryMap = {};

    foods.forEach((food) => {
      foodCategoryMap[food.name] = food.category;
    });

    const categorySales = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const category =
          foodCategoryMap[item.name] || "Unknown";

        if (!categorySales[category]) {
          categorySales[category] = {
            category,
            quantity: 0,
            revenue: 0,
          };
        }

        categorySales[category].quantity +=
          item.quantity;

        categorySales[category].revenue +=
          item.price * item.quantity;
      });
    });

    const categoryWiseSales =
      Object.values(categorySales).sort(
        (a, b) => b.revenue - a.revenue
      );

    // ========================================
    // DEPARTMENT-WISE ORDERS
    // ========================================

    const departmentOrders = {};

    orders.forEach((order) => {
      if (!departmentOrders[order.department]) {
        departmentOrders[order.department] = 0;
      }

      departmentOrders[order.department]++;
    });

    const departmentWiseOrders = Object.entries(
      departmentOrders
    )
      .map(([department, orders]) => ({
        department,
        orders,
      }))
      .sort((a, b) => b.orders - a.orders);

    // ========================================
    // DAILY REVENUE
    // ========================================

    const dailyRevenue = {};

    orders.forEach((order) => {
      const date = new Date(order.createdAt)
        .toISOString()
        .split("T")[0];

      if (!dailyRevenue[date]) {
        dailyRevenue[date] = {
          date,
          revenue: 0,
          orders: 0,
        };
      }

      dailyRevenue[date].revenue +=
        order.totalAmount;

      dailyRevenue[date].orders++;
    });

    const dailySales = Object.values(dailyRevenue).sort(
      (a, b) => a.date.localeCompare(b.date)
    );

    // ========================================
    // PEAK ORDERING HOUR
    // ========================================

    const hourlyOrders = {};

    orders.forEach((order) => {
      const hour = new Date(order.createdAt).getHours();

      if (!hourlyOrders[hour]) {
        hourlyOrders[hour] = 0;
      }

      hourlyOrders[hour]++;
    });

    let peakHour = null;

    Object.entries(hourlyOrders).forEach(
      ([hour, count]) => {
        if (
          peakHour === null ||
          count > peakHour.orders
        ) {
          peakHour = {
            hour: Number(hour),
            orders: count,
          };
        }
      }
    );

    // ========================================
    // RESPONSE
    // ========================================

    res.status(200).json({
      success: true,

      summary: {
        totalRevenue,
        totalOrders,
        totalItemsSold,
      },

      bestSellingFood,

      foodWiseSales,

      categoryWiseSales,

      departmentWiseOrders,

      dailySales,

      peakOrderingHour: peakHour,
    });
  } catch (error) {
    console.error(
      "Sales analytics failed:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to generate sales analytics",
    });
  }
};