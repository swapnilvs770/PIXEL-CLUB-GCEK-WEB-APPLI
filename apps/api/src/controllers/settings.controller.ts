import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Settings, SETTINGS_ID } from '../models/Settings';
import { asyncHandler } from '../utils/asyncHandler';
import { sendOk } from '../utils/ApiResponse';
import { logAction } from '../services/log.service';

function toObjectId(id: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error('Invalid id');
  }
  return new Types.ObjectId(id);
}

function sanitize(s: any) {
  // Public-facing projection: never expose smtp.user (besides what's in env),
  // and never expose sensitive bits that might leak via object spread.
  return {
    websiteName: s.websiteName,
    websiteDescription: s.websiteDescription,
    contactEmail: s.contactEmail,
    socials: s.socials,
    theme: s.theme,
    homepage: s.homepage,
    maintenance: s.maintenance,
    featureToggles: s.featureToggles,
  };
}

/**
 * Public-safe settings (visible to all users, even unauthenticated).
 * Used by the frontend for theme/homepage/maintenance mode.
 */
export const getPublicSettings = asyncHandler(async (_req: Request, res: Response) => {
  const s = await Settings.findById(SETTINGS_ID).lean();
  if (!s) {
    // Return defaults if no doc exists yet
    sendOk(res, {
      websiteName: 'Pixel Club Management Portal',
      websiteDescription: '',
      contactEmail: '',
      socials: {},
      theme: 'system',
      homepage: {
        heroTitle: 'Pixel Club, GCE Karad',
        heroSubtitle: 'Photography, storytelling, and memories.',
        heroImageUrl: null,
      },
      maintenance: { enabled: false, message: '' },
      featureToggles: {
        requestsEnabled: true,
        albumsEnabled: true,
        galleryEnabled: true,
        teamEnabled: true,
      },
    });
    return;
  }
  sendOk(res, sanitize(s));
});

/**
 * Admin-only: full settings doc, including smtp/featureToggles.
 */
export const adminGetSettings = asyncHandler(async (_req: Request, res: Response) => {
  const s = await Settings.findById(SETTINGS_ID).lean();
  if (!s) {
    sendOk(res, { _id: SETTINGS_ID });
    return;
  }
  sendOk(res, s);
});

export const adminUpdateSettings = asyncHandler(async (req: Request, res: Response) => {
  const update = req.body as Record<string, unknown>;

  // Convert nested undefineds to no-op (don't blow away existing values unintentionally)
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(update)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      clean[k] = { ...(v as Record<string, unknown>) };
    } else {
      clean[k] = v;
    }
  }

  const s = await Settings.findByIdAndUpdate(
    SETTINGS_ID,
    { $set: clean, $setOnInsert: { _id: SETTINGS_ID } },
    { new: true, upsert: true, runValidators: true }
  );

  if (req.userId) {
    s.updatedBy = toObjectId(req.userId);
    await s.save();
  }

  await logAction(
    {
      userId: req.userId,
      action: 'settings.update',
      result: 'success',
      meta: { keys: Object.keys(clean) },
    },
    req
  );

  sendOk(res, s.toObject());
});
