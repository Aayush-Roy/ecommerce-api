// // src/routes/order.routes.js

// import express from 'express';
// import { 
//     createOrder, 
//     getMyOrders, 
//     getOrderById,
//     getAllOrdersAdmin,
// } from '../controllers/order.controller.js';
// import { protect } from '../middlewares/auth.middleware.js';
// import { restrictToAdmin } from '../middlewares/role.middleware.js';

// const router = express.Router();

// // User routes
// router.post('/', protect, createOrder);
// router.get('/my-orders', protect, getMyOrders);
// router.get('/:id', protect, getOrderById); // Requires owner or ADMIN

// // Admin routes
// router.get('/admin/all', protect, restrictToAdmin, getAllOrdersAdmin);

// export default router;
// src/routes/order.routes.js में ये add करें:

import express from 'express';
import { 
    createOrder, 
    getMyOrders, 
    getOrderById,
    getAllOrdersAdmin,
    updateOrderStatusAdmin,  // <-- NEW CONTROLLER IMPORT
    updateOrderPaymentStatusAdmin  // <-- NEW CONTROLLER IMPORT
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

// ✅ NEW ADMIN UPDATE ROUTES
router.put('/admin/:id/status', protect, restrictToAdmin, updateOrderStatusAdmin);
router.put('/admin/:id/payment', protect, restrictToAdmin, updateOrderPaymentStatusAdmin);
// OR single endpoint
router.put('/admin/:id', protect, restrictToAdmin, updateOrderStatusAdmin);

export default router;