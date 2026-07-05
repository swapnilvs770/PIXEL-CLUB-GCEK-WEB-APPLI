import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Image, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  usePublishedAlbums,
  usePublishedAlbumYears,
} from '@/api/albums';
import { formatDate, cn } from '@/lib/utils';

export default function GalleryPage() {
  const [year, setYear] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState('');
  const { data: years } = usePublishedAlbumYears();
  const { data, isLoading, isError, error } = usePublishedAlbums({
    year,
    search: search.trim() || undefined,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Image className="h-7 w-7" /> Gallery
        </h1>
        <p className="text-muted-foreground">
          Browse albums published by the Pixel Club team.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={year === undefined ? 'default' : 'outline'}
          size="sm"
          onClick={() => setYear(undefined)}
        >
          All years
        </Button>
        {(years ?? []).map((y) => (
          <Button
            key={y}
            variant={year === y ? 'default' : 'outline'}
            size="sm"
            onClick={() => setYear(y)}
          >
            {y}
          </Button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search albums by title, description, or tag…"
          className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
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
            No albums match these filters.
          </CardContent>
        </Card>
      )}

      {data && data.data.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.data.map((a) => (
            <Card
              key={a.id}
              className="group overflow-hidden transition-shadow hover:shadow-md"
            >
              <Link to={`/gallery/${a.id}`} className="block">
                <div
                  className={cn(
                    'flex aspect-[4/3] items-center justify-center bg-secondary text-muted-foreground'
                  )}
                >
                  <Image className="h-12 w-12" />
                </div>
                <CardContent className="p-4">
                  <p className="line-clamp-1 font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.year} · {a.uploadedPhotos} photo
                    {a.uploadedPhotos === 1 ? '' : 's'}
                  </p>
                  {a.publishedAt && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Published {formatDate(a.publishedAt)}
                    </p>
                  )}
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
