// modules/auth/routes/auth.routes.ts
import { Router } from 'express';
import {
    loginController,
    registerController,
    getProfileController
} from './auth.controller';
import { authMiddleware } from '../../middlewares/auth.middlewares';
import { roleMiddleware } from '../../middlewares/role.middlewares';
import { UserRole } from '../../enum';

const authRouter = Router();

// Public routes
authRouter.post('/login', loginController);
authRouter.post('/register', authMiddleware, roleMiddleware([UserRole.ADMIN]), registerController);

// Protected routes
authRouter.get('/profile', authMiddleware, getProfileController);

export default authRouter;