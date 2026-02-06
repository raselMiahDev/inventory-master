// modules/auth/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { loginUser, registerUser, getCurrentUser } from './auth.service';
import { loginSchema, registerSchema } from './auth.validation';

export const loginController = async (req: Request, res: Response) => {
    try {
        // Validate request
        const validatedData = loginSchema.parse(req.body);

        // Login user
        const result = await loginUser(validatedData);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: result
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Login failed'
        });
    }
};

export const registerController = async (req: Request, res: Response) => {
    try {
        // Validate request
        const validatedData = registerSchema.parse(req.body);

        // Register user (only admin should access this)
        const result = await registerUser(validatedData);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: result
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Registration failed'
        });
    }
};

export const getProfileController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.userId;

        if (!userId) {
            throw new Error('User not authenticated');
        }

        const user = await getCurrentUser(userId);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to get profile'
        });
    }
};