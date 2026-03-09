// modules/sale/models/dailySales.model.ts
import mongoose, { Schema } from 'mongoose';
import { IDailySales } from './sale.types';

const DailySalesSchema = new Schema<IDailySales>({
    date: {
        type: Date,
        required: true,
        index: true
    },
    depotId: {
        type: Schema.Types.ObjectId,
        ref: 'Depot',
        required: true,
        index: true
    },
    totalSales: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    totalCashCollected: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    totalCardAmount: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    totalUpiAmount: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    totalCreditAmount: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    saleCount: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    bankDepositAmount: {
        type: Number,
        min: 0
    },
    bankDepositDate: {
        type: Date
    },
    depositSlipNo: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'DEPOSITED', 'PARTIAL'],
        default: 'PENDING',
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

// Compound unique index - one entry per depot per day
DailySalesSchema.index({ depotId: 1, date: 1 }, { unique: true });

// Index for queries
DailySalesSchema.index({ date: -1 });
DailySalesSchema.index({ status: 1, date: -1 });

export const DailySalesModel = mongoose.model<IDailySales>('DailySales', DailySalesSchema);