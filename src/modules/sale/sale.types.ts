export interface ISale {
    _id: string;
    saleId: string; // Format: SALE-YYYYMMDD-XXXX
    depotId: string | object;
    items: ISaleItem[];
    totalAmount: number;
    cashCollected: number;
    changeAmount: number;
    customerName?: string;
    customerPhone?: string;
    paymentMethod: 'CASH' | 'CARD' | 'UPI' | 'CREDIT';
    status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
    notes?: string;
    createdBy: string | object;
    createdAt: Date;
    updatedAt: Date;
}

export interface ISaleItem {
    productId: string | object;
    productName: string;
    productCode: string;
    quantity: number; // in KG
    unitPrice: number; // per KG
    totalPrice: number;
    packSize?: number;
}

export interface IDailySales {
    _id: string;
    date: Date;
    depotId: string | object;
    totalSales: number; // Total amount of all sales
    totalCashCollected: number;
    totalCardAmount: number;
    totalUpiAmount: number;
    totalCreditAmount: number;
    saleCount: number;
    bankDepositAmount?: number;
    bankDepositDate?: Date;
    depositSlipNo?: string;
    status: 'PENDING' | 'DEPOSITED' | 'PARTIAL';
    remarks?: string;
    createdBy: string | object;
    updatedAt: Date;
}

export interface ICreateSaleRequest {
    items: Array<{
        productId: string;
        quantity: number;
    }>;
    cashCollected: number;
    customerName?: string;
    customerPhone?: string;
    paymentMethod: 'CASH' | 'CARD' | 'UPI' | 'CREDIT';
    notes?: string;
}

export interface ICreateDailySalesRequest {
    depotId: string;
    totalSales: number;
    totalCashCollected: number;
    totalCardAmount: number;
    totalUpiAmount: number;
    totalCreditAmount: number;
    saleCount: number;
}

export interface IBankDepositRequest {
    depositAmount: number;
    depositSlipNo?: string;
    remarks?: string;
}

export interface ISaleSummary {
    totalSales: number;
    totalTransactions: number;
    averageTransactionValue: number;
    totalCashCollected: number;
    totalCardAmount: number;
    totalUpiAmount: number;
    totalCreditAmount: number;
    topProducts: Array<{
        productId: string;
        productName: string;
        productCode: string;
        quantitySold: number;
        totalAmount: number;
    }>;
    salesByHour: Array<{
        hour: number;
        count: number;
        amount: number;
    }>;
}

export interface ISaleFilters {
    startDate?: string;
    endDate?: string;
    depotId?: string;
    customerName?: string;
    customerPhone?: string;
    paymentMethod?: string;
    minAmount?: number;
    maxAmount?: number;
    page?: number;
    limit?: number;
}