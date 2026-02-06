"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productFiltersSchema = exports.productIdSchema = exports.updateProductSchema = exports.createProductSchema = void 0;
// modules/product/validators/product.validator.ts
const zod_1 = require("zod");
exports.createProductSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(3, 'Name must be at least 3 characters')
        .max(100, 'Name must be less than 100 characters'),
    code: zod_1.z.string()
        .min(2, 'Code must be at least 2 characters')
        .max(20, 'Code must be less than 20 characters')
        .regex(/^[A-Z0-9-]+$/, 'Code must be uppercase alphanumeric with hyphens'),
    packSize: zod_1.z.number()
        .positive('Pack size must be positive')
        .min(0.1, 'Pack size must be at least 0.1 KG')
        .max(1000, 'Pack size cannot exceed 1000 KG'),
    unitPrice: zod_1.z.number()
        .positive('Unit price must be positive')
        .min(0.01, 'Unit price must be at least 0.01'),
    description: zod_1.z.string()
        .max(500, 'Description must be less than 500 characters')
        .optional(),
    category: zod_1.z.string()
        .min(2, 'Category must be at least 2 characters')
        .max(50, 'Category must be less than 50 characters')
});
exports.updateProductSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(3, 'Name must be at least 3 characters')
        .max(100, 'Name must be less than 100 characters')
        .optional(),
    packSize: zod_1.z.number()
        .positive('Pack size must be positive')
        .min(0.1, 'Pack size must be at least 0.1 KG')
        .max(1000, 'Pack size cannot exceed 1000 KG')
        .optional(),
    unitPrice: zod_1.z.number()
        .positive('Unit price must be positive')
        .min(0.01, 'Unit price must be at least 0.01')
        .optional(),
    description: zod_1.z.string()
        .max(500, 'Description must be less than 500 characters')
        .optional(),
    category: zod_1.z.string()
        .min(2, 'Category must be at least 2 characters')
        .max(50, 'Category must be less than 50 characters')
        .optional(),
    isActive: zod_1.z.boolean().optional()
});
exports.productIdSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID')
});
exports.productFiltersSchema = zod_1.z.object({
    category: zod_1.z.string().optional(),
    isActive: zod_1.z.enum(['true', 'false']).optional(),
    search: zod_1.z.string().optional(),
    minPrice: zod_1.z.string().optional(),
    maxPrice: zod_1.z.string().optional()
});
