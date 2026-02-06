"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saleValidation = void 0;
const zod_1 = require("zod");
exports.saleValidation = zod_1.z.object({
    depoId: zod_1.z.string(),
    productId: zod_1.z.string(),
    quantity: zod_1.z.number(),
    unitPrice: zod_1.z.number().positive(),
    reference: zod_1.z.string().optional(),
});
