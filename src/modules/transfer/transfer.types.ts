import { Document, Types } from 'mongoose';

export enum TransferStatus {
    PENDING = 'pending',
    IN_TRANSIT = 'in_transit',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    REJECTED = 'rejected',
    PARTIALLY_COMPLETED = 'partially_completed'
}

export enum TransferPriority {
    LOW = 'low',
    NORMAL = 'normal',
    HIGH = 'high',
    URGENT = 'urgent'
}

export enum TransferType {
    INTER_DEPOT = 'inter_depot',
    RETURN = 'return',
    REPLENISHMENT = 'replenishment',
    EMERGENCY = 'emergency'
}

export interface ITransferItem {
    productId: Types.ObjectId | string;
    productName: string;
    productCode: string;
    packSize: number;
    requestedQuantity: number; // in KG
    approvedQuantity?: number; // in KG
    shippedQuantity?: number; // in KG
    receivedQuantity?: number; // in KG
    unitPrice: number;
    totalValue: number;
    batchNumber?: string;
    expiryDate?: Date;
    remarks?: string;
}

export interface ITransfer extends Document {
    transferId: string; // Format: TRF-YYYYMMDD-XXXX
    transferType: TransferType;
    fromDepotId: Types.ObjectId;
    toDepotId: Types.ObjectId;
    items: ITransferItem[];
    status: TransferStatus;
    priority: TransferPriority;

    // Quantities
    totalItems: number;
    totalRequestedQuantity: number;
    totalApprovedQuantity: number;
    totalShippedQuantity: number;
    totalReceivedQuantity: number;
    totalValue: number;

    // Dates
    requestedDate: Date;
    approvedDate?: Date;
    shippedDate?: Date;
    receivedDate?: Date;
    cancelledDate?: Date;
    expectedDeliveryDate?: Date;
    actualDeliveryDate?: Date;

    // Tracking
    trackingNumber?: string;
    courierName?: string;
    vehicleNumber?: string;
    driverName?: string;
    driverPhone?: string;

    // Documents
    documents?: Array<{
        name: string;
        url: string;
        uploadedAt: Date;
    }>;

    // Approvals
    requestedBy: Types.ObjectId;
    approvedBy?: Types.ObjectId;
    shippedBy?: Types.ObjectId;
    receivedBy?: Types.ObjectId;
    cancelledBy?: Types.ObjectId;

    // Reasons
    cancellationReason?: string;
    rejectionReason?: string;
    remarks?: string;

    // Audit
    createdAt: Date;
    updatedAt: Date;
    createdBy: Types.ObjectId;
    updatedBy?: Types.ObjectId;
}

export interface ITransferFilters {
    status?: TransferStatus;
    fromDepotId?: string;
    toDepotId?: string;
    transferType?: TransferType;
    priority?: TransferPriority;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface ICreateTransferRequest {
    transferType: TransferType;
    toDepotId: string;
    items: Array<{
        productId: string;
        requestedQuantity: number;
        batchNumber?: string;
        expiryDate?: string;
        remarks?: string;
    }>;
    priority?: TransferPriority;
    expectedDeliveryDate?: string;
    remarks?: string;
}

export interface IUpdateTransferRequest {
    status?: TransferStatus;
    priority?: TransferPriority;
    items?: Array<{
        productId: string;
        approvedQuantity?: number;
        shippedQuantity?: number;
        receivedQuantity?: number;
        remarks?: string;
    }>;
    expectedDeliveryDate?: string;
    trackingNumber?: string;
    courierName?: string;
    vehicleNumber?: string;
    driverName?: string;
    driverPhone?: string;
    remarks?: string;
}

export interface IApproveTransferRequest {
    approvedItems: Array<{
        productId: string;
        approvedQuantity: number;
    }>;
    remarks?: string;
}

export interface IShipTransferRequest {
    shippedItems: Array<{
        productId: string;
        shippedQuantity: number;
    }>;
    trackingNumber?: string;
    courierName?: string;
    vehicleNumber?: string;
    driverName?: string;
    driverPhone?: string;
    remarks?: string;
}

export interface IReceiveTransferRequest {
    receivedItems: Array<{
        productId: string;
        receivedQuantity: number;
        batchNumber?: string;
        expiryDate?: string;
        remarks?: string;
    }>;
    remarks?: string;
}

export interface ICancelTransferRequest {
    reason: string;
    remarks?: string;
}

export interface ITransferSummary {
    totalTransfers: number;
    pendingTransfers: number;
    inTransitTransfers: number;
    completedTransfers: number;
    cancelledTransfers: number;
    totalValueInTransit: number;
    averageCompletionTime: number; // in hours
    topProducts: Array<{
        productId: string;
        productName: string;
        productCode: string;
        totalTransferred: number;
    }>;
    transfersByDepot: Array<{
        depotId: string;
        depotName: string;
        depotCode: string;
        outgoingCount: number;
        incomingCount: number;
        totalValue: number;
    }>;
}

export interface ITransferTimeline {
    status: TransferStatus;
    timestamp: Date;
    performedBy: {
        userId: string;
        username: string;
    };
    remarks?: string;
}

export interface ITransferStatistics {
    daily: Array<{
        date: string;
        count: number;
        value: number;
    }>;
    weekly: Array<{
        week: string;
        count: number;
        value: number;
    }>;
    monthly: Array<{
        month: string;
        count: number;
        value: number;
    }>;
    byStatus: Record<TransferStatus, number>;
    byPriority: Record<TransferPriority, number>;
    byType: Record<TransferType, number>;
}