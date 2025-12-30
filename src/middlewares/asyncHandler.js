// src/middlewares/asyncHandler.js

/**
 * A wrapper for async route handlers to catch exceptions and pass them
 * to the global Express error handler.
 */
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        // Resolve the promise, or catch any error and pass it to 'next'
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    };
};

export default asyncHandler;