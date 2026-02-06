import { Request, Response } from 'express';
import {
    createDepot,
    getAllDepots,
    getDepotById,
    updateDepot,
    deleteDepot,
    getDepotStats,
    getActiveDepots
} from './depo.service';
import {
    createDepotSchema,
    updateDepotSchema,
    depotIdSchema
} from './depo.validation';

export const createDepotController = async (req: Request, res: Response) => {
    try {
        // Validate request
        const validatedData = createDepotSchema.parse(req.body);

        // Get user ID from auth middleware
        const userId = (req as any).user?.userId;

        if (!userId) {
            throw new Error('User not authenticated');
        }

        // Create depot
        const depot = await createDepot(validatedData, userId);

        res.status(201).json({
            success: true,
            message: 'Depot created successfully',
            data: depot
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to create depot'
        });
    }
};

export const getAllDepotsController = async (req: Request, res: Response) => {
    try {
        const {
            isActive,
            search
        } = req.query;

        const filters: any = {};

        if (isActive !== undefined) {
            filters.isActive = isActive === 'true';
        }

        if (search) {
            filters.search = search as string;
        }

        // Check user role
        const userRole = (req as any).user?.role;
        const userDepotId = (req as any).user?.depotId;

        // If user is in_charge, they can only see their depot
        if (userRole === 'in_charge' && userDepotId) {
            const depot = await getDepotById(userDepotId);
            if (depot) {
                return res.status(200).json({
                    success: true,
                    data: [depot]
                });
            }
        }

        // Admin can see all depots
        const depots = await getAllDepots(filters);

        res.status(200).json({
            success: true,
            data: depots
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch depots'
        });
    }
};

export const getDepotByIdController = async (req: Request, res: Response) => {
    try {
        // Validate depot ID
        const { id } = depotIdSchema.parse(req.params);

        // Check user role and permissions
        const userRole = (req as any).user?.role;
        const userDepotId = (req as any).user?.depotId;

        // If user is in_charge, they can only access their depot
        if (userRole === 'in_charge' && userDepotId !== id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this depot'
            });
        }

        const depot = await getDepotById(id);

        if (!depot) {
            return res.status(404).json({
                success: false,
                message: 'Depot not found'
            });
        }

        res.status(200).json({
            success: true,
            data: depot
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch depot'
        });
    }
};

export const updateDepotController = async (req: Request, res: Response) => {
    try {
        // Validate depot ID and update data
        const { id } = depotIdSchema.parse(req.params);
        const validatedData = updateDepotSchema.parse(req.body);

        // Check user role (only admin can update depots)
        const userRole = (req as any).user?.role;
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admin can update depots'
            });
        }

        // Get user ID for audit
        const userId = (req as any).user?.userId;

        const updatedDepot = await updateDepot(id, validatedData, userId);

        if (!updatedDepot) {
            return res.status(404).json({
                success: false,
                message: 'Depot not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Depot updated successfully',
            data: updatedDepot
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to update depot'
        });
    }
};

export const deleteDepotController = async (req: Request, res: Response) => {
    try {
        // Validate depot ID
        const { id } = depotIdSchema.parse(req.params);

        // Check user role (only admin can delete depots)
        const userRole = (req as any).user?.role;
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admin can delete depots'
            });
        }

        const result = await deleteDepot(id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Depot not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Depot deactivated successfully'
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to delete depot'
        });
    }
};

export const getDepotStatsController = async (req: Request, res: Response) => {
    try {
        // Validate depot ID
        const { id } = depotIdSchema.parse(req.params);

        // Check user role and permissions
        const userRole = (req as any).user?.role;
        const userDepotId = (req as any).user?.depotId;

        // If user is in_charge, they can only access their depot stats
        if (userRole === 'in_charge' && userDepotId !== id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this depot stats'
            });
        }

        const stats = await getDepotStats(id);

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch depot stats'
        });
    }
};

export const getActiveDepotsController = async (req: Request, res: Response) => {
    try {
        const depots = await getActiveDepots();

        res.status(200).json({
            success: true,
            data: depots
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch active depots'
        });
    }
};