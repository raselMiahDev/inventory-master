"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryIdSchema = exports.stockHistoryFiltersSchema = exports.transferStockSchema = exports.sellStockSchema = exports.receiveStockSchema = void 0;
const zod_1 = require("zod");
const enum_1 = require("../../enum");
exports.receiveStockSchema = zod_1.z.object({
    productId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
    quantity: zod_1.z.number()
        .positive('Quantity must be positive')
        .min(0.1, 'Minimum quantity is 0.1 KG'),
    remarks: zod_1.z.string().max(500, 'Remarks too long').optional()
});
exports.sellStockSchema = zod_1.z.object({
    productId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
    quantity: zod_1.z.number()
        .positive('Quantity must be positive')
        .min(0.1, 'Minimum quantity is 0.1 KG'),
    customerName: zod_1.z.string().max(100, 'Customer name too long').optional(),
    remarks: zod_1.z.string().max(500, 'Remarks too long').optional()
});
exports.transferStockSchema = zod_1.z.object({
    toDepotId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid depot ID'),
    productId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
    quantity: zod_1.z.number()
        .positive('Quantity must be positive')
        .min(0.1, 'Minimum quantity is 0.1 KG'),
    remarks: zod_1.z.string().max(500, 'Remarks too long').optional()
});
exports.stockHistoryFiltersSchema = zod_1.z.object({
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    productId: zod_1.z.string().optional(),
    type: zod_1.z.nativeEnum(enum_1.TransactionType).optional(),
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).default(1),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).default(20)
});
exports.inventoryIdSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID')
});
