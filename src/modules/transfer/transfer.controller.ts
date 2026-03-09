import { Request, Response } from 'express';
import { transferService } from './transfer.service';
import {
    createTransferSchema,
    updateTransferSchema,
    approveTransferSchema,
    shipTransferSchema,
    receiveTransferSchema,
    cancelTransferSchema,
    transferFiltersSchema,
    transferIdSchema,
    dateRangeSchema
} from './transfer.validator';

export class TransferController {

    // Create transfer
    async createTransfer(req: Request, res: Response) {
        try {
            const validatedData = createTransferSchema.parse(req.body);

            const userRole = (req as any).user?.role;
            const userDepotId = (req as any).user?.depoId;

            let fromDepotId = userDepotId;

            // Admin can specify source depot
            if (userRole === 'admin' && req.body.fromDepotId) {
                fromDepotId = req.body.fromDepotId;
            }

            if (!fromDepotId) {
                throw new Error('Source depot ID is required');
            }

            const userId = (req as any).user?.userId;
            if (!userId) {
                throw new Error('User not authenticated');
            }

            const transfer = await transferService.createTransfer(
                fromDepotId,
                validatedData,
                userId
            );

            res.status(201).json({
                success: true,
                message: 'Transfer created successfully',
                data: transfer
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to create transfer'
            });
        }
    }

    // Get transfers
    async getTransfers(req: Request, res: Response) {
        try {
            const validatedFilters = transferFiltersSchema.parse(req.query);

            const userRole = (req as any).user?.role;
            const userDepotId = (req as any).user?.depotId;

            // If in-charge, restrict to their depot
            if (userRole === 'in_charge') {
                if (!validatedFilters.fromDepotId && !validatedFilters.toDepotId) {
                    // Show both incoming and outgoing for their depot
                    // This will be handled in service
                }
            }

            const result = await transferService.getTransfers(validatedFilters);

            res.status(200).json({
                success: true,
                ...result
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to fetch transfers'
            });
        }
    }

    // Get transfer by ID
    async getTransferById(req: Request, res: Response) {
        try {
            const { id } = transferIdSchema.parse(req.params);

            const transfer = await transferService.getTransferById(id);

            if (!transfer) {
                return res.status(404).json({
                    success: false,
                    message: 'Transfer not found'
                });
            }

            // Check permission
            const userRole = (req as any).user?.role;
            const userDepotId = (req as any).user?.depoId;

            if (userRole === 'in_charge') {
                if (transfer.fromDepotId._id.toString() !== userDepotId &&
                    transfer.toDepotId._id.toString() !== userDepotId) {
                    return res.status(403).json({
                        success: false,
                        message: 'Access denied to this transfer'
                    });
                }
            }

            res.status(200).json({
                success: true,
                data: transfer
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to fetch transfer'
            });
        }
    }

    // Approve transfer
    async approveTransfer(req: Request, res: Response) {
        try {
            const { id } = transferIdSchema.parse(req.params);
            const validatedData = approveTransferSchema.parse(req.body);

            const userId = (req as any).user?.userId;
            if (!userId) {
                res.status(403).json({message:"User not authenticated"});
            }

            // Check permission - only source depot can approve
            const transfer = await transferService.getTransferById(id);
            const userDepotId = (req as any).user?.depotId;
            const userRole = (req as any).user?.role;

            if (userRole === 'in_charge' && transfer.fromDepotId._id.toString() !== userDepotId) {
                return res.status(403).json({
                    success: false,
                    message: 'Only source depot can approve transfers'
                });
            }

            const updated = await transferService.approveTransfer(id, validatedData, userId);

            res.status(200).json({
                success: true,
                message: 'Transfer approved successfully',
                data: updated
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to approve transfer'
            });
        }
    }

    // Ship transfer
    async shipTransfer(req: Request, res: Response) {
        try {
            const { id } = transferIdSchema.parse(req.params);
            const validatedData = shipTransferSchema.parse(req.body);

            const userId = (req as any).user?.userId;
            if (!userId) {
                res.status(403).json({message:"User not authenticated"});
            }

            // Check permission - only source depot can ship
            const transfer = await transferService.getTransferById(id);
            const userDepotId = (req as any).user?.depotId;
            const userRole = (req as any).user?.role;

            if (userRole === 'in_charge' && transfer.fromDepotId._id.toString() !== userDepotId) {
                return res.status(403).json({
                    success: false,
                    message: 'Only source depot can ship transfers'
                });
            }

            const updated = await transferService.shipTransfer(id, validatedData, userId);

            res.status(200).json({
                success: true,
                message: 'Transfer shipped successfully',
                data: updated
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to ship transfer'
            });
        }
    }

    // Receive transfer
    async receiveTransfer(req: Request, res: Response) {
        try {
            const { id } = transferIdSchema.parse(req.params);
            const validatedData = receiveTransferSchema.parse(req.body);

            const userId = (req as any).user?.userId;
            if (!userId) {
                throw new Error('User not authenticated');
            }

            // Check permission - only destination depot can receive
            const transfer = await transferService.getTransferById(id);
            const userDepotId = (req as any).user?.depotId;
            const userRole = (req as any).user?.role;

            if (userRole === 'in_charge' && transfer.toDepotId._id.toString() !== userDepotId) {
                return res.status(403).json({
                    success: false,
                    message: 'Only destination depot can receive transfers'
                });
            }

            const updated = await transferService.receiveTransfer(id, validatedData, userId);

            res.status(200).json({
                success: true,
                message: 'Transfer received successfully',
                data: updated
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to receive transfer'
            });
        }
    }

