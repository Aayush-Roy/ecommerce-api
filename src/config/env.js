// src/config/env.js

const getEnvVar = (key, defaultValue = undefined) => {
    const value = process.env[key] || defaultValue;
    if (value === undefined) {
        throw new Error(`Environment variable ${key} is not set.`);
    }
    return value;
};

// Export all required environment variables for use across the application
export const ENV = {
    PORT: getEnvVar('PORT', 8000),
    MONGODB_URI: getEnvVar('MONGODB_URI'),
    JWT_SECRET: getEnvVar('JWT_SECRET'),
    JWT_EXPIRY: getEnvVar('JWT_EXPIRY', '7d'),
    RAZORPAY_KEY_ID: getEnvVar('RAZORPAY_KEY_ID'),
    RAZORPAY_KEY_SECRET: getEnvVar('RAZORPAY_KEY_SECRET'),
    NODE_ENV: getEnvVar('NODE_ENV', 'development'),
};