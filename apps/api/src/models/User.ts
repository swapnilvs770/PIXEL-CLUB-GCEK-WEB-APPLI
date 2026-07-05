import { Schema, model, Document, Types } from 'mongoose';

export type UserRole = 'user' | 'admin';
export type UserStatus = 'pending' | 'approved' | 'blocked';

export interface IUser extends Document {
  _id: Types.ObjectId;
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: Date;
  approvedAt?: Date;
  approvedBy?: Types.ObjectId;
  blockedAt?: Date;
  blockedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  toSafeJSON(): SafeUserJSON;
}

export interface SafeUserJSON {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  lastLoginAt: Date | null;
}

const UserSchema = new Schema<IUser>(
  {
    googleId: { type: String, required: true, unique: true, index: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    avatarUrl: { type: String, default: null },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'blocked'],
      default: 'pending',
      required: true,
      index: true,
    },
    lastLoginAt: { type: Date },
    approvedAt: { type: Date },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    blockedAt: { type: Date },
    blockedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

UserSchema.methods.toSafeJSON = function (): SafeUserJSON {
  return {
    id: this._id.toString(),
    email: this.email,
    name: this.name,
    avatarUrl: this.avatarUrl ?? null,
    role: this.role,
    status: this.status,
    createdAt: this.createdAt,
    lastLoginAt: this.lastLoginAt ?? null,
  };
};

export const User = model<IUser>('User', UserSchema);
