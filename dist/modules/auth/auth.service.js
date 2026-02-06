"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.registerUser = exports.loginUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const auth_models_1 = require("./auth.models");
const enum_1 = require("../../enum");
const jwt_1 = require("../../utils/jwt");
const loginUser = async (credentials) => {
    const { username, password } = credentials;
    // Find user
    const user = await auth_models_1.UserModel.findOne({ username, isActive: true });
    if (!user) {
        throw new Error('Invalid credentials');
    }
    // Check password
    const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid credentials');
    }
    // Generate token
    const token = (0, jwt_1.signToken)({
        userId: user._id,
        role: user.role,
        depoId: user.depotId
    });
    // Convert to plain object and remove password
    const userObject = user.toObject();
    const { password: _, ...userWithoutPassword } = userObject;
    return {
        user: userWithoutPassword,
        token
    };
};
exports.loginUser = loginUser;
const registerUser = async (userData) => {
    const { username, password, role, depotId } = userData;
    // Check if user exists
    const existingUser = await auth_models_1.UserModel.findOne({ username });
    if (existingUser) {
        throw new Error('Username already exists');
    }
    // Hash password
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    // Create user
    const user = await auth_models_1.UserModel.create({
        username,
        password: hashedPassword,
        role,
        depotId: role === enum_1.UserRole.IN_CHARGE ? depotId : undefined
    });
    // Generate token
    const token = (0, jwt_1.signToken)({
        userId: user._id,
        role: user.role,
        depoId: user.depotId
    });
    return {
        user: user.toObject(),
        token
    };
};
exports.registerUser = registerUser;
const getCurrentUser = async (userId) => {
    return await auth_models_1.UserModel.findById(userId)
        .select('-password')
        .lean();
};
exports.getCurrentUser = getCurrentUser;
