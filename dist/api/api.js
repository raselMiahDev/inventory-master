"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const depo_routes_1 = __importDefault(require("../modules/depo/depo.routes"));
const product_routes_1 = __importDefault(require("../modules/product/product.routes"));
const auth_routes_1 = __importDefault(require("../modules/auth/auth.routes"));
const inventory_routes_1 = __importDefault(require("../modules/inventory/inventory.routes"));
const router = (0, express_1.Router)();
router.use("/auth", auth_routes_1.default);
router.use("/depots", depo_routes_1.default);
router.use("/products", product_routes_1.default);
router.use("/inventory", inventory_routes_1.default);
exports.default = router;
