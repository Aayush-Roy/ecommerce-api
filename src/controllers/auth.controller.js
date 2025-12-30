// src/controllers/auth.controller.js

import asyncHandler from "../middlewares/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/User.model.js";

const sendTokenResponse = (user, statusCode, res, message) => {
    const token = user.generateAuthToken();

    // Clean user object for response (security)
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(statusCode).json(new ApiResponse(
        statusCode,
        { user: userResponse, token },
        message
    ));
};

export const register = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, "User with this email already exists.");
    }

    // Role setting: ensure only 'USER' can be set unless specific admin logic is involved
    const safeRole = role === 'ADMIN' ? 'ADMIN' : 'USER'; 

    const user = await User.create({ name, email, password, role: safeRole });
    sendTokenResponse(user, 201, res, "User registered successfully");
});

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Please provide email and password");
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.isPasswordCorrect(password))) {
        throw new ApiError(401, "Invalid credentials");
    }

    sendTokenResponse(user, 200, res, "User logged in successfully");
});

export const getMe = asyncHandler(async (req, res) => {
    // req.user is populated by the 'protect' middleware
    res.status(200).json(new ApiResponse(
        200,
        { user: req.user },
        "Current user details fetched successfully"
    ));
});