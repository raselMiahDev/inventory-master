import mongoose, { Schema } from 'mongoose';
import {
    ITransfer,
    TransferStatus,
    TransferPriority,
    TransferType
} from './transfer.types';
import { v4 as uuidv4 } from 'uuid';

const TransferItemSchema = new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    productCode: {
        type: String,
        required: true
    },
    packSize: {
        type: Number,
        required: true
    },
    requestedQuantity: {
        type: Number,
        required: true,
        min: 0.1
    },
    approvedQuantity: {
        type: Number,
        min: 0
    },
    shippedQuantity: {
        type: Number,
        min: 0
    },
    receivedQuantity: {
        type: Number,
        min: 0
    },
    unitPrice: {
        type: Number,
        required: true,
        min: 0
    },
    totalValue: {
        type: Number,
        required: true,
        min: 0
    },
    batchNumber: {
        type: String,
        trim: true
    },
    expiryDate: {
        type: Date
    },
    remarks: {
        type: String,
        trim: true
    }
}, { _id: false });

const DocumentSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const TransferSchema = new Schema<ITransfer>({
    transferId: {
        type: String,
        unique: true,
        index: true
    },
    transferType: {
        type: String,
        enum: Object.values(TransferType),
        required: true,
        index: true
    },
    fromDepotId: {
        type: Schema.Types.ObjectId,
        ref: 'Depot',
        required: true,
        index: true
    },
    toDepotId: {
        type: Schema.Types.ObjectId,
        ref: 'Depot',
        required: true,
        index: true
    },
    items: [TransferItemSchema],
    status: {
        type: String,
        enum: Object.values(TransferStatus),
        default: TransferStatus.PENDING,
        index: true
    },
    priority: {
        type: String,
        enum: Object.values(TransferPriority),
        default: TransferPriority.NORMAL,
        index: true
    },

    // Quantities (calculated fields)
    totalItems: {
        type: Number,
        default: 0
    },
    totalRequestedQuantity: {
        type: Number,
        default: 0
    },
    totalApprovedQuantity: {
        type: Number,
        default: 0
    },
    totalShippedQuantity: {
        type: Number,
        default: 0
    },
    totalReceivedQuantity: {
        type: Number,
        default: 0
    },
    totalValue: {
        type: Number,
        default: 0
    },

    // Dates
    requestedDate: {
        type: Date,
        default: Date.now,
        index: true
    },
    approvedDate: Date,
    shippedDate: Date,
    receivedDate: Date,
    cancelledDate: Date,
    expectedDeliveryDate: Date,
    actualDeliveryDate: Date,

    // Tracking
    trackingNumber: {
        type: String,
        trim: true
    },
    courierName: {
        type: String,
        trim: true
    },
    vehicleNumber: {
        type: String,
        trim: true
    },
    driverName: {
        type: String,
        trim: true
    },
    driverPhone: {
        type: String,
        trim: true
    },

    // Documents
    documents: [DocumentSchema],

    // Approvals
    requestedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    approvedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    shippedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    receivedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    cancelledBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    // Reasons
    cancellationReason: {
        type: String,
        trim: true
    },
    rejectionReason: {
        type: String,
        trim: true
    },
    remarks: {
        type: String,
        trim: true
    },

    // Audit
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret:any) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

// Compound indexes for common queries
TransferSchema.index({ fromDepotId: 1, status: 1, createdAt: -1 });
TransferSchema.index({ toDepotId: 1, status: 1, createdAt: -1 });
TransferSchema.index({ status: 1, priority: 1, requestedDate: -1 });
TransferSchema.index({ transferType: 1, status: 1 });
TransferSchema.index({ trackingNumber: 1 }, { sparse: true });

// Text index for search
TransferSchema.index({
    'items.productName': 'text',
    'items.productCode': 'text',
    trackingNumber: 'text',
    remarks: 'text'
});

// Pre-save hook to generate transfer ID
TransferSchema.pre('save', function() {
    if (!this.transferId) {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const uuid = uuidv4().split('-')[0].toUpperCase();
        this.transferId = `TRF-${dateStr}-${uuid}`;
    }
});

// Pre-save hook to calculate totals
TransferSchema.pre('save', function() {
    if (this.items && this.items.length > 0) {
        this.totalItems = this.items.length;
        this.totalRequestedQuantity = this.items.reduce((sum, item) => sum + item.requestedQuantity, 0);
        this.totalApprovedQuantity = this.items.reduce((sum, item) => sum + (item.approvedQuantity || 0), 0);
        this.totalShippedQuantity = this.items.reduce((sum, item) => sum + (item.shippedQuantity || 0), 0);
        this.totalReceivedQuantity = this.items.reduce((sum, item) => sum + (item.receivedQuantity || 0), 0);
        this.totalValue = this.items.reduce((sum, item) => sum + item.totalValue, 0);
    }
});

export const TransferModel = mongoose.model<ITransfer>('Transfer', TransferSchema);