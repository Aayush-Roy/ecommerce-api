// src/middlewares/auth.middleware.js

import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/User.model.js";
import { ENV } from "../config/env.js";

/**
 * JWT Authentication Middleware. Attaches req.user.
 */
export const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        throw new ApiError(401, "Not authorized, no token provided");
    }

    try {
        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        // Find user by ID and exclude the password field
        const user = await User.findById(decoded._id).select("-password");

        if (!user) {
            throw new ApiError(401, "User belonging to this token no longer exists");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, "Not authorized, token failed: " + error.message);
    }
});