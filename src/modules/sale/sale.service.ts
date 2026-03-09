// modules/sale/services/sale.service.ts
import mongoose from 'mongoose';
import { DailySalesModel } from './dailySales.model';
import { ProductModel } from '../product/product.model';
import { sellStock } from '../inventory/inventory.service';
import {
    ICreateSaleRequest,
    IBankDepositRequest,
    ISaleFilters,
    ISaleSummary,
    ISaleItem
} from './sale.types';
import {SaleModel} from "./sale.model";

// Create a new sale
export const createSale = async (
    depotId: string,
    data: ICreateSaleRequest,
    createdBy: string
): Promise<any> => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const saleItems: ISaleItem[] = [];
        let totalAmount = 0;

        // Process each item
        for (const item of data.items) {
            // Get product details
            const product = await ProductModel.findById(item.productId);
            if (!product) {
                throw new Error(`Product not found: ${item.productId}`);
            }
            if (!product.isActive) {
                throw new Error(`Product is inactive: ${product.name}`);
            }

            // Calculate item total
            const itemTotal =product.packSize*product.unitPrice * item.quantity;
            totalAmount += itemTotal;

            // Add to sale items
            saleItems.push({
                productId: product._id.toString(),
                productName: product.name,
                productCode: product.code,
                quantity: item.quantity,
                unitPrice: product.unitPrice,
                totalPrice: itemTotal,
                packSize: product.packSize
            });

            // Update inventory (sell stock)
            await sellStock(
                depotId,
                {
                    productId: item.productId,
                    quantity: item.quantity,
                    customerName: data.customerName,
                    remarks: `Sale ${data.paymentMethod} - ${data.notes || ''}`
                },
                createdBy
            );
        }

        // Calculate change amount
        const changeAmount = data.paymentMethod === 'CASH'
            ? Math.max(0, data.cashCollected - totalAmount)
            : 0;

        // Create sale record
        const sale = await SaleModel.create([{
            depotId,
            items: saleItems,
            totalAmount,
            cashCollected: data.cashCollected,
            changeAmount,
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            paymentMethod: data.paymentMethod,
            status: 'COMPLETED',
            notes: data.notes,
            createdBy
        }], { session });

        // Update daily sales
        await updateDailySales(
            depotId,
            new Date(),
            {
                totalAmount,
                cashCollected: data.paymentMethod === 'CASH' ? totalAmount : 0,
                cardAmount: data.paymentMethod === 'CARD' ? totalAmount : 0,
                upiAmount: data.paymentMethod === 'UPI' ? totalAmount : 0,
                creditAmount: data.paymentMethod === 'CREDIT' ? totalAmount : 0
            },
            createdBy,
            session
        );

        await session.commitTransaction();

        // Populate and return
        const populatedSale = await SaleModel.findById(sale[0]._id)
            .populate('createdBy', 'username')
            .populate('items.productId', 'name code')
            .lean();

        return populatedSale;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
       await session.endSession();
    }
};

// Update daily sales summary
const updateDailySales = async (
    depotId: string,
    date: Date,
    amounts: {
        totalAmount: number;
        cashCollected: number;
        cardAmount: number;
        upiAmount: number;
        creditAmount: number;
    },
    createdBy: string,
    session: mongoose.ClientSession
) => {
    // Get start and end of day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Find or create daily sales record
    const dailySales = await DailySalesModel.findOneAndUpdate(
        {
            depotId,
            date: { $gte: startOfDay, $lte: endOfDay }
        },
        {
            $inc: {
                totalSales: amounts.totalAmount,
                totalCashCollected: amounts.cashCollected,
                totalCardAmount: amounts.cardAmount,
                totalUpiAmount: amounts.upiAmount,
                totalCreditAmount: amounts.creditAmount,
                saleCount: 1
            },
            $setOnInsert: {
                depotId,
                date: startOfDay,
                createdBy,
                status: 'PENDING'
            }
        },
        {
            upsert: true,
            new: true,
            session
        }
    );

    return dailySales;
};

// Get sales by ID
export const getSaleById = async (saleId: string): Promise<any> => {
    const sale = await SaleModel.findById(saleId)
        .populate('depotId', 'name code')
        .populate('createdBy', 'username')
        .populate('items.productId', 'name code packSize')
        .lean();

    return sale;
};

