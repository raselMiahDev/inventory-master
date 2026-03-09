"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sale_controller_1 = require("./sale.controller");
const auth_middlewares_1 = require("../../middlewares/auth.middlewares");
const role_middlewares_1 = require("../../middlewares/role.middlewares");
const enum_1 = require("../../enum");
const router = (0, express_1.Router)();
// All sale routes require authentication
router.use(auth_middlewares_1.authMiddleware);
// Sales operations
router.post('/', (0, role_middlewares_1.roleMiddleware)([enum_1.UserRole.ADMIN, enum_1.UserRole.IN_CHARGE]), sale_controller_1.createSaleController);
router.get('/', sale_controller_1.getSalesController);
router.get('/:id', sale_controller_1.getSaleByIdController);
router.get('/today/:depotId', sale_controller_1.getTodaySalesController);
router.get('/daily/:depotId', sale_controller_1.getDailySalesController);
router.put('/:id/deposit', sale_controller_1.markBankDepositController);
router.get('/summary', sale_controller_1.getSummaryController);
router.get('/customer/:phone', sale_controller_1.getCustomerHistoryController);
// Admin only routes
//router.delete('/:id/cancel', roleMiddleware([UserRole.ADMIN]), cancelSaleController);
exports.default = router;
