import mongoose, { Schema } from 'mongoose';
import { IDepot } from './depo.interface';

const DepotSchema = new Schema<IDepot>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    contactPerson: {
        type: String,
        required: true,
        trim: true
    },
    contactNumber: {
        type: String,
        required: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret: any) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

// Compound index for better query performance
DepotSchema.index({ code: 1, isActive: 1 });
DepotSchema.index({ createdBy: 1, isActive: 1 });

// Pre-save hook to ensure code is uppercase
DepotSchema.pre('save', function() {
    if (this.code) {
        this.code = this.code.toUpperCase();
    }
});

export const DepotModel = mongoose.model<IDepot>('Depot', DepotSchema);