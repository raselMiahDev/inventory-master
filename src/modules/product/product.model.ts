
import mongoose, { Schema } from 'mongoose';
import { IProduct } from './product.interface';

const ProductSchema = new Schema<IProduct>({
    name: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        index: true
    },
    packSize: {
        type: Number,
        required: true,
        min: 0.1
    },
    unitPrice: {
        type: Number,
        required: true,
        min: 0.01
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true,
        index: true
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
        transform: (doc, ret:any) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

// Virtual for total stock (will be calculated from depot stocks)
ProductSchema.virtual('totalStock').get(function() {
    // This will be populated by a service method
    return 0;
});

// Compound indexes for better query performance
// compound indexes
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ createdBy: 1, isActive: 1 });

// text search
ProductSchema.index({
    name: 'text',
    code: 'text',
    description: 'text'
});


// Pre-save hook to ensure code is uppercase
ProductSchema.pre('save', async function () {
    if (this.code) {
        this.code = this.code.toUpperCase();
    }
});


export const ProductModel = mongoose.model<IProduct>('Product', ProductSchema);