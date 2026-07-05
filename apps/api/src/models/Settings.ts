import { Schema, model, Types } from 'mongoose';

export const SETTINGS_ID = 'pcmp_settings';

export interface ISettings {
  _id: string;
  websiteName: string;
  websiteDescription: string;
  contactEmail: string;
  socials: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    website?: string;
  };
  theme: 'light' | 'dark' | 'system';
  smtp: {
    from: string;
    host: string;
    port: number;
    user: string;
  };
  googleDrive: {
    serviceAccountEmail?: string;
  };
  cloudinary: {
    cloudName?: string;
  };
  homepage: {
    heroTitle: string;
    heroSubtitle: string;
    heroImageUrl?: string;
  };
  maintenance: {
    enabled: boolean;
    message: string;
  };
  featureToggles: {
    requestsEnabled: boolean;
    albumsEnabled: boolean;
    galleryEnabled: boolean;
    teamEnabled: boolean;
  };
  updatedBy?: Types.ObjectId;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    _id: { type: String, default: SETTINGS_ID },
    websiteName: { type: String, default: 'Pixel Club Management Portal', trim: true, maxlength: 200 },
    websiteDescription: { type: String, default: '', maxlength: 500 },
    contactEmail: { type: String, default: '', trim: true, lowercase: true, maxlength: 200 },
    socials: {
      instagram: { type: String },
      twitter: { type: String },
      linkedin: { type: String },
      youtube: { type: String },
      website: { type: String },
    },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    smtp: {
      from: { type: String, default: 'Pixel Club <noreply@pixelclub.in>' },
      host: { type: String, default: 'smtp.gmail.com' },
      port: { type: Number, default: 465 },
      user: { type: String, default: '' },
    },
    googleDrive: {
      serviceAccountEmail: { type: String },
    },
    cloudinary: {
      cloudName: { type: String },
    },
    homepage: {
      heroTitle: { type: String, default: 'Pixel Club, GCE Karad' },
      heroSubtitle: {
        type: String,
        default: 'Photography, storytelling, and memories.',
      },
      heroImageUrl: { type: String },
    },
    maintenance: {
      enabled: { type: Boolean, default: false },
      message: {
        type: String,
        default: 'The portal is under maintenance. Please check back soon.',
      },
    },
    featureToggles: {
      requestsEnabled: { type: Boolean, default: true },
      albumsEnabled: { type: Boolean, default: true },
      galleryEnabled: { type: Boolean, default: true },
      teamEnabled: { type: Boolean, default: true },
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, _id: false }
);

export const Settings = model<ISettings>('Settings', SettingsSchema);
