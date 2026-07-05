import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateRequest } from '@/api/requests';

const phoneRegex = /^[\d\s+\-()]{7,20}$/;

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(2000).optional(),
  eventDate: z.string().min(1, 'Event date is required'),
  venue: z.string().min(1, 'Venue is required').max(200),
  expectedAttendees: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => {
      if (v === '' || v === undefined || v === null) return undefined;
      const n = typeof v === 'string' ? parseInt(v, 10) : v;
      return Number.isFinite(n) ? n : undefined;
    }),
  contactPhone: z
    .string()
    .regex(phoneRegex, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  notes: z.string().max(1000).optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewRequestPage() {
  const navigate = useNavigate();
  const create = useCreateRequest();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      eventDate: '',
      venue: '',
      contactPhone: '',
      notes: '',
      expectedAttendees: '' as unknown as number,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      title: values.title.trim(),
      description: values.description?.trim() || undefined,
      eventDate: values.eventDate,
      venue: values.venue.trim(),
      expectedAttendees: values.expectedAttendees,
      contactPhone: values.contactPhone?.trim() || undefined,
      notes: values.notes?.trim() || undefined,
    };
    try {
      const created = await create.mutateAsync(payload);
      navigate(`/requests/${created.id}`, { replace: true });
    } catch {
      /* mutation error surfaced via create.error */
    }
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Camera className="h-7 w-7" /> New photography request
        </h1>
        <p className="text-muted-foreground">
          Tell us about your event and we'll assign a photographer.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Event details</CardTitle>
            <CardDescription>
              Required fields are marked with an asterisk.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Title *" error={errors.title?.message}>
              <input
                {...register('title')}
                className="input"
                placeholder="e.g. Annual Cultural Fest - Day 1"
              />
            </Field>
            <Field label="Description" error={errors.description?.message}>
              <textarea
                {...register('description')}
                className="input min-h-[100px]"
                placeholder="What kind of photos do you need? Any specific moments to capture?"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Event date & time *" error={errors.eventDate?.message}>
                <input
                  {...register('eventDate')}
                  type="datetime-local"
                  className="input"
                />
              </Field>
              <Field label="Venue *" error={errors.venue?.message}>
                <input
                  {...register('venue')}
                  className="input"
                  placeholder="e.g. Open-air auditorium"
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Logistics (optional)</CardTitle>
            <CardDescription>
              Anything that helps the team prepare.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Expected attendees" error={errors.expectedAttendees?.message}>
                <input
                  {...register('expectedAttendees')}
                  type="number"
                  min={0}
                  className="input"
                  placeholder="e.g. 300"
                />
              </Field>
              <Field label="Contact phone" error={errors.contactPhone?.message}>
                <input
                  {...register('contactPhone')}
                  className="input"
                  placeholder="e.g. +91 98765 43210"
                />
              </Field>
            </div>
            <Field label="Notes" error={errors.notes?.message}>
              <textarea
                {...register('notes')}
                className="input min-h-[80px]"
                placeholder="Anything else we should know?"
              />
            </Field>
          </CardContent>
        </Card>

        {create.isError && (
          <p className="text-sm text-destructive">
            {(create.error as Error)?.message ?? 'Failed to submit'}
          </p>
        )}

        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting…' : 'Submit request'}
          </Button>
        </div>
      </form>

      {/* Inline style for form inputs (kept local to avoid expanding the UI lib) */}
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
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium leading-none">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
