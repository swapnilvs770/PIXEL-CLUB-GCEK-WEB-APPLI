# Pixel Club Management Portal (PCMP) v1.0

Centralized platform for **Pixel Club, Government College of Engineering, Karad**.

Replaces the Google Drive + WhatsApp workflow with a secure web application covering authentication, photography requests, album management, team management, user approval, notifications, logs, and analytics.

> 📄 The authoritative spec lives in [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md). Read it before changing architecture.

## Repository layout

```
.
├── apps/
│   ├── api/          # Node.js + Express + TypeScript backend
│   └── web/          # React + Vite + TypeScript frontend
├── docs/             # Specs, ADRs, deployment notes
├── PROJECT_CONTEXT.md
└── package.json      # npm workspaces root
```

## Tech stack (locked by spec)

- **Frontend:** React (Vite), TypeScript, Tailwind CSS, shadcn/ui, React Router, TanStack Query
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** MongoDB Atlas + Mongoose
- **Auth:** Google OAuth + JWT
- **Storage:** Google Drive (originals) + Cloudinary (compressed previews)
- **Realtime:** Socket.IO
- **Mail:** Nodemailer
- **Deployment:** Vercel (frontend) + Railway (backend) + MongoDB Atlas

## Quick start (local development)

> **Requires Node.js 22.x or 24.x** and an npm 10+.

```bash
# 1. Install all workspace dependencies
npm install

# 2. Set up environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# fill in the values (see PROJECT_CONTEXT.md for what each one is)

# 3. Run both apps in dev mode
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API health: http://localhost:5000/api/health

## Available scripts (run from repo root)

| Command | What it does |
|---|---|
| `npm run dev` | Runs API + Web concurrently |
| `npm run dev:api` | Runs backend only |
| `npm run dev:web` | Runs frontend only |
| `npm run build` | Builds both apps for production |
| `npm run typecheck` | TypeScript check across workspaces |
| `npm run lint` | Lint across workspaces (when configured) |

## Deployment

- **Frontend (Vercel):** point Vercel at the repo, set root directory to `apps/web`, framework preset = Vite. Add the `VITE_*` env vars from `.env.example`.
- **Backend (Railway):** new project from repo, root directory `apps/api`. Set all backend env vars. Railway auto-detects Node and runs `npm start`.

Detailed deployment guide: [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md).

## Definition of Done (from spec)

PCMP v1.0 is considered done when all of the following work end-to-end:

- [ ] Google OAuth login
- [ ] Admin approval workflow
- [ ] Request lifecycle (Pending → Approved → Completed)
- [ ] Album import pipeline (Google Drive → Cloudinary)
- [ ] Cloudinary previews
- [ ] Google Drive original downloads
- [ ] Batch-wise team management
- [ ] Notifications (in-app + email)
- [ ] Logs
- [ ] Analytics
- [ ] Admin settings
- [ ] Production-ready

## License

Internal — Pixel Club, GCE Karad.
