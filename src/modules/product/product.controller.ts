import { Request, Response } from 'express';
import {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    deactivateProduct,
    getProductCategories,
    getProductStockSummary,
    getProductsWithLowStock,
    getActiveProducts
} from './product.service';
import {
    createProductSchema,
    updateProductSchema,
    productIdSchema,
    productFiltersSchema
} from './product.validation';
import {ProductModel} from "./product.model";

export const createProductController = async (req: Request, res: Response) => {
    try {
        // Validate request
        const validatedData = createProductSchema.parse(req.body);

        // Get user ID from auth middleware
        const userId = (req as any).user?.userId;

        if (!userId) {
           res.status(401).json({message:'User not authenticated'});
        }

        // Create product

        const product = await createProduct(validatedData, userId);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to create product'
        });
    }
};

export const getAllProductsController = async (req: Request, res: Response) => {
    try {
        // Validate query params
        const validatedQuery = productFiltersSchema.parse(req.query);

        const filters: any = {};

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

        const products = await getAllProducts(filters);

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch products'
        });
    }
};

export const getProductByIdController = async (req: Request, res: Response) => {
    try {
        // Validate product ID
        const { id } = productIdSchema.parse(req.params);

        const product = await getProductById(id);

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
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch product'
        });
    }
};

export const updateProductController = async (req: Request, res: Response) => {
    try {
        // Validate product ID and update data
        const { id } = productIdSchema.parse(req.params);
        const validatedData = updateProductSchema.parse(req.body);

        // Check user role (only admin can update products)
        const userRole = (req as any).user?.role;
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admin can update products'
            });
        }

        // Get user ID for audit
        const userId = (req as any).user?.userId;

        const updatedProduct = await updateProduct(id, validatedData, userId);

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
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to update product'
        });
    }
};

export const deleteProductController = async (req: Request, res: Response) => {
    try {
        // Validate product ID
        const { id } = productIdSchema.parse(req.params);

        // Check user role (only admin can delete products)
        const userRole = (req as any).user?.role;
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admin can delete products'
            });
        }

        const result = await deleteProduct(id);

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
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to delete product'
        });
    }
};

export const deactivateProductController = async (req: Request, res: Response) => {
    try {
        // Validate product ID
        const { id } = productIdSchema.parse(req.params);

        // Check user role (only admin can deactivate products)
        const userRole = (req as any).user?.role;
        if (userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admin can deactivate products'
            });
        }

        const result = await deactivateProduct(id);

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
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to deactivate product'
        });
    }
};

export const getProductCategoriesController = async (req: Request, res: Response) => {
    try {
        const categories = await getProductCategories();

        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch categories'
        });
    }
};

export const getProductStockSummaryController = async (req: Request, res: Response) => {
    try {
        // Validate product ID
        const { id } = productIdSchema.parse(req.params);

        const summary = await getProductStockSummary(id);

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
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch product stock summary'
        });
    }
};

export const getProductsWithLowStockController = async (req: Request, res: Response) => {
    try {
        const { threshold } = req.query;
        const stockThreshold = threshold ? parseFloat(threshold as string) : 100;

        const products = await getProductsWithLowStock(stockThreshold);

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch low stock products'
        });
    }
};

export const getActiveProductsController = async (req: Request, res: Response) => {
    try {
        const products = await getActiveProducts();

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to fetch active products'
        });
    }
};