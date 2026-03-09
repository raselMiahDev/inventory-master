"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateRangeSchema = exports.dailySalesIdSchema = exports.saleIdSchema = exports.saleFiltersSchema = exports.bankDepositSchema = exports.createSaleSchema = exports.saleItemSchema = void 0;
// modules/sale/validators/sale.validator.ts
const zod_1 = require("zod");
exports.saleItemSchema = zod_1.z.object({
    productId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
    quantity: zod_1.z.number()
        .positive('Quantity must be positive')
        .min(0.1, 'Minimum quantity is 0.1 KG')
});
exports.createSaleSchema = zod_1.z.object({
    items: zod_1.z.array(exports.saleItemSchema)
        .min(1, 'At least one item is required'),
    cashCollected: zod_1.z.number()
        .positive('Cash collected must be positive')
        .min(0, 'Cash collected cannot be negative'),
    customerName: zod_1.z.string()
        .max(100, 'Customer name too long')
        .optional(),
    customerPhone: zod_1.z.string()
        .regex(/^[0-9+\-\s()]{10,15}$/, 'Invalid phone number')
        .optional(),
    paymentMethod: zod_1.z.enum(['CASH', 'CARD', 'UPI', 'CREDIT'])
        .default('CASH'),
    notes: zod_1.z.string()
        .max(500, 'Notes too long')
        .optional()
});
exports.bankDepositSchema = zod_1.z.object({
    depositAmount: zod_1.z.number()
        .positive('Deposit amount must be positive')
        .min(1, 'Minimum deposit amount is 1'),
    depositSlipNo: zod_1.z.string()
        .max(50, 'Deposit slip number too long')
        .optional(),
    remarks: zod_1.z.string()
        .max(500, 'Remarks too long')
        .optional()
});
exports.saleFiltersSchema = zod_1.z.object({
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    depotId: zod_1.z.string().optional(),
    customerName: zod_1.z.string().optional(),
    customerPhone: zod_1.z.string().optional(),
    paymentMethod: zod_1.z.enum(['CASH', 'CARD', 'UPI', 'CREDIT']).optional(),
    minAmount: zod_1.z.string().transform(Number).optional(),
    maxAmount: zod_1.z.string().transform(Number).optional(),
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).default(1),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).default(20)
});
exports.saleIdSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid sale ID')
});
exports.dailySalesIdSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid daily sales ID')
});
exports.dateRangeSchema = zod_1.z.object({
    startDate: zod_1.z.string(),
    endDate: zod_1.z.string()
});
