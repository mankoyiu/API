import mongoose, { Document, Schema } from 'mongoose';

// Interface for User document
export interface IUser extends Document {
    email: string;
    password: string;
    role: 'operator' | 'user';
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

// User Schema
const userSchema = new Schema<IUser>({
    email: {
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
        enum: ['operator', 'user'],
        default: 'user'
    },
    name: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

// Create and export the User model
export const User = mongoose.model<IUser>('User', userSchema);