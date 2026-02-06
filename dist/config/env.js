"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnvConfig = void 0;
const getEnvConfig = () => ({
    PORT: parseInt(process.env.PORT || '3000'),
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://raselmiahdev_db_user:RZWrhkV9oeBOOvg7@cluster0.oyu3ze6.mongodb.net/inventory-master',
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    JWT_EXPIRY: process.env.JWT_EXPIRY || '24h',
});
exports.getEnvConfig = getEnvConfig;
