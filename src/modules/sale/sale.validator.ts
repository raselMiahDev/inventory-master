// modules/sale/validators/sale.validator.ts
import { z } from 'zod';

export const saleItemSchema = z.object({
    productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
    quantity: z.number()
        .positive('Quantity must be positive')
        .min(0.1, 'Minimum quantity is 0.1 KG')
});

export const createSaleSchema = z.object({
    items: z.array(saleItemSchema)
        .min(1, 'At least one item is required'),
    cashCollected: z.number()
        .positive('Cash collected must be positive')
        .min(0, 'Cash collected cannot be negative'),
    customerName: z.string()
        .max(100, 'Customer name too long')
        .optional(),
    customerPhone: z.string()
        .regex(/^[0-9+\-\s()]{10,15}$/, 'Invalid phone number')
        .optional(),
    paymentMethod: z.enum(['CASH', 'CARD', 'UPI', 'CREDIT'])
        .default('CASH'),
    notes: z.string()
        .max(500, 'Notes too long')
        .optional()
});

export const bankDepositSchema = z.object({
    depositAmount: z.number()
        .positive('Deposit amount must be positive')
        .min(1, 'Minimum deposit amount is 1'),
    depositSlipNo: z.string()
        .max(50, 'Deposit slip number too long')
        .optional(),
    remarks: z.string()
        .max(500, 'Remarks too long')
        .optional()
});

export const saleFiltersSchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    depotId: z.string().optional(),
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),
    paymentMethod: z.enum(['CASH', 'CARD', 'UPI', 'CREDIT']).optional(),
    minAmount: z.string().transform(Number).optional(),
    maxAmount: z.string().transform(Number).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).default(1),
    limit: z.string().regex(/^\d+$/).transform(Number).default(20)
});

export const saleIdSchema = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid sale ID')
});

export const dailySalesIdSchema = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid daily sales ID')
});

export const dateRangeSchema = z.object({
    startDate: z.string(),
    endDate: z.string()
});