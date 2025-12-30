// src/app.js

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { ENV } from './config/env.js';
import ApiError from './utils/ApiError.js';
import errorMiddleware from './middlewares/error.middleware.js';

// --- Import Routes ---
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';
import paymentRoutes from './routes/payment.routes.js';

const app = express();

// --- Production Security & General Middlewares ---

// 1. Helmet for setting various HTTP headers
app.use(helmet());

// 2. CORS for cross-origin resource sharing
app.use(cors({
    origin: '*', // Set to specific frontend URL in production
    credentials: true
}));

// 3. Rate Limiter: Limit repeated requests to public APIs (e.g., login/register)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use(limiter);

// 4. Body Parsers
app.use(express.json({ limit: '16kb' })); // To parse JSON payloads
app.use(express.urlencoded({ extended: true, limit: '16kb' })); // To parse URL-encoded data

// --- Basic Health Check Route ---
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: `E-commerce API is running in ${ENV.NODE_ENV} mode.`,
        data: {
            service: "E-commerce Backend API",
            version: "1.0.0"
        }
    });
});

// --- API Route Declarations ---
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);


// --- Error Handling Middlewares ---

// 1. 404 Not Found Handler (Must be placed after all routes)
// app.all('*', (req, res, next) => {
//     next(new ApiError(404, `Can't find ${req.originalUrl} on this server!`));
// });
// --- 404 Not Found Handler (NO "*")
app.use((req, res, next) => {
    next(new ApiError(404, `Can't find ${req.originalUrl} on this server!`));
});

// --- Global Error Handler
app.use(errorMiddleware);


// 2. Global Error Handler (Centralized error processing)
app.use(errorMiddleware);

export default app;