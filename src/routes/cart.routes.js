// src/routes/cart.routes.js

import express from 'express';
import { 
    getCart, 
    addItemToCart, 
    updateCartItem, 
    removeCartItem 
} from '../controllers/cart.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All cart routes require user authentication
router.use(protect);

router.get('/', getCart);
router.post('/add', addItemToCart);
router.put('/update', updateCartItem);
router.delete('/remove/:productId', removeCartItem);

export default router;