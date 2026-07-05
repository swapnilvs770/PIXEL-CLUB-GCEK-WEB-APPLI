import { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminSettings, useUpdateSettings } from '@/api/settings';

export default function AdminSettingsPage() {
  const { data: settings, isLoading } = useAdminSettings();
  const update = useUpdateSettings();

  const [form, setForm] = useState<Record<string, any>>({});
  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const handleSave = async () => {
    await update.mutateAsync(form);
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!settings) return <p>Settings not loaded.</p>;

  const set = (path: string, value: unknown) =>
    setForm((prev) => setDeep(prev, path, value));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <SettingsIcon className="h-7 w-7" /> Settings
          </h1>
          <p className="text-muted-foreground">
            Operational settings. Per spec, no operational value should be hardcoded in code.
          </p>
        </div>
        <Button onClick={handleSave} disabled={update.isPending}>
          <Save className="mr-1 h-4 w-4" />
          {update.isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </div>

      {update.isError && (
        <p className="text-sm text-destructive">
          {(update.error as Error)?.message ?? 'Failed to save'}
        </p>
      )}
      {update.isSuccess && (
        <p className="text-sm text-emerald-600">Settings saved.</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Website</CardTitle>
          <CardDescription>Public-facing identity.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Field label="Website name">
            <input
              className="input"
              value={(form.websiteName as string) ?? ''}
              onChange={(e) => set('websiteName', e.target.value)}
            />
          </Field>
          <Field label="Description">
            <textarea
              className="input"
              rows={2}
              value={(form.websiteDescription as string) ?? ''}
              onChange={(e) => set('websiteDescription', e.target.value)}
            />
          </Field>
          <Field label="Contact email">
            <input
              className="input"
              type="email"
              value={(form.contactEmail as string) ?? ''}
              onChange={(e) => set('contactEmail', e.target.value)}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Homepage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Field label="Hero title">
            <input
              className="input"
              value={(form.homepage as any)?.heroTitle ?? ''}
              onChange={(e) => set('homepage.heroTitle', e.target.value)}
            />
          </Field>
          <Field label="Hero subtitle">
            <textarea
              className="input"
              rows={2}
              value={(form.homepage as any)?.heroSubtitle ?? ''}
              onChange={(e) => set('homepage.heroSubtitle', e.target.value)}
            />
          </Field>
          <Field label="Hero image URL">
            <input
              className="input"
              value={(form.homepage as any)?.heroImageUrl ?? ''}
              onChange={(e) => set('homepage.heroImageUrl', e.target.value)}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Maintenance mode</CardTitle>
          <CardDescription>
            When enabled, the portal displays a maintenance message to visitors.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean((form.maintenance as any)?.enabled)}
              onChange={(e) => set('maintenance.enabled', e.target.checked)}
            />
            Enable maintenance mode
          </label>
          <Field label="Maintenance message">
            <textarea
              className="input"
              rows={2}
              value={(form.maintenance as any)?.message ?? ''}
              onChange={(e) => set('maintenance.message', e.target.value)}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Feature toggles</CardTitle>
          <CardDescription>Disable features without code changes.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {(
            [
              ['requestsEnabled', 'Photography requests'],
              ['albumsEnabled', 'Albums'],
              ['galleryEnabled', 'Gallery'],
              ['teamEnabled', 'Team page'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean((form.featureToggles as any)?.[key])}
                onChange={(e) => set(`featureToggles.${key}`, e.target.checked)}
              />
              {label}
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">SMTP (display)</CardTitle>
          <CardDescription>
            Credentials stay in <code>.env</code>. This is just for display.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Field label="From address">
            <input
              className="input"
              value={(form.smtp as any)?.from ?? ''}
              onChange={(e) => set('smtp.from', e.target.value)}
            />
          </Field>
          <Field label="Host">
            <input
              className="input"
              value={(form.smtp as any)?.host ?? ''}
              onChange={(e) => set('smtp.host', e.target.value)}
            />
          </Field>
          <Field label="Port">
            <input
              className="input"
              type="number"
              value={(form.smtp as any)?.port ?? 465}
              onChange={(e) => set('smtp.port', Number(e.target.value))}
            />
          </Field>
          <Field label="User (no password)">
            <input
              className="input"
              value={(form.smtp as any)?.user ?? ''}
              onChange={(e) => set('smtp.user', e.target.value)}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Integrations (display)</CardTitle>
          <CardDescription>
            Cloud name and service-account email are non-secret display values.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Field label="Cloudinary cloud name">
            <input
              className="input"
              value={(form.cloudinary as any)?.cloudName ?? ''}
              onChange={(e) => set('cloudinary.cloudName', e.target.value)}
            />
          </Field>
          <Field label="Google Drive service account email">
            <input
              className="input"
              type="email"
              value={(form.googleDrive as any)?.serviceAccountEmail ?? ''}
              onChange={(e) =>
                set('googleDrive.serviceAccountEmail', e.target.value)
              }
            />
          </Field>
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

function setDeep(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const next = { ...obj };
  const parts = path.split('.');
  let cursor: any = next;
  for (let i = 0; i < parts.length - 1; i++) {
    cursor[parts[i]] = { ...(cursor[parts[i]] ?? {}) };
    cursor = cursor[parts[i]];
  }
  cursor[parts[parts.length - 1]] = value;
  return next;
}
