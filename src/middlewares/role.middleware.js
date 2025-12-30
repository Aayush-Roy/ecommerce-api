// src/middlewares/role.middleware.js

import ApiError from "../utils/ApiError.js";

/**
 * Role-based Access Control Middleware.
 */
export const restrictTo = (allowedRoles) => {
    return (req, res, next) => {
        // req.user is populated by the 'protect' middleware
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            throw new ApiError(403, "Forbidden: You do not have permission to perform this action");
        }
        next();
    };
};

export const restrictToAdmin = restrictTo(['ADMIN']);
export const restrictToUser = restrictTo(['USER']); // Useful if a route is open to all, but certain actions require a specific user role.