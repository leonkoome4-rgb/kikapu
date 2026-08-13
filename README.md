# Kikapu 🧺

**Kikapu** ("basket" in Swahili) is a full-stack group fund and protection platform for Kenyans
chamas, emergency funds, weddings, trips, matanga (funeral) contributions, and harambee
fundraisers. Instead of tracking money through WhatsApp and a notebook, members pool
contributions into one transparent shared basket — with M-Pesa contributions, live balances,
and member-approves claims.

Built by **Group 7** as a Module 5 bootcamp project.

| | |
|---|---|
| Leon Koome | leon.koome@student.moringaschool.com |
| Tracy Mboya | tracy.mboya@student.moringaschool.com |
| Densinela Chepngetich | densinela.chepngetich@student.moringaschool.com |
| Allan Kimani | allan.kimani@student.moringaschool.com |

## Live app

- Frontend: https://kikapu-kappa.vercel.app
- Backend API: https://kikapu-api-lbq9.onrender.com/api

Demo login (password `kikapu123` for all): `leon.koome@student.moringaschool.com`,
`tracy.mboya@student.moringaschool.com`, `densinela.chepngetich@student.moringaschool.com`,
`allan.kimani@student.moringaschool.com`.

> Note: the backend is on Render's free tier, which spins down after 15 minutes of
> inactivity — the first request after idle can take 30-50s to wake up. The free
> PostgreSQL database also expires 30 days after creation (with a 14-day grace period),
> so seed data will need refreshing if the project stays in use past that window.

## Fund types:

One schema, six fund types, differentiated by `fund_type` + `is_public` + `goal_amount`:

| Fund type | Recurring / goal-based | Access | Notes |
|---|---|---|---|
| Chama | Recurring, ongoing balance | Members only | Table-banking |
| Emergency Fund | Recurring, ongoing balance | Members only | Fast-tracked claim approval |
| Matanga | Recurring, ongoing balance | Members only | Fast-tracked claim approval |
| Wedding | Goal-based | Members only, public link optional | |
| Trip | Goal-based | Members only | |
| Harambee | Goal-based | Public, **no login required to contribute** | |

## Tech stack:

- **Frontend:** React (Vite) SPA, React Router, Tailwind CSS — single-page app, no full-page reloads
- **Backend:** Flask REST API, Flask-JWT-Extended, SQLAlchemy, Flask-Migrate
- **Database:** PostgreSQL in production, SQLite for local dev
- **Deployment:** Vercel/Netlify (frontend), Render/Railway (backend) — free tiers

## Architecture

```
kikapu/
├── backend/            Flask REST API
│   ├── app/
│   │   ├── models/      SQLAlchemy models
│   │   ├── routes/      Blueprints (auth, groups, contributions, claims, notifications, ussd)
│   │   ├── services/    M-Pesa Daraja client + pluggable notification service
│   │   └── utils/       Password reset token helpers
│   ├── seed.py          Demo data seed script
│   ├── main.py          Dev entrypoint (starts ngrok tunnel when NGROK_AUTHTOKEN set)
│   └── wsgi.py          Production WSGI entrypoint (gunicorn wsgi:app)
└── frontend/            React SPA
    └── src/
        ├── apis/          Axios client + endpoint wrappers
        ├── context/      Auth context (JWT access/refresh)
        ├── components/   Shared UI (layout, buttons, cards, badges)
        └── pages/        Routed pages
```

## Database schema

4 core models plus `Membership` as the many-to-many join table between `User` and `Group`.

- **User** — id, name, phone, email, password_hash, role, sms_notifications, email_notifications, created_at
- **Group** — id, name, fund_type, goal_amount (nullable), is_public, admin_id (FK → User), description, balance, public_slug, created_at
- **Membership** — id, user_id (FK), group_id (FK), joined_date, role, is_active — join table for the **many-to-many** User ↔ Group relationship
- **Contribution** — id, group_id (FK), user_id (FK), amount, mpesa_ref, status, checkout_request_id, created_at
- **Claim** — id, group_id (FK), user_id (FK), amount_requested, reason, status, created_at, reviewed_at
- **Notification** — id, user_id (FK), message, channel, sent_at, status

Relationships:
- **One-to-many:** User → Group (as admin), Group → Contribution, Group → Claim, User → Notification, etc.
- **Many-to-many:** User ↔ Group via `Membership`

## Core flow

1. Register / log in → receive JWT access + refresh tokens
2. Create a fund (pick one of 6 fund types) or join an existing one
3. Contribute via M-Pesa Daraja STK Push (sandbox) → fund balance updates automatically
4. File a claim (emergency/matanga are fast-tracked; others need approval) or track progress toward a goal (wedding/trip/harambee)
5. Group admin approves/rejects pending claims
6. A notification is sent via the pluggable notification service (SMS + email, swappable per environment variable)

