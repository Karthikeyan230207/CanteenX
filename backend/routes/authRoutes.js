import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Student from "../models/Student.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ==================================================
// SIGN UP
// ==================================================

router.post("/signup", async (req, res) => {
  try {
    const {
      registerNumber,
      username,
      department,
      password,
    } = req.body;

    // Validation
    if (
      !registerNumber ||
      !username ||
      !department ||
      !password
    ) {
      return res.status(400).json({
        message:
          "Register number, username, department and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const formattedRegisterNumber =
      registerNumber.trim().toUpperCase();

    // Check register number
    const existingStudent = await Student.findOne({
      registerNumber: formattedRegisterNumber,
    });

    if (existingStudent) {
      return res.status(409).json({
        message: "Register number already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Create student
    const student = await Student.create({
      registerNumber: formattedRegisterNumber,
      username: username.trim(),
      department: department.trim(),
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Account created successfully",

      student: {
        id: student._id,
        registerNumber: student.registerNumber,
        username: student.username,
        department: student.department,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    return res.status(500).json({
      message: "Server error during signup",
    });
  }
});

// ==================================================
// SIGN IN
// ==================================================

router.post("/signin", async (req, res) => {
  try {
    const {
      registerNumber,
      password,
    } = req.body;

    if (!registerNumber || !password) {
      return res.status(400).json({
        message:
          "Register number and password are required",
      });
    }

    const formattedRegisterNumber =
      registerNumber.trim().toUpperCase();

    // Find student
    const student = await Student.findOne({
      registerNumber: formattedRegisterNumber,
    });

    if (!student) {
      return res.status(401).json({
        message: "Invalid register number or password",
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(
      password,
      student.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid register number or password",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        studentId: student._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // Store JWT in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",

      student: {
        id: student._id,
        registerNumber: student.registerNumber,
        username: student.username,
        department: student.department,
      },
    });
  } catch (error) {
    console.error("Signin error:", error);

    return res.status(500).json({
      message: "Server error during signin",
    });
  }
});

// ==================================================
// LOGOUT
// ==================================================

router.post("/logout", (req, res) => {
  res.clearCookie("token");

  return res.status(200).json({
    message: "Logged out successfully",
  });
});

// ==================================================
// GET PROFILE
// ==================================================

router.get(
  "/profile",
  authMiddleware,
  async (req, res) => {
    try {
      const student = await Student.findById(
        req.studentId
      ).select("-password");

      if (!student) {
        return res.status(404).json({
          message: "Student not found",
        });
      }

      return res.status(200).json({
        student: {
          id: student._id,
          registerNumber: student.registerNumber,
          username: student.username,
          department: student.department,
        },
      });
    } catch (error) {
      console.error("Get profile error:", error);

      return res.status(500).json({
        message: "Server error while getting profile",
      });
    }
  }
);

// ==================================================
// UPDATE PROFILE
// ==================================================

router.patch(
  "/profile",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        username,
        department,
        password,
      } = req.body;

      const student = await Student.findById(
        req.studentId
      );

      if (!student) {
        return res.status(404).json({
          message: "Student not found",
        });
      }

      // ----------------------------------------------
      // UPDATE USERNAME
      // ----------------------------------------------

      if (username !== undefined) {
        const trimmedUsername = username.trim();

        if (!trimmedUsername) {
          return res.status(400).json({
            message: "Username cannot be empty",
          });
        }

        student.username = trimmedUsername;
      }

      // ----------------------------------------------
      // UPDATE DEPARTMENT
      // ----------------------------------------------

      if (department !== undefined) {
        const trimmedDepartment = department.trim();

        if (!trimmedDepartment) {
          return res.status(400).json({
            message: "Department cannot be empty",
          });
        }

        student.department = trimmedDepartment;
      }

      // ----------------------------------------------
      // UPDATE PASSWORD
      // ----------------------------------------------

      if (password !== undefined) {
        if (password.length < 6) {
          return res.status(400).json({
            message:
              "Password must be at least 6 characters",
          });
        }

        student.password = await bcrypt.hash(
          password,
          10
        );
      }

      // Register number is intentionally NOT updated
      // because it is the student's unique identifier.

      await student.save();

      return res.status(200).json({
        message: "Profile updated successfully",

        student: {
          id: student._id,
          registerNumber: student.registerNumber,
          username: student.username,
          department: student.department,
        },
      });
    } catch (error) {
      console.error("Update profile error:", error);

      return res.status(500).json({
        message:
          "Server error while updating profile",
      });
    }
  }
);

export default router;