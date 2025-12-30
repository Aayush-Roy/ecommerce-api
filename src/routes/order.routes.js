// src/routes/order.routes.js

import express from 'express';
import { 
    createOrder, 
    getMyOrders, 
    getOrderById,
    getAllOrdersAdmin,
} from '../controllers/order.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { restrictToAdmin } from '../middlewares/role.middleware.js';

const router = express.Router();

// User routes
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById); // Requires owner or ADMIN

// Admin routes
router.get('/admin/all', protect, restrictToAdmin, getAllOrdersAdmin);

export default router;