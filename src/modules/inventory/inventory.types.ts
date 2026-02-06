
import { TransactionType } from '../../enum';

export interface IInventory {
    _id: string;
    depotId: string | object;
    productId: string | object;
    transactionId: string;
    quantity: number; // Current stock in KG
    lastUpdated: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface ILedgerEntry {
    _id: string;
    transactionId: string; // Format: LED-YYYYMMDD-XXXX
    type: TransactionType;
    depotId: string | object;
    productId: string | object;
    quantity: number; // KG
    previousStock: number; // Stock before this transaction
    newStock: number; // Stock after this transaction
    referenceId?: string; // For transfers - links TRANSFER_OUT to TRANSFER_IN
    remarks?: string;
    createdBy: string | object;
    createdAt: Date;
}

export interface IStockMovement {
    type: TransactionType;
    quantity: number;
    date: Date;
    reference?: string;
    remarks?: string;
}

export interface IDepotStock {
    depotId: string | object;
    depotName: string | object;
    depotCode: string | object;
    productId: string | object;
    productName: string | object;
    productCode: string | object;
    packSize: string | object;
    quantity: number;
    lastUpdated: Date
}

export interface IProductStock {
    productId: string;
    productName: string;
    productCode: string;
    totalQuantity: number; // Across all depots
    depotWise: Array<{
        depotId: string;
        depotName: string;
        depotCode: string;
        quantity: number;
    }>;
}

export interface IReceiveStockRequest {
    productId: string;
    quantity: number;
    remarks?: string;
}

export interface ISellStockRequest {
    productId: string;
    quantity: number;
    customerName?: string;
    remarks?: string;
}

export interface ITransferStockRequest {
    toDepotId: string;
    productId: string;
    quantity: number;
    remarks?: string;
}

export interface IStockHistoryFilters {
    startDate?: string;
    endDate?: string;
    productId?: string;
    type?: TransactionType;
    page?: number;
    limit?: number;
}