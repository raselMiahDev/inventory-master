// modules/product/validators/product.validator.ts
import { z } from 'zod';

export const createProductSchema = z.object({
    name: z.string()
        .min(3, 'Name must be at least 3 characters')
        .max(100, 'Name must be less than 100 characters'),
    code: z.string()
        .min(2, 'Code must be at least 2 characters')
        .max(20, 'Code must be less than 20 characters')
        .regex(/^[A-Z0-9-]+$/, 'Code must be uppercase alphanumeric with hyphens'),
    packSize: z.number()
        .positive('Pack size must be positive')
        .min(0.1, 'Pack size must be at least 0.1 KG')
        .max(1000, 'Pack size cannot exceed 1000 KG'),
    unitPrice: z.number()
        .positive('Unit price must be positive')
        .min(0.01, 'Unit price must be at least 0.01'),
    description: z.string()
        .max(500, 'Description must be less than 500 characters')
        .optional(),
    category: z.string()
        .min(2, 'Category must be at least 2 characters')
        .max(50, 'Category must be less than 50 characters')
});

export const updateProductSchema = z.object({
    name: z.string()
        .min(3, 'Name must be at least 3 characters')
        .max(100, 'Name must be less than 100 characters')
        .optional(),
    packSize: z.number()
        .positive('Pack size must be positive')
        .min(0.1, 'Pack size must be at least 0.1 KG')
        .max(1000, 'Pack size cannot exceed 1000 KG')
        .optional(),
    unitPrice: z.number()
        .positive('Unit price must be positive')
        .min(0.01, 'Unit price must be at least 0.01')
        .optional(),
    description: z.string()
        .max(500, 'Description must be less than 500 characters')
        .optional(),
    category: z.string()
        .min(2, 'Category must be at least 2 characters')
        .max(50, 'Category must be less than 50 characters')
        .optional(),
    isActive: z.boolean().optional()
});

export const productIdSchema = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID')
});

export const productFiltersSchema = z.object({
    category: z.string().optional(),
    isActive: z.enum(['true', 'false']).optional(),
    search: z.string().optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional()
});