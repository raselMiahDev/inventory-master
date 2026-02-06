// modules/product/services/product.service.ts
import {ProductModel} from './product.model';
import {
    ICreateProductRequest,
    IProductResponse,
    IProductStockSummary,
    IUpdateProductRequest
} from './product.interface';

// We'll create inventory model later, but for now define interface
interface IInventory {
    productId: string;
    depotId: string;
    quantity: number;
}

export const createProduct = async (
    data: ICreateProductRequest,
    createdBy: string
): Promise<IProductResponse> => {
    // Check if product code already exists
    const existingProduct = await ProductModel.findOne({
        code: data.code.toUpperCase()
    });

    if (existingProduct) {
        throw new Error(`Product with code ${data.code} already exists`);
    }

    // Create product
    const product = await ProductModel.create({
        ...data,
        createdBy,
        isActive: true
    });

    // Populate createdBy field
    const populatedProduct = await product.populate({
        path: 'createdBy',
        select: '_id username'
    });

    return populatedProduct.toObject() as IProductResponse;
};

export const getAllProducts = async (
    filters: {
        category?: string;
        isActive?: boolean;
        search?: string;
        minPrice?: number;
        maxPrice?: number;
    } = {}
): Promise<IProductResponse[]> => {
    const {
        category,
        isActive,
        search,
        minPrice,
        maxPrice
    } = filters;

    const query: any = {};

    if (category) {
        query.category = category;
    }

    if (isActive !== undefined) {
        query.isActive = isActive;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
        query.unitPrice = {};
        if (minPrice !== undefined) query.unitPrice.$gte = minPrice;
        if (maxPrice !== undefined) query.unitPrice.$lte = maxPrice;
    }

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { code: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    const products = await ProductModel.find(query)
        .populate({
            path: 'createdBy',
            select: '_id username'
        })
        .sort({ createdAt: -1 })
        .lean();

    return products as IProductResponse[];
};

export const getProductById = async (
    id: string
): Promise<IProductResponse | null> => {
    const product = await ProductModel.findById(id)
        .populate({
            path: 'createdBy',
            select: '_id username'
        })
        .lean();

    return product as IProductResponse | null;
};

export const updateProduct = async (
    id: string,
    data: IUpdateProductRequest,
    updatedBy: string
): Promise<IProductResponse | null> => {
    // Check if product exists
    const product = await ProductModel.findById(id);
    if (!product) {
        throw new Error('Product not found');
    }

    // Update product
    const updatedProduct = await ProductModel.findByIdAndUpdate(
        id,
        { ...data, updatedAt: new Date() },
        { new: true, runValidators: true }
    )
        .populate({
            path: 'createdBy',
            select: '_id username'
        })
        .lean();

    return updatedProduct as IProductResponse | null;
};

export const deleteProduct = async (id: string): Promise<boolean> => {
    // Check if product exists
    const product = await ProductModel.findById(id);
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
    await ProductModel.findByIdAndDelete(id);

    return true;
};

export const deactivateProduct = async (id: string): Promise<boolean> => {
    // Check if product exists
    const product = await ProductModel.findById(id);
    if (!product) {
        throw new Error('Product not found');
    }

    // Deactivate product
    await ProductModel.findByIdAndUpdate(
        id,
        { isActive: false, updatedAt: new Date() }
    );

    return true;
};

export const getProductCategories = async (): Promise<string[]> => {
    const categories = await ProductModel.distinct('category', { isActive: true });
    return categories.sort();
};

export const getProductStockSummary = async (
    productId: string
): Promise<IProductStockSummary | null> => {
    const product = await ProductModel.findById(productId).lean();
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

export const getProductsWithLowStock = async (
    threshold: number = 100 // KG threshold
): Promise<IProductResponse[]> => {
    // TODO: Implement with actual inventory data
    // For now, return empty array
    return [];
};

export const getActiveProducts = async (): Promise<IProductResponse[]> => {
    const products = await ProductModel.find({ isActive: true })
        .populate({
            path: 'createdBy',
            select: '_id username'
        })
        .select('_id name code packSize unitPrice category')
        .sort({ name: 1 })
        .lean();

    return products as IProductResponse[];
};