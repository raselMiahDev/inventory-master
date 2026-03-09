// modules/transfer/routes/transfer.routes.ts
import { Router } from 'express';
import { transferController } from './transfer.controller';
import {authMiddleware} from "../../middlewares/auth.middlewares";
import {roleMiddleware} from "../../middlewares/role.middlewares";
import {UserRole} from "../../enum";

const router = Router();

// All transfer routes require authentication
router.use(authMiddleware);

// CRUD operations
router.post('/', roleMiddleware([UserRole.ADMIN, UserRole.IN_CHARGE]), transferController.createTransfer.bind(transferController));
router.get('/', roleMiddleware([UserRole.ADMIN, UserRole.IN_CHARGE]), transferController.getTransfers.bind(transferController));
// Get single transfer - must be last
router.get('/:id', roleMiddleware([UserRole.ADMIN, UserRole.IN_CHARGE]), transferController.getTransferById.bind(transferController));

















// Specific routes first (order matters!)
router.get('/summary', roleMiddleware([UserRole.ADMIN, UserRole.IN_CHARGE]), transferController.getTransferSummary.bind(transferController));
//router.get('/statistics', roleMiddleware([UserRole.ADMIN]), transferController.getTransferStatistics.bind(transferController));
router.get('/pending/:depotId', roleMiddleware([UserRole.ADMIN, UserRole.IN_CHARGE]), transferController.getPendingApprovals.bind(transferController));
router.get('/incoming/:depotId', roleMiddleware([UserRole.ADMIN, UserRole.IN_CHARGE]), transferController.getIncomingTransfers.bind(transferController));
router.get('/outgoing/:depotId', roleMiddleware([UserRole.ADMIN, UserRole.IN_CHARGE]), transferController.getOutgoingTransfers.bind(transferController));



// Status update routes
router.put('/:id/approve', roleMiddleware([UserRole.ADMIN, UserRole.IN_CHARGE]), transferController.approveTransfer.bind(transferController));
router.put('/:id/ship', roleMiddleware([UserRole.ADMIN, UserRole.IN_CHARGE]), transferController.shipTransfer.bind(transferController));
router.put('/:id/receive', roleMiddleware([UserRole.ADMIN, UserRole.IN_CHARGE]), transferController.receiveTransfer.bind(transferController));
router.put('/:id/cancel', roleMiddleware([UserRole.ADMIN, UserRole.IN_CHARGE]), transferController.cancelTransfer.bind(transferController));

// Update route
router.put('/:id', roleMiddleware([UserRole.ADMIN, UserRole.IN_CHARGE]), transferController.updateTransfer.bind(transferController));



export default router;