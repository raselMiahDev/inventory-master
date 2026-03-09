"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferService = exports.TransferService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const transfer_model_1 = require("./transfer.model");
const product_model_1 = require("../product/product.model");
const depo_model_1 = require("../depo/depo.model");
const inventory_service_1 = require("../inventory/inventory.service");
const transfer_types_1 = require("./transfer.types");
class TransferService {
    // Create new transfer request
    async createTransfer(fromDepotId, data, userId) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            // Validate destination depot exists and is active
            const toDepot = await depo_model_1.DepotModel.findOne({
                _id: data.toDepotId,
                isActive: true
            }).session(session);
            if (!toDepot) {
                throw new Error('Destination depot not found or inactive');
            }
            // Validate source and destination are different
            if (fromDepotId === data.toDepotId) {
                throw new Error('Source and destination depots must be different');
            }
            // Process items
            const transferItems = [];
            for (const item of data.items) {
                // Get product details
                const product = await product_model_1.ProductModel.findOne({
                    _id: item.productId,
                    isActive: true
                }).session(session);
                if (!product) {
                    throw new Error(`Product not found or inactive: ${item.productId}`);
                }
                // Validate quantity against available stock? (Optional - can be checked at approval)
                transferItems.push({
                    productId: product._id,
                    productName: product.name,
                    productCode: product.code,
                    packSize: product.packSize,
                    requestedQuantity: item.requestedQuantity,
                    unitPrice: product.unitPrice,
                    totalValue: product.unitPrice * product.packSize * item.requestedQuantity,
                    batchNumber: item.batchNumber,
                    expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
                    remarks: item.remarks
                });
            }
            // Create transfer
            const transfer = await transfer_model_1.TransferModel.create([{
                    transferType: data.transferType || transfer_types_1.TransferType.INTER_DEPOT,
                    fromDepotId,
                    toDepotId: data.toDepotId,
                    items: transferItems,
                    status: transfer_types_1.TransferStatus.PENDING,
                    priority: data.priority || transfer_types_1.TransferPriority.NORMAL,
                    requestedDate: new Date(),
                    expectedDeliveryDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : undefined,
                    remarks: data.remarks,
                    requestedBy: userId,
                    createdBy: userId
                }], { session });
            await session.commitTransaction();
            return await this.getTransferById(transfer[0]._id.toString());
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            await session.endSession();
        }
    }
    // Get transfer by ID with populated fields
    async getTransferById(transferId) {
        const transfer = await transfer_model_1.TransferModel.findById(transferId)
            .populate('fromDepotId', 'name code address')
            .populate('toDepotId', 'name code address')
            .populate('requestedBy', 'username')
            .populate('approvedBy', 'username')
            .populate('shippedBy', 'username')
            .populate('receivedBy', 'username')
            .populate('cancelledBy', 'username')
            .populate('items.productId', 'name code packSize unitPrice')
            .populate('createdBy', 'username')
            .populate('updatedBy', 'username')
            .lean();
        return transfer;
    }
    // Get transfers with filters
    async getTransfers(filters) {
        const { status, fromDepotId, toDepotId, transferType, priority, startDate, endDate, search, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = filters;
        const query = {};
        if (status)
            query.status = status;
        if (fromDepotId)
            query.fromDepotId = fromDepotId;
        if (toDepotId)
            query.toDepotId = toDepotId;
        if (transferType)
            query.transferType = transferType;
        if (priority)
            query.priority = priority;
        // Date range filter
        if (startDate || endDate) {
            query.requestedDate = {};
            if (startDate)
                query.requestedDate.$gte = new Date(startDate);
            if (endDate)
                query.requestedDate.$lte = new Date(endDate);
        }
        // Search filter
        if (search) {
            query.$text = { $search: search };
        }
        const skip = (page - 1) * limit;
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        const [data, total] = await Promise.all([
            transfer_model_1.TransferModel.find(query)
                .populate('fromDepotId', 'name code')
                .populate('toDepotId', 'name code')
                .populate('requestedBy', 'username')
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .lean(),
            transfer_model_1.TransferModel.countDocuments(query)
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }
    // Approve transfer
    async approveTransfer(transferId, data, userId) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const transfer = await transfer_model_1.TransferModel.findById(transferId).session(session);
            if (!transfer) {
                throw new Error('Transfer not found');
            }
            if (transfer.status !== transfer_types_1.TransferStatus.PENDING) {
                throw new Error(`Transfer cannot be approved in ${transfer.status} status`);
            }
            // Update items with approved quantities
            for (const item of transfer.items) {
                const approvedItem = data.approvedItems.find(ai => ai.productId.toString() === item.productId.toString());
                if (approvedItem) {
                    if (approvedItem.approvedQuantity > item.requestedQuantity) {
                        throw new Error(`Approved quantity cannot exceed requested quantity for ${item.productName}`);
                    }
                    item.approvedQuantity = approvedItem.approvedQuantity;
                    item.totalValue = item.unitPrice * approvedItem.approvedQuantity;
                }
                else {
                    // If not approved, set to 0
                    item.approvedQuantity = 0;
                    item.totalValue = 0;
                }
            }
            // Filter out items with zero approved quantity
            transfer.items = transfer.items.filter(item => (item.approvedQuantity || 0) > 0);
            if (transfer.items.length === 0) {
                throw new Error('No items approved for transfer');
            }
            transfer.status = transfer_types_1.TransferStatus.IN_TRANSIT;
            transfer.approvedDate = new Date();
            transfer.approvedBy = userId;
            transfer.updatedBy = userId;
            await transfer.save({ session });
            await session.commitTransaction();
            return await this.getTransferById(transferId);
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    // Ship transfer
    async shipTransfer(transferId, data, userId) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const transfer = await transfer_model_1.TransferModel.findById(transferId).session(session);
            if (!transfer) {
                throw new Error('Transfer not found');
            }
            if (transfer.status !== transfer_types_1.TransferStatus.IN_TRANSIT && transfer.status !== transfer_types_1.TransferStatus.PENDING) {
                throw new Error(`Transfer cannot be shipped in ${transfer.status} status`);
            }
            // Check if all approved items are being shipped
            for (const item of transfer.items) {
                const shippedItem = data.shippedItems.find(si => si.productId.toString() === item.productId.toString());
                if (!shippedItem && (item.approvedQuantity || item.requestedQuantity) > 0) {
                    throw new Error(`Missing shipping quantity for ${item.productName}`);
                }
                if (shippedItem) {
                    const maxQuantity = item.approvedQuantity || item.requestedQuantity;
                    if (shippedItem.shippedQuantity > maxQuantity) {
                        throw new Error(`Shipped quantity cannot exceed approved quantity for ${item.productName}`);
                    }
                    item.shippedQuantity = shippedItem.shippedQuantity;
                }
            }
            // Update transfer details
            transfer.status = transfer_types_1.TransferStatus.IN_TRANSIT;
            transfer.shippedDate = new Date();
            transfer.shippedBy = userId;
            if (data.trackingNumber)
                transfer.trackingNumber = data.trackingNumber;
            if (data.courierName)
                transfer.courierName = data.courierName;
            if (data.vehicleNumber)
                transfer.vehicleNumber = data.vehicleNumber;
            if (data.driverName)
                transfer.driverName = data.driverName;
            if (data.driverPhone)
                transfer.driverPhone = data.driverPhone;
            transfer.updatedBy = userId;
            if (data.remarks)
                transfer.remarks = data.remarks;
            await transfer.save({ session });
            // Update inventory for source depot (deduct stock)
            for (const item of transfer.items) {
                if (item.shippedQuantity && item.shippedQuantity > 0) {
                    await (0, inventory_service_1.transferStock)(transfer.fromDepotId.toString(), {
                        toDepotId: transfer.toDepotId.toString(),
                        productId: item.productId.toString(),
                        quantity: item.shippedQuantity,
                        remarks: `Transfer #${transfer.transferId}`
                    }, userId);
                }
            }
            await session.commitTransaction();
            return await this.getTransferById(transferId);
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    // Receive transfer
    async receiveTransfer(transferId, data, userId) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const transfer = await transfer_model_1.TransferModel.findById(transferId).session(session);
            if (!transfer) {
                throw new Error('Transfer not found');
            }
            if (transfer.status !== transfer_types_1.TransferStatus.IN_TRANSIT) {
                throw new Error(`Transfer cannot be received in ${transfer.status} status`);
            }
            // Update received quantities
            let allReceived = true;
            for (const item of transfer.items) {
                const receivedItem = data.receivedItems.find(ri => ri.productId.toString() === item.productId.toString());
                if (receivedItem) {
                    if (receivedItem.receivedQuantity > (item.shippedQuantity || 0)) {
                        throw new Error(`Received quantity cannot exceed shipped quantity for ${item.productName}`);
                    }
                    item.receivedQuantity = receivedItem.receivedQuantity;
                    if (receivedItem.batchNumber)
                        item.batchNumber = receivedItem.batchNumber;
                    if (receivedItem.expiryDate)
                        item.expiryDate = new Date(receivedItem.expiryDate);
                    if (receivedItem.receivedQuantity < (item.shippedQuantity || 0)) {
                        allReceived = false;
                    }
                }
                else if ((item.shippedQuantity || 0) > 0) {
                    throw new Error(`Missing received quantity for ${item.productName}`);
                }
            }
            // Update transfer status
            transfer.status = allReceived ? transfer_types_1.TransferStatus.COMPLETED : transfer_types_1.TransferStatus.PARTIALLY_COMPLETED;
            transfer.receivedDate = new Date();
            transfer.receivedBy = userId;
            transfer.actualDeliveryDate = new Date();
            transfer.updatedBy = userId;
            if (data.remarks)
                transfer.remarks = data.remarks;
            await transfer.save({ session });
            // Note: Inventory for destination depot is handled by the ledger system
            // through the transfer_in transaction
            await session.commitTransaction();
            return await this.getTransferById(transferId);
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    // Cancel transfer
    async cancelTransfer(transferId, data, userId) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const transfer = await transfer_model_1.TransferModel.findById(transferId).session(session);
            if (!transfer) {
                throw new Error('Transfer not found');
            }
            if ([transfer_types_1.TransferStatus.COMPLETED, transfer_types_1.TransferStatus.CANCELLED].includes(transfer.status)) {
                throw new Error(`Transfer cannot be cancelled in ${transfer.status} status`);
            }
            transfer.status = transfer_types_1.TransferStatus.CANCELLED;
            transfer.cancelledDate = new Date();
            transfer.cancelledBy = userId;
            transfer.cancellationReason = data.reason;
            transfer.updatedBy = userId;
            if (data.remarks)
                transfer.remarks = data.remarks;
            await transfer.save({ session });
            await session.commitTransaction();
            return await this.getTransferById(transferId);
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    // Update transfer (partial updates)
    async updateTransfer(transferId, data, userId) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const transfer = await transfer_model_1.TransferModel.findById(transferId).session(session);
            if (!transfer) {
                throw new Error('Transfer not found');
            }
            if (transfer.status === transfer_types_1.TransferStatus.COMPLETED || transfer.status === transfer_types_1.TransferStatus.CANCELLED) {
                throw new Error(`Transfer cannot be updated in ${transfer.status} status`);
            }
            // Update fields
            if (data.priority)
                transfer.priority = data.priority;
            if (data.expectedDeliveryDate)
                transfer.expectedDeliveryDate = new Date(data.expectedDeliveryDate);
            if (data.trackingNumber)
                transfer.trackingNumber = data.trackingNumber;
            if (data.courierName)
                transfer.courierName = data.courierName;
            if (data.vehicleNumber)
                transfer.vehicleNumber = data.vehicleNumber;
            if (data.driverName)
                transfer.driverName = data.driverName;
            if (data.driverPhone)
                transfer.driverPhone = data.driverPhone;
            if (data.remarks)
                transfer.remarks = data.remarks;
            transfer.updatedBy = userId;
            await transfer.save({ session });
            await session.commitTransaction();
            return await this.getTransferById(transferId);
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    // Get transfer summary
    async getTransferSummary(filters) {
        const { fromDepotId, toDepotId, startDate, endDate } = filters;
        const query = {};
        if (fromDepotId)
            query.fromDepotId = fromDepotId;
        if (toDepotId)
            query.toDepotId = toDepotId;
        if (startDate || endDate) {
            query.requestedDate = {};
            if (startDate)
                query.requestedDate.$gte = new Date(startDate);
            if (endDate)
                query.requestedDate.$lte = new Date(endDate);
        }
        const [transfers, stats] = await Promise.all([
            transfer_model_1.TransferModel.find(query).lean(),
            transfer_model_1.TransferModel.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        value: { $sum: '$totalValue' }
                    }
                }
            ])
        ]);
        // Calculate summary
        const summary = {
            totalTransfers: transfers.length,
            pendingTransfers: 0,
            inTransitTransfers: 0,
            completedTransfers: 0,
            cancelledTransfers: 0,
            totalValueInTransit: 0,
            averageCompletionTime: 0,
            topProducts: [],
            transfersByDepot: []
        };
        // Process statistics
        stats.forEach((stat) => {
            switch (stat._id) {
                case transfer_types_1.TransferStatus.PENDING:
                    summary.pendingTransfers = stat.count;
                    break;
                case transfer_types_1.TransferStatus.IN_TRANSIT:
                    summary.inTransitTransfers = stat.count;
                    summary.totalValueInTransit = stat.value;
                    break;
                case transfer_types_1.TransferStatus.COMPLETED:
                    summary.completedTransfers = stat.count;
                    break;
                case transfer_types_1.TransferStatus.CANCELLED:
                    summary.cancelledTransfers = stat.count;
                    break;
            }
        });
        // Calculate top products
        const productMap = new Map();
        transfers.forEach(transfer => {
            transfer.items.forEach((item) => {
                const key = item.productId.toString();
                if (!productMap.has(key)) {
                    productMap.set(key, {
                        productId: key,
                        productName: item.productName,
                        productCode: item.productCode,
                        totalTransferred: 0
                    });
                }
                const product = productMap.get(key);
                product.totalTransferred += item.shippedQuantity || item.approvedQuantity || item.requestedQuantity || 0;
            });
        });
        summary.topProducts = Array.from(productMap.values())
            .sort((a, b) => b.totalTransferred - a.totalTransferred)
            .slice(0, 10);
        return summary;
    }
    // Get transfers by status
    async getTransfersByStatus(status, depotId, limit = 50) {
        const query = { status };
        if (depotId) {
            query.$or = [
                { fromDepotId: depotId },
                { toDepotId: depotId }
            ];
        }
        const transfers = await transfer_model_1.TransferModel.find(query)
            .populate('fromDepotId', 'name code')
            .populate('toDepotId', 'name code')
            .sort({ requestedDate: -1 })
            .limit(limit)
            .lean();
        return transfers;
    }
    // Get pending approvals for a depot
    async getPendingApprovals(depotId) {
        const transfers = await transfer_model_1.TransferModel.find({
            fromDepotId: depotId,
            status: transfer_types_1.TransferStatus.PENDING
        })
            .populate('toDepotId', 'name code')
            .populate('requestedBy', 'username')
            .sort({ priority: -1, requestedDate: 1 })
            .lean();
        return transfers;
    }
    // Get incoming transfers for a depot
    async getIncomingTransfers(depotId, status) {
        const query = { toDepotId: depotId };
        if (status)
            query.status = status;
        const transfers = await transfer_model_1.TransferModel.find(query)
            .populate('fromDepotId', 'name code')
            .populate('requestedBy', 'username')
            .sort({ requestedDate: -1 })
            .lean();
        return transfers;
    }
    // Get outgoing transfers for a depot
    async getOutgoingTransfers(depotId, status) {
        const query = { fromDepotId: depotId };
        if (status)
            query.status = status;
        const transfers = await transfer_model_1.TransferModel.find(query)
            .populate('toDepotId', 'name code')
            .populate('requestedBy', 'username')
            .sort({ requestedDate: -1 })
            .lean();
        return transfers;
    }
    // Get transfer statistics
    async getTransferStatistics(depotId, startDate, endDate) {
        const match = {};
        if (depotId) {
            match.$or = [
                { fromDepotId: new mongoose_1.default.Types.ObjectId(depotId) },
                { toDepotId: new mongoose_1.default.Types.ObjectId(depotId) }
            ];
        }
        if (startDate || endDate) {
            match.requestedDate = {};
            if (startDate)
                match.requestedDate.$gte = new Date(startDate);
            if (endDate)
                match.requestedDate.$lte = new Date(endDate);
        }
        const statistics = await transfer_model_1.TransferModel.aggregate([
            { $match: match },
            {
                $facet: {
                    byStatus: [
                        { $group: { _id: '$status', count: { $sum: 1 } } }
                    ],
                    byPriority: [
                        { $group: { _id: '$priority', count: { $sum: 1 } } }
                    ],
                    byType: [
                        { $group: { _id: '$transferType', count: { $sum: 1 } } }
                    ],
                    daily: [
                        {
                            $group: {
                                _id: { $dateToString: { format: '%Y-%m-%d', date: '$requestedDate' } },
                                count: { $sum: 1 },
                                value: { $sum: '$totalValue' }
                            }
                        },
                        { $sort: { _id: -1 } },
                        { $limit: 30 }
                    ],
                    monthly: [
                        {
                            $group: {
                                _id: { $dateToString: { format: '%Y-%m', date: '$requestedDate' } },
                                count: { $sum: 1 },
                                value: { $sum: '$totalValue' }
                            }
                        },
                        { $sort: { _id: -1 } },
                        { $limit: 12 }
                    ]
                }
            }
        ]);
        return {
            byStatus: Object.fromEntries(statistics[0].byStatus.map((item) => [item._id, item.count])),
            byPriority: Object.fromEntries(statistics[0].byPriority.map((item) => [item._id, item.count])),
            byType: Object.fromEntries(statistics[0].byType.map((item) => [item._id, item.count])),
            daily: statistics[0].daily,
            monthly: statistics[0].monthly
        };
    }
    // Add document to transfer
    async addDocument(transferId, document, userId) {
        const transfer = await transfer_model_1.TransferModel.findByIdAndUpdate(transferId, {
            $push: { documents: { ...document, uploadedAt: new Date() } },
            updatedBy: userId
        }, { new: true });
        if (!transfer) {
            throw new Error('Transfer not found');
        }
        return transfer;
    }
    // Remove document from transfer
    async removeDocument(transferId, documentName, userId) {
        const transfer = await transfer_model_1.TransferModel.findByIdAndUpdate(transferId, {
            $pull: { documents: { name: documentName } },
            updatedBy: userId
        }, { new: true });
        if (!transfer) {
            throw new Error('Transfer not found');
        }
        return transfer;
    }
    // Check if transfer is overdue
    async checkOverdueTransfers() {
        const now = new Date();
        await transfer_model_1.TransferModel.updateMany({
            status: { $in: [transfer_types_1.TransferStatus.PENDING, transfer_types_1.TransferStatus.IN_TRANSIT] },
            expectedDeliveryDate: { $lt: now }
        }, {
            $set: {
                priority: transfer_types_1.TransferPriority.URGENT,
                remarks: 'Auto-marked as urgent due to overdue delivery'
            }
        });
    }
}
exports.TransferService = TransferService;
exports.transferService = new TransferService();
