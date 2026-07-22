# Kikapu 🧺

**Kikapu** ("basket" in Swahili) is a full-stack group fund and protection platform for Kenyan
chamas, emergency funds, weddings, trips, matanga (funeral) contributions, and harambee
fundraisers. Instead of tracking money through WhatsApp and a notebook, members pool
contributions into one transparent shared basket — with M-Pesa contributions, live balances,
and member-approved claims.

Built by **Group 7** as a Module 5 bootcamp project.

| | |
|---|---|
| Leon Koome | leon.koome@student.moringaschool.com |
| Tracy Mboya | tracy.mboya@student.moringaschool.com |
| Densinela Chepngetich | densinela.chepngetich@student.moringaschool.com |
| Allan Kimani | allan.kimani@student.moringaschool.com |

## Live app

- Frontend: _add deployed URL here_
- Backend API: _add deployed URL here_

## Fund types

One schema, six fund types, differentiated by `fund_type` + `is_public` + `goal_amount`:

| Fund type | Recurring / goal-based | Access | Notes |
|---|---|---|---|
| Chama | Recurring, ongoing balance | Members only | Table-banking |
| Emergency Fund | Recurring, ongoing balance | Members only | Fast-tracked claim approval |
| Matanga | Recurring, ongoing balance | Members only | Fast-tracked claim approval |
| Wedding | Goal-based | Members only, public link optional | |
| Trip | Goal-based | Members only | |
| Harambee | Goal-based | Public, **no login required to contribute** | |

## Tech stack

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
│   │   ├── routes/      Blueprints (auth, groups, contributions, claims, notifications)
│   │   ├── services/    M-Pesa Daraja client + pluggable notification service
│   │   └── utils/       Password reset token helpers
│   ├── seed.py          Demo data seed script
│   └── wsgi.py          App entrypoint
└── frontend/            React SPA
    └── src/
        ├── api/          Axios client + endpoint wrappers
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
python wsgi.py                   # runs on http://localhost:5000
```

> **macOS note:** port 5000 is often claimed by AirPlay Receiver. If you see
> "Address already in use", either disable AirPlay Receiver in System Settings
> or run on another port: `python -c "from app import create_app; create_app().run(port=5001)"`.

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

### Frontend (`frontend/.env.local`)

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base URL of the backend API (e.g. `http://localhost:5000/api`) |

## Notification service

Notifications are sent through a small provider interface (`app/services/notifications/`)
so the SMS/email vendor can be swapped per environment without touching business logic:

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

This exceeds the minimum of 8 endpoints (2+ per HTTP method) and 5+ JWT-protected endpoints.

## Frontend routes

8+ routes, 5+ requiring authentication:

**Public:** `/`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/browse`, `/harambee/:slug`

**Protected:** `/dashboard`, `/groups/create`, `/groups/:id`, `/groups/:id/contribute`, `/groups/:id/claims`, `/notifications`, `/profile`

## Deployment

### Backend → Render

A `render.yaml` blueprint is included at the repo root (Postgres + web service, free tier).
Point Render at this repo and it will provision both from the blueprint, running
`flask db upgrade` on every deploy to keep the schema current. Set `FRONTEND_ORIGIN` to your
deployed frontend URL once it exists. To load demo data on the deployed database, run
`python seed.py` once from a Render shell (or locally with `DATABASE_URL` pointed at it).

### Frontend → Vercel or Netlify

Both `frontend/vercel.json` and `frontend/netlify.toml` are included with SPA fallback
routing configured. Set the `VITE_API_URL` build environment variable to your deployed
backend's `/api` URL.

## License

MIT — see [LICENSE](LICENSE).
