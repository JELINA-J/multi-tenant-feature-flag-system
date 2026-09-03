# Multi-Tenant Feature Flag Management System

![Backend CI](https://github.com/JELINA-J/multi-tenant-feature-flag-system/actions/workflows/ci.yml/badge.svg)

A small SaaS-style feature-flag system with a Node.js/Express backend, MongoDB storage, custom JWT auth, and three separate plain HTML/JS frontends (Super Admin, Org Admin, End User).

## Architecture

```
feature-flag-system/
├── backend/                  Express + MongoDB API
│   └── src/
│       ├── models/           Organization, User (org admins), FeatureFlag
│       ├── routes/           auth, organizations, flags
│       ├── middleware/       JWT auth + role guards
│       ├── config/db.js      Mongo connection
│       └── utils/jwt.js      sign/verify helpers
├── super-admin-frontend/      Login + create/view organizations
├── admin-frontend/            Signup/login + manage feature flags
└── user-frontend/             Public flag-check form (no login)
```

## Data model

- **Organization**: `{ name (unique) }`
- **User** (Org Admins only): `{ email, passwordHash, role, organization }`
- **FeatureFlag**: `{ key, enabled, organization }` — compound unique index on `(organization, key)` so the same key can exist independently per org. This index is the core enforcement point for multi-tenancy at the data layer.

Super Admin is **not** a DB record — per the assignment spec it uses static, config-based credentials from `.env`. This avoids the awkwardness of a "chicken-and-egg" superuser row and keeps the one static account trivially rotatable via environment config.

## Auth design

- Custom JWT implementation (no third-party auth provider), using `bcryptjs` for password hashing and `jsonwebtoken` for signing.
- One shared `requireAuth` middleware verifies any valid token; `requireSuperAdmin` / `requireOrgAdmin` then gate by role.
- Org Admin tokens carry `organization` in the payload, so every scoped route reads `req.orgId` from the token rather than trusting a client-supplied org ID — this is what prevents one org's admin from touching another org's flags.
- The End User "check flag" endpoint is intentionally public/unauthenticated per spec (a simple checkbox/form, no login) — it identifies the org by **name** in the query string. This is a deliberate trade-off: simpler for the assignment's scope, but in a real product you'd want a public API key per org instead of a guessable name.

## Key trade-offs (worth raising in the interview discussion)

- **Plain HTML/JS frontends, not React** — chosen to maximize time spent on backend design (API structure, data modeling, auth) since that's what's being evaluated, while still meeting "basic UI usability is enough."
- **No refresh tokens** — access tokens are valid 8h, long enough for a demo/interview session; a production system would add refresh tokens and shorter access-token lifetimes.
- **Org lookup by name for End User checks** — trades security (guessable org names) for simplicity (no auth flow needed for end users). Flagged as a known limitation above.
- **Automated testing** — Added a Jest + Supertest integration test for the `/health` endpoint, with tests automatically executed through GitHub Actions on every push to `main`.
  
## Self-assessment

- **Performance** — Queries are scoped and indexed where it matters (compound unique index on `organization + key` for feature flags), so lookups stay fast even as flags grow per org. No caching layer or pagination yet — for a system with hundreds of orgs/flags, the `GET /flags` and `GET /organizations` endpoints would need pagination since they currently return full result sets.
- **Readability & Maintainability** — Routes are split by resource (`auth`, `organizations`, `flags`), with a single shared auth middleware reused across role checks, so adding a new role or route follows an existing pattern. Frontend JS is inline per-page rather than modularized, which is fine at this scale but wouldn't scale past 3 apps.
- **Stability** — Duplicate organization names and duplicate flag keys per org are handled explicitly (409 responses via the unique index + try/catch), and auth failures return clear 401/403s rather than crashing. Not yet covered: input sanitization (e.g. very long strings, special characters in flag keys), and there's no rate limiting on the public flag-check endpoint.
- **Testability** — Route handlers are thin and mostly delegate to Mongoose queries, which keeps them easy to unit test in isolation; middleware is also separated out so auth logic can be tested independently of routes. An initial Jest + Supertest integration test covers the health-check endpoint, and the test suite runs automatically through GitHub Actions. A next step would be integration tests per role (Super Admin, Org Admin, End User) covering the happy path and the 401/403/409 cases.
  
## Running locally

**Backend:**
```bash
cd backend
npm install
cp .env.example .env   # fill in your own MongoDB URI
npm run dev             # nodemon, http://localhost:5000
```

**Frontends:** each is a static `index.html` — open directly in a browser, or serve with any static server (e.g. `npx serve .`). All three point to `http://localhost:5000/api` by default.

**Suggested flow to test end-to-end:**
1. Open `super-admin-frontend`, log in with the credentials in `.env`, create an organization.
2. Open `admin-frontend`, sign up under that organization, log in, create a feature flag and toggle it.
3. Open `user-frontend`, enter the organization name and the feature key to confirm the enabled/disabled status.
