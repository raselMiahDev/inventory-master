"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferStock = void 0;
const mongoose = require("mongoose");
const getCurrentStock_1 = require("../../utils/getCurrentStock");
const ladger_model_1 = require("../inventory/ladger.model");
const enum_1 = require("../../enum");
const transferStock = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { fromDepoId, toDepoId, productId, pcs, reference } = req.body;
        if (req.user.role === enum_1.UserRole.IN_CHARGE && req.user.depoId === fromDepoId) {
            res.status(401).json({ message: "Unauthorized To Transfer" });
        }
        if (fromDepoId === toDepoId) {
            res.status(200).json({ message: "Cannot transfer same depo" });
        }
        // stock check
        const currentStockKg = await (0, getCurrentStock_1.getCurrentStockAgg)(fromDepoId, productId);
        if (currentStockKg <= 0) {
            res.status(404).json({ message: "Insufficient Stock" });
        }
        await ladger_model_1.Ladger.create([
            {
                depoId: fromDepoId,
                productId: productId,
                type: enum_1.TransactionType.TRANSFER_OUT,
                quantity: -pcs,
                reference,
                createdBy: req.user.userId,
            },
            {
                depoId: toDepoId,
                productId: productId,
                type: enum_1.TransactionType.TRANSFER_IN,
                quantity: pcs,
                reference,
                createdBy: req.user.userId,
            }
        ], { session });
        await session.commitTransaction();
        res.status(201).json({ message: "Stock Transfer successfully" });
    }
    catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: "Stock Transfer error" });
    }
    finally {
        await session.endSession();
    }
};
exports.transferStock = transferStock;
