# Afterword — AI email drafting & exact-time scheduled sending (MERN)

MongoDB + Express + React + Node. Sign in with Google → write an email by hand or
let Gemini draft it → pick the exact moment it should go out → it's sent from your
own Gmail account at that time.

## Architecture

- **`/server`** — Express API
  - **Auth**: Passport Google OAuth2 strategy requesting the `gmail.send` scope
    (`access_type=offline` + `prompt=consent`, so we always get a refresh token).
    Session is a JWT in an httpOnly cookie — no server-side session store needed.
  - **Storage**: MongoDB Atlas via Mongoose — `User` (profile + encrypted refresh
    token) and `Draft` (email content + status + schedule).
  - **AI drafting**: Gemini API (`gemini-2.0-flash`) generates a subject + body.
  - **Scheduling**: [Agenda](https://github.com/agenda/agenda), a MongoDB-backed
    job scheduler — no external queue service needed. When you schedule a send,
    a job is persisted in Mongo for that exact timestamp; Agenda polls and fires
    it, calling the Gmail API via `googleapis` (which auto-refreshes the access
    token from the stored refresh token).
  - Refresh tokens are encrypted at rest (AES-256-GCM).
- **`/client`** — React (Vite) SPA, talks to the API with `axios` + cookies.

### ⚠️ Important deployment note

Agenda needs a **long-running Node process** to poll and fire scheduled jobs —
this will not work on Vercel serverless functions, which spin down between
requests. Deploy:
- **`/client`** → Vercel (or any static host) — this part works great on Vercel.
- **`/server`** → a persistent Node host: **Render**, **Railway**, **Fly.io**, or
  a VPS. All have free/cheap tiers suitable for this.

## 1. Set up external services

### Google Cloud (OAuth + Gmail API)
1. Create a project at [console.cloud.google.com](https://console.cloud.google.com).
2. **APIs & Services → Library** → enable the **Gmail API**.
3. **APIs & Services → OAuth consent screen**:
   - User type: External (or Internal for Google Workspace).
   - Add the scope `.../auth/gmail.send`.
   - Add yourself (and other testers) under **Test users** while in "Testing" status.
   - ⚠️ While unverified and in Testing status, Google expires refresh tokens
     after 7 days and restricts sign-in to listed test users. For production use
     by other people, submit for [OAuth verification](https://support.google.com/cloud/answer/9110914)
     — `gmail.send` is a restricted scope requiring a CASA security assessment.
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   (Web application).
   - Authorized redirect URI: `https://your-api-host.com/api/auth/google/callback`
   - Also add `http://localhost:5000/api/auth/google/callback` for local dev.
   - Copy the Client ID and Client Secret.

### MongoDB Atlas
1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and copy the connection string into `MONGODB_URI`.
3. **Network Access** → allow access from anywhere (`0.0.0.0/0`), since most
   hosts (Render, Railway, Vercel) don't have static IPs by default.

### Gemini API
Get a key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

### Encryption key
```bash
openssl rand -base64 32
```

## 2. Configure environment variables

- `server/.env` — copy from `server/.env.example` and fill in every value.
- `client/.env` — copy from `client/.env.example`, set `VITE_API_URL` to your
  API's URL.

## 3. Run locally

```bash
# Terminal 1
cd server
npm install
npm run dev      # http://localhost:5000

# Terminal 2
cd client
npm install
npm run dev       # http://localhost:5173
```

Visit `http://localhost:5173`, sign in with Google, and try scheduling a send a
couple of minutes out — Agenda polls every 10 seconds, so it'll fire close to
the exact time even locally.

## 4. Deploy

### Backend (Render example)
1. Push this repo to GitHub.
2. New Web Service on [render.com](https://render.com), root directory `server`.
3. Build command: `npm install` · Start command: `npm start`.
4. Add all variables from `server/.env.example` in the dashboard, with
   `SERVER_URL` and `GOOGLE_CALLBACK_URL` set to your Render URL, and
   `CLIENT_URL` set to your Vercel frontend URL.
5. Since frontend and backend are on different domains, cookies need
   `SameSite=None; Secure` — already handled automatically in `routes/auth.js`
   when `NODE_ENV=production`.

### Frontend (Vercel)
1. Import the repo at [vercel.com/new](https://vercel.com/new), set the root
   directory to `client`.
2. Framework preset: Vite.
3. Add environment variable `VITE_API_URL` = your deployed backend URL.
4. Deploy.

### Final step
Go back to the Google Cloud OAuth client and add the production callback URL
(`https://your-api-host.com/api/auth/google/callback`) as an authorized redirect URI.

## Notes & limitations

- Editing the content of an already-scheduled draft cancels the pending job (it
  reverts to a plain draft) so you don't get two conflicting sends.
- A failed send (e.g. revoked Gmail access) is marked **failed** with the error
  shown in the dashboard — it is not silently retried forever.
- Single-tenant per user: everyone only ever sees their own drafts.
- `npm audit` flags a few moderate-severity advisories in Vite/React Router dev
  tooling that require major version bumps to clear; they don't affect this
  app's runtime behavior, but run `npm audit fix --force` in `client/` later if
  you want to be on the latest majors.
