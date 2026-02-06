"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferZod = void 0;
const zod_1 = require("zod");
exports.TransferZod = zod_1.z.object({
    body: zod_1.z.object({
        fromDepoId: zod_1.z.string().min(10, "From Depo required"),
        toDepoId: zod_1.z.string().min(10, "To Depo required"),
        productId: zod_1.z.string().min(10, "Product ID"),
        pcs: zod_1.z.number().int().positive("Pcs must be greater than 0"),
        reference: zod_1.z.string().min(1, "Reference"),
    })
});
