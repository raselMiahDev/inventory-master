"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveProductsController = exports.getProductsWithLowStockController = exports.getProductStockSummaryController = exports.getProductCategoriesController = exports.deactivateProductController = exports.deleteProductController = exports.updateProductController = exports.getProductByIdController = exports.getAllProductsController = exports.createProductController = void 0;
const product_service_1 = require("./product.service");
const product_validation_1 = require("./product.validation");
const createProductController = async (req, res) => {
    try {
        // Validate request
        const validatedData = product_validation_1.createProductSchema.parse(req.body);
        // Get user ID from auth middleware
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: 'User not authenticated' });
        }
        // Create product
        const product = await (0, product_service_1.createProduct)(validatedData, userId);
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to create product'
        });
    }
};
exports.createProductController = createProductController;
const getAllProductsController = async (req, res) => {
    try {
        // Validate query params
        const validatedQuery = product_validation_1.productFiltersSchema.parse(req.query);
        const filters = {};
        if (validatedQuery.category) {
            filters.category = validatedQuery.category;
        }
        if (validatedQuery.isActive !== undefined) {
            filters.isActive = validatedQuery.isActive === 'true';
        }
        if (validatedQuery.search) {
            filters.search = validatedQuery.search;
        }
        if (validatedQuery.minPrice) {
            filters.minPrice = parseFloat(validatedQuery.minPrice);
        }
        if (validatedQuery.maxPrice) {
            filters.maxPrice = parseFloat(validatedQuery.maxPrice);
        }
        const products = await (0, product_service_1.getAllProducts)(filters);
        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch products'
        });
    }
};
exports.getAllProductsController = getAllProductsController;
const getProductByIdController = async (req, res) => {
    try {
        // Validate product ID
        const { id } = product_validation_1.productIdSchema.parse(req.params);
        const product = await (0, product_service_1.getProductById)(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        res.status(200).json({
            success: true,
            data: product
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch product'
        });
    }
};
exports.getProductByIdController = getProductByIdController;
const updateProductController = async (req, res) => {
    try {
        // Validate product ID and update data
        const { id } = product_validation_1.productIdSchema.parse(req.params);
        const validatedData = product_validation_1.updateProductSchema.parse(req.body);
        // Check user role (only admin can update products)
        const userRole = req.user?.role;
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admin can update products'
            });
        }
        // Get user ID for audit
        const userId = req.user?.userId;
        const updatedProduct = await (0, product_service_1.updateProduct)(id, validatedData, userId);
        if (!updatedProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to update product'
        });
    }
};
exports.updateProductController = updateProductController;
const deleteProductController = async (req, res) => {
    try {
        // Validate product ID
        const { id } = product_validation_1.productIdSchema.parse(req.params);
        // Check user role (only admin can delete products)
        const userRole = req.user?.role;
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admin can delete products'
            });
        }
        const result = await (0, product_service_1.deleteProduct)(id);
        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to delete product'
        });
    }
};
exports.deleteProductController = deleteProductController;
const deactivateProductController = async (req, res) => {
    try {
        // Validate product ID
        const { id } = product_validation_1.productIdSchema.parse(req.params);
        // Check user role (only admin can deactivate products)
        const userRole = req.user?.role;
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admin can deactivate products'
            });
        }
        const result = await (0, product_service_1.deactivateProduct)(id);
        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Product deactivated successfully'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to deactivate product'
        });
    }
};
exports.deactivateProductController = deactivateProductController;
const getProductCategoriesController = async (req, res) => {
    try {
        const categories = await (0, product_service_1.getProductCategories)();
        res.status(200).json({
            success: true,
            data: categories
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch categories'
        });
    }
};
exports.getProductCategoriesController = getProductCategoriesController;
const getProductStockSummaryController = async (req, res) => {
    try {
        // Validate product ID
        const { id } = product_validation_1.productIdSchema.parse(req.params);
        const summary = await (0, product_service_1.getProductStockSummary)(id);
        if (!summary) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        res.status(200).json({
            success: true,
            data: summary
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch product stock summary'
        });
    }
};
exports.getProductStockSummaryController = getProductStockSummaryController;
const getProductsWithLowStockController = async (req, res) => {
    try {
        const { threshold } = req.query;
        const stockThreshold = threshold ? parseFloat(threshold) : 100;
        const products = await (0, product_service_1.getProductsWithLowStock)(stockThreshold);
        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch low stock products'
        });
    }
};
exports.getProductsWithLowStockController = getProductsWithLowStockController;
const getActiveProductsController = async (req, res) => {
    try {
        const products = await (0, product_service_1.getActiveProducts)();
        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch active products'
        });
    }
};
exports.getActiveProductsController = getActiveProductsController;
