"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateRangeSchema = exports.transferIdSchema = exports.transferFiltersSchema = exports.cancelTransferSchema = exports.receiveTransferSchema = exports.shipTransferSchema = exports.approveTransferSchema = exports.updateTransferSchema = exports.createTransferSchema = void 0;
const zod_1 = require("zod");
const transfer_types_1 = require("./transfer.types");
// Base schemas
const objectIdSchema = zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');
const transferItemSchema = zod_1.z.object({
    productId: objectIdSchema,
    requestedQuantity: zod_1.z.number()
        .positive('Quantity must be positive')
        .min(0.1, 'Minimum quantity is 0.1 KG')
        .max(100000, 'Maximum quantity is 100,000 KG'),
    batchNumber: zod_1.z.string().max(50, 'Batch number too long').optional(),
    expiryDate: zod_1.z.string().datetime().optional(),
    remarks: zod_1.z.string().max(500, 'Remarks too long').optional()
});
// Create transfer schema
exports.createTransferSchema = zod_1.z.object({
    transferType: zod_1.z.nativeEnum(transfer_types_1.TransferType),
    toDepotId: objectIdSchema,
    items: zod_1.z.array(transferItemSchema)
        .min(1, 'At least one item is required')
        .max(50, 'Maximum 50 items per transfer'),
    priority: zod_1.z.nativeEnum(transfer_types_1.TransferPriority).default(transfer_types_1.TransferPriority.NORMAL),
    expectedDeliveryDate: zod_1.z.string().datetime().optional(),
    remarks: zod_1.z.string().max(500, 'Remarks too long').optional()
});
// Update transfer schema
exports.updateTransferSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(transfer_types_1.TransferStatus).optional(),
    priority: zod_1.z.nativeEnum(transfer_types_1.TransferPriority).optional(),
    expectedDeliveryDate: zod_1.z.string().datetime().optional(),
    trackingNumber: zod_1.z.string().max(100, 'Tracking number too long').optional(),
    courierName: zod_1.z.string().max(100, 'Courier name too long').optional(),
    vehicleNumber: zod_1.z.string().max(50, 'Vehicle number too long').optional(),
    driverName: zod_1.z.string().max(100, 'Driver name too long').optional(),
    driverPhone: zod_1.z.string().regex(/^[0-9+\-\s()]{10,15}$/, 'Invalid phone number').optional(),
    remarks: zod_1.z.string().max(500, 'Remarks too long').optional()
}).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update'
});
// Approve transfer schema
exports.approveTransferSchema = zod_1.z.object({
    approvedItems: zod_1.z.array(zod_1.z.object({
        productId: objectIdSchema,
        approvedQuantity: zod_1.z.number()
            .positive('Approved quantity must be positive')
            .min(0.1, 'Minimum approved quantity is 0.1 KG')
    })).min(1, 'At least one item must be approved'),
    remarks: zod_1.z.string().max(500, 'Remarks too long').optional()
});
// Ship transfer schema
exports.shipTransferSchema = zod_1.z.object({
    shippedItems: zod_1.z.array(zod_1.z.object({
        productId: objectIdSchema,
        shippedQuantity: zod_1.z.number()
            .positive('Shipped quantity must be positive')
            .min(0.1, 'Minimum shipped quantity is 0.1 KG')
    })).min(1, 'At least one item must be shipped'),
    trackingNumber: zod_1.z.string().max(100, 'Tracking number too long').optional(),
    courierName: zod_1.z.string().max(100, 'Courier name too long').optional(),
    vehicleNumber: zod_1.z.string().max(50, 'Vehicle number too long').optional(),
    driverName: zod_1.z.string().max(100, 'Driver name too long').optional(),
    driverPhone: zod_1.z.string().regex(/^[0-9+\-\s()]{10,15}$/, 'Invalid phone number').optional(),
    remarks: zod_1.z.string().max(500, 'Remarks too long').optional()
});
// Receive transfer schema
exports.receiveTransferSchema = zod_1.z.object({
    receivedItems: zod_1.z.array(zod_1.z.object({
        productId: objectIdSchema,
        receivedQuantity: zod_1.z.number()
            .positive('Received quantity must be positive')
            .min(0.1, 'Minimum received quantity is 0.1 KG'),
        batchNumber: zod_1.z.string().max(50, 'Batch number too long').optional(),
        expiryDate: zod_1.z.string().datetime().optional(),
        remarks: zod_1.z.string().max(500, 'Remarks too long').optional()
    })).min(1, 'At least one item must be received'),
    remarks: zod_1.z.string().max(500, 'Remarks too long').optional()
});
// Cancel transfer schema
exports.cancelTransferSchema = zod_1.z.object({
    reason: zod_1.z.string()
        .min(5, 'Cancellation reason must be at least 5 characters')
        .max(500, 'Cancellation reason too long'),
    remarks: zod_1.z.string().max(500, 'Remarks too long').optional()
});
// Filter schema
exports.transferFiltersSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(transfer_types_1.TransferStatus).optional(),
    fromDepotId: objectIdSchema.optional(),
    toDepotId: objectIdSchema.optional(),
    transferType: zod_1.z.nativeEnum(transfer_types_1.TransferType).optional(),
    priority: zod_1.z.nativeEnum(transfer_types_1.TransferPriority).optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    search: zod_1.z.string().max(100).optional(),
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).default(1),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).default(20),
    sortBy: zod_1.z.enum(['createdAt', 'requestedDate', 'expectedDeliveryDate', 'totalValue']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc')
});
// ID schema
exports.transferIdSchema = zod_1.z.object({
    id: objectIdSchema
});
// Date range schema for statistics
exports.dateRangeSchema = zod_1.z.object({
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional()
});
