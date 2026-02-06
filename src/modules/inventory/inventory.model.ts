import mongoose, { Schema } from 'mongoose';
import { IInventory } from './inventory.types';

const InventorySchema = new Schema<IInventory>({
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
        min: 0,
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
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

// Compound unique index - one entry per product per depot
InventorySchema.index({ depotId: 1, productId: 1 }, { unique: true });

// Index for faster queries
InventorySchema.index({ depotId: 1, lastUpdated: -1 });
InventorySchema.index({ productId: 1, lastUpdated: -1 });

export const InventoryModel = mongoose.model<IInventory>('Inventory', InventorySchema);