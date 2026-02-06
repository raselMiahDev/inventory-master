"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// modules/depo/routes/depo.routes.ts
const express_1 = require("express");
const depo_controller_1 = require("./depo.controller");
const enum_1 = require("../../enum");
const auth_middlewares_1 = require("../../middlewares/auth.middlewares");
const role_middlewares_1 = require("../../middlewares/role.middlewares");
const depoRouter = (0, express_1.Router)();
// All depot routes require authentication
depoRouter.use(auth_middlewares_1.authMiddleware);
// Get active depots (dropdown list)
depoRouter.get('/active', depo_controller_1.getActiveDepotsController);
// Get depot stats
depoRouter.get('/:id/stats', depo_controller_1.getDepotStatsController);
// CRUD operations - Admin only
depoRouter.post('/', (0, role_middlewares_1.roleMiddleware)([enum_1.UserRole.ADMIN]), depo_controller_1.createDepotController);
depoRouter.get('/', depo_controller_1.getAllDepotsController); // Both admin and in_charge (with restrictions)
depoRouter.get('/:id', depo_controller_1.getDepotByIdController); // Both admin and in_charge (with restrictions)
depoRouter.put('/:id', (0, role_middlewares_1.roleMiddleware)([enum_1.UserRole.ADMIN]), depo_controller_1.updateDepotController);
depoRouter.delete('/:id', (0, role_middlewares_1.roleMiddleware)([enum_1.UserRole.ADMIN]), depo_controller_1.deleteDepotController);
exports.default = depoRouter;
