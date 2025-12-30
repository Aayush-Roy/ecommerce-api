// src/controllers/cart.controller.js

import asyncHandler from "../middlewares/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { 
    addProductToCart, 
    findOrCreateCart, 
    updateCartItemQuantity 
} from "../services/cart.service.js";
import ApiError from "../utils/ApiError.js";

// --- USER ROUTES ---

// export const getCart = asyncHandler(async (req, res) => {
//     // Populates cart items with full product details
//     // const cart = await findOrCreateCart(req.user._id).populate('items.product', 'title price stock images');
//     const cart = await findOrCreateCart(req.user._id)
//   .populate('items.product', 'title price stock images');

//     res.status(200).json(new ApiResponse(
//         200, cart, "Cart fetched successfully"
//     ));
// });
export const getCart = asyncHandler(async (req, res) => {
    const cart = await findOrCreateCart(req.user._id);

    await cart.populate('items.product', 'title price stock images');

    res.status(200).json(
        new ApiResponse(200, cart, "Cart fetched successfully")
    );
});

export const addItemToCart = asyncHandler(async (req, res) => {
    const { productId, quantity = 1 } = req.body;
    
    if (!productId || quantity < 1) {
        throw new ApiError(400, "Invalid product ID or quantity.");
    }

    const updatedCart = await addProductToCart(req.user._id, productId, quantity);

    res.status(200).json(new ApiResponse(
        200, updatedCart, "Product added to cart successfully"
    ));
});

export const updateCartItem = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    
    if (!productId || quantity === undefined || quantity < 0) {
        throw new ApiError(400, "Invalid product ID or quantity.");
    }
    
    if (quantity === 0) {
        // Delegate to removal if quantity is zero
        return await removeCartItem(req, res);
    }

    const updatedCart = await updateCartItemQuantity(req.user._id, productId, quantity);

    res.status(200).json(new ApiResponse(
        200, updatedCart, "Cart item quantity updated successfully"
    ));
});

export const removeCartItem = asyncHandler(async (req, res) => {
    const productId = req.params.productId || req.body.productId; // Handles both PUT/DELETE

    if (!productId) {
        throw new ApiError(400, "Product ID is required for removal.");
    }

    const cart = await findOrCreateCart(req.user._id);
    
    const initialLength = cart.items.length;
    
    // Filter out the item to be removed
    cart.items = cart.items.filter(item => item.product.toString() !== productId);

    if (cart.items.length === initialLength) {
        throw new ApiError(404, "Product not found in cart.");
    }

    // Recalculate totals
    let totalQuantity = 0;
    let totalAmount = 0;
    cart.items.forEach(item => {
        totalQuantity += item.quantity;
        totalAmount += item.price * item.quantity;
    });
    cart.totalQuantity = totalQuantity;
    cart.totalAmount = totalAmount;

    await cart.save();
    
    res.status(200).json(new ApiResponse(
        200, cart, "Product removed from cart successfully"
    ));
});