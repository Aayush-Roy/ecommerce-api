// src/routes/category.routes.js

import express from 'express';
import { 
    createCategory, 
    getCategories, 
    updateCategory, 
    deleteCategory 
} from '../controllers/category.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { restrictToAdmin } from '../middlewares/role.middleware.js';

const router = express.Router();

// Public read access
router.get('/', getCategories);

// Admin-only routes
router.use(protect, restrictToAdmin);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;