// Get sales with filters
export const getSales = async (
    filters: ISaleFilters
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
        depotId,
        customerName,
        customerPhone,
        paymentMethod,
        minAmount,
        maxAmount,
        page = 1,
        limit = 20
    } = filters;

    const query: any = {};

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

    // Depot filter
    if (depotId) {
        query.depotId = depotId;
    }

    // Customer filters
    if (customerName) {
        query.customerName = { $regex: customerName, $options: 'i' };
    }
    if (customerPhone) {
        query.customerPhone = customerPhone;
    }

    // Payment method
    if (paymentMethod) {
        query.paymentMethod = paymentMethod;
    }

    // Amount range
    if (minAmount !== undefined || maxAmount !== undefined) {
        query.totalAmount = {};
        if (minAmount !== undefined) query.totalAmount.$gte = minAmount;
        if (maxAmount !== undefined) query.totalAmount.$lte = maxAmount;
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Get total count
    const total = await SaleModel.countDocuments(query);

    // Get paginated data
    const data = await SaleModel.find(query)
        .populate('depotId', 'name code')
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

// Get daily sales for a depot
export const getDailySales = async (
    depotId: string,
    startDate?: string,
    endDate?: string
): Promise<any[]> => {
    const query: any = { depotId };

    if (startDate || endDate) {
        query.date = {};
        if (startDate) {
            query.date.$gte = new Date(startDate);
        }
        if (endDate) {
            query.date.$lte = new Date(endDate);
        }
    }

    const dailySales = await DailySalesModel.find(query)
        .sort({ date: -1 })
        .lean();

    return dailySales;
};

// Get today's daily sales
export const getTodaySales = async (depotId: string): Promise<any> => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const dailySales = await DailySalesModel.findOne({
        depotId,
        date: { $gte: startOfDay, $lte: endOfDay }
    }).lean();

    // If no record, calculate from sales
    if (!dailySales) {
        const sales = await SaleModel.find({
            depotId,
            createdAt: { $gte: startOfDay, $lte: endOfDay },
            status: 'COMPLETED'
        }).lean();

        const summary = sales.reduce((acc, sale) => {
            acc.totalSales += sale.totalAmount;
            if (sale.paymentMethod === 'CASH') acc.totalCashCollected += sale.totalAmount;
            if (sale.paymentMethod === 'CARD') acc.totalCardAmount += sale.totalAmount;
            if (sale.paymentMethod === 'UPI') acc.totalUpiAmount += sale.totalAmount;
            if (sale.paymentMethod === 'CREDIT') acc.totalCreditAmount += sale.totalAmount;
            acc.saleCount += 1;
            return acc;
        }, {
            totalSales: 0,
            totalCashCollected: 0,
            totalCardAmount: 0,
            totalUpiAmount: 0,
            totalCreditAmount: 0,
            saleCount: 0
        });

        return {
            date: startOfDay,
            depotId,
            ...summary,
            status: 'PENDING'
        };
    }

    return dailySales;
};

// Mark bank deposit
export const markBankDeposit = async (
    dailySalesId: string,
    data: IBankDepositRequest,
    userId: string
): Promise<any> => {
    const dailySales = await DailySalesModel.findById(dailySalesId);

    if (!dailySales) {
        throw new Error('Daily sales record not found');
    }

    // Validate deposit amount
    if (data.depositAmount > dailySales.totalCashCollected) {
        throw new Error(`Deposit amount cannot exceed cash collected (${dailySales.totalCashCollected})`);
    }

    // Determine new status
    let status = dailySales.status;
    if (data.depositAmount >= dailySales.totalCashCollected) {
        status = 'DEPOSITED';
    } else if (data.depositAmount > 0) {
        status = 'PARTIAL';
    }

    // Update daily sales
    const updated = await DailySalesModel.findByIdAndUpdate(
        dailySalesId,
        {
            bankDepositAmount: data.depositAmount,
            bankDepositDate: new Date(),
            depositSlipNo: data.depositSlipNo,
            status,
            remarks: data.remarks,
            updatedAt: new Date()
        },
        { new: true }
    ).lean();

    return updated;
};

