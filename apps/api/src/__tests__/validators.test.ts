import { describe, it, expect } from 'vitest';
import './_setup';
import { createRequestSchema, updateRequestSchema, rejectRequestSchema, idParamSchema } from '../validators/request.validators';
import { createBatchSchema, addMemberSchema } from '../validators/team.validators';
import { createAlbumSchema, updateAlbumSchema } from '../validators/album.validators';
import { updateSettingsSchema } from '../validators/settings.validators';
import { listLogsQuerySchema } from '../validators/logs.validators';

describe('validators/request.validators', () => {
  const validCreate = {
    title: 'Annual Fest Day 1',
    description: 'Coverage of cultural events',
    eventDate: new Date(Date.now() + 86400_000).toISOString(),
    venue: 'Open-air auditorium',
    expectedAttendees: 300,
    contactPhone: '+91 98765 43210',
    notes: 'Bring wide-angle lens',
  };

  it('accepts a valid request', () => {
    const r = createRequestSchema.safeParse(validCreate);
    expect(r.success).toBe(true);
  });

  it('rejects too-short titles', () => {
    const r = createRequestSchema.safeParse({ ...validCreate, title: 'ab' });
    expect(r.success).toBe(false);
  });

  it('rejects bad phone numbers', () => {
    const r = createRequestSchema.safeParse({ ...validCreate, contactPhone: 'not-a-phone' });
    expect(r.success).toBe(false);
  });

  it('partial update schema works', () => {
    const r = updateRequestSchema.safeParse({ title: 'Updated title' });
    expect(r.success).toBe(true);
  });

  it('reject schema requires a reason', () => {
    const ok = rejectRequestSchema.safeParse({ reason: 'date conflict' });
    expect(ok.success).toBe(true);
    const bad = rejectRequestSchema.safeParse({ reason: '' });
    expect(bad.success).toBe(false);
  });

  it('id param rejects non-objectids', () => {
    const ok = idParamSchema.safeParse({ id: '507f1f77bcf86cd799439011' });
    expect(ok.success).toBe(true);
    const bad = idParamSchema.safeParse({ id: 'nope' });
    expect(bad.success).toBe(false);
  });
});

describe('validators/team.validators', () => {
  it('createBatch requires name and year', () => {
    const ok = createBatchSchema.safeParse({ batchName: '2024-25', batchYear: '2024-2025' });
    expect(ok.success).toBe(true);
    const bad = createBatchSchema.safeParse({ batchName: '' });
    expect(bad.success).toBe(false);
  });

  it('addMember requires name and designation', () => {
    const ok = addMemberSchema.safeParse({
      name: 'Alice',
      designation: 'President',
      contributions: ['led fest', 'mentoring'],
    });
    expect(ok.success).toBe(true);
    const bad = addMemberSchema.safeParse({ name: '', designation: '' });
    expect(bad.success).toBe(false);
  });
});

describe('validators/album.validators', () => {
  const validAlbum = {
    title: 'Annual Fest 2026',
    description: 'all photos',
    year: 2026,
    driveFolderUrl: 'https://drive.google.com/drive/folders/abc123def456ghi789jkl',
  };

  it('accepts valid album', () => {
    const r = createAlbumSchema.safeParse(validAlbum);
    expect(r.success).toBe(true);
  });

  it('rejects out-of-range years', () => {
    const r = createAlbumSchema.safeParse({ ...validAlbum, year: 1999 });
    expect(r.success).toBe(false);
    const r2 = createAlbumSchema.safeParse({ ...validAlbum, year: 2200 });
    expect(r2.success).toBe(false);
  });

  it('updateAlbum allows partials', () => {
    const r = updateAlbumSchema.safeParse({ title: 'New title' });
    expect(r.success).toBe(true);
  });
});

describe('validators/settings.validators', () => {
  it('accepts theme toggle', () => {
    const r = updateSettingsSchema.safeParse({ theme: 'dark' });
    expect(r.success).toBe(true);
  });

  it('rejects invalid theme', () => {
    const r = updateSettingsSchema.safeParse({ theme: 'rainbow' });
    expect(r.success).toBe(false);
  });

  it('accepts feature toggles', () => {
    const r = updateSettingsSchema.safeParse({
      featureToggles: { requestsEnabled: false, galleryEnabled: true },
    });
    expect(r.success).toBe(true);
  });
});

describe('validators/logs.validators', () => {
  it('parses pagination and filters', () => {
    const r = listLogsQuerySchema.safeParse({
      page: '2',
      limit: '50',
      result: 'failure',
      from: '2026-01-01',
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(2);
      expect(r.data.limit).toBe(50);
      expect(r.data.result).toBe('failure');
    }
  });

  it('rejects out-of-range limit', () => {
    const r = listLogsQuerySchema.safeParse({ limit: '999' });
    expect(r.success).toBe(false);
  });
});
