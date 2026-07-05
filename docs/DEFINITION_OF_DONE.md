# PCMP v1.0 — Definition of Done Checklist

> Tracks each acceptance criterion from `PROJECT_CONTEXT.md`.

## Required functionality

- [ ] **Google OAuth works** — user can sign in with Google and a record is created
- [ ] **Admin approval works** — new users are pending until an admin approves; blocked users cannot access protected resources
- [ ] **Request lifecycle is complete** — Pending → Approved → Photography Completed → Album Linked → Completed, with edit-while-pending support
- [ ] **Album import pipeline works** — admin pastes a Drive folder link; images are downloaded, compressed, uploaded to Cloudinary, and saved as a draft
- [ ] **Cloudinary previews work** — gallery shows compressed previews via Cloudinary URLs
- [ ] **Google Drive original downloads work** — clicking "Original (Drive)" opens the file in Drive
- [ ] **Batch-wise team management works** — admins can create/archive batches, add members, sync with admin accounts; previous batches are never overwritten
- [ ] **Notifications are functional** — in-app bell shows unread count, dropdown lists notifications, mark-read / mark-all-read / delete actions work; emails are also sent when SMTP is configured
- [ ] **Logs are functional** — every auth, admin, album, request, and settings action writes to the logs collection; admin can browse/filter in `/admin/logs`
- [ ] **Analytics are functional** — `/admin/analytics` shows users, requests, albums, photos, notifications, and activity breakdowns
- [ ] **Settings are functional** — `/admin/settings` lets admins edit website, homepage, maintenance, feature toggles, and integration display values
- [ ] **Application is production-ready** — security middleware, rate limiting, helmet, CORS, env validation, error handler, graceful shutdown, audit logging, and deployment configs

## Spec invariants

- [ ] Google Drive always stores original images; Cloudinary only stores compressed previews
- [ ] Manual approval flow is preserved — no auto-approve beyond `ADMIN_BOOTSTRAP_EMAILS`
- [ ] Only two roles exist: `user`, `admin`
- [ ] Tech stack matches spec exactly: React+Vite+TS+Tailwind+shadcn+TanStack Query on the frontend; Node+Express+TS+Mongoose on the backend; MongoDB Atlas; Google OAuth; Cloudinary; Socket.IO; Nodemailer
- [ ] Upload engine supports: real-time progress, ETA, upload speed, pause, resume, retry failed, session recovery (job state persisted in MongoDB), background processing, live logs
- [ ] Only one upload job runs at a time

## Deployment readiness

- [ ] Backend deploys to Railway with the included `railway.toml` / `Procfile`
- [ ] Frontend deploys to Vercel with the included `vercel.json`
- [ ] Health check (`/api/health`) returns 200 with mongo status
- [ ] CORS configured for the deployed frontend origin
- [ ] Google OAuth redirect URI matches the deployed backend origin
- [ ] All secrets live in env vars (never in source control)

## Code quality

- [ ] No `TODO` or `FIXME` placeholders left in shipped code
- [ ] TypeScript compiles with `strict: true`
- [ ] Input validation on every endpoint (Zod)
- [ ] Error responses use a consistent envelope `{ success, data|error }`
- [ ] All admin actions are recorded in the `logs` collection
- [ ] All notification-trigger events also attempt to send an email (best-effort)

When every box is checked, PCMP v1.0 is done.
