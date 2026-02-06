import mongoose from 'mongoose';
import { getEnvConfig } from './env';

export const connectDB = async (): Promise<void> => {
    try {
        const { MONGODB_URI } = getEnvConfig();
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

export const disconnectDB = async (): Promise<void> => {
    await mongoose.disconnect();
};