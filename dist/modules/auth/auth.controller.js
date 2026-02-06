"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfileController = exports.registerController = exports.loginController = void 0;
const auth_service_1 = require("./auth.service");
const auth_validation_1 = require("./auth.validation");
const loginController = async (req, res) => {
    try {
        // Validate request
        const validatedData = auth_validation_1.loginSchema.parse(req.body);
        // Login user
        const result = await (0, auth_service_1.loginUser)(validatedData);
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: result
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Login failed'
        });
    }
};
exports.loginController = loginController;
const registerController = async (req, res) => {
    try {
        // Validate request
        const validatedData = auth_validation_1.registerSchema.parse(req.body);
        // Register user (only admin should access this)
        const result = await (0, auth_service_1.registerUser)(validatedData);
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: result
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Registration failed'
        });
    }
};
exports.registerController = registerController;
const getProfileController = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            throw new Error('User not authenticated');
        }
        const user = await (0, auth_service_1.getCurrentUser)(userId);
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to get profile'
        });
    }
};
exports.getProfileController = getProfileController;
