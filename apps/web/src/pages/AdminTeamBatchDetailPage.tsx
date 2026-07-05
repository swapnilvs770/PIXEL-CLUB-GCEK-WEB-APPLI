import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, Plus, Star, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useAdminBatch,
  useAddMember,
  useDeleteMember,
  useUpdateMember,
  useActivateBatch,
  useSyncBatch,
} from '@/api/team';

export default function AdminTeamBatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: batch, isLoading } = useAdminBatch(id);
  const add = useAddMember();
  const update = useUpdateMember();
  const del = useDeleteMember();
  const activate = useActivateBatch();
  const sync = useSyncBatch();

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: '',
    designation: '',
    photoUrl: '',
    bio: '',
    contributions: '',
    instagram: '',
    linkedin: '',
    twitter: '',
    website: '',
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!batch)
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Batch not found.
        </CardContent>
      </Card>
    );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await add.mutateAsync({
      batchId: batch.id,
      input: {
        name: form.name.trim(),
        designation: form.designation.trim(),
        photoUrl: form.photoUrl.trim() || undefined,
        bio: form.bio.trim() || undefined,
        contributions: form.contributions
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        socials: {
          instagram: form.instagram.trim() || undefined,
          linkedin: form.linkedin.trim() || undefined,
          twitter: form.twitter.trim() || undefined,
          website: form.website.trim() || undefined,
        },
      },
    });
    setForm({
      name: '',
      designation: '',
      photoUrl: '',
      bio: '',
      contributions: '',
      instagram: '',
      linkedin: '',
      twitter: '',
      website: '',
    });
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/admin/team">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to batches
        </Link>
      </Button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Users className="h-7 w-7" /> {batch.batchName}
          </h1>
          <p className="text-muted-foreground">
            {batch.batchYear} · {batch.members.length} member
            {batch.members.length === 1 ? '' : 's'}
            {batch.isActive && ' · Active'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => sync.mutate(batch.id)}
            disabled={sync.isPending}
          >
            Sync with admins
          </Button>
          {!batch.isActive && (
            <Button onClick={() => activate.mutate(batch.id)} disabled={activate.isPending}>
              <Star className="mr-1 h-4 w-4" /> Set active
            </Button>
          )}
          <Button onClick={() => setShowAdd((v) => !v)}>
            <Plus className="mr-1 h-4 w-4" /> Add member
          </Button>
        </div>
      </div>

      {showAdd && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add member</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Name *">
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="input"
                  />
                </Field>
                <Field label="Designation *">
                  <input
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    required
                    className="input"
                    placeholder="e.g. President, Lead Photographer"
                  />
                </Field>
              </div>
              <Field label="Photo URL">
                <input
                  value={form.photoUrl}
                  onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
                  className="input"
                  placeholder="https://…"
                />
              </Field>
              <Field label="Bio">
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  className="input"
                />
              </Field>
              <Field label="Contributions (one per line)">
                <textarea
                  value={form.contributions}
                  onChange={(e) => setForm({ ...form, contributions: e.target.value })}
                  rows={3}
                  className="input"
                  placeholder="Led fest coverage&#10;Mentored new photographers"
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Instagram">
                  <input
                    value={form.instagram}
                    onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                    className="input"
                  />
                </Field>
                <Field label="LinkedIn">
                  <input
                    value={form.linkedin}
                    onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                    className="input"
                  />
                </Field>
                <Field label="Twitter">
                  <input
                    value={form.twitter}
                    onChange={(e) => setForm({ ...form, twitter: e.target.value })}
                    className="input"
                  />
                </Field>
                <Field label="Website">
                  <input
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    className="input"
                  />
                </Field>
              </div>
              {add.isError && (
                <p className="text-sm text-destructive">
                  {(add.error as Error)?.message ?? 'Failed'}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={add.isPending}>
                  {add.isPending ? 'Adding…' : 'Add member'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Members</CardTitle>
          <CardDescription>
            Drag to reorder via displayOrder (set per-member below).
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y p-0">
          {batch.members.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              No members yet. Add some or sync with admins.
            </p>
          )}
          {batch.members
            .slice()
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((m) => (
              <div key={m.id} className="flex items-start gap-3 p-4">
                {m.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.photoUrl}
                    alt={m.name}
                    className="h-12 w-12 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
                    {m.name
                      .split(' ')
                      .slice(0, 2)
                      .map((s) => s[0])
                      .join('')
                      .toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{m.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{m.designation}</p>
                  <p className="text-xs text-muted-foreground">
                    Order: {m.displayOrder}
                    {m.userId && ` · Linked to admin ${m.userId}`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <input
                    type="number"
                    defaultValue={m.displayOrder}
                    className="w-16 rounded-md border border-input bg-background px-2 py-1 text-xs"
                    onBlur={async (e) => {
                      const v = parseInt(e.target.value, 10);
                      if (!Number.isFinite(v) || v === m.displayOrder) return;
                      await update.mutateAsync({
                        batchId: batch.id,
                        memberId: m.id,
                        input: { displayOrder: v },
                      });
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remove member"
                    onClick={async () => {
                      if (!confirm(`Remove ${m.name} from this batch?`)) return;
                      await del.mutateAsync({ batchId: batch.id, memberId: m.id });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium leading-none">{label}</label>
      {children}
    </div>
  );
}
