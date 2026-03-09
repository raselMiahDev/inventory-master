"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveUserAndDepot = void 0;
const enum_1 = require("../enum");
const resolveUserAndDepot = (req, allowAdminDepotOverride = true) => {
    const user = req.user;
    if (!user?.userId) {
        throw new Error('User not authenticated');
    }
    let depotId = user.depoId;
    if (allowAdminDepotOverride &&
        user.role === enum_1.UserRole.IN_CHARGE &&
        req.body.depotId) {
        depotId = req.body.depotId;
    }
    if (!depotId) {
        throw new Error('Depot ID is required');
    }
    return {
        userId: user.userId,
        depotId,
        role: user.role,
    };
};
exports.resolveUserAndDepot = resolveUserAndDepot;
