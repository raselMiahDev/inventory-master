"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveDepots = exports.getDepotStats = exports.deleteDepot = exports.updateDepot = exports.getDepotById = exports.getAllDepots = exports.createDepot = void 0;
const depo_model_1 = require("./depo.model");
const createDepot = async (data, createdBy) => {
    // Check if depot code already exists
    const existingDepot = await depo_model_1.DepotModel.findOne({
        code: data.code.toUpperCase()
    });
    if (existingDepot) {
        throw new Error(`Depot with code ${data.code} already exists`);
    }
    // Create depot
    const depot = await depo_model_1.DepotModel.create({
        ...data,
        createdBy,
        isActive: true
    });
    // Populate createdBy field
    const populatedDepot = await depot.populate({
        path: 'createdBy',
        select: '_id username'
    });
    return populatedDepot.toObject();
};
exports.createDepot = createDepot;
const getAllDepots = async (filters = {}) => {
    const { isActive, search } = filters;
    const query = {};
    if (isActive !== undefined) {
        query.isActive = isActive;
    }
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { code: { $regex: search, $options: 'i' } },
            { contactPerson: { $regex: search, $options: 'i' } }
        ];
    }
    const depots = await depo_model_1.DepotModel.find(query)
        .populate({
        path: 'createdBy',
        select: '_id username'
    })
        .sort({ createdAt: -1 })
        .lean();
    return depots;
};
exports.getAllDepots = getAllDepots;
const getDepotById = async (id) => {
    const depot = await depo_model_1.DepotModel.findById(id)
        .populate({
        path: 'createdBy',
        select: '_id username'
    })
        .lean();
    return depot;
};
exports.getDepotById = getDepotById;
const updateDepot = async (id, data, updatedBy) => {
    // Check if depot exists
    const depot = await depo_model_1.DepotModel.findById(id);
    if (!depot) {
        throw new Error('Depot not found');
    }
    // Update depot
    const updatedDepot = await depo_model_1.DepotModel.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true, runValidators: true })
        .populate({
        path: 'createdBy',
        select: '_id username'
    })
        .lean();
    return updatedDepot;
};
exports.updateDepot = updateDepot;
const deleteDepot = async (id) => {
    // Check if depot exists
    const depot = await depo_model_1.DepotModel.findById(id);
    if (!depot) {
        throw new Error('Depot not found');
    }
    // Check if depot is in use (you might want to add checks for existing inventory)
    // For now, we'll just soft delete
    await depo_model_1.DepotModel.findByIdAndUpdate(id, { isActive: false, updatedAt: new Date() });
    return true;
};
exports.deleteDepot = deleteDepot;
const getDepotStats = async (id) => {
    // For now, return basic stats
    // Later we'll add inventory and transaction counts
    return {
        totalProducts: 0,
        totalStockValue: 0,
        recentTransactions: 0
    };
};
exports.getDepotStats = getDepotStats;
const getActiveDepots = async () => {
    const depots = await depo_model_1.DepotModel.find({ isActive: true })
        .populate({
        path: 'createdBy',
        select: '_id username'
    })
        .select('_id name code')
        .sort({ name: 1 })
        .lean();
    return depots;
};
exports.getActiveDepots = getActiveDepots;
