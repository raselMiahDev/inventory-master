import { Router } from 'express';
import {
    createSaleController,
    getSaleByIdController,
    getSalesController,
    getDailySalesController,
    getTodaySalesController,
    markBankDepositController,
    getSummaryController,
    cancelSaleController,
    getCustomerHistoryController,
} from './sale.controller';
import {authMiddleware} from "../../middlewares/auth.middlewares";
import {roleMiddleware} from "../../middlewares/role.middlewares";
import {UserRole} from "../../enum";

const router = Router();

// All sale routes require authentication
router.use(authMiddleware);

// Sales operations
router.post('/', roleMiddleware([UserRole.ADMIN, UserRole.IN_CHARGE]), createSaleController);
router.get('/', getSalesController);
router.get('/:id', getSaleByIdController);
router.get('/today/:depotId', getTodaySalesController);
router.get('/daily/:depotId', getDailySalesController);
router.put('/:id/deposit', markBankDepositController);
router.get('/summary', getSummaryController);
router.get('/customer/:phone', getCustomerHistoryController);


// Admin only routes
//router.delete('/:id/cancel', roleMiddleware([UserRole.ADMIN]), cancelSaleController);

export default router;