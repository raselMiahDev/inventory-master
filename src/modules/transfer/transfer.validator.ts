import { z } from 'zod';
import { TransferStatus, TransferPriority, TransferType } from './transfer.types';

// Base schemas
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

const transferItemSchema = z.object({
    productId: objectIdSchema,
    requestedQuantity: z.number()
        .positive('Quantity must be positive')
        .min(0.1, 'Minimum quantity is 0.1 KG')
        .max(100000, 'Maximum quantity is 100,000 KG'),
    batchNumber: z.string().max(50, 'Batch number too long').optional(),
    expiryDate: z.string().datetime().optional(),
    remarks: z.string().max(500, 'Remarks too long').optional()
});

// Create transfer schema
export const createTransferSchema = z.object({
    transferType: z.nativeEnum(TransferType),
    toDepotId: objectIdSchema,
    items: z.array(transferItemSchema)
        .min(1, 'At least one item is required')
        .max(50, 'Maximum 50 items per transfer'),
    priority: z.nativeEnum(TransferPriority).default(TransferPriority.NORMAL),
    expectedDeliveryDate: z.string().datetime().optional(),
    remarks: z.string().max(500, 'Remarks too long').optional()
});

// Update transfer schema
export const updateTransferSchema = z.object({
    status: z.nativeEnum(TransferStatus).optional(),
    priority: z.nativeEnum(TransferPriority).optional(),
    expectedDeliveryDate: z.string().datetime().optional(),
    trackingNumber: z.string().max(100, 'Tracking number too long').optional(),
    courierName: z.string().max(100, 'Courier name too long').optional(),
    vehicleNumber: z.string().max(50, 'Vehicle number too long').optional(),
    driverName: z.string().max(100, 'Driver name too long').optional(),
    driverPhone: z.string().regex(/^[0-9+\-\s()]{10,15}$/, 'Invalid phone number').optional(),
    remarks: z.string().max(500, 'Remarks too long').optional()
}).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update'
});

// Approve transfer schema
export const approveTransferSchema = z.object({
    approvedItems: z.array(z.object({
        productId: objectIdSchema,
        approvedQuantity: z.number()
            .positive('Approved quantity must be positive')
            .min(0.1, 'Minimum approved quantity is 0.1 KG')
    })).min(1, 'At least one item must be approved'),
    remarks: z.string().max(500, 'Remarks too long').optional()
});

// Ship transfer schema
export const shipTransferSchema = z.object({
    shippedItems: z.array(z.object({
        productId: objectIdSchema,
        shippedQuantity: z.number()
            .positive('Shipped quantity must be positive')
            .min(0.1, 'Minimum shipped quantity is 0.1 KG')
    })).min(1, 'At least one item must be shipped'),
    trackingNumber: z.string().max(100, 'Tracking number too long').optional(),
    courierName: z.string().max(100, 'Courier name too long').optional(),
    vehicleNumber: z.string().max(50, 'Vehicle number too long').optional(),
    driverName: z.string().max(100, 'Driver name too long').optional(),
    driverPhone: z.string().regex(/^[0-9+\-\s()]{10,15}$/, 'Invalid phone number').optional(),
    remarks: z.string().max(500, 'Remarks too long').optional()
});

// Receive transfer schema
export const receiveTransferSchema = z.object({
    receivedItems: z.array(z.object({
        productId: objectIdSchema,
        receivedQuantity: z.number()
            .positive('Received quantity must be positive')
            .min(0.1, 'Minimum received quantity is 0.1 KG'),
        batchNumber: z.string().max(50, 'Batch number too long').optional(),
        expiryDate: z.string().datetime().optional(),
        remarks: z.string().max(500, 'Remarks too long').optional()
    })).min(1, 'At least one item must be received'),
    remarks: z.string().max(500, 'Remarks too long').optional()
});

// Cancel transfer schema
export const cancelTransferSchema = z.object({
    reason: z.string()
        .min(5, 'Cancellation reason must be at least 5 characters')
        .max(500, 'Cancellation reason too long'),
    remarks: z.string().max(500, 'Remarks too long').optional()
});

// Filter schema
export const transferFiltersSchema = z.object({
    status: z.nativeEnum(TransferStatus).optional(),
    fromDepotId: objectIdSchema.optional(),
    toDepotId: objectIdSchema.optional(),
    transferType: z.nativeEnum(TransferType).optional(),
    priority: z.nativeEnum(TransferPriority).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    search: z.string().max(100).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).default(1),
    limit: z.string().regex(/^\d+$/).transform(Number).default(20),
    sortBy: z.enum(['createdAt', 'requestedDate', 'expectedDeliveryDate', 'totalValue']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// ID schema
export const transferIdSchema = z.object({
    id: objectIdSchema
});

// Date range schema for statistics
export const dateRangeSchema = z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional()
});