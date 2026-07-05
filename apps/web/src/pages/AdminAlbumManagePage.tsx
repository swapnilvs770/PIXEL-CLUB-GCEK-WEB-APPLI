import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Image as ImageIcon,
  Pause,
  Play,
  RotateCcw,
  Trash2,
  XCircle,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useAdminAlbum,
  useDeleteAlbum,
  usePublishAlbum,
  useStartImport,
  useUnpublishAlbum,
} from '@/api/albums';
import {
  useCancelJob,
  useJob,
  useJobProgress,
  usePauseJob,
  useResumeJob,
  useRetryJob,
  useJobs,
} from '@/api/uploadJobs';
import { cn, formatDateTime } from '@/lib/utils';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatEta(seconds: number | undefined): string {
  if (!seconds || seconds <= 0) return '—';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

export default function AdminAlbumManagePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: album, isLoading, isError, error } = useAdminAlbum(id);
  const { data: jobs } = useJobs();
  const startImport = useStartImport();
  const publish = usePublishAlbum();
  const unpublish = useUnpublishAlbum();
  const del = useDeleteAlbum();
  const pause = usePauseJob();
  const cancel = useCancelJob();

  // Find the most recent job for this album
  const job = jobs?.find((j) => j.albumId === id);
  const jobId = job?._id;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/admin/albums">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to albums
        </Link>
      </Button>

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {isError && (
        <p className="text-sm text-destructive">
          Failed to load album: {(error as Error)?.message ?? 'unknown error'}
        </p>
      )}

      {album && (
        <>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
                <ImageIcon className="h-7 w-7" /> {album.title}
              </h1>
              <p className="text-muted-foreground">
                Year {album.year} · {album.uploadedPhotos}/{album.totalPhotos}{' '}
                uploaded{album.failedPhotos > 0 && ` · ${album.failedPhotos} failed`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {album.status !== 'published' && (
                <Button
                  onClick={() => publish.mutate(album.id)}
                  disabled={
                    publish.isPending ||
                    album.totalPhotos === 0 ||
                    album.uploadedPhotos === 0
                  }
                  title={
                    album.uploadedPhotos === 0
                      ? 'No photos uploaded yet'
                      : undefined
                  }
                >
                  <Upload className="mr-1 h-4 w-4" /> Publish
                </Button>
              )}
              {album.status === 'published' && (
                <Button
                  variant="outline"
                  onClick={() => unpublish.mutate(album.id)}
                  disabled={unpublish.isPending}
                >
                  Unpublish
                </Button>
              )}
              <Button
                variant="destructive"
                onClick={async () => {
                  if (
                    !confirm(
                      `Delete "${album.title}"? This removes all photos and jobs. Cannot be undone.`
                    )
                  )
                    return;
                  await del.mutateAsync(album.id);
                  navigate('/admin/albums', { replace: true });
                }}
                disabled={del.isPending}
              >
                <Trash2 className="mr-1 h-4 w-4" /> Delete
              </Button>
            </div>
          </div>

          {jobId && <JobProgressPanel jobId={jobId} />}
          <ImportControls
            albumId={album.id}
            status={album.status}
            totalPhotos={album.totalPhotos}
            uploadedPhotos={album.uploadedPhotos}
            failedPhotos={album.failedPhotos}
            onStart={() => startImport.mutate(album.id)}
            onPause={() => pause.mutate()}
            onCancel={() => cancel.mutate()}
            starting={startImport.isPending}
            pausing={pause.isPending}
            cancelling={cancel.isPending}
          />
          {jobId && <JobLogsPanel jobId={jobId} />}
        </>
      )}
    </div>
  );
}

function ImportControls(props: {
  albumId: string;
  status: string;
  totalPhotos: number;
  uploadedPhotos: number;
  failedPhotos: number;
  onStart: () => void;
  onPause: () => void;
  onCancel: () => void;
  starting: boolean;
  pausing: boolean;
  cancelling: boolean;
}) {
  const { data: jobs } = useJobs();
  const resume = useResumeJob();
  const retry = useRetryJob();

  const job = jobs?.find((j) => j.albumId === props.albumId);
  const status = job?.status;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Upload engine</CardTitle>
        <CardDescription>
          Per spec, only one upload job runs at a time in v1.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2">
        {(!job || status === 'completed' || status === 'cancelled' || status === 'failed') && (
          <Button onClick={props.onStart} disabled={props.starting}>
            <Upload className="mr-1 h-4 w-4" />
            {job ? 'Re-run import' : 'Start import'}
          </Button>
        )}
        {status === 'running' && (
          <Button variant="outline" onClick={props.onPause} disabled={props.pausing}>
            <Pause className="mr-1 h-4 w-4" /> Pause
          </Button>
        )}
        {status === 'paused' && job && (
          <Button onClick={() => resume.mutate(job._id)} disabled={resume.isPending}>
            <Play className="mr-1 h-4 w-4" /> Resume
          </Button>
        )}
        {(status === 'running' || status === 'paused') && (
          <Button
            variant="destructive"
            onClick={props.onCancel}
            disabled={props.cancelling}
          >
            <XCircle className="mr-1 h-4 w-4" /> Cancel
          </Button>
        )}
        {props.failedPhotos > 0 && job && (
          <Button
            variant="outline"
            onClick={() => retry.mutate(job._id)}
            disabled={retry.isPending}
          >
            <RotateCcw className="mr-1 h-4 w-4" /> Retry failed ({props.failedPhotos})
          </Button>
        )}
        <span className="ml-2 text-sm text-muted-foreground">
          Status: <span className="font-medium">{status ?? 'idle'}</span>
        </span>
      </CardContent>
    </Card>
  );
}

