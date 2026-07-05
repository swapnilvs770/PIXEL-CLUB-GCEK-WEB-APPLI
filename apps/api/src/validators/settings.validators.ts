import { z } from 'zod';

const urlOrEmpty = z.string().url().or(z.literal('')).optional();

export const updateSettingsSchema = z.object({
  websiteName: z.string().min(1).max(200).trim().optional(),
  websiteDescription: z.string().max(500).optional(),
  contactEmail: z.string().email().or(z.literal('')).optional(),
  socials: z
    .object({
      instagram: urlOrEmpty,
      twitter: urlOrEmpty,
      linkedin: urlOrEmpty,
      youtube: urlOrEmpty,
      website: urlOrEmpty,
    })
    .optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  smtp: z
    .object({
      from: z.string().min(1).max(200).optional(),
      host: z.string().min(1).max(200).optional(),
      port: z.number().int().min(1).max(65535).optional(),
      user: z.string().max(200).optional(),
    })
    .optional(),
  googleDrive: z
    .object({
      serviceAccountEmail: z.string().email().or(z.literal('')).optional(),
    })
    .optional(),
  cloudinary: z
    .object({
      cloudName: z.string().max(200).optional(),
    })
    .optional(),
  homepage: z
    .object({
      heroTitle: z.string().min(1).max(200).optional(),
      heroSubtitle: z.string().max(500).optional(),
      heroImageUrl: urlOrEmpty,
    })
    .optional(),
  maintenance: z
    .object({
      enabled: z.boolean().optional(),
      message: z.string().max(500).optional(),
    })
    .optional(),
  featureToggles: z
    .object({
      requestsEnabled: z.boolean().optional(),
      albumsEnabled: z.boolean().optional(),
      galleryEnabled: z.boolean().optional(),
      teamEnabled: z.boolean().optional(),
    })
    .optional(),
});
