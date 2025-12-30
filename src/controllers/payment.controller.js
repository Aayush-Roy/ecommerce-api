// src/controllers/payment.controller.js

import asyncHandler from "../middlewares/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Order from "../models/Order.model.js";
import Payment from "../models/Payment.model.js";
import razorpay from "../config/razorpay.js";
import crypto from "crypto";

// --- USER ROUTES ---

/**
 * @route POST /api/payments/create-order
 * 1. Checks internal Order status.
 * 2. Creates a Razorpay Order ID.
 * 3. Stores the Payment record (status: created).
 */
export const createRazorpayOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.body;
    
    const order = await Order.findById(orderId);
    
    if (!order || order.user.toString() !== req.user._id.toString()) {
        throw new ApiError(404, "Order not found or access denied.");
    }
    if (order.paymentStatus === 'Paid') {
        throw new ApiError(400, "Payment for this order is already complete.");
    }

    const amountInPaisa = Math.round(order.totalAmount * 100);

    const options = {
        amount: amountInPaisa, // amount in the smallest currency unit (Paisa)
        currency: "INR",
        receipt: `receipt_order_${orderId}`,
        notes: {
            internal_order_id: orderId,
        }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Store the payment record in our DB
    const payment = await Payment.create({
        order: orderId,
        amount: order.totalAmount,
        razorpayOrderId: razorpayOrder.id,
        status: 'created',
    });
    
    // Link the payment record to the order
    order.payment = payment._id;
    await order.save();

    res.status(200).json(new ApiResponse(
        200,
        {
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount / 100,
            currency: razorpayOrder.currency,
        },
        "Razorpay order created successfully"
    ));
});

/**
 * @route POST /api/payments/verify
 * 1. Verifies the Razorpay signature to ensure payment authenticity.
 * 2. Updates internal Order and Payment status.
 */
export const verifyPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        throw new ApiError(400, "Missing payment details for verification.");
    }
    
    // 1. Find the pending Payment record
    const paymentRecord = await Payment.findOne({ razorpayOrderId: razorpay_order_id });

    if (!paymentRecord) {
        throw new ApiError(404, "Payment record not found.");
    }

    // 2. Generate the expected signature
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const expectedSignature = shasum.digest('hex');

    // 3. Cryptographic Verification
    if (expectedSignature !== razorpay_signature) {
        // Payment failed verification
        paymentRecord.status = 'failed';
        await paymentRecord.save();
        
        // Update associated Order status
        await Order.findByIdAndUpdate(paymentRecord.order, { paymentStatus: 'Failed' });

        throw new ApiError(400, "Payment verification failed. Signature mismatch.");
    }

    // 4. Success: Update records
    paymentRecord.status = 'verified';
    paymentRecord.razorpayPaymentId = razorpay_payment_id;
    paymentRecord.razorpaySignature = razorpay_signature;
    await paymentRecord.save();

    // Update the associated Order status
    const order = await Order.findByIdAndUpdate(paymentRecord.order, 
        { 
            paymentStatus: 'Paid',
            orderStatus: 'Paid', // Update internal order status upon payment
        },
        { new: true }
    );
    
    res.status(200).json(new ApiResponse(
        200, 
        { orderId: order._id, paymentId: razorpay_payment_id },
        "Payment successful and verified. Order is now Paid."
    ));
});