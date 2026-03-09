"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStockMovementSummaryController = exports.getLowStockAlertsController = exports.getStockHistoryController = exports.getProductStockController = exports.getDepotStockController = exports.transferStockController = exports.sellStockController = exports.receiveStockController = void 0;
const inventory_service_1 = require("./inventory.service");
const inventory_validator_1 = require("./inventory.validator");
const requestHelpers_1 = require("../../utils/requestHelpers");
const validateRequest_1 = require("../../utils/validateRequest");
// Receive stock into depot
const receiveStockController = async (req, res) => {
    try {
        // Validate request
        const validatedData = (0, validateRequest_1.validateRequest)(inventory_validator_1.receiveStockSchema, req);
        const { depotId, userId } = (0, requestHelpers_1.resolveUserAndDepot)(req);
        // Process stock receive
        const result = await (0, inventory_service_1.receiveStock)(depotId, validatedData, userId);
        res.status(200).json({
            success: true,
            message: 'Stock received successfully',
            data: {
                inventory: result.inventory,
                ledgerEntry: result.ledgerEntry
            }
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to receive stock'
        });
    }
};
exports.receiveStockController = receiveStockController;
// Sell stock from depot
const sellStockController = async (req, res) => {
    try {
        // Validate request
        const validatedData = (0, validateRequest_1.validateRequest)(inventory_validator_1.sellStockSchema, req);
        const { userId, depotId } = (0, requestHelpers_1.resolveUserAndDepot)(req);
        // Process stock sale
        const result = await (0, inventory_service_1.sellStock)(depotId, validatedData, userId);
        res.status(200).json({
            success: true,
            message: 'Stock sold successfully',
            data: {
                inventory: result.inventory,
                ledgerEntry: result.ledgerEntry
            }
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to sell stock'
        });
    }
};
exports.sellStockController = sellStockController;
// Transfer stock between depots
const transferStockController = async (req, res) => {
    try {
        // Validate request
        const validatedData = (0, validateRequest_1.validateRequest)(inventory_validator_1.transferStockSchema, req);
        // Get source depot ID
        const fromDepotId = req.user?.depoId;
        const userRole = req.user?.role;
        // Admin can specify source depot
        let sourceDepotId = fromDepotId;
        if (userRole === 'in_charge' && req.body.fromDepotId) {
            sourceDepotId = req.body.fromDepotId;
        }
        if (!sourceDepotId) {
            res.status(400).json({ message: "Source depot ID is required" });
        }
        // Get user ID
        const userId = req.user?.userId;
        if (!userId) {
            res.status(400).json({ message: "User not authenticated" });
        }
        // Process stock transfer
        const result = await (0, inventory_service_1.transferStock)(sourceDepotId, validatedData, userId);
        res.status(200).json({
            success: true,
            message: 'Stock transferred successfully',
            data: {
                fromInventory: result.fromInventory,
                toInventory: result.toInventory,
                transferOutLedger: result.transferOutLedger,
                transferInLedger: result.transferInLedger
            }
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to transfer stock'
        });
    }
};
exports.transferStockController = transferStockController;
// Get depot stock
const getDepotStockController = async (req, res) => {
    try {
        // Get depot ID
        const userDepotId = req.user?.depoId;
        const userRole = req.user?.role;
        const requestedDepotId = req.params.depotId;
        let depotId = userDepotId;
        // Admin can view any depot, in-charge only their depot
        if (userRole === 'admin' && requestedDepotId) {
            depotId = requestedDepotId;
        }
        else if (userRole === 'in_charge' && requestedDepotId && requestedDepotId !== userDepotId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this depot'
            });
        }
        if (!depotId) {
            res.status(404).json({ message: "Depot ID is required" });
        }
        // Get depot stock
        const stock = await (0, inventory_service_1.getDepotStock)(depotId);
        res.status(200).json({
            success: true,
            data: stock
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch depot stock'
        });
    }
};
exports.getDepotStockController = getDepotStockController;
// Get product stock across depots
const getProductStockController = async (req, res) => {
    try {
        const productId = req.params.productId;
        if (!productId) {
            throw new Error('Product ID is required');
        }
        // Check user permissions
        const userRole = req.user?.role;
        // Admin can view any product stock
        // In-charge can view product stock if they have access
        const stock = await (0, inventory_service_1.getProductStock)(productId);
        res.status(200).json({
            success: true,
            data: stock
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch product stock'
        });
    }
};
exports.getProductStockController = getProductStockController;
// Get stock history
const getStockHistoryController = async (req, res) => {
    try {
        // Validate query params
        const validatedFilters = (0, validateRequest_1.validateRequest)(inventory_validator_1.stockHistoryFiltersSchema, req);
        // Get depot ID
        const userDepotId = req.user?.depotId;
        const userRole = req.user?.role;
        const requestedDepotId = req.params.depotId;
        let depotId = userDepotId;
        // Admin can view any depot history, in-charge only their depot
        if (userRole === 'admin' && requestedDepotId) {
            depotId = requestedDepotId;
        }
        else if (userRole === 'in_charge' && requestedDepotId && requestedDepotId !== userDepotId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this depot history'
            });
        }
        if (!depotId) {
            throw new Error('Depot ID is required');
        }
        // Get stock history
        const history = await (0, inventory_service_1.getStockHistory)(depotId, validatedFilters);
        res.status(200).json({
            success: true,
            ...history
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch stock history'
        });
    }
};
exports.getStockHistoryController = getStockHistoryController;
// Get low stock alerts
const getLowStockAlertsController = async (req, res) => {
    try {
        // Get depot ID
        const userDepotId = req.user?.depoId;
        const userRole = req.user?.role;
        const requestedDepotId = req.params.depotId;
        let depotId = userDepotId;
        // Admin can view any depot alerts, in-charge only their depot
        if (userRole === 'admin' && requestedDepotId) {
            depotId = requestedDepotId;
        }
        else if (userRole === 'in_charge' && requestedDepotId && requestedDepotId !== userDepotId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this depot alerts'
            });
        }
        if (!depotId) {
            throw new Error('Depot ID is required');
        }
        const threshold = req.query.threshold ? parseFloat(req.query.threshold) : 100;
        const alerts = await (0, inventory_service_1.getLowStockAlerts)(depotId, threshold);
        res.status(200).json({
            success: true,
            data: alerts
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch low stock alerts'
        });
    }
};
exports.getLowStockAlertsController = getLowStockAlertsController;
// Get stock movement summary
const getStockMovementSummaryController = async (req, res) => {
    try {
        // Get depot ID
        const userDepotId = req.user?.depoId;
        const userRole = req.user?.role;
        const requestedDepotId = req.params.depotId;
        let depotId = userDepotId;
        // Admin can view any depot summary, in-charge only their depot
        if (userRole === 'admin' && requestedDepotId) {
            depotId = requestedDepotId;
        }
        else if (userRole === 'in_charge' && requestedDepotId && requestedDepotId !== userDepotId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this depot summary'
            });
        }
        if (!depotId) {
            throw new Error('Depot ID is required');
        }
        const days = req.query.days ? parseInt(req.query.days) : 7;
        const summary = await (0, inventory_service_1.getStockMovementSummary)(depotId, days);
        res.status(200).json({
            success: true,
            data: summary
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch stock movement summary'
        });
    }
};
exports.getStockMovementSummaryController = getStockMovementSummaryController;
// Initialize depot inventory (Admin only)
// export const initializeDepotInventoryController = async (req: Request, res: Response) => {
//     try {
//         const userRole = (req as any).user?.role;
//         if (userRole !== 'admin') {
//             return res.status(403).json({
//                 success: false,
//                 message: 'Only admin can initialize depot inventory'
//             });
//         }
//
//         const depotId = req.params.depotId;
//         if (!depotId) {
//             throw new Error('Depot ID is required');
//         }
//
//         await initializeDepotInventory(depotId);
//
//         res.status(200).json({
//             success: true,
//             message: 'Depot inventory initialized successfully'
//         });
//     } catch (error: any) {
//         res.status(400).json({
//             success: false,
//             message: error.message || 'Failed to initialize depot inventory'
//         });
//     }
// };
