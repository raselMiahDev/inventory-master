"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sale = void 0;
const mongoose_1 = require("mongoose");
const enum_1 = require("../../enum");
const saleSchema = new mongoose_1.Schema({
    depoId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Depos",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: enum_1.SaleStatus,
    },
    reference: {
        type: String
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true, versionKey: false });
exports.Sale = (0, mongoose_1.model)("Sale", saleSchema);
