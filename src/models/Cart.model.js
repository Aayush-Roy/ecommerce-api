// src/models/Cart.model.js

import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },
    // snapshot of price at the time of addition (optional but good practice)
    price: { 
        type: Number, 
        required: true,
    } 
}, { _id: false }); // No individual _id for subdocuments

const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true, // Each user has exactly one cart
    },
    items: {
        type: [CartItemSchema],
        default: [],
    },
    totalQuantity: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
}, { timestamps: true });

const Cart = mongoose.model("Cart", CartSchema);
export default Cart;