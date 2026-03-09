import { Request, Response } from 'express';
import {
    createSale,
    getSaleById,
    getSales,
    getDailySales,
    getTodaySales,
    markBankDeposit,
    getSalesSummary,
    cancelSale,
    getCustomerHistory
} from './sale.service';
import {
    createSaleSchema,
    bankDepositSchema,
    saleFiltersSchema,
    saleIdSchema,
    dailySalesIdSchema,
    dateRangeSchema
} from './sale.validator';
import {validateRequest} from "../../utils/validateRequest";
import {resolveUserAndDepot} from "../../utils/requestHelpers";
import {UserRole} from "../../enum";

// Create new sale
export const createSaleController = async (req: Request, res: Response) => {
    try {
        // Validate request
        const validatedData = validateRequest(createSaleSchema,req);

        const {depotId,userId} = resolveUserAndDepot(req as any)

        // Create sale
        const sale = await createSale(depotId, validatedData, userId);

        res.status(201).json({
            success: true,
            message: 'Sale completed successfully',
            data: sale
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to create sale'
        });
    }
};

// Get all sales
export const getSalesController = async (req: Request, res: Response) => {
    try {
        const validatedFilters = saleFiltersSchema.parse(req.query);

        const userRole = (req as any).user?.role;
        const userDepotId = (req as any).user?.depoId;

        // If in-charge, restrict to their depot
        if (userRole === 'in_charge' && !validatedFilters.depotId) {
            validatedFilters.depotId = userDepotId;
        }

        const result = await getSales(validatedFilters);

        res.status(200).json({
            success: true,
            ...result
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch sales'
        });
    }
};

// Get sale by ID
export const getSaleByIdController = async (req: Request, res: Response) => {
    try {
        const { id } = saleIdSchema.parse(req.params);

        const sale = await getSaleById(id);

        if (!sale) {
            return res.status(404).json({
                success: false,
                message: 'Sale not found'
            });
        }

        // Check permission
        const userRole = (req as any).user?.role;
        const userDepotId = (req as any).user?.depoId;

        if (userRole === 'in_charge' && sale.depotId._id.toString() !== userDepotId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this sale'
            });
        }

        res.status(200).json({
            success: true,
            data: sale
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch sale'
        });
    }
};

// Get daily sales
export const getDailySalesController = async (req: Request, res: Response) => {
    try {
        const userRole = (req as any).user?.role;
        const userDepotId = (req as any).user?.depoId;
        const { startDate, endDate } = req.query;

        let depotId = userDepotId;

        // Admin can specify depot
        if (userRole === 'admin' && req.params.depotId) {
            depotId = req.params.depotId;
        }

        if (!depotId) {
            throw new Error('Depot ID is required');
        }

        const dailySales = await getDailySales(
            depotId,
            startDate as string,
            endDate as string
        );

        res.status(200).json({
            success: true,
            data: dailySales
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch daily sales'
        });
    }
};

// Get today's sales
export const getTodaySalesController = async (req: Request, res: Response) => {
    try {
        const userRole = (req as any).user?.role;
        const userDepotId = (req as any).user?.depoId;

        let depotId = userDepotId;

        // Admin can specify depot
        if (userRole === 'admin' && req.params.depotId) {
            depotId = req.params.depotId;
        }

        if (!depotId) {
            throw new Error('Depot ID is required');
        }

        const todaySales = await getTodaySales(depotId);

        res.status(200).json({
            success: true,
            data: todaySales
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch today\'s sales'
        });
    }
};
// Mark bank deposit
export const markBankDepositController = async (req: Request, res: Response) => {
    try {
        const { id } = dailySalesIdSchema.parse(req.params);
        const validatedData = bankDepositSchema.parse(req.body);

        const userId = (req as any).user?.userId;
        if (!userId) {
            throw new Error('User not authenticated');
        }

        // Check permission
        const userRole = (req as any).user?.role;
        const userDepotId = (req as any).user?.depotId;

        // In-charge can only mark deposit for their depot
        if (userRole === 'in_charge') {
            // You might want to check if the daily sales belongs to their depot
        }

        const updated = await markBankDeposit(id, validatedData, userId);

        res.status(200).json({
            success: true,
            message: 'Bank deposit marked successfully',
            data: updated
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to mark bank deposit'
        });
    }
};


// Get sales summary
export const getSummaryController = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = dateRangeSchema.parse(req.query);

        const userRole = (req as any).user?.role;
        const userDepotId = (req as any).user?.depoId;

        let depotId = userDepotId;

        // Admin can specify depot
        if (userRole === 'admin' && req.params.depotId) {
            depotId = req.params.depotId;
        }

        if (!depotId) {
            throw new Error('Depot ID is required');
        }

        const summary = await getSalesSummary(depotId, startDate, endDate);

        res.status(200).json({
            success: true,
            data: summary
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to generate sales summary'
        });
    }
};

// Cancel sale
export const cancelSaleController = async (req: Request, res: Response) => {
    try {
        const { id } = saleIdSchema.parse(req.params);
        const { reason } = req.body;

        if (!reason) {
            throw new Error('Cancellation reason is required');
        }

        const userId = (req as any).user?.userId;
        if (!userId) {
            throw new Error('User not authenticated');
        }

        // Check permission - only admin can cancel sales
        const userRole = (req as any).user?.role;
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admin can cancel sales'
            });
        }

        const cancelledSale = await cancelSale(id, userId, reason);

        res.status(200).json({
            success: true,
            message: 'Sale cancelled successfully',
            data: cancelledSale
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to cancel sale'
        });
    }
};

// Get customer history
export const getCustomerHistoryController = async (req: Request, res: Response) => {
    try {
        const { phone } = req.params;
        const { limit } = req.query;

        if (!phone) {
            throw new Error('Customer phone number is required');
        }

        const history = await getCustomerHistory(phone,
            limit ? parseInt(limit as string) : 10
        );

        res.status(200).json({
            success: true,
            data: history
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch customer history'
        });
    }
};