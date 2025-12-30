// src/controllers/order.controller.js

import asyncHandler from "../middlewares/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Order from "../models/Order.model.js";
import Cart from "../models/Cart.model.js";
import Product from "../models/Product.model.js";

// --- USER ROUTES ---

export const createOrder = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { address } = req.body;

    if (!address || !address.street || !address.city || !address.zip) {
        throw new ApiError(400, "Shipping address is required.");
    }

    // 1. Fetch user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart || cart.items.length === 0) {
        throw new ApiError(400, "Cannot create an order from an empty cart.");
    }
    
    // 2. Map cart items to order items and check stock availability
    const orderItems = [];
    const productUpdates = [];

    for (const cartItem of cart.items) {
        const product = cartItem.product;

        // Stock check
        if (product.stock < cartItem.quantity) {
            throw new ApiError(400, `Not enough stock for ${product.title}. Available: ${product.stock}`);
        }

        orderItems.push({
            product: product._id,
            quantity: cartItem.quantity,
            priceAtOrder: cartItem.price, // Use price snapshot from cart
            title: product.title,
        });
        
        // Prepare stock deduction update
        productUpdates.push({
            id: product._id,
            stockDecrease: cartItem.quantity,
        });
    }

    // 3. Create the order (Status: Pending, PaymentStatus: Pending)
    const order = await Order.create({
        user: userId,
        items: orderItems,
        totalAmount: cart.totalAmount,
        address,
        orderStatus: 'Pending',
        paymentStatus: 'Pending',
    });

    // 4. Clear the cart (Important!)
    cart.items = [];
    cart.totalAmount = 0;
    cart.totalQuantity = 0;
    await cart.save();
    
    // 5. Deduct stock (simple transaction simulation)
    for (const update of productUpdates) {
        await Product.findByIdAndUpdate(update.id, {
            $inc: { stock: -update.stockDecrease }
        });
    }

    res.status(201).json(new ApiResponse(
        201, order, "Order created successfully. Proceed to payment."
    ));
});

export const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .populate('items.product', 'title images'); // Fetch limited product data

    res.status(200).json(new ApiResponse(
        200, orders, "User order history fetched successfully"
    ));
});

export const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name email')
        .populate('payment');

    if (!order) {
        throw new ApiError(404, "Order not found.");
    }
    
    // Only allow access if the user is the owner OR an Admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
        throw new ApiError(403, "Access denied to this order.");
    }

    res.status(200).json(new ApiResponse(
        200, order, "Order details fetched successfully"
    ));
});

// --- ADMIN ROUTES ---

export const getAllOrdersAdmin = asyncHandler(async (req, res) => {
    // Admin middleware handles access
    const orders = await Order.find({})
        .sort({ createdAt: -1 })
        .populate('user', 'name email');

    res.status(200).json(new ApiResponse(
        200, orders, "All orders fetched successfully (Admin View)"
    ));
});