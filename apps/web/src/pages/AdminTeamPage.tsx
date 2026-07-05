import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Users, Plus, RefreshCw, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useAdminBatches,
  useCreateBatch,
  useActivateBatch,
  useDeleteBatch,
  useSyncBatch,
} from '@/api/team';

export default function AdminTeamPage() {
  const { data: batches, isLoading } = useAdminBatches();
  const create = useCreateBatch();
  const activate = useActivateBatch();
  const del = useDeleteBatch();
  const sync = useSyncBatch();

  const [showForm, setShowForm] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [batchYear, setBatchYear] = useState('');
  const [isActive, setIsActive] = useState(true);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({
      batchName: batchName.trim(),
      batchYear: batchYear.trim(),
      isActive,
    });
    setBatchName('');
    setBatchYear('');
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Users className="h-7 w-7" /> Team batches
          </h1>
          <p className="text-muted-foreground">
            Batch-wise history of all contributors. Previous batches are never overwritten.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus className="mr-1 h-4 w-4" /> New batch
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create batch</CardTitle>
            <CardDescription>
              Adding a new batch with "Active" checked will deactivate the current active batch.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Batch name *">
                  <input
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                    required
                    className="input"
                    placeholder="e.g. Pixel Committee 2024-25"
                  />
                </Field>
                <Field label="Batch year *">
                  <input
                    value={batchYear}
                    onChange={(e) => setBatchYear(e.target.value)}
                    required
                    className="input"
                    placeholder="e.g. 2024-2025"
                  />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                Set as active batch
              </label>
              {create.isError && (
                <p className="text-sm text-destructive">
                  {(create.error as Error)?.message ?? 'Failed'}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={create.isPending}>
                  {create.isPending ? 'Creating…' : 'Create'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

      {batches && batches.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No batches yet. Create one to get started.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {batches?.map((b) => (
          <Card key={b.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{b.batchName}</CardTitle>
                  <CardDescription>{b.batchYear}</CardDescription>
                </div>
                {b.isActive && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    Active
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {b.memberCount} member{b.memberCount === 1 ? '' : 's'}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link to={`/admin/team/${b.id}`}>Manage members</Link>
                </Button>
                {!b.isActive && (
                  <Button
                    size="sm"
                    onClick={() => activate.mutate(b.id)}
                    disabled={activate.isPending}
                  >
                    <Star className="mr-1 h-3 w-3" /> Activate
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => sync.mutate(b.id)}
                  disabled={sync.isPending}
                  aria-label="Sync with admins"
                  title="Sync with current admins"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete batch"
                  onClick={async () => {
                    if (!confirm(`Delete batch "${b.batchName}"? This cannot be undone.`)) return;
                    await del.mutateAsync(b.id);
                  }}
                  disabled={del.isPending}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
