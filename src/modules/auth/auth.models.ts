import mongoose, { Schema } from 'mongoose';
import { UserRole } from '../../enum';
import { IUser } from './auth.types';

const UserSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: Object.values(UserRole),
        required: true
    },
    depotId: {
        type: Schema.Types.ObjectId,
        ref: 'Depot'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            // @ts-ignore
            delete ret.password;
            return ret;
        }
    }
});

export const UserModel = mongoose.model<IUser>('User', UserSchema);