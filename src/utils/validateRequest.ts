import { ZodSchema } from 'zod';
import { Request } from 'express';
export const validateRequest = <T>(
    schema: ZodSchema<T>,
    req: Request
): T => {
    return schema.parse(req.body);
};