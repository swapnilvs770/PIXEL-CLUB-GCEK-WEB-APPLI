import { Request, Response } from 'express';
import { User } from '../models/User';
import { PhotographyRequest, REQUEST_STATUSES } from '../models/PhotographyRequest';
import { Album, ALBUM_STATUSES } from '../models/Album';
import { Photo } from '../models/Photo';
import { Notification } from '../models/Notification';
import { UploadJob } from '../models/UploadJob';
import { Log } from '../models/Log';
import { asyncHandler } from '../utils/asyncHandler';
import { sendOk } from '../utils/ApiResponse';

const DAY = 24 * 60 * 60 * 1000;
function daysAgo(n: number): Date {
  return new Date(Date.now() - n * DAY);
}

export const getOverview = asyncHandler(async (_req: Request, res: Response) => {
  const [
    usersByStatus,
    requestsByStatus,
    albumsByStatus,
    photosTotal,
    photosUploaded,
    photosFailed,
    notificationsTotal,
    jobsByStatus,
    recentLogins,
    recentRequests,
    recentAlbums,
    actionBreakdown,
  ] = await Promise.all([
    User.aggregate<{ _id: string; count: number }>([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    PhotographyRequest.aggregate<{ _id: string; count: number }>([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Album.aggregate<{ _id: string; count: number }>([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Photo.countDocuments({}),
    Photo.countDocuments({ status: 'uploaded' }),
    Photo.countDocuments({ status: 'failed' }),
    Notification.countDocuments({}),
    UploadJob.aggregate<{ _id: string; count: number }>([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Log.countDocuments({ action: 'auth.login', createdAt: { $gte: daysAgo(7) } }),
    PhotographyRequest.countDocuments({ createdAt: { $gte: daysAgo(7) } }),
    Album.countDocuments({ status: 'published', publishedAt: { $gte: daysAgo(30) } }),
    Log.aggregate<{ _id: string; count: number; failures: number }>([
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          failures: {
            $sum: { $cond: [{ $eq: ['$result', 'failure'] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]),
  ]);

  sendOk(res, {
    users: {
      total: usersByStatus.reduce((s, r) => s + r.count, 0),
      byStatus: mapToObject(usersByStatus),
      admins: await User.countDocuments({ role: 'admin' }),
    },
    requests: {
      total: requestsByStatus.reduce((s, r) => s + r.count, 0),
      byStatus: ensureAllStatuses(mapToObject(requestsByStatus), REQUEST_STATUSES),
      last7Days: recentRequests,
    },
    albums: {
      total: albumsByStatus.reduce((s, r) => s + r.count, 0),
      byStatus: ensureAllStatuses(mapToObject(albumsByStatus), ALBUM_STATUSES),
      publishedLast30Days: recentAlbums,
    },
    photos: {
      total: photosTotal,
      uploaded: photosUploaded,
      failed: photosFailed,
    },
    notifications: {
      total: notificationsTotal,
    },
    uploadJobs: {
      byStatus: mapToObject(jobsByStatus),
    },
    activity: {
      loginsLast7Days: recentLogins,
      topActions: actionBreakdown.map((a) => ({
        action: a._id,
        count: a.count,
        failures: a.failures,
      })),
    },
  });
});

export const requestsTimeline = asyncHandler(async (req: Request, res: Response) => {
  const days = Math.min(180, Math.max(1, parseInt((req.query.days as string) ?? '30', 10) || 30));
  const since = daysAgo(days);

  const rows = await PhotographyRequest.aggregate<{ _id: string; count: number }>([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  sendOk(res, { days, points: rows.map((r) => ({ date: r._id, count: r.count })) });
});

export const albumsByYear = asyncHandler(async (_req: Request, res: Response) => {
  const rows = await Album.aggregate<{ _id: number; total: number; published: number }>([
    {
      $group: {
        _id: '$year',
        total: { $sum: 1 },
        published: {
          $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] },
        },
      },
    },
    { $sort: { _id: -1 } },
  ]);
  sendOk(res, rows.map((r) => ({ year: r._id, total: r.total, published: r.published })));
});

function mapToObject(rows: { _id: string; count: number }[]): Record<string, number> {
  return rows.reduce<Record<string, number>>((acc, r) => {
    acc[r._id] = r.count;
    return acc;
  }, {});
}

function ensureAllStatuses(
  obj: Record<string, number>,
  statuses: readonly string[]
): Record<string, number> {
  for (const s of statuses) {
    if (!(s in obj)) obj[s] = 0;
  }
  return obj;
}
