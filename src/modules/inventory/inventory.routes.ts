import { Router } from 'express';
import {
    receiveStockController,
    sellStockController,
    transferStockController,
    getStockHistoryController,
    getStockMovementSummaryController, getDepotStockController,
} from './inventory.controller';
import {authMiddleware} from "../../middlewares/auth.middlewares";
import {roleMiddleware} from "../../middlewares/role.middlewares";
import {UserRole} from "../../enum";



const router = Router();

// All inventory routes require authentication
router.use(authMiddleware);

// Stock operations
router.post('/receive', roleMiddleware([UserRole.ADMIN, UserRole.IN_CHARGE]), receiveStockController);
//router.post('/sell', roleMiddleware([UserRole.ADMIN, UserRole.IN_CHARGE]), sellStockController);
//router.post('/transfer', roleMiddleware([UserRole.ADMIN, UserRole.IN_CHARGE]), transferStockController);

// Stock queries
//router.get('/depot/:depotId?', getDepotStockController);
//router.get('/product/:productId', getProductStockController);
//router.get('/history/:depotId?', getStockHistoryController);
//router.get('/alerts/:depotId?', getLowStockAlertsController);
//router.get('/summary/:depotId?', getStockMovementSummaryController);

// Admin only operations
//router.post('/initialize/:depotId', roleMiddleware([UserRole.ADMIN]), initializeDepotInventoryController);

export default router;