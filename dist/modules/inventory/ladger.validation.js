"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LadgerSchema = void 0;
const zod_1 = require("zod");
const ladger_enum_1 = require("../../enum/ladger.enum");
exports.LadgerSchema = zod_1.z.object({
    depoId: zod_1.z.string(),
    productId: zod_1.z.string(),
    type: zod_1.z.nativeEnum(ladger_enum_1.LadgerEnum),
    quantity: zod_1.z.number().positive(),
    reference: zod_1.z.string().optional(),
});
