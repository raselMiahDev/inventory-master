// modules/depo/routes/depo.routes.ts
import { Router } from 'express';
import {
    createDepotController,
    getAllDepotsController,
    getDepotByIdController,
    updateDepotController,
    deleteDepotController,
    getDepotStatsController,
    getActiveDepotsController
} from './depo.controller';
import { UserRole } from '../../enum';
import {authMiddleware} from "../../middlewares/auth.middlewares";
import {roleMiddleware} from "../../middlewares/role.middlewares";

const depoRouter = Router();

// All depot routes require authentication
depoRouter.use(authMiddleware);

// Get active depots (dropdown list)
depoRouter.get('/active', getActiveDepotsController);

// Get depot stats
depoRouter.get('/:id/stats', getDepotStatsController);

// CRUD operations - Admin only
depoRouter.post('/', roleMiddleware([UserRole.ADMIN]), createDepotController);
depoRouter.get('/', getAllDepotsController); // Both admin and in_charge (with restrictions)
depoRouter.get('/:id', getDepotByIdController); // Both admin and in_charge (with restrictions)
depoRouter.put('/:id', roleMiddleware([UserRole.ADMIN]), updateDepotController);
depoRouter.delete('/:id', roleMiddleware([UserRole.ADMIN]), deleteDepotController);

export default depoRouter;