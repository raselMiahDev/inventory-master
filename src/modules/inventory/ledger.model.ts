import mongoose, { Schema } from 'mongoose';
import { ILedgerEntry } from './inventory.types';
import { TransactionType } from '../../enum';

const LedgerSchema = new Schema<ILedgerEntry>({
    transactionId: {
        type: String,
        unique: true,
        index: true
    },
    type: {
        type: String,
        enum: Object.values(TransactionType),
        required: true,
        index: true
    },
    depotId: {
        type: Schema.Types.ObjectId,
        ref: 'Depot',
        required: true,
        index: true
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        index: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0.1
    },
    previousStock: {
        type: Number,
        required: true,
        min: 0
    },
    newStock: {
        type: Number,
        required: true,
        min: 0
    },
    referenceId: {
        type: Schema.Types.ObjectId,
        ref: 'Ledger',
        index: true
    },
    remarks: {
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
LedgerSchema.index({ depotId: 1, createdAt: -1 });
LedgerSchema.index({ productId: 1, createdAt: -1 });
LedgerSchema.index({ type: 1, createdAt: -1 });
LedgerSchema.index({ createdBy: 1, createdAt: -1 });

// Pre-save hook to generate transaction ID
LedgerSchema.pre('save', async function() {
    if (!this.transactionId) {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const uuid = require('uuid').v4().split('-')[0];
        this.transactionId = `LED-${dateStr}-${uuid.toUpperCase()}`;
    }
});

export const LedgerModel = mongoose.model<ILedgerEntry>('Ledger', LedgerSchema);