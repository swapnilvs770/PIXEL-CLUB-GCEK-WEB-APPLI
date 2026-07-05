import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useMyRequest,
  useUpdateRequest,
  useWithdrawRequest,
} from '@/api/requests';
import { formatDateTime, cn } from '@/lib/utils';

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: r, isLoading, isError, error } = useMyRequest(id);
  const update = useUpdateRequest();
  const withdraw = useWithdrawRequest();
  const [editing, setEditing] = useState(false);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Failed to load: {(error as Error)?.message ?? 'unknown error'}
      </p>
    );
  }
  if (!r) return <p>Request not found.</p>;

  const canEdit = r.status === 'pending';
  const canWithdraw = r.status === 'pending';

  const handleWithdraw = async () => {
    if (!confirm('Withdraw this request? This cannot be undone.')) return;
    await withdraw.mutateAsync(r.id);
    navigate('/requests', { replace: true });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/requests">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to requests
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Button variant="outline" size="sm" onClick={() => setEditing((e) => !e)}>
              {editing ? 'Stop editing' : 'Edit'}
            </Button>
          )}
          {canWithdraw && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleWithdraw}
              disabled={withdraw.isPending}
            >
              <Trash2 className="mr-1 h-4 w-4" /> Withdraw
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{r.title}</CardTitle>
          <CardDescription>
            Submitted {formatDateTime(r.createdAt)} · Event {formatDateTime(r.eventDate)} · {r.venue}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <StatusBlock status={r.status} rejectionReason={r.rejectionReason} />

          {editing && canEdit ? (
            <EditForm
              initial={r}
              onCancel={() => setEditing(false)}
              onSave={async (input) => {
                await update.mutateAsync({ id: r.id, input });
                setEditing(false);
              }}
              saving={update.isPending}
              error={update.error as Error | null}
            />
          ) : (
            <ViewBlock r={r} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBlock({
  status,
  rejectionReason,
}: {
  status: string;
  rejectionReason: string | null;
}) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-900 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-800',
    approved: 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-800',
    rejected: 'bg-red-50 text-red-900 border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800',
    photography_completed: 'bg-purple-50 text-purple-900 border-purple-200 dark:bg-purple-900/20 dark:text-purple-200 dark:border-purple-800',
    completed: 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:border-emerald-800',
  };
  return (
    <div className={cn('rounded-md border p-3 text-sm', styles[status] ?? '')}>
      <p className="font-medium">Status: {status.replace('_', ' ')}</p>
      {status === 'rejected' && rejectionReason && (
        <p className="mt-1">Reason: {rejectionReason}</p>
      )}
    </div>
  );
}

function ViewBlock({ r }: { r: any }) {
  return (
    <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
      {r.description && (
        <div className="sm:col-span-2">
          <dt className="font-medium">Description</dt>
          <dd className="mt-1 whitespace-pre-wrap text-muted-foreground">{r.description}</dd>
        </div>
      )}
      {r.expectedAttendees != null && (
        <div>
          <dt className="font-medium">Expected attendees</dt>
          <dd className="mt-1 text-muted-foreground">{r.expectedAttendees}</dd>
        </div>
      )}
      {r.contactPhone && (
        <div>
          <dt className="font-medium">Contact phone</dt>
          <dd className="mt-1 text-muted-foreground">{r.contactPhone}</dd>
        </div>
      )}
      {r.notes && (
        <div className="sm:col-span-2">
          <dt className="font-medium">Notes</dt>
          <dd className="mt-1 whitespace-pre-wrap text-muted-foreground">{r.notes}</dd>
        </div>
      )}
      {r.albumId && (
        <div className="sm:col-span-2">
          <dt className="font-medium">Linked album</dt>
          <dd className="mt-1 text-muted-foreground">{r.albumId}</dd>
        </div>
      )}
    </dl>
  );
}

function EditForm({
  initial,
  onCancel,
  onSave,
  saving,
  error,
}: {
  initial: any;
  onCancel: () => void;
  onSave: (input: any) => Promise<void>;
  saving: boolean;
  error: Error | null;
}) {
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description ?? '');
  const [eventDate, setEventDate] = useState(initial.eventDate.slice(0, 16));
  const [venue, setVenue] = useState(initial.venue);
  const [expectedAttendees, setExpectedAttendees] = useState(initial.expectedAttendees ?? '');
  const [contactPhone, setContactPhone] = useState(initial.contactPhone ?? '');
  const [notes, setNotes] = useState(initial.notes ?? '');

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSave({
          title,
          description,
          eventDate: new Date(eventDate).toISOString(),
          venue,
          expectedAttendees: expectedAttendees === '' ? undefined : Number(expectedAttendees),
          contactPhone: contactPhone || undefined,
          notes: notes || undefined,
        });
      }}
      className="space-y-3"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="Title" value={title} onChange={setTitle} required />
        <Input label="Venue" value={venue} onChange={setVenue} required />
      </div>
      <Input label="Description" value={description} onChange={setDescription} multiline />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Event date & time"
          type="datetime-local"
          value={eventDate}
          onChange={setEventDate}
          required
        />
        <Input
          label="Expected attendees"
          type="number"
          value={String(expectedAttendees)}
          onChange={setExpectedAttendees}
        />
      </div>
      <Input label="Contact phone" value={contactPhone} onChange={setContactPhone} />
      <Input label="Notes" value={notes} onChange={setNotes} multiline />
      {error && <p className="text-sm text-destructive">{error.message}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  multiline = false,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  multiline?: boolean;
  required?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium leading-none">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          rows={3}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          type={type}
          required={required}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
      )}
    </div>
  );
}
