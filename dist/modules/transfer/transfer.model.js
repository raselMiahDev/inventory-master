"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const transfer_types_1 = require("./transfer.types");
const uuid_1 = require("uuid");
const TransferItemSchema = new mongoose_1.Schema({
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
const DocumentSchema = new mongoose_1.Schema({
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
const TransferSchema = new mongoose_1.Schema({
    transferId: {
        type: String,
        unique: true,
        index: true
    },
    transferType: {
        type: String,
        enum: Object.values(transfer_types_1.TransferType),
        required: true,
        index: true
    },
    fromDepotId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Depot',
        required: true,
        index: true
    },
    toDepotId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Depot',
        required: true,
        index: true
    },
    items: [TransferItemSchema],
    status: {
        type: String,
        enum: Object.values(transfer_types_1.TransferStatus),
        default: transfer_types_1.TransferStatus.PENDING,
        index: true
    },
    priority: {
        type: String,
        enum: Object.values(transfer_types_1.TransferPriority),
        default: transfer_types_1.TransferPriority.NORMAL,
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    approvedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    shippedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    receivedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    cancelledBy: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
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
TransferSchema.pre('save', function () {
    if (!this.transferId) {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const uuid = (0, uuid_1.v4)().split('-')[0].toUpperCase();
        this.transferId = `TRF-${dateStr}-${uuid}`;
    }
});
// Pre-save hook to calculate totals
TransferSchema.pre('save', function () {
    if (this.items && this.items.length > 0) {
        this.totalItems = this.items.length;
        this.totalRequestedQuantity = this.items.reduce((sum, item) => sum + item.requestedQuantity, 0);
        this.totalApprovedQuantity = this.items.reduce((sum, item) => sum + (item.approvedQuantity || 0), 0);
        this.totalShippedQuantity = this.items.reduce((sum, item) => sum + (item.shippedQuantity || 0), 0);
        this.totalReceivedQuantity = this.items.reduce((sum, item) => sum + (item.receivedQuantity || 0), 0);
        this.totalValue = this.items.reduce((sum, item) => sum + item.totalValue, 0);
    }
});
exports.TransferModel = mongoose_1.default.model('Transfer', TransferSchema);
