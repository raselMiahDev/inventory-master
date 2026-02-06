"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// modules/auth/routes/auth.routes.ts
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_middlewares_1 = require("../../middlewares/auth.middlewares");
const role_middlewares_1 = require("../../middlewares/role.middlewares");
const enum_1 = require("../../enum");
const authRouter = (0, express_1.Router)();
// Public routes
authRouter.post('/login', auth_controller_1.loginController);
authRouter.post('/register', auth_middlewares_1.authMiddleware, (0, role_middlewares_1.roleMiddleware)([enum_1.UserRole.ADMIN]), auth_controller_1.registerController);
// Protected routes
authRouter.get('/profile', auth_middlewares_1.authMiddleware, auth_controller_1.getProfileController);
exports.default = authRouter;
