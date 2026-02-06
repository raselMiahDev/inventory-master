// modules/product/types/product.types.ts
export interface IProduct {
    _id: string;
    name: string;
    code: string;
    packSize: number; // KG per pack
    unitPrice: number; // Price per KG
    description?: string;
    category: string;
    isActive: boolean;
    createdBy: string | object; // User ID
    createdAt: Date;
    updatedAt: Date;
}

export interface ICreateProductRequest {
    name: string;
    code: string;
    packSize: number;
    unitPrice: number;
    description?: string;
    category: string;
}

export interface IUpdateProductRequest {
    name?: string;
    packSize?: number;
    unitPrice?: number;
    description?: string;
    category?: string;
    isActive?: boolean;
}

export interface IProductResponse extends Omit<IProduct, 'createdBy'> {
    createdBy: {
        _id: string;
        username: string;
    };
}

export interface IProductStockSummary {
    productId: string;
    name: string;
    code: string;
    packSize: number;
    totalStock: number; // Total across all depots
    depotWiseStock: Array<{
        depotId: string;
        depotName: string;
        depotCode: string;
        quantity: number;
    }>;
}