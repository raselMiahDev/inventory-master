import { UserRole } from '../../enum';

export interface IUser {
    _id: string;
    username: string;
    password: string;
    role: UserRole;
    depotId?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ILoginRequest {
    username: string;
    password: string;
}

export interface IRegisterRequest {
    username: string;
    password: string;
    role: UserRole;
    depotId?: string;
}

export interface IAuthResponse {
    user: Omit<IUser, 'password'>;
    token: string;
}