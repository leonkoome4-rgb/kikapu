# Kikapu — Project Tracker

**Group 7 — Moringa School, Module 5**

This document is the single source of truth for who owns what in Kikapu. Each
teammate has a dedicated git branch named after them; use it as your working
branch for any further changes to your area, and open a pull request into
`main` when a change is ready for the rest of the team to review.

## Team & branches

| Member | Email | Branch | Primary role |
|---|---|---|---|
| Leon Koome | leon.koome@student.moringaschool.com | [`leon-koome`](../../tree/leon-koome) | Team lead & Backend Engineer |
| Tracy Mboya | tracy.mboya@student.moringaschool.com | [`tracy-mboya`](../../tree/tracy-mboya) | Frontend Lead |
| Densinela Chepngetich | densinela.chepngetich@student.moringaschool.com | [`densinela-chepngetich`](../../tree/densinela-chepngetich) | Payments & Integrations Engineer |
| Allan Kimani | allan.kimani@student.moringaschool.com | [`allan-kimani`](../../tree/allan-kimani) | Fund Management & Claims Engineer |

All four branches currently point at the same working `main` snapshot — the
MVP is complete and merged. Going forward, each person should branch from
`main` for new work (`git checkout main && git pull && git checkout -b
leon-koome/<short-description>`), rather than committing directly to their
name-branch, so the name-branch stays a clean reference point for "whatever
this person currently owns."

## Workflow

1. Pull the latest `main`.
2. Branch off `main` using `<your-branch>/<feature-name>` (e.g.
   `tracy-mboya/dark-mode`).
3. Commit in small, incremental steps with clear messages.
4. Open a PR into `main`; at least one other teammate reviews before merging.
5. Update this tracker's status column when a task changes state.

---

## Leon Koome — Team Lead & Backend Engineer

**Owns:** Flask app architecture, database layer, authentication, group
management, deployment.

| Area | Files | Status |
|---|---|---|
| App factory, config, extensions | `backend/app/__init__.py`, `backend/config.py`, `backend/app/extensions.py` | ✅ Done |
| Database models (all 6) | `backend/app/models/` | ✅ Done |
| JWT auth (register/login/refresh) + password reset | `backend/app/routes/auth.py`, `backend/app/utils/tokens.py` | ✅ Done |
| Group & membership APIs (CRUD, join, members) | `backend/app/routes/groups.py` | ✅ Done |
| Alembic migrations | `backend/migrations/` | ✅ Done |
| Seed script (demo users/groups/data) | `backend/seed.py` | ✅ Done |
| Render deployment blueprint + Procfile | `render.yaml`, `backend/Procfile` | ✅ Done |
| README, LICENSE, project docs | `README.md`, `LICENSE`, this file | ✅ Done |

**Next up:** wire the production M-Pesa Go Live credentials once Safaricom
issues them; add rate-limit backoff/queueing in front of the Daraja sandbox
calls if usage grows.

---

## Tracy Mboya — Frontend Lead

**Owns:** App shell, brand system, routing, auth UX, dashboard/profile.

| Area | Files | Status |
|---|---|---|
| Vite + React + Tailwind scaffold, routing | `frontend/src/App.jsx`, `frontend/src/main.jsx`, `frontend/vite.config.js` | ✅ Done |
| Brand system (colors, type, logo) | `frontend/src/index.css`, `frontend/src/components/Logo.jsx`, `frontend/public/favicon.svg` | ✅ Done |
| Auth pages: Login, Register, Forgot/Reset Password | `frontend/src/pages/Login.jsx`, `Register.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx` | ✅ Done |
| Auth context + JWT-aware API client (auto refresh) | `frontend/src/context/AuthContext.jsx`, `frontend/src/api/client.js` | ✅ Done |
| Protected route guard + app layout/nav | `frontend/src/components/ProtectedRoute.jsx`, `AppLayout.jsx`, `Navbar.jsx` | ✅ Done |
| Dashboard (balance, stats, activity feed) | `frontend/src/pages/Dashboard.jsx` | ✅ Done |
| Profile page | `frontend/src/pages/Profile.jsx` | ✅ Done |

