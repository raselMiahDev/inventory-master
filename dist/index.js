"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const error_middleware_1 = require("./middlewares/error.middleware");
const api_1 = __importDefault(require("./api/api"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        db: mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});
// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: '🚀🚀🚀API is working!' });
});
// ✅ FOR LOCAL DEVELOPMENT ONLY
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Local server running on port ${PORT}`);
    });
}
// global error handler
app.use(error_middleware_1.errorHandler);
app.use("/v1", api_1.default);
exports.default = app;
