// src/models/Category.model.js

import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    slug: { // Optional: for SEO friendly URLs
        type: String,
        lowercase: true,
        trim: true,
    },
}, { timestamps: true });

const Category = mongoose.model("Category", CategorySchema);
export default Category;