import { Link } from 'react-router-dom';
import { Image, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminAlbums, AlbumStatus } from '@/api/albums';
import { cn, formatDateTime } from '@/lib/utils';

const statusFilters: { label: string; value: AlbumStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
];

function statusBadge(status: AlbumStatus) {
  const styles: Record<AlbumStatus, string> = {
    draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    archived: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  };
  return (
    <span
      className={cn(
        'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
        styles[status]
      )}
    >
      {status}
    </span>
  );
}

export default function AdminAlbumsPage() {
  const [status, setStatus] = useState<AlbumStatus | 'all'>('all');
  const params = status === 'all' ? {} : { status };
  const { data, isLoading, isError, error } = useAdminAlbums(params);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Image className="h-7 w-7" /> Albums
          </h1>
          <p className="text-muted-foreground">
            Import Drive folders, track uploads, and publish albums.
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/albums/new">
            <Plus className="mr-1 h-4 w-4" /> New album
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {statusFilters.map((f) => (
          <Button
            key={f.value}
            variant={status === f.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatus(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {isError && (
        <p className="text-sm text-destructive">
          Failed to load: {(error as Error)?.message ?? 'unknown error'}
        </p>
      )}

      {data && data.data.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No albums yet. Click "New album" to import a Drive folder.
          </CardContent>
        </Card>
      )}

      {data && data.data.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map((a) => (
            <Card key={a.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="line-clamp-2 text-base">{a.title}</CardTitle>
                  {statusBadge(a.status)}
                </div>
                <CardDescription>Year {a.year}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  {a.uploadedPhotos}/{a.totalPhotos} uploaded
                  {a.failedPhotos > 0 && ` · ${a.failedPhotos} failed`}
                </p>
                {a.publishedAt && (
                  <p className="text-xs text-muted-foreground">
                    Published {formatDateTime(a.publishedAt)}
                  </p>
                )}
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to={`/admin/albums/${a.id}`}>Manage</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
