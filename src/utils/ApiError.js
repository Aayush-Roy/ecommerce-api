// src/utils/ApiError.js

/**
 * Custom error class for API operations.
 * Allows throwing errors with specific HTTP status codes and messages.
 */
class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        isOperational = true
    ) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.isOperational = isOperational;
        this.success = false;
        
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export default ApiError;