**Next up:** add loading skeletons instead of plain "Loading…" text; dark
mode pass over the brand palette.

---

## Densinela Chepngetich — Payments & Integrations Engineer

**Owns:** M-Pesa Daraja integration, phone validation, contribution flow,
notification delivery.

| Area | Files | Status |
|---|---|---|
| M-Pesa Daraja STK Push + STK Push Query (status polling) | `backend/app/services/mpesa.py` | ✅ Done — verified against live Safaricom sandbox |
| Kenyan phone number normalization/validation | `backend/app/utils/phone.py` | ✅ Done |
| Contribution routes (create/list/update/delete, M-Pesa callback) | `backend/app/routes/contributions.py` | ✅ Done |
| Pluggable notification service (console/Africa's Talking/Twilio/SMTP) | `backend/app/services/notifications/` | ✅ Done |
| Notification preferences page | `frontend/src/pages/NotificationPreferences.jsx` | ✅ Done |
| Contribute page + live status polling UI | `frontend/src/pages/Contribute.jsx`, `frontend/src/hooks/useContributionPolling.js` | ✅ Done |
| Public harambee contribution page (no login) | `frontend/src/pages/HarambeePublic.jsx` | ✅ Done |

**Next up:** once a public callback URL exists (post-deploy), confirm the
`/api/contributions/mpesa/callback` webhook path end-to-end instead of
relying on status polling; add Africa's Talking/Twilio credentials for a
real (non-console) notification demo.

---

## Allan Kimani — Fund Management & Claims Engineer

**Owns:** Fund creation, claims workflow, group detail, public fund
discovery, visual content.

| Area | Files | Status |
|---|---|---|
| Claims routes (file/approve/reject/withdraw, fast-track logic) | `backend/app/routes/claims.py` | ✅ Done |
| Create-a-fund flow (6 fund-type picker + goal fields) | `frontend/src/pages/CreateFund.jsx`, `frontend/src/constants/fundTypes.js` | ✅ Done |
| Group detail page (balance, activity, members, join flow) | `frontend/src/pages/GroupDetail.jsx` | ✅ Done |
| Claims page (file/review/withdraw UI) | `frontend/src/pages/Claims.jsx` | ✅ Done |
| Browse public funds page | `frontend/src/pages/BrowsePublicFunds.jsx` | ✅ Done |
| Real photography across fund-type UI | `frontend/public/images/` | ✅ Done |

**Next up:** member invite links for private groups; per-member contribution
leaderboard on the group detail page.

---

## Cross-cutting / shared

- **Vercel/Netlify frontend deploy config** (`frontend/vercel.json`,
  `frontend/netlify.toml`) — Leon, reviewed by Tracy.
- **Full backend verification** (auth, groups, contributions, claims,
  notifications smoke-tested end-to-end via curl and Playwright) — Leon,
  with Densinela verifying the M-Pesa-specific paths.
- **Frontend visual QA** (Playwright screenshots across all 14 routes,
  brand-consistency pass) — Tracy, with Allan verifying fund-type imagery.

## Submission checklist status

| Requirement | Status |
|---|---|
| 8+ frontend routes, 5+ protected | ✅ 14 routes total, 7 protected |
| Working password reset flow | ✅ |
| 8+ backend endpoints, 2+ per method | ✅ 29 endpoints |
| 5+ JWT-protected endpoints | ✅ ~20 |
| JWT access + refresh tokens | ✅ |
| 4+ models, 4+ columns beyond PK | ✅ 6 models |
| 2+ one-to-many, 1+ many-to-many | ✅ |
| README, MIT license, seed script | ✅ |
| Clean incremental git history | ✅ |
| Deployed frontend + backend | ⬜ pending hosting step (see README § Deployment) |
