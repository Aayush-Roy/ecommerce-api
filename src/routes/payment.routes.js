// src/routes/payment.routes.js

import express from 'express';
import { 
    createRazorpayOrder, 
    verifyPayment 
} from '../controllers/payment.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Both routes require user authentication
router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment); // Frontend sends verification payload here

export default router;