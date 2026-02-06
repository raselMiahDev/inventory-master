"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveProducts = exports.getProductsWithLowStock = exports.getProductStockSummary = exports.getProductCategories = exports.deactivateProduct = exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.getAllProducts = exports.createProduct = void 0;
// modules/product/services/product.service.ts
const product_model_1 = require("./product.model");
const createProduct = async (data, createdBy) => {
    // Check if product code already exists
    const existingProduct = await product_model_1.ProductModel.findOne({
        code: data.code.toUpperCase()
    });
    if (existingProduct) {
        throw new Error(`Product with code ${data.code} already exists`);
    }
    // Create product
    const product = await product_model_1.ProductModel.create({
        ...data,
        createdBy,
        isActive: true
    });
    // Populate createdBy field
    const populatedProduct = await product.populate({
        path: 'createdBy',
        select: '_id username'
    });
    return populatedProduct.toObject();
};
exports.createProduct = createProduct;
const getAllProducts = async (filters = {}) => {
    const { category, isActive, search, minPrice, maxPrice } = filters;
    const query = {};
    if (category) {
        query.category = category;
    }
    if (isActive !== undefined) {
        query.isActive = isActive;
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
        query.unitPrice = {};
        if (minPrice !== undefined)
            query.unitPrice.$gte = minPrice;
        if (maxPrice !== undefined)
            query.unitPrice.$lte = maxPrice;
    }
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { code: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }
    const products = await product_model_1.ProductModel.find(query)
        .populate({
        path: 'createdBy',
        select: '_id username'
    })
        .sort({ createdAt: -1 })
        .lean();
    return products;
};
exports.getAllProducts = getAllProducts;
const getProductById = async (id) => {
    const product = await product_model_1.ProductModel.findById(id)
        .populate({
        path: 'createdBy',
        select: '_id username'
    })
        .lean();
    return product;
};
exports.getProductById = getProductById;
const updateProduct = async (id, data, updatedBy) => {
    // Check if product exists
    const product = await product_model_1.ProductModel.findById(id);
    if (!product) {
        throw new Error('Product not found');
    }
    // Update product
    const updatedProduct = await product_model_1.ProductModel.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true, runValidators: true })
        .populate({
        path: 'createdBy',
        select: '_id username'
    })
        .lean();
    return updatedProduct;
};
exports.updateProduct = updateProduct;
const deleteProduct = async (id) => {
    // Check if product exists
    const product = await product_model_1.ProductModel.findById(id);
    if (!product) {
        throw new Error('Product not found');
    }
    // Check if product has stock in any depot
    // TODO: Check inventory collection once created
    const hasStock = false; // Implement later
    if (hasStock) {
        throw new Error('Cannot delete product with existing stock. Deactivate instead.');
    }
    // Delete product
    await product_model_1.ProductModel.findByIdAndDelete(id);
    return true;
};
exports.deleteProduct = deleteProduct;
const deactivateProduct = async (id) => {
    // Check if product exists
    const product = await product_model_1.ProductModel.findById(id);
    if (!product) {
        throw new Error('Product not found');
    }
    // Deactivate product
    await product_model_1.ProductModel.findByIdAndUpdate(id, { isActive: false, updatedAt: new Date() });
    return true;
};
exports.deactivateProduct = deactivateProduct;
const getProductCategories = async () => {
    const categories = await product_model_1.ProductModel.distinct('category', { isActive: true });
    return categories.sort();
};
exports.getProductCategories = getProductCategories;
const getProductStockSummary = async (productId) => {
    const product = await product_model_1.ProductModel.findById(productId).lean();
    if (!product) {
        return null;
    }
    // TODO: Implement actual stock calculation from inventory
    // For now, return mock data structure
    return {
        productId: product._id.toString(),
        name: product.name,
        code: product.code,
        packSize: product.packSize,
        totalStock: 0,
        depotWiseStock: []
    };
};
exports.getProductStockSummary = getProductStockSummary;
const getProductsWithLowStock = async (threshold = 100 // KG threshold
) => {
    // TODO: Implement with actual inventory data
    // For now, return empty array
    return [];
};
exports.getProductsWithLowStock = getProductsWithLowStock;
const getActiveProducts = async () => {
    const products = await product_model_1.ProductModel.find({ isActive: true })
        .populate({
        path: 'createdBy',
        select: '_id username'
    })
        .select('_id name code packSize unitPrice category')
        .sort({ name: 1 })
        .lean();
    return products;
};
exports.getActiveProducts = getActiveProducts;
