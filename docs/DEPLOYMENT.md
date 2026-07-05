# PCMP Deployment Guide

> **Stack:** Frontend on **Vercel** · Backend on **Railway** · Database on **MongoDB Atlas**

This document walks you through deploying the Pixel Club Management Portal to production.

---

## 0. Prerequisites

Before you start, have these ready:

- ✅ GitHub repository with the PCMP code pushed
- ✅ MongoDB Atlas cluster (free tier is fine for testing)
- ✅ Google Cloud project with **OAuth 2.0 Client ID** for Google Sign-In
- ✅ Google Cloud project with a **Service Account** that has access to your Drive folders (for album imports)
- ✅ Cloudinary account
- ✅ Gmail account with an **App Password** (for SMTP)
- ✅ Vercel account
- ✅ Railway account
- ✅ A custom domain (optional, but recommended)

---

## 1. MongoDB Atlas

1. Create a free cluster at https://www.mongodb.com/atlas
2. **Database Access:** create a user with read/write to your database
3. **Network Access:** add `0.0.0.0/0` (Vercel and Railway use dynamic IPs) or the specific IPs if you prefer
4. Get the **connection string** — it looks like:
   ```
   mongodb+srv://<user>:<password>@<cluster>.mongodb.net/pcmp?retryWrites=true&w=majority
   ```
   Save this — it's `MONGO_URI`.

---

## 2. Google Cloud — OAuth

1. Go to https://console.cloud.google.com/
2. Create a new project (or use an existing one)
3. **APIs & Services → OAuth consent screen:**
   - User type: External
   - Add scopes: `email`, `profile`, `openid`
   - Add your domain to **Authorized domains**
4. **APIs & Services → Credentials → Create OAuth client ID:**
   - Application type: **Web application**
   - Authorized JavaScript origins:
     - `https://<your-vercel-domain>.vercel.app`
     - (add custom domain once you have one)
   - Authorized redirect URIs:
     - `https://<your-railway-domain>.up.railway.app/api/auth/google/callback`
     - `http://localhost:5000/api/auth/google/callback` (local dev)
5. Save the **Client ID** and **Client Secret**.

---

## 3. Google Cloud — Service Account (for Drive imports)

1. **IAM & Admin → Service Accounts → Create service account**
   - Name: `pcmp-drive-reader`
   - Role: minimal — just need Drive read access
2. After creation, go to **Keys → Add Key → Create new key → JSON**
   - Save the downloaded JSON file — you'll paste its entire contents into `GOOGLE_SERVICE_ACCOUNT_JSON`
3. Copy the service account email (looks like `pcmp-drive-reader@<project>.iam.gserviceaccount.com`)
4. For each Drive folder you want to import, **share the folder with that email** (Viewer access is sufficient)

---

## 4. Cloudinary

1. Sign up at https://cloudinary.com/
2. On the dashboard, copy **Cloud Name**, **API Key**, and **API Secret**

---

## 5. Gmail SMTP (App Password)

1. Enable 2-Step Verification on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Create an app password for "Mail" / "Other (PCMP)"
4. Save the 16-character password

---

## 6. Deploy Backend → Railway

### Option A — Deploy via dashboard (easiest)

1. Go to https://railway.app/new
2. **Deploy from GitHub repo** → select your PCMP repo
3. Railway auto-detects the Node app. Configure:
   - **Root directory:** `apps/api`
   - **Build command:** `npm install && npm run build -w @pcmp/api`
   - **Start command:** `npm run start -w @pcmp/api`
   - **Health check path:** `/api/health`

   > If Railway doesn't auto-detect, the included `apps/api/railway.toml` and `Procfile` set the right commands.

4. **Variables** tab — add every env var from `apps/api/.env.example`:
   ```
   NODE_ENV=production
   PORT=5000
   API_BASE_URL=https://<your-railway-domain>.up.railway.app
   CLIENT_BASE_URL=https://<your-vercel-domain>.vercel.app

   MONGO_URI=mongodb+srv://...
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_REDIRECT_URI=https://<your-railway-domain>.up.railway.app/api/auth/google/callback
   ADMIN_BOOTSTRAP_EMAILS=you@example.com

   JWT_SECRET=<32+ random chars>
   JWT_EXPIRES_IN=7d

   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...

   GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}

   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=...
   SMTP_PASS=...
   MAIL_FROM="Pixel Club <noreply@yourdomain.com>"

   LOG_LEVEL=info
   ```

5. **Generate Domain** in Settings to get a public URL.
6. Verify by visiting `https://<your-railway-domain>.up.railway.app/api/health` — you should see:
   ```json
   { "success": true, "data": { "status": "ok", "service": "pcmp-api", "mongo": "connected" } }
   ```

### Option B — Railway CLI

```bash
npm install -g @railway/cli
railway login
cd apps/api
railway init
railway up
railway variables set MONGO_URI=...
# ... etc
```

---

## 7. Deploy Frontend → Vercel

