import { Types } from 'mongoose';
import { TeamBatch } from '../models/TeamBatch';
import { User } from '../models/User';
import { logger } from '../config/logger';

/**
 * Synchronize the given batch's members with current admin accounts:
 *  - Adds any admin not already represented by a member.userId
 *  - Marks existing admin-linked members as inactive by removing userId only if the admin
 *    was demoted (we keep their entry for historical record but unset userId)
 *
 * The spec says: "Team is synchronized with Admin accounts" and
 * "Never overwrite previous batches" — so we ONLY mutate the active/current batch.
 */
export async function syncBatchWithAdmins(batchId: string): Promise<void> {
  const batch = await TeamBatch.findById(batchId);
  if (!batch) throw new Error('Batch not found');

  const admins = await User.find({ role: 'admin', status: 'approved' })
    .select('_id name email avatarUrl')
    .lean();

  const adminIds = new Set(admins.map((a) => a._id.toString()));
  const presentAdminIds = new Set(
    batch.members
      .map((m) => m.userId?.toString())
      .filter((id): id is string => Boolean(id))
  );

  let changed = false;

  // Add missing admins
  for (const admin of admins) {
    if (!presentAdminIds.has(admin._id.toString())) {
      batch.members.push({
        name: admin.name,
        photoUrl: admin.avatarUrl ?? null,
        designation: 'Admin',
        bio: '',
        contributions: [],
        socials: {},
        displayOrder: batch.members.length,
        userId: admin._id,
      });
      changed = true;
    }
  }

  // For demoted admins, keep their row but clear userId so they stay as historical entry
  for (const m of batch.members) {
    if (m.userId && !adminIds.has(m.userId.toString())) {
      m.userId = null;
      changed = true;
    }
  }

  if (changed) {
    await batch.save();
    logger.info({ batchId, members: batch.members.length }, 'Synced batch with admins');
  }
}
