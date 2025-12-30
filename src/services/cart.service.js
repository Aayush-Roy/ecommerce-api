// src/services/cart.service.js

import Cart from "../models/Cart.model.js";
import Product from "../models/Product.model.js";
import ApiError from "../utils/ApiError.js";

/**
 * Helper to calculate and update the total quantity and amount of the cart.
 * @param {object} cart - The Mongoose Cart document.
 */
const calculateCartTotals = (cart) => {
    let totalQuantity = 0;
    let totalAmount = 0;

    cart.items.forEach(item => {
        totalQuantity += item.quantity;
        // Use the price stored in the cart item (price snapshot)
        totalAmount += item.price * item.quantity; 
    });

    cart.totalQuantity = totalQuantity;
    cart.totalAmount = totalAmount;
};

/**
 * Finds or creates a cart for a user.
 * @param {string} userId
 */
export const findOrCreateCart = async (userId) => {
    // Find the cart by user ID, or create a new one if it doesn't exist
    let cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
        cart = await Cart.create({ user: userId, items: [] });
    }
    return cart;
};


/**
 * Adds a product to the cart or updates quantity if it exists.
 * @param {string} userId
 * @param {string} productId
 * @param {number} quantity
 */
export const addProductToCart = async (userId, productId, quantity) => {
    const cart = await findOrCreateCart(userId);
    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
        throw new ApiError(404, "Product not found or inactive.");
    }
    if (product.stock < quantity) {
        throw new ApiError(400, `Only ${product.stock} units of ${product.title} are in stock.`);
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
        // Item exists: update quantity
        cart.items[itemIndex].quantity += quantity;
    } else {
        // Item does not exist: add new item
        cart.items.push({
            product: productId,
            quantity: quantity,
            price: product.price, // Snapshot the current price
        });
    }

    calculateCartTotals(cart);
    await cart.save();
    return cart;
};

/**
 * Updates the quantity of a product in the cart.
 * @param {string} userId
 * @param {string} productId
 * @param {number} newQuantity
 */
export const updateCartItemQuantity = async (userId, productId, newQuantity) => {
    const cart = await findOrCreateCart(userId);
    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
        throw new ApiError(404, "Product not found or inactive.");
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex === -1) {
        throw new ApiError(404, "Product not found in cart.");
    }

    if (product.stock < newQuantity) {
        throw new ApiError(400, `Only ${product.stock} units are in stock for this product.`);
    }

    cart.items[itemIndex].quantity = newQuantity;
    
    // Recalculate totals and save
    calculateCartTotals(cart);
    await cart.save();
    return cart;
};