import { Schema, model, Document, Types } from 'mongoose';

export interface ITeamMember {
  _id?: Types.ObjectId;
  userId?: Types.ObjectId | null;
  name: string;
  photoUrl?: string | null;
  designation: string;
  bio?: string;
  contributions: string[];
  socials: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
    other?: string;
  };
  displayOrder: number;
}

export interface ITeamBatch extends Document {
  _id: Types.ObjectId;
  batchName: string;
  batchYear: string;
  isActive: boolean;
  members: ITeamMember[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    photoUrl: { type: String, default: null },
    designation: { type: String, required: true, trim: true, maxlength: 120 },
    bio: { type: String, maxlength: 600 },
    contributions: { type: [String], default: [] },
    socials: {
      instagram: { type: String },
      linkedin: { type: String },
      twitter: { type: String },
      website: { type: String },
      other: { type: String },
    },
    displayOrder: { type: Number, default: 0, index: true },
  },
  { _id: true }
);

const TeamBatchSchema = new Schema<ITeamBatch>(
  {
    batchName: { type: String, required: true, trim: true, maxlength: 120, index: true },
    batchYear: { type: String, required: true, trim: true, maxlength: 20, index: true },
    isActive: { type: Boolean, default: false },
    members: { type: [TeamMemberSchema], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Only one active batch at a time
TeamBatchSchema.index(
  { isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

export const TeamBatch = model<ITeamBatch>('TeamBatch', TeamBatchSchema);