No smartphone? Dial the **USSD** shortcode (`*384*100#` by default) to browse
public funds, contribute with M-Pesa, check your balances and file claims —
see [the USSD section](#ussd-channel) below.

## Getting started

### Prerequisites

- Python 3.11+ (3.14 tested)
- Node 20+
- (Optional) PostgreSQL — SQLite is used automatically if `DATABASE_URL` isn't set

### 1. Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # edit as needed
python seed.py                   # creates tables + seeds the local database with demo data
python main.py                   # runs on http://localhost:5000
```

> **macOS note:** port 5000 is often claimed by AirPlay Receiver. If you see
> "Address already in use", either disable AirPlay Receiver in System Settings
> or run on another port: `python -c "from app import create_app; create_app().run(port=5001)"`.

> **Exposing callbacks (M-Pesa / USSD):** set `NGROK_AUTHTOKEN` in
> `backend/.env` and run `python main.py` — it auto-starts an ngrok tunnel,
> prints the public URL, and repoints `MPESA_CALLBACK_URL` at it so Safaricom
> and Africa's Talking can reach your local machine. Paste the printed
> `https://<id>.ngrok.app/api/ussd` into the AT dashboard as the USSD callback.

Seeded demo accounts (password `kikapu123` for all):

- leon.koome@student.moringaschool.com
- tracy.mboya@student.moringaschool.com
- densinela.chepngetich@student.moringaschool.com
- allan.kimani@student.moringaschool.com
- wanjiku.mwangi@example.com

### 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env.local       # set VITE_API_URL to your backend URL
npm run dev                      # runs on http://localhost:5173
```

### 3. Try it out

Log in with a seeded account, open a fund from the dashboard, contribute (M-Pesa sandbox
credentials aren't required — the app simulates a successful STK push when they're absent),
file a claim, and review it as the fund admin.

## Environment variables

### Backend (`backend/.env`)

| Variable | Purpose |
|---|---|
| `SECRET_KEY` / `JWT_SECRET_KEY` | Flask session + JWT signing keys |
| `DATABASE_URL` | Postgres URL in production; defaults to local SQLite |
| `FRONTEND_ORIGIN` | Allowed CORS origin |
| `MPESA_*` | Daraja sandbox/production credentials (STK push simulated when unset) |
| `SMS_PROVIDER` | `console` \| `africastalking` \| `twilio` |
| `EMAIL_PROVIDER` | `console` \| `smtp` |
| `USSD_CODE` | The USSD shortcode shown in the UI (default `*384*100#`) |

### Frontend (`frontend/.env.local`)

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base URL of the backend API (e.g. `http://localhost:5000/api`) |

## Notification service

Notifications are sent through a small provider interface (`app/services/notifications/`)
so the SMS/emails vendor can be swapped per environment without touching business logic:

- SMS: `console` (dev, logs only), `africastalking`, `twilio`
- Email: `console` (dev, logs only), `smtp`

Every attempt — success or failure — is logged as a `Notification` row, and users can toggle
SMS/email delivery from the **Notification preferences** screen.

## API overview

All endpoints are prefixed with `/api`. JSON in, JSON out — no server-rendered pages.

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | – | Create an account, returns JWT pair |
| POST | `/auth/login` | – | Log in, returns JWT pair |
| POST | `/auth/refresh` | refresh token | Rotate access token |
| GET | `/auth/me` | ✅ | Current user profile |
| POST | `/auth/forgot-password` | – | Request a reset code |
| POST | `/auth/reset-password` | – | Reset password with code |
| GET | `/groups` | – | List public funds |
| GET | `/groups/mine` | ✅ | List my funds |
| POST | `/groups` | ✅ | Create a fund |
| GET | `/groups/:id` | optional | Fund detail |
| PUT | `/groups/:id` | ✅ (admin) | Update a fund |
| DELETE | `/groups/:id` | ✅ (admin) | Delete a fund |
| POST | `/groups/:id/join` | ✅ | Join a fund |
| GET | `/groups/:id/members` | ✅ | List members |
| POST | `/contributions` | optional | Contribute (STK push); no auth needed for harambee |
| GET | `/contributions/mine` | ✅ | My contributions |
| GET | `/contributions/group/:id` | ✅ | Fund's contributions |
| PUT | `/contributions/:id` | ✅ (admin) | Correct a contribution's status |
| DELETE | `/contributions/:id` | ✅ (admin) | Remove a contribution |
| POST | `/claims` | ✅ | File a claim |
| GET | `/claims/group/:id` | ✅ | Fund's claims |
| PUT | `/claims/:id` | ✅ (admin) | Approve / reject |
| DELETE | `/claims/:id` | ✅ | Withdraw my pending claim |
| GET / PUT | `/notifications/preferences` | ✅ | SMS/email toggles |
| POST | `/ussd` | – | Africa's Talking USSD callback (form-encoded) |

This exceeds the minimum of 8 endpoints (2+ per HTTP method) and 5+ JWT-protected endpoints.

## USSD channel

Kikapu exposes a USSD menu over [Africa's Talking USSD](https://developers.africastalking.com/docs/ussd/overview),
so members without smartphones (or with no data bundle) can interact with their
funds by dialing a shortcode. AT POSTs the session (`sessionId`, `phoneNumber`,
`serviceCode`, `text`) form-encoded to the callback, and we reply with plain text
beginning with `CON` (keep the session open) or `END` (terminate it).

```text
Welcome to Kikapu. Your shared basket.   ← dial *384*100#
1. Browse public funds
2. Contribute
3. My funds
4. File a claim
```

| Menu path | Response |
|---|---|
| (dial in) | Main menu |
| `1` | List public funds |
| `2` | Enter the fund ID |
| `2*<fund_id>` | Enter amount in KES |
| `2*<fund_id>*<amount>` | Triggers an M-Pesa STK push to the caller's number |
| `3` | List my funds (name + balance) |
| `3*<fund_id>` | Single fund balance |
| `4` | Enter the fund ID |
| `4*<fund_id>*<amount>*<reason>` | Files a claim (fast-tracked on emergency/matanga) |

Callers are matched to their account by phone number, so contributions and
claims go straight to the right user. Contributing to a **public** fund from an
unknown number creates a guest account (no login needed), while private funds
require an existing membership.

**Setup:** in the Africa's Talking dashboard, create a USSD service code and set
its callback URL to `https://<your-backend-url>/api/ussd`. The app itself only
uses `USSD_CODE` to display the shortcode in the UI — routing is handled by AT.

## Frontend routes

8+ routes, 5+ requiring authentication:

**Public:** `/`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/browse`, `/harambee/:slug`

**Protected:** `/dashboard`, `/groups/create`, `/groups/:id`, `/groups/:id/contribute`, `/groups/:id/claims`, `/notifications`, `/profile`

## Deployment

Push this repo to GitHub first — both Render and Vercel/Netlify deploy by connecting to a
GitHub repo, not by uploading files.

```bash
gh repo create kikapu --public --source=. --remote=origin --push
# or, without gh: create an empty repo on github.com, then
git remote add origin https://github.com/<you>/kikapu.git
git push -u origin main
```

### 1. Backend → Render

1. Go to [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint**.
2. Connect your GitHub account and select the `kikapu` repo. Render will detect
   `render.yaml` at the repo root and show the `kikapu-api` web service + `kikapu-db`
   Postgres database it defines — click **Apply**.
3. Once created, open the `kikapu-api` service → **Environment** and set `FRONTEND_ORIGIN`
   (you can leave it blank for now and come back after step 2 below). `SECRET_KEY`,
   `JWT_SECRET_KEY`, and `DATABASE_URL` are already wired up by the blueprint.
4. Render runs `pip install -r requirements.txt && flask db upgrade` on every deploy, so the
   schema is created automatically — no manual migration step needed.
5. Copy the service's public URL (e.g. `https://kikapu-api.onrender.com`) — you'll need it
   for the frontend. Confirm it's alive: `curl https://kikapu-api.onrender.com/api/health`.
6. (Optional) To load demo data: open the service's **Shell** tab in the Render dashboard
   and run `python seed.py`.
7. To enable real M-Pesa STK Push (rather than the local simulated fallback), set these four
   env vars on the `kikapu-api` service from your Daraja sandbox app's credentials:
   `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_PASSKEY`, and `MPESA_CALLBACK_URL`
   (set this to `https://<your-render-url>/api/contributions/mpesa/callback` — the deployed
   backend has a real public URL, so unlike local dev, Safaricom can actually reach this
   callback).

> Free-tier Render web services spin down after 15 minutes of inactivity — the first
> request after idling can take ~30–60s to respond while it wakes up.

### 2. Frontend → Vercel or Netlify

**Vercel:**
1. Go to [vercel.com/new](https://vercel.com/new), import the `kikapu` GitHub repo.
2. Set **Root Directory** to `frontend`.
3. Add an environment variable `VITE_API_URL` = `https://kikapu-api.onrender.com/api`
   (your Render URL + `/api`).
4. Deploy. `frontend/vercel.json` handles SPA fallback routing so client-side routes like
   `/dashboard` don't 404 on refresh.

**Netlify (alternative):**
1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing
   project**, pick the `kikapu` repo.
2. Set **Base directory** to `frontend` (build command/publish directory are already defined
   in `frontend/netlify.toml`).
3. Add the same `VITE_API_URL` environment variable under **Site settings → Environment
   variables**.
4. Deploy.

### 3. Close the loop

Once the frontend has its own URL (e.g. `https://kikapu.vercel.app`), go back to the Render
service's environment variables and set `FRONTEND_ORIGIN` to that URL, then redeploy the
backend — this is what allows the browser's CORS preflight to succeed. Verify by logging in
on the live frontend URL and confirming the dashboard loads.

## License

MIT — see [LICENSE](LICENSE).
