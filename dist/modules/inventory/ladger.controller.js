"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReceived = exports.createReceive = void 0;
const ladger_model_1 = require("./ladger.model");
const enum_1 = require("../../enum");
const createReceive = async (req, res, next) => {
    const { depoId, productId, quantity, reference } = req.body;
    const ladger = await ladger_model_1.Ladger.create({
        depoId: depoId,
        productId: productId,
        quantity: quantity,
        reference: reference,
        type: enum_1.TransactionType.RECEIVE,
        createdBy: req.user.userId
    });
    res.status(201).json({ message: "Received Add Successfully" });
};
exports.createReceive = createReceive;
const getReceived = async (req, res, next) => {
    const receive = await ladger_model_1.Ladger.find().limit(10);
    res.status(200).json(receive);
};
exports.getReceived = getReceived;
