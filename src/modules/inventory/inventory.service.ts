import mongoose from 'mongoose';
import { InventoryModel } from './inventory.model';
import { LedgerModel } from './ledger.model';
import { ProductModel } from '../product/product.model';
import { v4 as uuidv4 } from 'uuid';
import { DepotModel } from '../depo/depo.model';
import {
    IReceiveStockRequest,
    ISellStockRequest,
    ITransferStockRequest,
    IStockHistoryFilters,
    IDepotStock,
    IProductStock
} from './inventory.types';
import { TransactionType } from '../../enum';

// Get or create inventory record
const getOrCreateInventory = async (
    depotId: string,
    productId: string
): Promise<any> => {
    let inventory = await InventoryModel.findOne({ depotId, productId });

    if (!inventory) {
        inventory = await InventoryModel.create({
            depotId,
            productId,
            quantity: 0,
            lastUpdated: new Date()
        });
    }

    return inventory;
};

// Update stock with ledger entry
const updateStockWithLedger = async (
    type: TransactionType,
    depotId: string,
    productId: string,
    quantity: number,
    previousStock: number,
    remarks: string,
    createdBy: string,
    referenceId?: string
): Promise<{ inventory: any; ledgerEntry: any }> => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Calculate new stock
        let newStock = previousStock;
        switch (type) {
            case TransactionType.RECEIVE:
            case TransactionType.TRANSFER_IN:
                newStock += quantity;
                break;
            case TransactionType.SALE:
            case TransactionType.TRANSFER_OUT:
                newStock -= quantity;
                break;
        }

        // Update inventory
        const inventory = await InventoryModel.findOneAndUpdate(
            { depotId, productId },
            {
                quantity: newStock,
                lastUpdated: new Date()
            },
            { new: true, session }
        );

        if (!inventory) {
            throw new Error('Inventory record not found');
        }

        // Create ledger entry
        const ledgerEntry = await LedgerModel.create([{
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
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
      await session.endSession();
    }
};

// Receive stock into depot
export const receiveStock = async (
    depotId: string,
    data: IReceiveStockRequest,
    createdBy: string
): Promise<{ inventory: any; ledgerEntry: any }> => {
    const { productId, quantity, remarks } = data;

    // Get current inventory
    const inventory = await getOrCreateInventory(depotId, productId);

    // Update stock with ledger
    return await updateStockWithLedger(
        TransactionType.RECEIVE,
        depotId,
        productId,
        quantity,
        inventory.quantity,
        remarks || 'Stock received',
        createdBy
    );
};

// Sell stock from depot
export const sellStock = async (
    depotId: string,
    data: ISellStockRequest,
    createdBy: string
): Promise<{ inventory: any; ledgerEntry: any }> => {
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
    return await updateStockWithLedger(
        TransactionType.SALE,
        depotId,
        productId,
        quantity,
        inventory.quantity,
        saleRemarks,
        createdBy
    );
};

// Transfer stock between depots
export const transferStock = async (
    fromDepotId: string,
    data: ITransferStockRequest,
    createdBy: string
): Promise<{
    fromInventory: any;
    toInventory: any;
    transferOutLedger: any;
    transferInLedger: any;
}> => {
    const { toDepotId, productId, quantity, remarks } = data;

    if (fromDepotId === toDepotId) {
        throw new Error('Cannot transfer to the same depot');
    }

    // Check if destination depot exists and is active
    const toDepot = await DepotModel.findById(toDepotId);
    if (!toDepot || !toDepot.isActive) {
        throw new Error('Destination depot not found or inactive');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Get current inventory for source depot
        const fromInventory = await getOrCreateInventory(fromDepotId, productId);

        // Check if enough stock is available
        if (fromInventory.quantity < quantity) {
            throw new Error(`Insufficient stock for transfer. Available: ${fromInventory.quantity} KG`);
        }

        // Process transfer out (from source depot)
        const transferOut = await updateStockWithLedger(
            TransactionType.TRANSFER_OUT,
            fromDepotId,
            productId,
            quantity,
            fromInventory.quantity,
            `Transfer to ${toDepot.code} - ${remarks || ''}`,
            createdBy
        );

        // Process transfer in (to destination depot)
        const toInventory = await getOrCreateInventory(toDepotId, productId);
        const transferIn = await updateStockWithLedger(
            TransactionType.TRANSFER_IN,
            toDepotId,
            productId,
            quantity,
            toInventory.quantity,
            `Transfer from ${fromDepotId} - ${remarks || ''}`,
            createdBy,
            transferOut.ledgerEntry._id
        );

        // Update reference in transfer out ledger
        await LedgerModel.findByIdAndUpdate(
            transferOut.ledgerEntry._id,
            { referenceId: transferIn.ledgerEntry._id },
            { session }
        );

        await session.commitTransaction();

        return {
            fromInventory: transferOut.inventory,
            toInventory: transferIn.inventory,
            transferOutLedger: transferOut.ledgerEntry,
            transferInLedger: transferIn.ledgerEntry
        };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
       await session.endSession();
    }
};

// Get depot stock summary
export const getDepotStock = async (depotId: string): Promise<IDepotStock[]> => {
    const inventory = await InventoryModel.find({ depotId })
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
export const getStockHistory = async (
    depotId: string,
    filters: IStockHistoryFilters
): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}> => {
    const {
        startDate,
        endDate,
        productId,
        type,
        page = 1,
        limit = 20
    } = filters;

    const query: any = { depotId };

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
    const total = await LedgerModel.countDocuments(query);

    // Get paginated data
    const data = await LedgerModel.find(query)
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
export const getStockMovementSummary = async (
    depotId: string,
    days: number = 7
): Promise<{
    totalReceived: number;
    totalSold: number;
    totalTransferredOut: number;
    totalTransferredIn: number;
    netChange: number;
}> => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const pipeline = [
        {
            $match: {
                depotId: new mongoose.Types.ObjectId(depotId),
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

    const results = await LedgerModel.aggregate(pipeline);

    const summary = {
        totalReceived: 0,
        totalSold: 0,
        totalTransferredOut: 0,
        totalTransferredIn: 0,
        netChange: 0
    };

    results.forEach(result => {
        switch (result._id) {
            case TransactionType.RECEIVE:
                summary.totalReceived = result.totalQuantity;
                break;
            case TransactionType.SALE:
                summary.totalSold = result.totalQuantity;
                break;
            case TransactionType.TRANSFER_OUT:
                summary.totalTransferredOut = result.totalQuantity;
                break;
            case TransactionType.TRANSFER_IN:
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

// Initialize inventory for all products in depot
// export const initializeDepotInventory = async (
//     depotId: string | string[]
// ): Promise<void> => {
//     const products = await ProductModel.find({ isActive: true }).select('_id');

//     for (const product of products) {
//         await getOrCreateInventory(depotId, product._id);
//     }
// };