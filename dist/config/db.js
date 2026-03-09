"use strict";
// import mongoose from 'mongoose';
// import { getEnvConfig } from './env';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
// export const connectDB = async (): Promise<void> => {
//     try {
//         const { MONGODB_URI } = getEnvConfig();
//         await mongoose.connect(MONGODB_URI);
//         console.log('✅ MongoDB connected successfully');
//     } catch (error) {
//         console.error('❌ MongoDB connection error:', error);
//         process.exit(1);
//     }
// };
// export const disconnectDB = async (): Promise<void> => {
//     await mongoose.disconnect();
// };
const mongoose_1 = __importDefault(require("mongoose"));
let isConnected = false; // Track connection status
const connectDB = async () => {
    if (isConnected) {
        console.log('Using existing database connection');
        return;
    }
    try {
        const db = await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory_db');
        isConnected = true;
        console.log('✅ MongoDB connected');
        return db;
    }
    catch (error) {
        console.error('❌ MongoDB connection error:', error);
        // Don't crash on Vercel - just log error
        return null;
    }
};
exports.connectDB = connectDB;
