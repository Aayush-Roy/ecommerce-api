// src/routes/product.routes.js

import express from 'express';
import { 
    createProduct, 
    getProducts, 
    getProduct, 
    updateProduct, 
    deleteProduct 
} from '../controllers/product.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { restrictToAdmin } from '../middlewares/role.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Admin-only routes
router.use(protect, restrictToAdmin); // Apply middleware to all routes below this line
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;