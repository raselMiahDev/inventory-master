"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// modules/transfer/routes/transfer.routes.ts
const express_1 = require("express");
const transfer_controller_1 = require("./transfer.controller");
const auth_middlewares_1 = require("../../middlewares/auth.middlewares");
const role_middlewares_1 = require("../../middlewares/role.middlewares");
const enum_1 = require("../../enum");
const router = (0, express_1.Router)();
// All transfer routes require authentication
router.use(auth_middlewares_1.authMiddleware);
// CRUD operations
router.post('/', (0, role_middlewares_1.roleMiddleware)([enum_1.UserRole.ADMIN, enum_1.UserRole.IN_CHARGE]), transfer_controller_1.transferController.createTransfer.bind(transfer_controller_1.transferController));
router.get('/', (0, role_middlewares_1.roleMiddleware)([enum_1.UserRole.ADMIN, enum_1.UserRole.IN_CHARGE]), transfer_controller_1.transferController.getTransfers.bind(transfer_controller_1.transferController));
// Get single transfer - must be last
router.get('/:id', (0, role_middlewares_1.roleMiddleware)([enum_1.UserRole.ADMIN, enum_1.UserRole.IN_CHARGE]), transfer_controller_1.transferController.getTransferById.bind(transfer_controller_1.transferController));
// Specific routes first (order matters!)
router.get('/summary', (0, role_middlewares_1.roleMiddleware)([enum_1.UserRole.ADMIN, enum_1.UserRole.IN_CHARGE]), transfer_controller_1.transferController.getTransferSummary.bind(transfer_controller_1.transferController));
//router.get('/statistics', roleMiddleware([UserRole.ADMIN]), transferController.getTransferStatistics.bind(transferController));
router.get('/pending/:depotId', (0, role_middlewares_1.roleMiddleware)([enum_1.UserRole.ADMIN, enum_1.UserRole.IN_CHARGE]), transfer_controller_1.transferController.getPendingApprovals.bind(transfer_controller_1.transferController));
router.get('/incoming/:depotId', (0, role_middlewares_1.roleMiddleware)([enum_1.UserRole.ADMIN, enum_1.UserRole.IN_CHARGE]), transfer_controller_1.transferController.getIncomingTransfers.bind(transfer_controller_1.transferController));
router.get('/outgoing/:depotId', (0, role_middlewares_1.roleMiddleware)([enum_1.UserRole.ADMIN, enum_1.UserRole.IN_CHARGE]), transfer_controller_1.transferController.getOutgoingTransfers.bind(transfer_controller_1.transferController));
// Status update routes
router.put('/:id/approve', (0, role_middlewares_1.roleMiddleware)([enum_1.UserRole.ADMIN, enum_1.UserRole.IN_CHARGE]), transfer_controller_1.transferController.approveTransfer.bind(transfer_controller_1.transferController));
router.put('/:id/ship', (0, role_middlewares_1.roleMiddleware)([enum_1.UserRole.ADMIN, enum_1.UserRole.IN_CHARGE]), transfer_controller_1.transferController.shipTransfer.bind(transfer_controller_1.transferController));
router.put('/:id/receive', (0, role_middlewares_1.roleMiddleware)([enum_1.UserRole.ADMIN, enum_1.UserRole.IN_CHARGE]), transfer_controller_1.transferController.receiveTransfer.bind(transfer_controller_1.transferController));
router.put('/:id/cancel', (0, role_middlewares_1.roleMiddleware)([enum_1.UserRole.ADMIN, enum_1.UserRole.IN_CHARGE]), transfer_controller_1.transferController.cancelTransfer.bind(transfer_controller_1.transferController));
// Update route
router.put('/:id', (0, role_middlewares_1.roleMiddleware)([enum_1.UserRole.ADMIN, enum_1.UserRole.IN_CHARGE]), transfer_controller_1.transferController.updateTransfer.bind(transfer_controller_1.transferController));
exports.default = router;