    // Cancel transfer
    async cancelTransfer(req: Request, res: Response) {
        try {
            const { id } = transferIdSchema.parse(req.params);
            const validatedData = cancelTransferSchema.parse(req.body);

            const userId = (req as any).user?.userId;
            if (!userId) {
                throw new Error('User not authenticated');
            }

            // Check permission - only source depot or admin can cancel
            const transfer = await transferService.getTransferById(id);
            const userDepotId = (req as any).user?.depotId;
            const userRole = (req as any).user?.role;

            if (userRole === 'in_charge' && transfer.fromDepotId._id.toString() !== userDepotId) {
                return res.status(403).json({
                    success: false,
                    message: 'Only source depot can cancel transfers'
                });
            }

            const updated = await transferService.cancelTransfer(id, validatedData, userId);

            res.status(200).json({
                success: true,
                message: 'Transfer cancelled successfully',
                data: updated
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to cancel transfer'
            });
        }
    }

    // Update transfer
    async updateTransfer(req: Request, res: Response) {
        try {
            const { id } = transferIdSchema.parse(req.params);
            const validatedData = updateTransferSchema.parse(req.body);

            const userId = (req as any).user?.userId;
            if (!userId) {
                throw new Error('User not authenticated');
            }

            // Check permission - only source depot can update
            const transfer = await transferService.getTransferById(id);
            const userDepotId = (req as any).user?.depotId;
            const userRole = (req as any).user?.role;

            if (userRole === 'in_charge' && transfer.fromDepotId._id.toString() !== userDepotId) {
                return res.status(403).json({
                    success: false,
                    message: 'Only source depot can update transfers'
                });
            }

            const updated = await transferService.updateTransfer(id, validatedData, userId);

            res.status(200).json({
                success: true,
                message: 'Transfer updated successfully',
                data: updated
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to update transfer'
            });
        }
    }

    // Get transfer summary
    async getTransferSummary(req: Request, res: Response) {
        try {
            const userRole = (req as any).user?.role;
            const userDepotId = (req as any).user?.depotId;
            const { startDate, endDate } = req.query;

            const filters: any = {};

            if (userRole === 'in_charge') {
                filters.fromDepotId = userDepotId;
            } else if (userRole === 'admin' && req.query.depotId) {
                filters.fromDepotId = req.query.depotId as string;
            }

            if (startDate) filters.startDate = startDate as string;
            if (endDate) filters.endDate = endDate as string;

            const summary = await transferService.getTransferSummary(filters);

            res.status(200).json({
                success: true,
                data: summary
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to get transfer summary'
            });
        }
    }

    // Get pending approvals
    async getPendingApprovals(req: Request, res: Response) {
        try {
            const userRole = (req as any).user?.role;
            const userDepotId = (req as any).user?.depotId;

            if (!userDepotId && userRole === 'in_charge') {
                throw new Error('Depot ID not found');
            }

            const depotId = userRole === 'admin' && req.params.depotId
                ? req.params.depotId
                : userDepotId;

            const transfers = await transferService.getPendingApprovals(depotId);

            res.status(200).json({
                success: true,
                data: transfers
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to get pending approvals'
            });
        }
    }

    // Get incoming transfers
    async getIncomingTransfers(req: Request, res: Response) {
        try {
            const userRole = (req as any).user?.role;
            const userDepotId = (req as any).user?.depotId;
            const { status } = req.query;

            if (!userDepotId && userRole === 'in_charge') {
                throw new Error('Depot ID not found');
            }

            const depotId = userRole === 'admin' && req.params.depotId
                ? req.params.depotId
                : userDepotId;

            const transfers = await transferService.getIncomingTransfers(
                depotId,
                status as any
            );

            res.status(200).json({
                success: true,
                data: transfers
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to get incoming transfers'
            });
        }
    }

    // Get outgoing transfers
    async getOutgoingTransfers(req: Request, res: Response) {
        try {
            const userRole = (req as any).user?.role;
            const userDepotId = (req as any).user?.depotId;
            const { status } = req.query;

            if (!userDepotId && userRole === 'in_charge') {
                throw new Error('Depot ID not found');
            }

            const depotId = userRole === 'admin' && req.params.depotId
                ? req.params.depotId
                : userDepotId;

            const transfers = await transferService.getOutgoingTransfers(
                depotId,
                status as any
            );

            res.status(200).json({
                success: true,
                data: transfers
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to get outgoing transfers'
            });
        }
    }

    // Get transfer statistics
    // async getTransferStatistics(req: Request, res: Response) {
    //     try {
    //         const { startDate, endDate } = dateRangeSchema.parse(req.query);
    //
    //         const userRole = (req as any).user?.role;
    //         const userDepotId = (req as any).user?.depotId;
    //
    //         let depotId: string | string[];
    //
    //         if (userRole === 'in_charge') {
    //             depotId = userDepotId;
    //         } else if (userRole === 'admin' && req.params.depotId) {
    //             depotId = req.params.depotId;
    //         }
    //
    //         const statistics = await transferService.getTransferStatistics(
    //             depotId,
    //             startDate,
    //             endDate
    //         );
    //
    //         res.status(200).json({
    //             success: true,
    //             data: statistics
    //         });
    //     } catch (error: any) {
    //         res.status(400).json({
    //             success: false,
    //             message: error.message || 'Failed to get transfer statistics'
    //         });
    //     }
    // }
}

export const transferController = new TransferController();