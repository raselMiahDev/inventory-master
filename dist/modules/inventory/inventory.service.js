"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStockMovementSummary = exports.getStockHistory = exports.getDepotStock = exports.transferStock = exports.sellStock = exports.receiveStock = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const inventory_model_1 = require("./inventory.model");
const ledger_model_1 = require("./ledger.model");
const depo_model_1 = require("../depo/depo.model");
const enum_1 = require("../../enum");
// Get or create inventory record
const getOrCreateInventory = async (depotId, productId) => {
    let inventory = await inventory_model_1.InventoryModel.findOne({ depotId, productId });
    if (!inventory) {
        inventory = await inventory_model_1.InventoryModel.create({
            depotId,
            productId,
            quantity: 0,
            lastUpdated: new Date()
        });
    }
    return inventory;
};
// Update stock with ledger entry
const updateStockWithLedger = async (type, depotId, productId, quantity, previousStock, remarks, createdBy, referenceId) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // Calculate new stock
        let newStock = previousStock;
        switch (type) {
            case enum_1.TransactionType.RECEIVE:
            case enum_1.TransactionType.TRANSFER_IN:
                newStock += quantity;
                break;
            case enum_1.TransactionType.SALE:
            case enum_1.TransactionType.TRANSFER_OUT:
                newStock -= quantity;
                break;
        }
        // Update inventory
        const inventory = await inventory_model_1.InventoryModel.findOneAndUpdate({ depotId, productId }, {
            quantity: newStock,
            lastUpdated: new Date()
        }, { new: true, session });
        if (!inventory) {
            throw new Error('Inventory record not found');
        }
        // Create ledger entry
        const ledgerEntry = await ledger_model_1.LedgerModel.create([{
                type,
                depotId,
                productId,
                quantity,
                previousStock,
                newStock,
                referenceId,
                remarks,
                createdBy
            }], { session });
        await session.commitTransaction();
        return {
            inventory: inventory.toObject(),
            ledgerEntry: ledgerEntry[0].toObject()
        };
    }
    catch (error) {
        await session.abortTransaction();
        throw error;
    }
    finally {
        await session.endSession();
    }
};
// Receive stock into depot
const receiveStock = async (depotId, data, createdBy) => {
    const { productId, quantity, remarks } = data;
    // Get current inventory
    const inventory = await getOrCreateInventory(depotId, productId);
    // Update stock with ledger
    return await updateStockWithLedger(enum_1.TransactionType.RECEIVE, depotId, productId, quantity, inventory.quantity, remarks || 'Stock received', createdBy);
};
exports.receiveStock = receiveStock;
// Sell stock from depot
const sellStock = async (depotId, data, createdBy) => {
    const { productId, quantity, customerName, remarks } = data;
    // Get current inventory
    const inventory = await getOrCreateInventory(depotId, productId);
    // Check if enough stock is available
    if (inventory.quantity < quantity) {
        throw new Error(`Insufficient stock. Available: ${inventory.quantity} KG, Requested: ${quantity} KG`);
    }
    // Create remarks with customer name if provided
    let saleRemarks = remarks || 'Stock sold';
    if (customerName) {
        saleRemarks = `${saleRemarks} - Customer: ${customerName}`;
    }
    // Update stock with ledger
    return await updateStockWithLedger(enum_1.TransactionType.SALE, depotId, productId, quantity, inventory.quantity, saleRemarks, createdBy);
};
exports.sellStock = sellStock;
// Transfer stock between depots
const transferStock = async (fromDepotId, data, createdBy) => {
    const { toDepotId, productId, quantity, remarks } = data;
    if (fromDepotId === toDepotId) {
        throw new Error('Cannot transfer to the same depot');
    }
    // Check if destination depot exists and is active
    const toDepot = await depo_model_1.DepotModel.findById(toDepotId);
    if (!toDepot || !toDepot.isActive) {
        throw new Error('Destination depot not found or inactive');
    }
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // Get current inventory for source depot
        const fromInventory = await getOrCreateInventory(fromDepotId, productId);
        // Check if enough stock is available
        if (fromInventory.quantity < quantity) {
            throw new Error(`Insufficient stock for transfer. Available: ${fromInventory.quantity} KG`);
        }
        // Process transfer out (from source depot)
        const transferOut = await updateStockWithLedger(enum_1.TransactionType.TRANSFER_OUT, fromDepotId, productId, quantity, fromInventory.quantity, `Transfer to ${toDepot.code} - ${remarks || ''}`, createdBy);
        // Process transfer in (to destination depot)
        const toInventory = await getOrCreateInventory(toDepotId, productId);
        const transferIn = await updateStockWithLedger(enum_1.TransactionType.TRANSFER_IN, toDepotId, productId, quantity, toInventory.quantity, `Transfer from ${fromDepotId} - ${remarks || ''}`, createdBy, transferOut.ledgerEntry._id);
        // Update reference in transfer out ledger
        await ledger_model_1.LedgerModel.findByIdAndUpdate(transferOut.ledgerEntry._id, { referenceId: transferIn.ledgerEntry._id }, { session });
        await session.commitTransaction();
        return {
            fromInventory: transferOut.inventory,
            toInventory: transferIn.inventory,
            transferOutLedger: transferOut.ledgerEntry,
            transferInLedger: transferIn.ledgerEntry
        };
    }
    catch (error) {
        await session.abortTransaction();
        throw error;
    }
    finally {
        await session.endSession();
    }
};
exports.transferStock = transferStock;
// Get depot stock summary
const getDepotStock = async (depotId) => {
    const inventory = await inventory_model_1.InventoryModel.find({ depotId })
        .populate('productId', 'name code packSize unitPrice')
        .populate('depotId', 'name code')
        .sort({ 'productId.name': 1 })
        .lean();
    return inventory.map(item => ({
        depotId: item.depotId,
        depotName: item.depotId,
        depotCode: item.depotId,
        productId: item.productId,
        productName: item.productId,
        productCode: item.productId,
        packSize: item.productId,
        quantity: item.quantity,
        //value: item.quantity * item.productId,
        lastUpdated: item.lastUpdated
    }));
};
exports.getDepotStock = getDepotStock;
// Get product stock across all depots
// export const getProductStock = async (productId: string | string[]): Promise<IProductStock> => {
//     // Get product details
//     const product = await ProductModel.findById(productId).lean();
//     if (!product) {
//         throw new Error('Product not found');
//     }
//     // Get stock across all depots
//     const inventory = await InventoryModel.find({ productId })
//         .populate('depotId', 'name code')
//         .lean();
//     const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
//     const depotWise = inventory.map(item => ({
//         depotId: item.depotId._id.toString(),
//         depotName: item.depotId.name,
//         depotCode: item.depotId.code,
//         quantity: item.quantity
//     }));
//     return {
//         productId: product._id.toString(),
//         productName: product.name,
//         productCode: product.code,
//         totalQuantity,
//         depotWise
//     };
// };
// Get stock history/ledger for depot
const getStockHistory = async (depotId, filters) => {
    const { startDate, endDate, productId, type, page = 1, limit = 20 } = filters;
    const query = { depotId };
    // Date range filter
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
            query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
            query.createdAt.$lte = new Date(endDate);
        }
    }
    // Product filter
    if (productId) {
        query.productId = productId;
    }
    // Transaction type filter
    if (type) {
        query.type = type;
    }
    // Calculate skip
    const skip = (page - 1) * limit;
    // Get total count
    const total = await ledger_model_1.LedgerModel.countDocuments(query);
    // Get paginated data
    const data = await ledger_model_1.LedgerModel.find(query)
        .populate('productId', 'name code')
        .populate('createdBy', 'username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
};
exports.getStockHistory = getStockHistory;
// Get low stock alerts
// export const getLowStockAlerts = async (
//     depotId: string,
//     threshold: number = 100
// ): Promise<IDepotStock[]> => {
//     const inventory = await InventoryModel.find({
//         depotId,
//         quantity: { $lt: threshold }
//     })
//         .populate('productId', 'name code packSize unitPrice')
//         .populate('depotId', 'name code')
//         .sort({ quantity: 1 })
//         .lean();
//     return inventory.map(item => ({
//         depotId: item.depotId._id.toString(),
//         depotName: item.depotId.name,
//         depotCode: item.depotId.code,
//         productId: item.productId._id.toString(),
//         productName: item.productId.name,
//         productCode: item.productId.code,
//         packSize: item.productId.packSize,
//         quantity: item.quantity,
//         value: item.quantity * item.productId.unitPrice,
//         lastUpdated: item.lastUpdated
//     }));
// };
// Get stock movement summary
const getStockMovementSummary = async (depotId, days = 7) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const pipeline = [
        {
            $match: {
                depotId: new mongoose_1.default.Types.ObjectId(depotId),
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: '$type',
                totalQuantity: { $sum: '$quantity' }
            }
        }
    ];
    const results = await ledger_model_1.LedgerModel.aggregate(pipeline);
    const summary = {
        totalReceived: 0,
        totalSold: 0,
        totalTransferredOut: 0,
        totalTransferredIn: 0,
        netChange: 0
    };
    results.forEach(result => {
        switch (result._id) {
            case enum_1.TransactionType.RECEIVE:
                summary.totalReceived = result.totalQuantity;
                break;
            case enum_1.TransactionType.SALE:
                summary.totalSold = result.totalQuantity;
                break;
            case enum_1.TransactionType.TRANSFER_OUT:
                summary.totalTransferredOut = result.totalQuantity;
                break;
            case enum_1.TransactionType.TRANSFER_IN:
                summary.totalTransferredIn = result.totalQuantity;
                break;
        }
    });
    summary.netChange =
        summary.totalReceived +
            summary.totalTransferredIn -
            summary.totalSold -
            summary.totalTransferredOut;
    return summary;
};
exports.getStockMovementSummary = getStockMovementSummary;
// Initialize inventory for all products in depot
// export const initializeDepotInventory = async (
//     depotId: string | string[]
// ): Promise<void> => {
//     const products = await ProductModel.find({ isActive: true }).select('_id');
//     for (const product of products) {
//         await getOrCreateInventory(depotId, product._id);
//     }
// };
