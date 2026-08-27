# Afterword — AI email drafting & exact-time scheduled sending (MERN, Vercel-only)

MongoDB + Express + React + Node, fully deployable on Vercel. Sign in with
Google → write an email by hand or let Gemini draft it → pick the exact
moment it should go out → it's sent from your own Gmail account at that time.

## Architecture

- **`/server`** — Express API, deployed as a **Vercel serverless function**
  - **Entry points**: `src/index.js` runs a normal long-lived server for local
    dev (`npm run dev`). `api/index.js` is what Vercel actually invokes in
    production — it exports the same Express app directly, since Vercel's
    Node runtime treats an Express app as a valid `(req, res)` handler.
    `vercel.json` rewrites every request to that function.
  - **Auth**: Passport Google OAuth2 requesting the `gmail.send` scope
    (`access_type=offline` + `prompt=consent`, so we always get a refresh
    token). Session is a JWT in an httpOnly cookie — no server-side session
    store needed.
  - **Storage**: MongoDB Atlas via Mongoose — `User` (profile + encrypted
    refresh token) and `Draft` (email content + status + schedule). The DB
    connection is cached across warm serverless invocations.
  - **AI drafting**: Gemini API (`gemini-2.0-flash`) generates a subject + body.
  - **Scheduling**: **Upstash QStash** — a serverless-friendly message queue.
    When you schedule a send, we tell QStash to call `/api/send-email` at the
    exact timestamp. QStash verifies itself with a signature, so no session
    cookie is needed for that call; the route checks the signature, then
    sends the email via the Gmail API using the stored (encrypted) refresh
    token. This replaces a self-hosted job scheduler like Agenda, which
    **cannot** run on Vercel — serverless functions don't stay alive to poll
    for jobs.
  - Refresh tokens are encrypted at rest (AES-256-GCM).
- **`/client`** — React (Vite) SPA, deployed on Vercel, talks to the API with
  `axios` + cookies.

## 1. Set up external services

### Google Cloud (OAuth + Gmail API)
1. Create a project at [console.cloud.google.com](https://console.cloud.google.com).
2. **APIs & Services → Library** → enable the **Gmail API**.
3. **APIs & Services → OAuth consent screen**:
   - User type: External (or Internal for Google Workspace).
   - Add the scope `.../auth/gmail.send`.
   - Add yourself (and other testers) under **Test users** while in "Testing" status.
   - ⚠️ While unverified and in Testing status, Google expires refresh tokens
     after 7 days and restricts sign-in to listed test users. For production
     use by other people, submit for [OAuth verification](https://support.google.com/cloud/answer/9110914)
     — `gmail.send` is a restricted scope requiring a CASA security assessment.
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   (Web application).
   - Authorized redirect URI: `https://your-api.vercel.app/api/auth/google/callback`
   - Also add `http://localhost:5000/api/auth/google/callback` for local dev.
   - Copy the Client ID and Client Secret.

### MongoDB Atlas
1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and copy the connection string into `MONGODB_URI`.
3. **Network Access** → allow access from anywhere (`0.0.0.0/0`), since Vercel
   doesn't have static IPs.

### Gemini API
Get a key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

### Upstash QStash
1. Create a free account at [console.upstash.com/qstash](https://console.upstash.com/qstash).
2. Copy **QSTASH_TOKEN**, **QSTASH_CURRENT_SIGNING_KEY**, and
   **QSTASH_NEXT_SIGNING_KEY** from the dashboard.

### Encryption key
```bash
openssl rand -base64 32
```

## 2. Configure environment variables

- `server/.env` — copy from `server/.env.example`, fill in every value.
  `APP_URL` must be this API's own **public https URL** (your Vercel backend
  domain) — QStash calls back to `${APP_URL}/api/send-email`.
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

**Testing scheduled sends locally requires a public URL**, since QStash needs
to reach your machine to call the webhook — `localhost` won't work. Use a
tunnel (e.g. `npx localtunnel --port 5000` or `ngrok http 5000`), set
`APP_URL` to that tunnel URL, and use the tunnel's URL as
`GOOGLE_CALLBACK_URL`'s host too if you want to test the full OAuth flow
through it.

## 4. Deploy — both on Vercel

### Backend
1. Push this repo to GitHub.
2. New Project on [vercel.com/new](https://vercel.com/new), **Root Directory: `server`**.
3. Framework preset: Other. Vercel will pick up `api/index.js` and
   `vercel.json` automatically — no build command needed.
4. Add every variable from `server/.env.example` in **Settings → Environment
   Variables**, with:
   - `APP_URL` = this backend's own Vercel URL (e.g. `https://your-api.vercel.app`)
   - `CLIENT_URL` = your frontend's Vercel URL
   - `NODE_ENV=production` (required — this is what makes the session cookie
     use `Secure` + `SameSite=None`, needed since frontend and backend are on
     different domains)
5. Deploy, then copy the resulting domain into `APP_URL` if you didn't already
   know it, and redeploy.

### Frontend
1. New Project on [vercel.com/new](https://vercel.com/new), **Root Directory: `client`**.
2. Framework preset: Vite.
3. Add environment variable `VITE_API_URL` = your deployed backend's URL.
4. Deploy. `client/vercel.json` already handles SPA routing so client-side
   routes (like `/dashboard`) don't 404 on direct load.

### Final step
Go back to the Google Cloud OAuth client and add the production callback URL
(`https://your-api.vercel.app/api/auth/google/callback`) as an authorized
redirect URI.

## Notes & limitations

- Editing the content of an already-scheduled draft cancels the pending
  QStash job (it reverts to a plain draft) so you don't get two conflicting sends.
- A failed send (e.g. revoked Gmail access) is marked **failed** with the
  error shown in the dashboard — QStash is told not to retry indefinitely.
- Single-tenant per user: everyone only ever sees their own drafts.
- `npm audit` in `client/` flags a few moderate-severity advisories in
  Vite/React Router dev tooling that require major version bumps to clear;
  they don't affect runtime behavior.
