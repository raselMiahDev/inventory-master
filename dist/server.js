"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = __importDefault(require("."));
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const startServer = async () => {
    await (0, db_1.connectDB)();
    _1.default.listen((0, env_1.getEnvConfig)().PORT, () => {
        console.log(`🚀 Server running on port ${(0, env_1.getEnvConfig)().PORT}`);
    });
};
startServer();