function JobProgressPanel({ jobId }: { jobId: string }) {
  const { data: job } = useJob(jobId);
  const live = useJobProgress(jobId);

  // Merge live data over polled data
  const totalPhotos = live?.totalPhotos ?? job?.totalPhotos ?? 0;
  const processedPhotos = live?.processedPhotos ?? job?.processedPhotos ?? 0;
  const uploadedPhotos = live?.uploadedPhotos ?? job?.uploadedPhotos ?? 0;
  const failedPhotos = live?.failedPhotos ?? job?.failedPhotos ?? 0;
  const currentFileName =
    live?.currentFileName ?? live?.fileName ?? job?.currentFileName;
  const averageSpeed = live?.averageSpeed ?? job?.averageSpeed ?? 0;
  const etaSeconds = live?.etaSeconds ?? job?.etaSeconds;
  const status = (live?.status as string | undefined) ?? job?.status ?? 'unknown';

  const percent = totalPhotos > 0 ? Math.round((processedPhotos / totalPhotos) * 100) : 0;
  const remaining = Math.max(totalPhotos - processedPhotos, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Progress</CardTitle>
        <CardDescription>
          Live progress via Socket.IO. Updates without page refresh.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="capitalize">{status}</span>
          <span>
            {processedPhotos}/{totalPhotos} processed ({percent}%)
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={cn(
              'h-full transition-all',
              status === 'failed' ? 'bg-destructive' : 'bg-primary'
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <Stat label="Uploaded" value={String(uploadedPhotos)} />
          <Stat label="Failed" value={String(failedPhotos)} />
          <Stat label="Remaining" value={String(remaining)} />
          <Stat label="Speed" value={formatBytes(averageSpeed) + '/s'} />
          <Stat label="ETA" value={formatEta(etaSeconds)} />
          <Stat
            label="Started"
            value={job?.startedAt ? formatDateTime(job.startedAt) : '—'}
            className="col-span-2 sm:col-span-2"
          />
        </div>
        {currentFileName && (
          <p className="truncate rounded-md border bg-secondary/40 p-2 text-xs font-mono">
            {currentFileName}
          </p>
        )}
        {job?.error && (
          <p className="text-sm text-destructive">Error: {job.error}</p>
        )}
      </CardContent>
    </Card>
  );
}

function JobLogsPanel({ jobId }: { jobId: string }) {
  const { data: job } = useJob(jobId);
  const live = useJobProgress(jobId);
  const [extraLogs, setExtraLogs] = useState<typeof live extends infer T ? any : never>([]);

  useEffect(() => {
    if (live?.entry) setExtraLogs((prev: any[]) => [...prev, live.entry].slice(-200));
  }, [live?.entry]);

  const logs = [...(job?.logs ?? []), ...extraLogs];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Live logs</CardTitle>
        <CardDescription>
          Last {logs.length} entries. Auto-trims to 500 in the database.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-h-80 overflow-auto rounded-md border bg-zinc-950 p-3 font-mono text-xs text-zinc-100">
          {logs.length === 0 && <p className="text-zinc-500">No logs yet.</p>}
          {logs.map((l: any, i: number) => (
            <div key={i} className="flex gap-2">
              <span className="text-zinc-500">
                {new Date(l.ts).toLocaleTimeString()}
              </span>
              <span
                className={cn(
                  'uppercase',
                  l.level === 'error' && 'text-red-400',
                  l.level === 'warn' && 'text-yellow-400',
                  l.level === 'info' && 'text-sky-300'
                )}
              >
                [{l.level}]
              </span>
              <span className="whitespace-pre-wrap break-all">{l.message}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn('rounded-md border bg-secondary/40 p-2', className)}>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 truncate font-medium">{value}</p>
    </div>
  );
}
