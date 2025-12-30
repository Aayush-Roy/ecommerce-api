// src/middlewares/error.middleware.js

import ApiError from "../utils/ApiError.js";
// import { ENV } from "../config/env.js";
import {ENV} from "../config/env.js"

/**
 * Global Error Handling Middleware.
 * Catches all errors and sends a clean JSON response.
 */
const errorMiddleware = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    let isOperational = err.isOperational || false;

    // Handle Mongoose specific errors
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Resource not found. Invalid: ${err.path}`;
        isOperational = true;
    } else if (err.code === 11000) { // Duplicate key error
        statusCode = 409; 
        const value = Object.values(err.keyValue)[0];
        message = `Duplicate field value: ${value}. Please use another value.`;
        isOperational = true;
    } else if (err.name === 'ValidationError') {
        statusCode = 400;
        const errors = Object.values(err.errors).map(el => el.message);
        message = `Invalid input data: ${errors.join('. ')}`;
        isOperational = true;
    }

    // Hide stack trace and generic error in production if not an operational error
    if (!isOperational && ENV.NODE_ENV !== 'development') {
        statusCode = 500;
        message = "Internal Server Error";
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        stack: ENV.NODE_ENV === 'development' ? err.stack : undefined,
    });
};

export default errorMiddleware;