1. Go to https://vercel.com/new
2. **Import Git Repository** → select your PCMP repo
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `apps/web`
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (default)
4. **Environment Variables** — add:
   ```
   VITE_API_BASE_URL=https://<your-railway-domain>.up.railway.app/api
   VITE_SOCKET_URL=https://<your-railway-domain>.up.railway.app
   VITE_APP_NAME="Pixel Club Management Portal"
   ```
5. **Deploy.** Vercel will give you a domain like `pcmp-web.vercel.app`.
6. Verify by visiting the URL — the home page should load.

---

## 8. Wire Up Cross-Service URLs

After both deploys:

1. **Backend env:** make sure `CLIENT_BASE_URL` matches your Vercel domain exactly (no trailing slash). Redeploy if needed.
2. **Frontend env:** make sure `VITE_API_BASE_URL` matches your Railway API domain. Vercel will rebuild on env change.
3. **Google OAuth redirect URI:** add your Railway URL to the Authorized redirect URIs in Google Cloud Console. The full URI is:
   ```
   https://<railway-domain>/api/auth/google/callback
   ```

---

## 9. Bootstrap Your First Admin

The first admin is bootstrapped via the `ADMIN_BOOTSTRAP_EMAILS` env var on the backend:

```
ADMIN_BOOTSTRAP_EMAILS=you@example.com,founder@example.com
```

These emails are promoted to admin + auto-approved on their first Google login.

1. Set this env var on Railway
2. Redeploy
3. Sign in with one of those emails
4. Confirm `/dashboard` loads with the admin nav

---

## 10. Custom Domains (optional)

### Backend (Railway)
1. Railway → Settings → Domains → Custom Domain
2. Add a CNAME: `api.yourdomain.com` → `<railway-provided>.up.railway.app`
3. Update `API_BASE_URL` and `GOOGLE_REDIRECT_URI` env vars
4. Update Google Cloud Console redirect URI

### Frontend (Vercel)
1. Vercel → Project → Settings → Domains
2. Add `yourdomain.com` and `www.yourdomain.com`
3. Vercel shows the DNS records to add
4. Update `CLIENT_BASE_URL` on the backend

---

## 11. Post-Deployment Checklist

- [ ] `/api/health` returns `mongo: connected`
- [ ] Google sign-in works end-to-end
- [ ] First admin can access `/admin/users`
- [ ] Notifications show in bell icon and trigger emails (check spam folder)
- [ ] Album import starts and progress updates in real time
- [ ] Cloudinary previews load
- [ ] Drive original-download links open the file
- [ ] Team page reflects the active batch
- [ ] Logs page records the actions you've taken
- [ ] Analytics dashboard populates
- [ ] Settings update is persisted

---

## 12. Troubleshooting

### "Mongo connection error"
- Verify the connection string has the right username/password
- Check Network Access on Atlas — `0.0.0.0/0` is the simplest
- Make sure the database name in the URI matches what you expect

### "CORS error in browser console"
- `CLIENT_BASE_URL` on backend must match the deployed frontend URL **exactly**
- Frontend axios client uses `withCredentials: true` but the token is in `Authorization` header, so cookies aren't strictly required

### "Google OAuth redirect mismatch"
- The `GOOGLE_REDIRECT_URI` env var must exactly match one of the **Authorized redirect URIs** in Google Cloud Console
- Common gotcha: trailing slashes — `https://x.com/callback` ≠ `https://x.com/callback/`

### "Google Drive folder not found"
- The service account email must be added as a **Viewer** on the source folder
- Wait ~1 minute after sharing for permissions to propagate

### "Cloudinary upload failed"
- Verify cloud name / API key / API secret are correct
- Free tier has storage limits — check Cloudinary dashboard

### "Socket.IO not connecting"
- The Railway service must keep the connection alive (it does by default)
- Frontend `VITE_SOCKET_URL` must match the backend URL (no `/api` suffix)
- Make sure the JWT token is in localStorage before connecting

### Logs show "Mail skipped — mailer not configured"
- Check `SMTP_USER` and `SMTP_PASS` are set
- Gmail app passwords are 16 characters, no spaces

---

## 13. Local Production Smoke Test

Before relying on deployment, test the production build locally:

```bash
# Backend
cd apps/api
NODE_ENV=production npm run build
NODE_ENV=production npm start
# → should listen on port 5000

# Frontend
cd apps/web
npm run build
npm run preview
# → serves dist/ on port 4173
```

---

## 14. Maintenance Mode

Toggle maintenance mode from the admin UI: **Admin → Settings → Maintenance mode**.
When enabled, the homepage will display the maintenance message. (For v1, the maintenance banner is purely informational — the app is not fully gated by it.)

---

## 15. Backup & Recovery

- **MongoDB Atlas:** Atlas provides automatic backups on paid tiers; otherwise schedule `mongodump` exports
- **Cloudinary:** assets are stored in Cloudinary's CDN; verify their retention policy
- **Google Drive:** originals remain in your Drive folder — Drive's own recycle bin protects against accidental deletion

---

**Done!** Your PCMP instance is live. The first admin you signed in with can now approve more users and manage the portal.
