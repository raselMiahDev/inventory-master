import { DepotModel } from './depo.model';
import {
    ICreateDepotRequest,
    IUpdateDepotRequest,
    IDepotResponse,
    IDepotStats
} from './depo.interface';

export const createDepot = async (
    data: ICreateDepotRequest,
    createdBy: string
): Promise<IDepotResponse> => {
    // Check if depot code already exists
    const existingDepot = await DepotModel.findOne({
        code: data.code.toUpperCase()
    });

    if (existingDepot) {
        throw new Error(`Depot with code ${data.code} already exists`);
    }

    // Create depot
    const depot = await DepotModel.create({
        ...data,
        createdBy,
        isActive: true
    });

    // Populate createdBy field
    const populatedDepot = await depot.populate({
        path: 'createdBy',
        select: '_id username'
    });

    return populatedDepot.toObject() as IDepotResponse;
};

export const getAllDepots = async (
    filters: {
        isActive?: boolean;
        search?: string;
    } = {}
): Promise<IDepotResponse[]> => {
    const { isActive, search } = filters;

    const query: any = {};

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

    const depots = await DepotModel.find(query)
        .populate({
            path: 'createdBy',
            select: '_id username'
        })
        .sort({ createdAt: -1 })
        .lean();

    return depots as IDepotResponse[];
};

export const getDepotById = async (
    id: string
): Promise<IDepotResponse | null> => {
    const depot = await DepotModel.findById(id)
        .populate({
            path: 'createdBy',
            select: '_id username'
        })
        .lean();

    return depot as IDepotResponse | null;
};

export const updateDepot = async (
    id: string,
    data: IUpdateDepotRequest,
    updatedBy: string
): Promise<IDepotResponse | null> => {
    // Check if depot exists
    const depot = await DepotModel.findById(id);
    if (!depot) {
        throw new Error('Depot not found');
    }

    // Update depot
    const updatedDepot = await DepotModel.findByIdAndUpdate(
        id,
        { ...data, updatedAt: new Date() },
        { new: true, runValidators: true }
    )
        .populate({
            path: 'createdBy',
            select: '_id username'
        })
        .lean();

    return updatedDepot as IDepotResponse | null;
};

export const deleteDepot = async (id: string): Promise<boolean> => {
    // Check if depot exists
    const depot = await DepotModel.findById(id);
    if (!depot) {
        throw new Error('Depot not found');
    }

    // Check if depot is in use (you might want to add checks for existing inventory)
    // For now, we'll just soft delete
    await DepotModel.findByIdAndUpdate(
        id,
        { isActive: false, updatedAt: new Date() }
    );

    return true;
};

export const getDepotStats = async (id: string): Promise<IDepotStats> => {
    // For now, return basic stats
    // Later we'll add inventory and transaction counts
    return {
        totalProducts: 0,
        totalStockValue: 0,
        recentTransactions: 0
    };
};

export const getActiveDepots = async (): Promise<IDepotResponse[]> => {
    const depots = await DepotModel.find({ isActive: true })
        .populate({
            path: 'createdBy',
            select: '_id username'
        })
        .select('_id name code')
        .sort({ name: 1 })
        .lean();

    return depots as IDepotResponse[];
};