// // server.js

// import dotenv from 'dotenv';
// // Load environment variables from .env file
// // dotenv.config({ path: './.env' });
// dotenv.config({ path: './.env' });
// console.log("Is MONGODB_URI loaded?", process.env.MONGODB_URI ? "Yes" : "No");

// import app from './src/app.js';
// import connectDB from './src/config/db.js';
// import { ENV } from './src/config/env.js';
// console.log("Loaded Environment Variables:", {
//     PORT: ENV.PORT,
//     MONGODB_URI: ENV.MONGODB_URI,
//     NODE_ENV: ENV.NODE_ENV
//     // Note: Do not log sensitive information like JWT_SECRET or RAZORPAY_KEY_SECRET
// });
// const startServer = async () => {
//     try {
//         // 1. Connect to MongoDB
//         await connectDB();

//         // 2. Start the Express server
//         app.listen(ENV.PORT, () => {
//             console.log(`\n 🚀 Server is running on port: ${ENV.PORT}`);
//             console.log(`   Mode: ${ENV.NODE_ENV}`);
//             console.log(`   URL: http://localhost:${ENV.PORT}`);
//         });
//     } catch (error) {
//         console.error("❌ Server startup error: ", error);
//         // Exit the process on connection failure
//         process.exit(1);
//     }
// };

// startServer();
import 'dotenv/config'; // 👈 runs BEFORE anything else

import app from './src/app.js';
import connectDB from './src/config/db.js';
import { ENV } from './src/config/env.js';
console.log("ENV CHECK:", {
  PORT: ENV.PORT,
  DB: ENV.MONGODB_URI ? "OK" : "MISSING",
  JWT: ENV.JWT_SECRET ? "OK" : "MISSING",
  RZP_ID: ENV.RAZORPAY_KEY_ID ? "OK" : "MISSING",
  RZP_SECRET: ENV.RAZORPAY_KEY_SECRET ? "OK" : "MISSING",
});
const startServer = async () => {
  try {
    await connectDB();

    app.listen(ENV.PORT, () => {
      console.log(`🚀 Server running on port ${ENV.PORT}`);
      console.log(`Mode: ${ENV.NODE_ENV}`);
    });
  } catch (err) {
    console.error('❌ Server startup error:', err);
    process.exit(1);
  }
};

startServer();