// Get sales summary
export const getSalesSummary = async (
    depotId: string,
    startDate: string,
    endDate: string
): Promise<ISaleSummary> => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Get all sales in date range
    const sales = await SaleModel.find({
        depotId,
        createdAt: { $gte: start, $lte: end },
        status: 'COMPLETED'
    })
        .populate('items.productId', 'name code')
        .lean();

    // Calculate totals
    const summary: ISaleSummary = {
        totalSales: 0,
        totalTransactions: sales.length,
        averageTransactionValue: 0,
        totalCashCollected: 0,
        totalCardAmount: 0,
        totalUpiAmount: 0,
        totalCreditAmount: 0,
        topProducts: [],
        salesByHour: Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            count: 0,
            amount: 0
        }))
    };

    // Product sales tracking
    const productSales: { [key: string]: { name: string; code: string; quantity: number; amount: number } } = {};

    for (const sale of sales) {
        summary.totalSales += sale.totalAmount;

        // Payment method totals
        if (sale.paymentMethod === 'CASH') summary.totalCashCollected += sale.totalAmount;
        if (sale.paymentMethod === 'CARD') summary.totalCardAmount += sale.totalAmount;
        if (sale.paymentMethod === 'UPI') summary.totalUpiAmount += sale.totalAmount;
        if (sale.paymentMethod === 'CREDIT') summary.totalCreditAmount += sale.totalAmount;

        // Sales by hour
        const hour = new Date(sale.createdAt).getHours();
        summary.salesByHour[hour].count += 1;
        summary.salesByHour[hour].amount += sale.totalAmount;

        // Product tracking
        for (const item of sale.items) {
            const productId = item.productId.toString();
            if (!productSales[productId]) {
                productSales[productId] = {
                    name: item.productName,
                    code: item.productCode,
                    quantity: 0,
                    amount: 0
                };
            }
            productSales[productId].quantity += item.quantity;
            productSales[productId].amount += item.totalPrice;
        }
    }

    // Calculate average
    summary.averageTransactionValue = summary.totalTransactions > 0
        ? summary.totalSales / summary.totalTransactions
        : 0;

    // Get top products (sort by amount descending)
    summary.topProducts = Object.entries(productSales)
        .map(([productId, data]) => ({
            productId,
            productName: data.name,
            productCode: data.code,
            quantitySold: data.quantity,
            totalAmount: data.amount
        }))
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 10);

    return summary;
};

// Cancel a sale
export const cancelSale = async (
    saleId: string,
    userId: string,
    reason: string
): Promise<any> => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const sale = await SaleModel.findById(saleId);

        if (!sale) {
            throw new Error('Sale not found');
        }

        if (sale.status === 'CANCELLED') {
            throw new Error('Sale is already cancelled');
        }

        // Update sale status
        sale.status = 'CANCELLED';
        sale.notes = `CANCELLED: ${reason} | ${sale.notes || ''}`;
        await sale.save({ session });

        // TODO: Reverse inventory
        // For each item, add stock back to inventory
        for (const item of sale.items) {
            // This should call a service to add stock back
            // await addStock(sale.depotId, item.productId, item.quantity, 'CANCELLATION', userId);
        }

        // Update daily sales (decrement)
        await DailySalesModel.findOneAndUpdate(
            {
                depotId: sale.depotId,
                date: {
                    $gte: new Date(sale.createdAt).setHours(0,0,0,0),
                    $lte: new Date(sale.createdAt).setHours(23,59,59,999)
                }
            },
            {
                $inc: {
                    totalSales: -sale.totalAmount,
                    ...(sale.paymentMethod === 'CASH' && { totalCashCollected: -sale.totalAmount }),
                    ...(sale.paymentMethod === 'CARD' && { totalCardAmount: -sale.totalAmount }),
                    ...(sale.paymentMethod === 'UPI' && { totalUpiAmount: -sale.totalAmount }),
                    ...(sale.paymentMethod === 'CREDIT' && { totalCreditAmount: -sale.totalAmount }),
                    saleCount: -1
                }
            },
            { session }
        );

        await session.commitTransaction();

        return sale;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
       await session.endSession();
    }
};

// Get customer purchase history
export const getCustomerHistory = async (
    customerPhone: string | string[],
    limit: number = 10
): Promise<any[]> => {
    const sales = await SaleModel.find({ customerPhone, status: 'COMPLETED' })
        .populate('depotId', 'name code')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

    return sales;
};