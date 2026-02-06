"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// modules/product/routes/product.routes.ts
const express_1 = require("express");
const product_controller_1 = require("./product.controller");
const auth_middlewares_1 = require("../../middlewares/auth.middlewares");
const role_middlewares_1 = require("../../middlewares/role.middlewares");
const enum_1 = require("../../enum");
const productRouter = (0, express_1.Router)();
// All product routes require authentication
productRouter.use(auth_middlewares_1.authMiddleware);
// Public product routes (read-only)
productRouter.get('/', product_controller_1.getAllProductsController);
productRouter.get('/categories', product_controller_1.getProductCategoriesController);
productRouter.get('/active', product_controller_1.getActiveProductsController);
productRouter.get('/low-stock', product_controller_1.getProductsWithLowStockController);
productRouter.get('/:id', product_controller_1.getProductByIdController);
productRouter.get('/:id/stock-summary', product_controller_1.getProductStockSummaryController);
// Admin-only routes
productRouter.post('/', (0, role_middlewares_1.roleMiddleware)([enum_1.UserRole.ADMIN]), product_controller_1.createProductController);
productRouter.put('/:id', (0, role_middlewares_1.roleMiddleware)([enum_1.UserRole.ADMIN]), product_controller_1.updateProductController);
productRouter.delete('/:id', (0, role_middlewares_1.roleMiddleware)([enum_1.UserRole.ADMIN]), product_controller_1.deleteProductController);
productRouter.patch('/:id/deactivate', (0, role_middlewares_1.roleMiddleware)([enum_1.UserRole.ADMIN]), product_controller_1.deactivateProductController);
exports.default = productRouter;
