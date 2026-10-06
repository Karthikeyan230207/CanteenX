import Food from "../models/Food.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
// ========================================
// GET ALL FOOD
// ========================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFoods = async (req, res) => {
  try {
    const foods = await Food.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: foods.length,
      foods,
    });
  } catch (error) {
    console.error("Get foods error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch food items",
    });
  }
};

// ========================================
// GET SINGLE FOOD
// ========================================

const getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    res.status(200).json({
      success: true,
      food,
    });
  } catch (error) {
    console.error("Get food error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch food item",
    });
  }
};

// ========================================
// ADD FOOD
// ========================================

const createFood = async (req, res) => {
  try {
    const { name, category, price, stock } = req.body;

    if (!name || !category || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, category, price and stock are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Food image is required",
      });
    }

    const food = await Food.create({
      name,
      category,
      price: Number(price),
      stock: Number(stock),
      image: `/uploads/${req.file.filename}`,
      isAvailable: Number(stock) > 0,
    });

    res.status(201).json({
      success: true,
      message: "Food added successfully",
      food,
    });
  } catch (error) {
    console.error("Create food error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add food",
      error: error.message,
    });
  }
};

// ========================================
// UPDATE FOOD
// ========================================

const updateFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    const { name, category, price, stock } = req.body;

    if (name !== undefined) {
      food.name = name;
    }

    if (category !== undefined) {
      food.category = category;
    }

    if (price !== undefined) {
      food.price = Number(price);
    }

    if (stock !== undefined) {
      food.stock = Number(stock);
    }

    // If a new image was uploaded
    if (req.file) {
      const oldImage = food.image;

      food.image = `/uploads/${req.file.filename}`;

      // Delete old image
      if (oldImage && oldImage.startsWith("/uploads/")) {
        const oldImagePath = path.join(
          __dirname,
          "..",
          oldImage
        );

        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    food.isAvailable = food.stock > 0;

    await food.save();

    res.status(200).json({
      success: true,
      message: "Food updated successfully",
      food,
    });
  } catch (error) {
    console.error("Update food error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update food",
      error: error.message,
    });
  }
};

// ========================================
// DELETE FOOD
// ========================================

const deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    // Delete image from uploads folder
    if (food.image && food.image.startsWith("/uploads/")) {
      const imagePath = path.join(
        __dirname,
        "..",
        food.image
      );

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Food.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Food deleted successfully",
    });
  } catch (error) {
    console.error("Delete food error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete food",
    });
  }
};

export {
  getFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
};