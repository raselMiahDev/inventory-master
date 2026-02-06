import { z } from 'zod';

export const createDepotSchema = z.object({
    name: z.string()
        .min(3, 'Name must be at least 3 characters')
        .max(100, 'Name must be less than 100 characters'),
    code: z.string()
        .min(2, 'Code must be at least 2 characters')
        .max(10, 'Code must be less than 10 characters')
        .regex(/^[A-Z0-9]+$/, 'Code must be uppercase alphanumeric'),
    address: z.string()
        .min(5, 'Address must be at least 5 characters')
        .max(500, 'Address must be less than 500 characters'),
    contactPerson: z.string()
        .min(3, 'Contact person name must be at least 3 characters')
        .max(100, 'Contact person name must be less than 100 characters'),
    contactNumber: z.string()
        .regex(/^[0-9+\-\s()]{10,15}$/, 'Invalid phone number format')
});

export const updateDepotSchema = z.object({
    name: z.string()
        .min(3, 'Name must be at least 3 characters')
        .max(100, 'Name must be less than 100 characters')
        .optional(),
    address: z.string()
        .min(5, 'Address must be at least 5 characters')
        .max(500, 'Address must be less than 500 characters')
        .optional(),
    contactPerson: z.string()
        .min(3, 'Contact person name must be at least 3 characters')
        .max(100, 'Contact person name must be less than 100 characters')
        .optional(),
    contactNumber: z.string()
        .regex(/^[0-9+\-\s()]{10,15}$/, 'Invalid phone number format')
        .optional(),
    isActive: z.boolean().optional()
});

export const depotIdSchema = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid depot ID')
});