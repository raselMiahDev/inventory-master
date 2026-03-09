"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventory_controller_1 = require("./inventory.controller");
const auth_middlewares_1 = require("../../middlewares/auth.middlewares");
const role_middlewares_1 = require("../../middlewares/role.middlewares");
const enum_1 = require("../../enum");
const router = (0, express_1.Router)();
// All inventory routes require authentication
router.use(auth_middlewares_1.authMiddleware);
// Stock operations
router.post('/receive', (0, role_middlewares_1.roleMiddleware)([enum_1.UserRole.ADMIN, enum_1.UserRole.IN_CHARGE]), inventory_controller_1.receiveStockController);
router.post('/sell', (0, role_middlewares_1.roleMiddleware)([enum_1.UserRole.ADMIN, enum_1.UserRole.IN_CHARGE]), inventory_controller_1.sellStockController);
router.post('/transfer', (0, role_middlewares_1.roleMiddleware)([enum_1.UserRole.ADMIN, enum_1.UserRole.IN_CHARGE]), inventory_controller_1.transferStockController);
// Stock queries
router.get('/depot/:depotId', inventory_controller_1.getDepotStockController);
router.get('/product/:productId', inventory_controller_1.getProductStockController);
router.get('/history/:depotId', inventory_controller_1.getStockHistoryController);
router.get('/alerts/:depotId', inventory_controller_1.getLowStockAlertsController);
router.get('/summary/:depotId', inventory_controller_1.getStockMovementSummaryController);
// Admin only operations
//router.post('/initialize/:depotId', roleMiddleware([UserRole.ADMIN]), initializeDepotInventoryController);
exports.default = router;
