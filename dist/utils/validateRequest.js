"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const validateRequest = (schema, req) => {
    return schema.parse(req.body);
};
exports.validateRequest = validateRequest;
