export interface IDepot {
    _id: string;
    name: string;
    code: string;
    address: string;
    contactPerson: string;
    contactNumber: string;
    isActive: boolean;
    createdBy: string | object; // User ID
    createdAt: Date;
    updatedAt: Date;
}

export interface ICreateDepotRequest {
    name: string;
    code: string;
    address: string;
    contactPerson: string;
    contactNumber: string;
}

export interface IUpdateDepotRequest {
    name?: string;
    address?: string;
    contactPerson?: string;
    contactNumber?: string;
    isActive?: boolean;
}

export interface IDepotResponse extends Omit<IDepot, 'createdBy'> {
    createdBy: {
        _id: string;
        username: string;
    };
}

export interface IDepotStats {
    totalProducts: number;
    totalStockValue: number;
    recentTransactions: number;
}