// src/controllers/order.controller.js

import asyncHandler from "../middlewares/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Order from "../models/Order.model.js";
import Cart from "../models/Cart.model.js";
import Product from "../models/Product.model.js";

// --- USER ROUTES ---

// export const createOrder = asyncHandler(async (req, res) => {
//     const userId = req.user._id;
//     const { address } = req.body;
//     console.log('🟢 [ORDER] Creating order...');
//     console.log('🟢 [ORDER] Request body:', JSON.stringify(req.body, null, 2));
//     console.log('🟢 [ORDER] User:', req.user);
//     if (!address || !address.street || !address.city || !address.zip) {
//         throw new ApiError(400, "Shipping address is required.");
//     }

//     // 1. Fetch user's cart
//     const cart = await Cart.findOne({ user: userId }).populate('items.product');

//     if (!cart || cart.items.length === 0) {
//         throw new ApiError(400, "Cannot create an order from an empty cart.");
//     }
    
//     // 2. Map cart items to order items and check stock availability
//     const orderItems = [];
//     const productUpdates = [];

//     for (const cartItem of cart.items) {
//         const product = cartItem.product;

//         // Stock check
//         if (product.stock < cartItem.quantity) {
//             throw new ApiError(400, `Not enough stock for ${product.title}. Available: ${product.stock}`);
//         }

//         orderItems.push({
//             product: product._id,
//             quantity: cartItem.quantity,
//             priceAtOrder: cartItem.price, // Use price snapshot from cart
//             title: product.title,
//         });
        
//         // Prepare stock deduction update
//         productUpdates.push({
//             id: product._id,
//             stockDecrease: cartItem.quantity,
//         });
//     }

//     // 3. Create the order (Status: Pending, PaymentStatus: Pending)
//     const order = await Order.create({
//         user: userId,
//         items: orderItems,
//         totalAmount: cart.totalAmount,
//         address,
//         orderStatus: 'Pending',
//         paymentStatus: 'Pending',
//     });

//     // 4. Clear the cart (Important!)
//     cart.items = [];
//     cart.totalAmount = 0;
//     cart.totalQuantity = 0;
//     await cart.save();
    
//     // 5. Deduct stock (simple transaction simulation)
//     for (const update of productUpdates) {
//         await Product.findByIdAndUpdate(update.id, {
//             $inc: { stock: -update.stockDecrease }
//         });
//     }

//     res.status(201).json(new ApiResponse(
//         201, order, "Order created successfully. Proceed to payment."
//     ));
// });
// src/controllers/order.controller.js

export const createOrder = asyncHandler(async (req, res) => {
    console.log('🟢 [ORDER] Creating order...');
    console.log('🟢 [ORDER] Request body:', req.body);
    console.log('🟢 [ORDER] User:', req.user);

    // 1️⃣ Validate request body
    if (!req.body || Object.keys(req.body).length === 0) {
        throw new ApiError(400, "Request body is missing.");
    }

    const { address } = req.body;

    // 2️⃣ Validate address
    if (
        !address ||
        !address.street ||
        !address.city ||
        !address.zip ||
        !address.country
    ) {
        throw new ApiError(400, "Complete shipping address is required.");
    }

    const userId = req.user._id;

    // 3️⃣ Fetch user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
        throw new ApiError(400, "Cannot create an order from an empty cart.");
    }

    const orderItems = [];
    const productUpdates = [];

    // 4️⃣ Validate stock & prepare order items
    for (const cartItem of cart.items) {
        const product = cartItem.product;

        if (!product) {
            throw new ApiError(404, "Product not found in cart.");
        }

        if (product.stock < cartItem.quantity) {
            throw new ApiError(
                400,
                `Not enough stock for ${product.title}. Available: ${product.stock}`
            );
        }

        orderItems.push({
            product: product._id,
            quantity: cartItem.quantity,
            priceAtOrder: cartItem.price,
            title: product.title,
        });

        productUpdates.push({
            id: product._id,
            stockDecrease: cartItem.quantity,
        });
    }

    // 5️⃣ Create order
    const order = await Order.create({
        user: userId,
        items: orderItems,
        totalAmount: cart.totalAmount,
        address,
        orderStatus: 'Pending',
        paymentStatus: 'Pending',
    });

    // 6️⃣ Clear cart
    cart.items = [];
    cart.totalAmount = 0;
    cart.totalQuantity = 0;
    await cart.save();

    // 7️⃣ Update product stock
    for (const update of productUpdates) {
        await Product.findByIdAndUpdate(update.id, {
            $inc: { stock: -update.stockDecrease },
        });
    }

    // 8️⃣ Send response
    return res.status(201).json(
        new ApiResponse(
            201,
            order,
            "Order created successfully. Proceed to payment."
        )
    );
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


// src/controllers/order.controller.js में ये add करें:

// Update Order Status (Admin Only)
export const updateOrderStatusAdmin = async (req, res) => {
    try {
        const { orderStatus } = req.body;
        const orderId = req.params.id;

        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Update order status
        order.orderStatus = orderStatus || order.orderStatus;
        order.updatedAt = Date.now();
        
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: order
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Update Payment Status (Admin Only)
export const updateOrderPaymentStatusAdmin = async (req, res) => {
    try {
        const { paymentStatus } = req.body;
        const orderId = req.params.id;

        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Update payment status
        order.paymentStatus = paymentStatus || order.paymentStatus;
        order.updatedAt = Date.now();
        
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Payment status updated successfully',
            data: order
        });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// OR Combined update function
export const updateOrderAdmin = async (req, res) => {
    try {
        const { orderStatus, paymentStatus } = req.body;
        const orderId = req.params.id;

        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Update fields if provided
        if (orderStatus) order.orderStatus = orderStatus;
        if (paymentStatus) order.paymentStatus = paymentStatus;
        
        order.updatedAt = Date.now();
        
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Order updated successfully',
            data: order
        });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};