// src/models/Product.model.js

import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    images: { type: [String], default: [] }, // Array of image URLs
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Simple Index for faster search on title
ProductSchema.index({ title: 'text' }); 

const Product = mongoose.model("Product", ProductSchema);
export default Product;