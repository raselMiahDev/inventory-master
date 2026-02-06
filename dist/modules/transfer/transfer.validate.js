"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationRequest = void 0;
const validationRequest = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params
        });
        next();
    }
    catch (err) {
        return res.status(400).json({
            message: "Validation Error",
            error: err
        });
    }
};
exports.validationRequest = validationRequest;
