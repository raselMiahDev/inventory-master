import { Request, Response } from 'express';
import {
    receiveStock,
    sellStock,
    transferStock,
    getStockHistory,
    getStockMovementSummary, getDepotStock, getProductStock, getLowStockAlerts,
} from './inventory.service';
import {
    receiveStockSchema,
    sellStockSchema,
    transferStockSchema,
    stockHistoryFiltersSchema
} from './inventory.validator';
import {resolveUserAndDepot} from "../../utils/requestHelpers";
import { ZodSchema } from 'zod';


export const validateRequest = <T>(
    schema: ZodSchema<T>,
    req: Request
): T => {
    return schema.parse(req.body);
};

// Receive stock into depot
export const receiveStockController = async (req: Request, res: Response) => {
    try {
        // Validate request
        const validatedData =validateRequest(receiveStockSchema,req)
        const {depotId,userId} = resolveUserAndDepot(req as any)
        // Process stock receive
        const result = await receiveStock(depotId, validatedData, userId);

        res.status(200).json({
            success: true,
            message: 'Stock received successfully',
            data: {
                inventory: result.inventory,
                ledgerEntry: result.ledgerEntry
            }
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to receive stock'
        });
    }
};

// Sell stock from depot
export const sellStockController = async (req: Request, res: Response) => {
    try {
        // Validate request
        const validatedData = validateRequest(sellStockSchema,req);
        const {userId,depotId} = resolveUserAndDepot(req as any);

        // Process stock sale
        const result = await sellStock(depotId, validatedData, userId);

        res.status(200).json({
            success: true,
            message: 'Stock sold successfully',
            data: {
                inventory: result.inventory,
                ledgerEntry: result.ledgerEntry
            }
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to sell stock'
        });
    }
};

// Transfer stock between depots
export const transferStockController = async (req: Request, res: Response) => {
    try {
        // Validate request
        const validatedData =validateRequest(transferStockSchema,req)

        // Get source depot ID
        const fromDepotId = (req as any).user?.depoId;
        const userRole = (req as any).user?.role;

        // Admin can specify source depot
        let sourceDepotId = fromDepotId;
        if (userRole === 'in_charge' && req.body.fromDepotId) {
            sourceDepotId = req.body.fromDepotId;
        }

        if (!sourceDepotId) {
            res.status(400).json({message:"Source depot ID is required"});
        }

        // Get user ID
        const userId = (req as any).user?.userId;
        if (!userId) {
            res.status(400).json({message:"User not authenticated"});
        }

        // Process stock transfer
        const result = await transferStock(sourceDepotId, validatedData, userId);

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
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to transfer stock'
        });
    }
};

// Get depot stock
export const getDepotStockController = async (req: Request, res: Response) => {
    try {
        // Get depot ID
        const userDepotId = (req as any).user?.depoId;
        const userRole = (req as any).user?.role;
        const requestedDepotId = req.params.depotId;

        let depotId = userDepotId;

        // Admin can view any depot, in-charge only their depot
        if (userRole === 'admin' && requestedDepotId) {
            depotId = requestedDepotId;
        } else if (userRole === 'in_charge' && requestedDepotId && requestedDepotId !== userDepotId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this depot'
            });
        }

        if (!depotId) {
            res.status(404).json({message:"Depot ID is required"})
        }

        // Get depot stock
        const stock = await getDepotStock(depotId);

        res.status(200).json({
            success: true,
            data: stock
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch depot stock'
        });
    }
};

// Get product stock across depots
export const getProductStockController = async (req: Request, res: Response) => {
    try {
        const productId = req.params.productId;

        if (!productId) {
            throw new Error('Product ID is required');
        }

        // Check user permissions
        const userRole = (req as any).user?.role;

        // Admin can view any product stock
        // In-charge can view product stock if they have access
        const stock = await getProductStock(productId);

        res.status(200).json({
            success: true,
            data: stock
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch product stock'
        });
    }
};

// Get stock history
export const getStockHistoryController = async (req: Request, res: Response) => {
    try {
        // Validate query params
        const validatedFilters =validateRequest(stockHistoryFiltersSchema,req);
        // Get depot ID
        const userDepotId = (req as any).user?.depotId;
        const userRole = (req as any).user?.role;
        const requestedDepotId = req.params.depotId;

        let depotId = userDepotId;

        // Admin can view any depot history, in-charge only their depot
        if (userRole === 'admin' && requestedDepotId) {
            depotId = requestedDepotId;
        } else if (userRole === 'in_charge' && requestedDepotId && requestedDepotId !== userDepotId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this depot history'
            });
        }

        if (!depotId) {
            throw new Error('Depot ID is required');
        }

        // Get stock history
        const history = await getStockHistory(depotId, validatedFilters);

        res.status(200).json({
            success: true,
            ...history
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch stock history'
        });
    }
};

// Get low stock alerts
export const getLowStockAlertsController = async (req: Request, res: Response) => {
    try {
        // Get depot ID
        const userDepotId = (req as any).user?.depoId;
        const userRole = (req as any).user?.role;
        const requestedDepotId = req.params.depotId;

        let depotId = userDepotId;

        // Admin can view any depot alerts, in-charge only their depot
        if (userRole === 'admin' && requestedDepotId) {
            depotId = requestedDepotId;
        } else if (userRole === 'in_charge' && requestedDepotId && requestedDepotId !== userDepotId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this depot alerts'
            });
        }

        if (!depotId) {
            throw new Error('Depot ID is required');
        }

        const threshold = req.query.threshold ? parseFloat(req.query.threshold as string) : 100;
        const alerts = await getLowStockAlerts(depotId, threshold);

        res.status(200).json({
            success: true,
            data: alerts
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch low stock alerts'
        });
    }
};

// Get stock movement summary
export const getStockMovementSummaryController = async (req: Request, res: Response) => {
    try {
        // Get depot ID
        const userDepotId = (req as any).user?.depoId;
        const userRole = (req as any).user?.role;
        const requestedDepotId = req.params.depotId;

        let depotId = userDepotId;

        // Admin can view any depot summary, in-charge only their depot
        if (userRole === 'admin' && requestedDepotId) {
            depotId = requestedDepotId;
        } else if (userRole === 'in_charge' && requestedDepotId && requestedDepotId !== userDepotId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this depot summary'
            });
        }

        if (!depotId) {
            throw new Error('Depot ID is required');
        }

        const days = req.query.days ? parseInt(req.query.days as string) : 7;
        const summary = await getStockMovementSummary(depotId, days);

        res.status(200).json({
            success: true,
            data: summary
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch stock movement summary'
        });
    }
};

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