// src/controllers/category.controller.js

import asyncHandler from "../middlewares/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import Category from "../models/Category.model.js";

// --- ADMIN ROUTES ---

export const createCategory = asyncHandler(async (req, res) => {
    const { name, slug } = req.body;
    
    if (!name) {
        throw new ApiError(400, "Category name is required.");
    }
    
    const category = await Category.create({ name, slug });

    res.status(201).json(new ApiResponse(
        201, category, "Category created successfully"
    ));
});

export const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, slug } = req.body;

    const category = await Category.findByIdAndUpdate(id, { name, slug }, {
        new: true,
        runValidators: true,
    });

    if (!category) {
        throw new ApiError(404, `Category with id ${id} not found.`);
    }

    res.status(200).json(new ApiResponse(
        200, category, "Category updated successfully"
    ));
});

export const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
        throw new ApiError(404, `Category with id ${id} not found.`);
    }
    
    // NOTE: In a real app, you must handle products tied to this category (e.g., set category to null, or delete products).

    res.status(200).json(new ApiResponse(
        200, null, "Category deleted successfully"
    ));
});

// --- PUBLIC ROUTES ---

export const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({});
    
    res.status(200).json(new ApiResponse(
        200, categories, "Categories fetched successfully"
    ));
});