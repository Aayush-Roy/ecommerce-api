// src/models/Payment.model.js

import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
    order: { // Internal order reference
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        unique: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },

    // Razorpay specific IDs
    razorpayOrderId: {
        type: String,
        required: true,
        unique: true,
    },
    razorpayPaymentId: { // Only present after successful verification
        type: String,
        unique: true,
        sparse: true, // Allows multiple documents to have a null value
    },
    razorpaySignature: {
        type: String,
        default: null,
    },
    
    status: {
        type: String,
        enum: ['created', 'verified', 'failed'],
        default: 'created',
    },
}, { timestamps: true });

const Payment = mongoose.model("Payment", PaymentSchema);
export default Payment;