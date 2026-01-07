// src/models/Order.model.js

import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    // Capture the price at the time of order placement to avoid price changes later
    priceAtOrder: { type: Number, required: true }, 
    title: { type: String, required: true }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: {
        type: [OrderItemSchema],
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    address: { // Simplified address structure
        street: { type: String, required: true },
        city: { type: String, required: true },
        zip: { type: String, required: true },
        country: { type: String, required: true, default: "India" },
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending',
    },
    orderStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled','Cash on Delivery'],
        default: 'Pending',
    },
    // Reference to the Payment record
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
        default: null,
    },
}, { timestamps: true });

const Order = mongoose.model("Order", OrderSchema);
export default Order;