import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ImageIcon, Search, Calendar, Image as ImageIcon2, Sparkles } from 'lucide-react';
import { usePublishedAlbums, usePublishedAlbumYears } from '@/api/albums';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardGlow } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { AuroraBackground } from '@/components/motion/aurora-background';
import { Spotlight } from '@/components/motion/spotlight';
import { AnimatedText } from '@/components/motion/animated-text';
import { Reveal, RevealItem } from '@/components/motion/reveal';
import { dur, ease, fadeUp, stagger } from '@/lib/motion';
import { cn, formatDate } from '@/lib/utils';

const GRADIENTS = [
  'from-blue-500/40 via-indigo-500/40 to-purple-500/40',
  'from-purple-500/40 via-fuchsia-500/40 to-pink-500/40',
  'from-amber-500/40 via-orange-500/40 to-rose-500/40',
  'from-emerald-500/40 via-teal-500/40 to-cyan-500/40',
  'from-cyan-500/40 via-sky-500/40 to-blue-500/40',
  'from-violet-500/40 via-purple-500/40 to-fuchsia-500/40',
];

export default function GalleryPage() {
  const [year, setYear] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState('');
  const { data: years } = usePublishedAlbumYears();
  const { data, isLoading, isError, error } = usePublishedAlbums({
    year,
    search: search.trim() || undefined,
  });

  const albums = useMemo(() => data?.data ?? [], [data]);

  return (
    <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 -my-6 sm:-my-6 lg:-my-8 px-4 sm:px-6 lg:px-8 py-6 sm:py-6 lg:py-8">
      <AuroraBackground />
      <Spotlight />

      <div className="relative">
        {/* Hero */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger(0.08, 0)}
          className="mb-10"
        >
          <motion.div variants={fadeUp} className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <Sparkles className="h-3 w-3 text-amber-300" />
            <span>{albums.length} {albums.length === 1 ? 'album' : 'albums'} live</span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            The <AnimatedText variant="cool">gallery</AnimatedText>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-2 max-w-xl text-muted-foreground">
            Year-wise archive of every published album. Click any album to browse the full set and download originals.
          </motion.p>
        </motion.div>

        {/* Filters */}
        <Card className="mb-8">
          <CardGlow />
          <div className="relative flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
            <div className="flex-1">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search albums by title, description, or tag…"
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Chip active={year === undefined} onClick={() => setYear(undefined)}>
                All years
              </Chip>
              {(years ?? []).map((y, i) => (
                <Chip
                  key={y}
                  active={year === y}
                  onClick={() => setYear(y)}
                  accent={GRADIENTS[i % GRADIENTS.length]}
                >
                  {y}
                </Chip>
              ))}
            </div>
          </div>
        </Card>

        {/* Grid */}
        {isLoading && <GridSkeleton />}

        {isError && (
          <Card className="p-8 text-center">
            <CardGlow />
            <p className="text-sm text-destructive">
              Failed to load albums: {(error as Error)?.message ?? 'unknown error'}
            </p>
          </Card>
        )}

        {data && albums.length === 0 && (
          <EmptyState
            icon={<ImageIcon className="h-6 w-6" />}
            title="No albums match these filters"
            description="Try a different year or clear the search."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setYear(undefined);
                  setSearch('');
                }}
              >
                Clear filters
              </Button>
            }
          />
        )}

        {data && albums.length > 0 && (
          <Reveal className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {albums.map((a, i) => (
              <RevealItem key={a.id}>
                <AlbumCard album={a} gradient={GRADIENTS[i % GRADIENTS.length]} />
              </RevealItem>
            ))}
          </Reveal>
        )}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-300',
        active
          ? 'border-white/[0.12] bg-white/[0.06] text-foreground shadow-[0_0_24px_-8px_rgba(99,102,241,0.4)]'
          : 'border-white/[0.06] bg-white/[0.02] text-muted-foreground hover:border-white/[0.1] hover:text-foreground'
      )}
    >
      {active && accent && (
        <span
          aria-hidden
          className={cn(
            'absolute inset-0 -z-10 rounded-full bg-gradient-to-r opacity-30 blur-md',
            accent
          )}
        />
      )}
      {children}
    </button>
  );
}

function AlbumCard({
  album,
  gradient,
}: {
  album: ReturnType<typeof usePublishedAlbums>['data'] extends infer T
    ? T extends { data: Array<infer A> }
      ? A
      : never
    : never;
  gradient: string;
}) {
  return (
    <Link to={`/gallery/${album.id}`} className="group block h-full">
      <Card interactive className="relative h-full overflow-hidden">
        <CardGlow />
        <div className={cn('relative aspect-[4/3] overflow-hidden bg-gradient-to-br', gradient)}>
          <div className="absolute inset-0 bg-radial-highlight opacity-80" aria-hidden />
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon2 className="h-12 w-12 text-white/30 transition-transform duration-700 group-hover:scale-110" />
          </div>
          {/* Top-right badge */}
          <div className="absolute right-3 top-3">
            <Badge variant="gradient" className="bg-black/40 backdrop-blur">
              <ImageIcon2 className="h-3 w-3" />
              {album.uploadedPhotos}
            </Badge>
          </div>
          {/* Hover glass overlay */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <div className="bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
              <p className="line-clamp-2 text-xs text-white/90">{album.description ?? album.title}</p>
            </div>
          </div>
        </div>
        <div className="relative p-4">
          <p className="line-clamp-1 font-display text-base font-semibold tracking-tight">
            {album.title}
          </p>
          <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {album.year}
            </span>
            {album.publishedAt && (
              <>
                <span className="text-white/20">·</span>
                <span>Published {formatDate(album.publishedAt)}</span>
              </>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-white/[0.06]">
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
