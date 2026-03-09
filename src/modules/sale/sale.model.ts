// modules/sale/models/sale.model.ts
import mongoose, { Schema } from 'mongoose';
import { ISale, ISaleItem } from './sale.types';
import { v4 as uuidv4 } from 'uuid';

const SaleItemSchema = new Schema<ISaleItem>({
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
    quantity: {
        type: Number,
        required: true,
        min: 0.1
    },
    unitPrice: {
        type: Number,
        required: true,
        min: 0
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    packSize: {
        type: Number
    }
}, { _id: false });

const SaleSchema = new Schema<ISale>({
    saleId: {
        type: String,
        unique: true,
        index: true
    },
    depotId: {
        type: Schema.Types.ObjectId,
        ref: 'Depot',
        required: true,
        index: true
    },
    items: [SaleItemSchema],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    cashCollected: {
        type: Number,
        required: true,
        min: 0
    },
    changeAmount: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    customerName: {
        type: String,
        trim: true,
        index: true
    },
    customerPhone: {
        type: String,
        trim: true,
        index: true
    },
    paymentMethod: {
        type: String,
        enum: ['CASH', 'CARD', 'UPI', 'CREDIT'],
        required: true,
        default: 'CASH'
    },
    status: {
        type: String,
        enum: ['COMPLETED', 'PENDING', 'CANCELLED'],
        default: 'COMPLETED',
        index: true
    },
    notes: {
        type: String,
        trim: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
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

// Indexes for faster queries
SaleSchema.index({ createdAt: -1 });
SaleSchema.index({ depotId: 1, createdAt: -1 });
SaleSchema.index({ customerPhone: 1, createdAt: -1 });
SaleSchema.index({ 'items.productId': 1 });

// Pre-save hook to generate sale ID
SaleSchema.pre('save', function() {
    if (!this.saleId) {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const uuid = uuidv4().split('-')[0].toUpperCase();
        this.saleId = `SALE-${dateStr}-${uuid}`;
    }
});

export const SaleModel = mongoose.model<ISale>('Sale', SaleSchema);