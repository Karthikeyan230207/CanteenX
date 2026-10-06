import jwt from "jsonwebtoken";

const adminAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    req.adminId = decoded.id;
    req.adminRole = decoded.role;

    next();
  } catch (error) {
    console.error(
      "Admin authentication error:",
      error
    );

    return res.status(401).json({
      success: false,
      message: "Invalid or expired admin token",
    });
  }
};

export default adminAuthMiddleware;