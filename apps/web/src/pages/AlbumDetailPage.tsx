import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Download,
  Image as ImageIcon,
  Sparkles,
  X,
  Aperture,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardGlow } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { usePublishedAlbum, usePublishedAlbumPhotos } from '@/api/albums';
import { apiClient } from '@/api/client';
import { AuroraBackground } from '@/components/motion/aurora-background';
import { Spotlight } from '@/components/motion/spotlight';
import { AnimatedText } from '@/components/motion/animated-text';
import { dur, ease, fadeUp, stagger } from '@/lib/motion';
import { formatDate, formatDateTime } from '@/lib/utils';

const GRADIENTS = [
  'from-blue-500/40 via-indigo-500/40 to-purple-500/40',
  'from-purple-500/40 via-fuchsia-500/40 to-pink-500/40',
  'from-amber-500/40 via-orange-500/40 to-rose-500/40',
  'from-emerald-500/40 via-teal-500/40 to-cyan-500/40',
  'from-cyan-500/40 via-sky-500/40 to-blue-500/40',
  'from-violet-500/40 via-purple-500/40 to-fuchsia-500/40',
];

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
    return (
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 -my-6 sm:-my-6 lg:-my-8 px-4 sm:px-6 lg:px-8 py-6 sm:py-6 lg:py-8">
        <AuroraBackground />
        <div className="relative">
          <Skeleton className="mb-4 h-6 w-32" />
          <Skeleton className="mb-2 h-10 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 -my-6 sm:-my-6 lg:-my-8 px-4 sm:px-6 lg:px-8 py-6 sm:py-6 lg:py-8">
        <AuroraBackground />
        <div className="relative flex flex-col items-center justify-center gap-4 py-32 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 ring-1 ring-white/10">
            <ImageIcon className="h-6 w-6 text-white/80" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold">Album not found</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              It may have been unpublished or the link is incorrect.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/gallery">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to gallery
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const photoList = photos?.data ?? [];
  const selected = selectedIdx != null ? photoList[selectedIdx] : null;

  return (
    <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 -my-6 sm:-my-6 lg:-my-8 px-4 sm:px-6 lg:px-8 py-6 sm:py-6 lg:py-8">
      <AuroraBackground />
      <Spotlight />

      <div className="relative">
        {/* Breadcrumb */}
        <Link
          to="/gallery"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Back to gallery
        </Link>

        {/* Cinematic hero */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger(0.08, 0)}
          className="relative mt-6 overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 p-6 shadow-[0_30px_120px_-30px_rgba(99,102,241,0.4)] backdrop-blur-xl sm:p-10"
        >
          <div className="absolute inset-0 bg-radial-highlight opacity-80" aria-hidden />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 flex-1">
              <motion.div variants={fadeUp} className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="gradient">
                  <Sparkles className="h-3 w-3" /> Year {album.year}
                </Badge>
                <Badge variant="default">
                  <ImageIcon className="h-3 w-3" /> {album.uploadedPhotos} photos
                </Badge>
                {album.eventDate && (
                  <Badge variant="default">
                    <Calendar className="h-3 w-3" /> {formatDate(album.eventDate)}
                  </Badge>
                )}
              </motion.div>
              <motion.h1
                variants={fadeUp}
                className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl"
              >
                <AnimatedText variant="brand">{album.title}</AnimatedText>
              </motion.h1>
              {album.description && (
                <motion.p
                  variants={fadeUp}
                  className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base"
                >
                  {album.description}
                </motion.p>
              )}
              {album.publishedAt && (
                <motion.p
                  variants={fadeUp}
                  className="mt-3 text-xs text-muted-foreground"
                >
                  Published {formatDateTime(album.publishedAt)}
                </motion.p>
              )}
            </div>
            {photoList.length > 0 && (
              <motion.div variants={fadeUp} className="shrink-0">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setSelectedIdx(0)}
                >
                  <Aperture className="h-4 w-4" /> Open viewer
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Photo grid */}
        <div className="mt-8">
          {photosLoading && <PhotoGridSkeleton />}

          {photoList.length === 0 && !photosLoading && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-20 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 ring-1 ring-white/10">
                <ImageIcon className="h-5 w-5 text-white/80" />
              </div>
              <p className="text-sm text-muted-foreground">
                This album doesn't have any photos yet.
              </p>
            </div>
          )}

          {photoList.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {photoList.map((p, idx) => (
                <motion.button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedIdx(idx)}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.02, duration: dur.base, ease }}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                >
                  {p.cloudinaryThumbnailUrl || p.cloudinaryUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.cloudinaryThumbnailUrl ?? p.cloudinaryUrl!}
                      alt={p.driveFileName}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 will-change-transform group-hover:scale-110"
                    />
                  ) : (
                    <div
                      className={`h-full w-full bg-gradient-to-br ${
                        GRADIENTS[idx % GRADIENTS.length]
                      }`}
                    >
                      <div className="flex h-full items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-white/40" />
                      </div>
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl"
              onClick={() => setSelectedIdx(null)}
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                transition={{ duration: 0.2, ease }}
                className="relative max-h-full max-w-5xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selected.cloudinaryUrl ?? ''}
                  alt={selected.driveFileName}
                  className="max-h-[80vh] w-auto rounded-xl object-contain shadow-[0_30px_120px_-20px_rgba(0,0,0,0.8)]"
                />
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-white">
                  <div>
                    <p className="font-medium">{selected.driveFileName}</p>
                    {selected.uploadedAt && (
                      <p className="text-xs text-white/60">
                        Uploaded {formatDateTime(selected.uploadedAt)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedIdx != null && selectedIdx > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedIdx(selectedIdx - 1)}
                      >
                        ← Prev
                      </Button>
                    )}
                    {selectedIdx != null && selectedIdx < photoList.length - 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedIdx(selectedIdx + 1)}
                      >
                        Next →
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        logDownload(selected.id);
                        window.open(selected.originalDownloadUrl, '_blank', 'noopener');
                      }}
                    >
                      <Download className="h-3.5 w-3.5" /> Original (Drive)
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedIdx(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PhotoGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: 15 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square w-full rounded-xl" />
      ))}
    </div>
  );
}
