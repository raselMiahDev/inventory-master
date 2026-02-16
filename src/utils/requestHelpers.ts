import { Request } from 'express';
import {UserRole} from "../enum";

interface IUserRequest extends Request {
    user?: {
        userId?: string;
        depoId?: string;
        role?: string;
    };
}

export const resolveUserAndDepot = (
    req: IUserRequest,
    allowAdminDepotOverride: boolean = true
) => {
    const user = req.user;

    if (!user?.userId) {
        throw new Error('User not authenticated');
    }

    let depotId = user.depoId;

    if (
        allowAdminDepotOverride &&
        user.role === UserRole.IN_CHARGE &&
        req.body.depotId
    ) {
        depotId = req.body.depotId;
    }

    if (!depotId) {
        throw new Error('Depot ID is required');
    }

    return {
        userId: user.userId,
        depotId,
        role: user.role,
    };
};
