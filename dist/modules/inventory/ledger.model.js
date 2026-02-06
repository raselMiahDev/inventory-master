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
exports.LedgerModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const enum_1 = require("../../enum");
const LedgerSchema = new mongoose_1.Schema({
    transactionId: {
        type: String,
        unique: true,
        index: true
    },
    type: {
        type: String,
        enum: Object.values(enum_1.TransactionType),
        required: true,
        index: true
    },
    depotId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Depot',
        required: true,
        index: true
    },
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Ledger',
        index: true
    },
    remarks: {
        type: String,
        trim: true
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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
// Indexes for faster queries
LedgerSchema.index({ depotId: 1, createdAt: -1 });
LedgerSchema.index({ productId: 1, createdAt: -1 });
LedgerSchema.index({ type: 1, createdAt: -1 });
LedgerSchema.index({ createdBy: 1, createdAt: -1 });
// Pre-save hook to generate transaction ID
LedgerSchema.pre('save', async function () {
    if (!this.transactionId) {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const uuid = require('uuid').v4().split('-')[0];
        this.transactionId = `LED-${dateStr}-${uuid.toUpperCase()}`;
    }
});
exports.LedgerModel = mongoose_1.default.model('Ledger', LedgerSchema);
