// src/config/db.js

import mongoose from "mongoose";
import { ENV } from "./env.js";
console.log("Connecting to MongoDB with URI:", ENV.MONGODB_URI);
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(ENV.MONGODB_URI);
        console.log(`\n 💾 MongoDB connected! DB Host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("❌ MONGODB connection FAILED ", error);
        process.exit(1);
    }
};

export default connectDB;