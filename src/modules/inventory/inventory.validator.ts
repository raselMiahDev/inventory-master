
import { z } from 'zod';
import { TransactionType } from '../../enum';

export const receiveStockSchema = z.object({
    productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
    quantity: z.number()
        .positive('Quantity must be positive')
        .min(0.1, 'Minimum quantity is 0.1 KG'),
    remarks: z.string().max(500, 'Remarks too long').optional()
});

export const sellStockSchema = z.object({
    productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
    quantity: z.number()
        .positive('Quantity must be positive')
        .min(0.1, 'Minimum quantity is 0.1 KG'),
    customerName: z.string().max(100, 'Customer name too long').optional(),
    remarks: z.string().max(500, 'Remarks too long').optional()
});

export const transferStockSchema = z.object({
    toDepotId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid depot ID'),
    productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
    quantity: z.number()
        .positive('Quantity must be positive')
        .min(0.1, 'Minimum quantity is 0.1 KG'),
    remarks: z.string().max(500, 'Remarks too long').optional()
});

export const stockHistoryFiltersSchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    productId: z.string().optional(),
    type: z.nativeEnum(TransactionType).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).default(1),
    limit: z.string().regex(/^\d+$/).transform(Number).default(20)
});

export const inventoryIdSchema = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID')
});