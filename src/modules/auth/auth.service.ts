import bcrypt from 'bcrypt';
import { UserModel } from './auth.models';
import { UserRole } from '../../enum';
import {
    ILoginRequest,
    IRegisterRequest,
    IAuthResponse
} from './auth.types';
import { signToken } from '../../utils/jwt';

export const loginUser = async (
    credentials: ILoginRequest
): Promise<IAuthResponse> => {
    const { username, password } = credentials;

    // Find user
    const user = await UserModel.findOne({ username, isActive: true });
    if (!user) {
        throw new Error('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid credentials');
    }

    // Generate token
    const token = signToken({
        userId: user._id,
        role: user.role,
        depoId: user.depotId
    })

    // Convert to plain object and remove password
    const userObject = user.toObject();
    const { password: _, ...userWithoutPassword } = userObject;

    return {
        user: userWithoutPassword,
        token
    };
};

export const registerUser = async (
    userData: IRegisterRequest
): Promise<IAuthResponse> => {
    const { username, password, role, depotId } = userData;

    // Check if user exists
    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
        throw new Error('Username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await UserModel.create({
        username,
        password: hashedPassword,
        role,
        depotId: role === UserRole.IN_CHARGE ? depotId : undefined
    });

    // Generate token
    const token = signToken({
        userId: user._id,
        role: user.role,
        depoId: user.depotId
    })

    return {
        user: user.toObject(),
        token
    };
};

export const getCurrentUser = async (userId: string) => {
    return await UserModel.findById(userId)
        .select('-password')
        .lean();
};