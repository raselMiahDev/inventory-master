"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.depotIdSchema = exports.updateDepotSchema = exports.createDepotSchema = void 0;
const zod_1 = require("zod");
exports.createDepotSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(3, 'Name must be at least 3 characters')
        .max(100, 'Name must be less than 100 characters'),
    code: zod_1.z.string()
        .min(2, 'Code must be at least 2 characters')
        .max(10, 'Code must be less than 10 characters')
        .regex(/^[A-Z0-9]+$/, 'Code must be uppercase alphanumeric'),
    address: zod_1.z.string()
        .min(5, 'Address must be at least 5 characters')
        .max(500, 'Address must be less than 500 characters'),
    contactPerson: zod_1.z.string()
        .min(3, 'Contact person name must be at least 3 characters')
        .max(100, 'Contact person name must be less than 100 characters'),
    contactNumber: zod_1.z.string()
        .regex(/^[0-9+\-\s()]{10,15}$/, 'Invalid phone number format')
});
exports.updateDepotSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(3, 'Name must be at least 3 characters')
        .max(100, 'Name must be less than 100 characters')
        .optional(),
    address: zod_1.z.string()
        .min(5, 'Address must be at least 5 characters')
        .max(500, 'Address must be less than 500 characters')
        .optional(),
    contactPerson: zod_1.z.string()
        .min(3, 'Contact person name must be at least 3 characters')
        .max(100, 'Contact person name must be less than 100 characters')
        .optional(),
    contactNumber: zod_1.z.string()
        .regex(/^[0-9+\-\s()]{10,15}$/, 'Invalid phone number format')
        .optional(),
    isActive: zod_1.z.boolean().optional()
});
exports.depotIdSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid depot ID')
});
