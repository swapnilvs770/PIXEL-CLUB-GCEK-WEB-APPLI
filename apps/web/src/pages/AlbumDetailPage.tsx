import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  usePublishedAlbum,
  usePublishedAlbumPhotos,
} from '@/api/albums';
import { formatDate, formatDateTime } from '@/lib/utils';
import { apiClient } from '@/api/client';

export default function AlbumDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: album, isLoading: albumLoading } = usePublishedAlbum(id);
  const { data: photos, isLoading: photosLoading } = usePublishedAlbumPhotos(id, {
    limit: 200,
  });
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const logDownload = async (photoId: string) => {
    try {
      await apiClient.post(`/albums/${id}/photos/${photoId}/download-log`);
    } catch {
      /* best-effort */
    }
  };

  if (albumLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }
  if (!album) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Album not found.
        </CardContent>
      </Card>
    );
  }

  const photoList = photos?.data ?? [];
  const selected = selectedIdx != null ? photoList[selectedIdx] : null;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/gallery">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to gallery
        </Link>
      </Button>

      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <ImageIcon className="h-7 w-7" /> {album.title}
        </h1>
        <p className="text-muted-foreground">
          Year {album.year} · {album.uploadedPhotos} photo
          {album.uploadedPhotos === 1 ? '' : 's'}
          {album.eventDate && ` · ${formatDate(album.eventDate)}`}
          {album.publishedAt && ` · Published ${formatDate(album.publishedAt)}`}
        </p>
        {album.description && (
          <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
            {album.description}
          </p>
        )}
      </div>

      {photosLoading && <p className="text-sm text-muted-foreground">Loading photos…</p>}

      {photoList.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {photoList.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className="group relative aspect-square overflow-hidden rounded-md bg-secondary focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {p.cloudinaryThumbnailUrl || p.cloudinaryUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={p.cloudinaryThumbnailUrl ?? p.cloudinaryUrl!}
                  alt={p.driveFileName}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <ImageIcon className="h-8 w-8" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedIdx(null)}
        >
          <div
            className="relative max-h-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selected.cloudinaryUrl ?? ''}
              alt={selected.driveFileName}
              className="max-h-[80vh] w-auto rounded-md object-contain"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-white">
              <div>
                <p className="font-medium">{selected.driveFileName}</p>
                {selected.uploadedAt && (
                  <p className="text-xs text-white/60">
                    Uploaded {formatDateTime(selected.uploadedAt)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    logDownload(selected.id);
                    window.open(selected.originalDownloadUrl, '_blank', 'noopener');
                  }}
                >
                  <Download className="mr-1 h-4 w-4" /> Original (Drive)
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedIdx(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
