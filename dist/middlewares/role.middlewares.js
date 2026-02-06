"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleMiddleware = void 0;
const roleMiddleware = (allowedRoles) => {
    return function (req, res, next) {
        if (!req.user) {
            return res.status(403).send("Not authorized");
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "You don't have permission to access this role" });
        }
        next();
    };
};
exports.roleMiddleware = roleMiddleware;
