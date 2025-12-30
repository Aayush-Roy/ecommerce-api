// src/controllers/product.controller.js

import asyncHandler from "../middlewares/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import Product from "../models/Product.model.js";
import Category from "../models/Category.model.js";

// --- ADMIN ROUTES ---

export const createProduct = asyncHandler(async (req, res) => {
    const { category, ...productData } = req.body;

    if (!await Category.findById(category)) {
        throw new ApiError(400, "Invalid category ID provided.");
    }
    
    const product = await Product.create({ category, ...productData });

    res.status(201).json(new ApiResponse(
        201, product, "Product created successfully"
    ));
});

export const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const update = req.body;

    if (update.category && !(await Category.findById(update.category))) {
        throw new ApiError(400, "Invalid category ID provided.");
    }

    const product = await Product.findByIdAndUpdate(id, update, {
        new: true,
        runValidators: true,
    });

    if (!product) {
        throw new ApiError(404, `Product with id ${id} not found.`);
    }

    res.status(200).json(new ApiResponse(
        200, product, "Product updated successfully"
    ));
});

export const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
        throw new ApiError(404, `Product with id ${id} not found.`);
    }

    res.status(200).json(new ApiResponse(
        200, null, "Product deleted successfully"
    ));
});

// --- PUBLIC ROUTES ---

export const getProducts = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search, category } = req.query;

    let query = { isActive: true }; // Only show active products to public

    if (search) {
        query.$text = { $search: search };
    }
    if (category) {
        query.category = category;
    }

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await Product.find(query)
        .populate('category', 'name')
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(
        200,
        { products, pagination: { page, limit, totalProducts, totalPages } },
        "Products fetched successfully"
    ));
});

export const getProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category', 'name');

    if (!product || !product.isActive) {
        throw new ApiError(404, `Product not found or inactive.`);
    }

    res.status(200).json(new ApiResponse(
        200, product, "Product fetched successfully"
    ));
});