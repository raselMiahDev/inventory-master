"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveDepotsController = exports.getDepotStatsController = exports.deleteDepotController = exports.updateDepotController = exports.getDepotByIdController = exports.getAllDepotsController = exports.createDepotController = void 0;
const depo_service_1 = require("./depo.service");
const depo_validation_1 = require("./depo.validation");
const createDepotController = async (req, res) => {
    try {
        // Validate request
        const validatedData = depo_validation_1.createDepotSchema.parse(req.body);
        // Get user ID from auth middleware
        const userId = req.user?.userId;
        if (!userId) {
            throw new Error('User not authenticated');
        }
        // Create depot
        const depot = await (0, depo_service_1.createDepot)(validatedData, userId);
        res.status(201).json({
            success: true,
            message: 'Depot created successfully',
            data: depot
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to create depot'
        });
    }
};
exports.createDepotController = createDepotController;
const getAllDepotsController = async (req, res) => {
    try {
        const { isActive, search } = req.query;
        const filters = {};
        if (isActive !== undefined) {
            filters.isActive = isActive === 'true';
        }
        if (search) {
            filters.search = search;
        }
        // Check user role
        const userRole = req.user?.role;
        const userDepotId = req.user?.depotId;
        // If user is in_charge, they can only see their depot
        if (userRole === 'in_charge' && userDepotId) {
            const depot = await (0, depo_service_1.getDepotById)(userDepotId);
            if (depot) {
                return res.status(200).json({
                    success: true,
                    data: [depot]
                });
            }
        }
        // Admin can see all depots
        const depots = await (0, depo_service_1.getAllDepots)(filters);
        res.status(200).json({
            success: true,
            data: depots
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch depots'
        });
    }
};
exports.getAllDepotsController = getAllDepotsController;
const getDepotByIdController = async (req, res) => {
    try {
        // Validate depot ID
        const { id } = depo_validation_1.depotIdSchema.parse(req.params);
        // Check user role and permissions
        const userRole = req.user?.role;
        const userDepotId = req.user?.depotId;
        // If user is in_charge, they can only access their depot
        if (userRole === 'in_charge' && userDepotId !== id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this depot'
            });
        }
        const depot = await (0, depo_service_1.getDepotById)(id);
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
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch depot'
        });
    }
};
exports.getDepotByIdController = getDepotByIdController;
const updateDepotController = async (req, res) => {
    try {
        // Validate depot ID and update data
        const { id } = depo_validation_1.depotIdSchema.parse(req.params);
        const validatedData = depo_validation_1.updateDepotSchema.parse(req.body);
        // Check user role (only admin can update depots)
        const userRole = req.user?.role;
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admin can update depots'
            });
        }
        // Get user ID for audit
        const userId = req.user?.userId;
        const updatedDepot = await (0, depo_service_1.updateDepot)(id, validatedData, userId);
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
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to update depot'
        });
    }
};
exports.updateDepotController = updateDepotController;
const deleteDepotController = async (req, res) => {
    try {
        // Validate depot ID
        const { id } = depo_validation_1.depotIdSchema.parse(req.params);
        // Check user role (only admin can delete depots)
        const userRole = req.user?.role;
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admin can delete depots'
            });
        }
        const result = await (0, depo_service_1.deleteDepot)(id);
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
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to delete depot'
        });
    }
};
exports.deleteDepotController = deleteDepotController;
const getDepotStatsController = async (req, res) => {
    try {
        // Validate depot ID
        const { id } = depo_validation_1.depotIdSchema.parse(req.params);
        // Check user role and permissions
        const userRole = req.user?.role;
        const userDepotId = req.user?.depotId;
        // If user is in_charge, they can only access their depot stats
        if (userRole === 'in_charge' && userDepotId !== id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this depot stats'
            });
        }
        const stats = await (0, depo_service_1.getDepotStats)(id);
        res.status(200).json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch depot stats'
        });
    }
};
exports.getDepotStatsController = getDepotStatsController;
const getActiveDepotsController = async (req, res) => {
    try {
        const depots = await (0, depo_service_1.getActiveDepots)();
        res.status(200).json({
            success: true,
            data: depots
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch active depots'
        });
    }
};
exports.getActiveDepotsController = getActiveDepotsController;
