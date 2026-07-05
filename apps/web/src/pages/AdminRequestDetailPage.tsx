import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Image as ImageIcon,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useAdminRequest,
  useAdminRequestAction,
} from '@/api/requests';
import { formatDateTime, cn } from '@/lib/utils';

export default function AdminRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: r, isLoading, isError, error } = useAdminRequest(id);
  const action = useAdminRequestAction();

  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [linkAlbumId, setLinkAlbumId] = useState('');

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (isError)
    return (
      <p className="text-sm text-destructive">
        Failed to load: {(error as Error)?.message ?? 'unknown error'}
      </p>
    );
  if (!r) return <p>Request not found.</p>;

  const doingId = action.variables?.id;
  const isBusy = action.isPending && doingId === r.id;

  const approve = async () => {
    await action.mutateAsync({ id: r.id, action: 'approve' });
  };

  const reject = async () => {
    if (!rejectReason.trim()) return;
    await action.mutateAsync({
      id: r.id,
      action: 'reject',
      payload: { reason: rejectReason.trim() },
    });
    setShowReject(false);
    setRejectReason('');
  };

  const markPhotoComplete = async () => {
    await action.mutateAsync({ id: r.id, action: 'photography-completed' });
  };

  const linkAlbum = async () => {
    if (!linkAlbumId.trim()) return;
    await action.mutateAsync({
      id: r.id,
      action: 'link-album',
      payload: { albumId: linkAlbumId.trim() },
    });
    setLinkAlbumId('');
  };

  const complete = async () => {
    await action.mutateAsync({ id: r.id, action: 'complete' });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/admin/requests">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to all requests
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{r.title}</CardTitle>
          <CardDescription>
            Submitted by {r.user?.name ?? 'Unknown'} ({r.user?.email ?? ''}) ·{' '}
            {formatDateTime(r.createdAt)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <StatusBadge status={r.status} />
          {r.status === 'rejected' && r.rejectionReason && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              Rejection reason: {r.rejectionReason}
            </p>
          )}

          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <KV label="Event date" value={formatDateTime(r.eventDate)} />
            <KV label="Venue" value={r.venue} />
            {r.expectedAttendees != null && (
              <KV label="Expected attendees" value={String(r.expectedAttendees)} />
            )}
            {r.contactPhone && <KV label="Contact phone" value={r.contactPhone} />}
            {r.albumId && <KV label="Linked album" value={r.albumId} />}
            {r.approvedAt && <KV label="Approved at" value={formatDateTime(r.approvedAt)} />}
            {r.rejectedAt && <KV label="Rejected at" value={formatDateTime(r.rejectedAt)} />}
            {r.completedAt && (
              <KV label="Completed at" value={formatDateTime(r.completedAt)} />
            )}
          </dl>

          {r.description && (
            <div>
              <h3 className="text-sm font-medium">Description</h3>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                {r.description}
              </p>
            </div>
          )}
          {r.notes && (
            <div>
              <h3 className="text-sm font-medium">Notes</h3>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                {r.notes}
              </p>
            </div>
          )}

          {/* ─── Admin actions ─── */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="text-sm font-medium">Actions</h3>

            {r.status === 'pending' && (
              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={approve} disabled={isBusy}>
                  <Check className="mr-1 h-4 w-4" /> Approve
                </Button>
                {!showReject ? (
                  <Button
                    variant="destructive"
                    onClick={() => setShowReject(true)}
                    disabled={isBusy}
                  >
                    <XCircle className="mr-1 h-4 w-4" /> Reject
                  </Button>
                ) : (
                  <div className="flex w-full items-center gap-2 sm:w-auto">
                    <input
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Reason for rejection"
                      className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 sm:w-64"
                    />
                    <Button
                      variant="destructive"
                      onClick={reject}
                      disabled={!rejectReason.trim() || isBusy}
                    >
                      Confirm reject
                    </Button>
                    <Button variant="ghost" onClick={() => setShowReject(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            )}

            {r.status === 'approved' && (
              <Button onClick={markPhotoComplete} disabled={isBusy}>
                <ImageIcon className="mr-1 h-4 w-4" /> Mark photography completed
              </Button>
            )}

            {(r.status === 'approved' || r.status === 'photography_completed') && (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={linkAlbumId}
                  onChange={(e) => setLinkAlbumId(e.target.value)}
                  placeholder="Album ObjectId"
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 sm:w-72"
                />
                <Button onClick={linkAlbum} disabled={!linkAlbumId.trim() || isBusy}>
                  Link album
                </Button>
                {r.albumId && (
                  <span className="text-xs text-muted-foreground">
                    Linked: {r.albumId}
                  </span>
                )}
              </div>
            )}

            {r.status === 'photography_completed' && (
              <Button
                onClick={complete}
                disabled={isBusy || !r.albumId}
                title={!r.albumId ? 'Link an album first' : undefined}
              >
                <CheckCircle2 className="mr-1 h-4 w-4" /> Mark request complete
              </Button>
            )}

            {action.isError && (
              <p className="text-sm text-destructive">
                {(action.error as Error)?.message ?? 'Action failed'}
              </p>
            )}

            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    photography_completed:
      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    completed:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  };
  return (
    <span
      className={cn(
        'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
        styles[status] ?? ''
      )}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}
