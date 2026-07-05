import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateAlbum, useStartImport } from '@/api/albums';

export default function AdminNewAlbumPage() {
  const navigate = useNavigate();
  const create = useCreateAlbum();
  const startImport = useStartImport();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [driveFolderUrl, setDriveFolderUrl] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [tags, setTags] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const album = await create.mutateAsync({
      title: title.trim(),
      description: description.trim() || undefined,
      year: Number(year),
      driveFolderUrl: driveFolderUrl.trim(),
      eventDate: eventDate ? new Date(eventDate).toISOString() : undefined,
      tags: tags
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });
    // Auto-start import after creation
    try {
      await startImport.mutateAsync(album.id);
    } catch (err) {
      // Continue even if start fails — user can retry from the manage page
      console.warn('Could not auto-start import', err);
    }
    navigate(`/admin/albums/${album.id}`, { replace: true });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button asChild variant="ghost" size="sm">
        <a onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </a>
      </Button>

      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Image className="h-7 w-7" /> New album
        </h1>
        <p className="text-muted-foreground">
          Paste a public Google Drive folder URL. The service account must have
          access to the folder.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Album details</CardTitle>
            <CardDescription>Basic information about the album.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Title *">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="input"
                placeholder="e.g. Annual Cultural Fest 2026"
              />
            </Field>
            <Field label="Description">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="input"
                placeholder="Short description of the album"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Year *">
                <input
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  type="number"
                  min={2000}
                  max={2100}
                  required
                  className="input"
                />
              </Field>
              <Field label="Event date">
                <input
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  type="date"
                  className="input"
                />
              </Field>
            </div>
            <Field label="Tags (comma-separated)">
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="input"
                placeholder="e.g. fest, cultural, day-1"
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Google Drive folder</CardTitle>
            <CardDescription>
              Paste a Drive folder link. The folder must be shared with the
              service account email configured in <code>GOOGLE_SERVICE_ACCOUNT_JSON</code>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Field label="Drive folder URL or ID *">
              <input
                value={driveFolderUrl}
                onChange={(e) => setDriveFolderUrl(e.target.value)}
                required
                className="input"
                placeholder="https://drive.google.com/drive/folders/…"
              />
            </Field>
          </CardContent>
        </Card>

        {(create.isError || startImport.isError) && (
          <p className="text-sm text-destructive">
            {((create.error || startImport.error) as Error)?.message ??
              'Failed to create album'}
          </p>
        )}

        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={create.isPending || startImport.isPending}
          >
            {create.isPending
              ? 'Creating…'
              : startImport.isPending
                ? 'Starting import…'
                : 'Create & start import'}
          </Button>
        </div>
      </form>

      <style>{`
        .input {
          width: 100%;
          border-radius: 0.375rem;
          border: 1px solid hsl(var(--input));
          background: hsl(var(--background));
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: hsl(var(--foreground));
          outline: none;
        }
        .input:focus {
          border-color: hsl(var(--ring));
          box-shadow: 0 0 0 2px hsl(var(--ring) / 0.2);
        }
        textarea.input { font-family: inherit; }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium leading-none">{label}</label>
      {children}
    </div>
  );
}
