# Tharwah Team Energy Matrix

A bilingual (Arabic/English) HR diagnostic tool that measures where a team sits on the
Emotional Energy Matrix — **Performance, Survival, Burnout, Renewal** — by combining:

1. **Quadrant Time-Distribution Audit** — respondents allocate their last-30-days working
   hours across the four quadrants (must sum to 100%).
2. **8-Item Behavioral Diagnostic** — two items per quadrant (S1/S2, P1/P2, B1/B2, R1/R2),
   rated 1 (Never) – 5 (Always). The highest-scoring pair is the dominant operating baseline.

Responses feed a password-protected admin dashboard with aggregate analytics, trend views,
and risk flags. This is an internal HR tool built to hold real employee data — see
[Security](#security) and [PDPL compliance](#pdpl-compliance) below.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | Single deployable repo — frontend, API routes, and server-only scoring logic all live together, no separate backend service. |
| Database | PostgreSQL via Prisma ORM | Real relational DB with migrations; clean separation of raw answers / computed scores. |
| Styling | Tailwind CSS (v3), Tharwah brand tokens in `src/app/globals.css` | Utility-first, easy to keep the palette centralized. |
| Charts | Recharts | Bar / line / scatter charts, works fine in RTL page contexts (see below). |
| Admin auth | `iron-session` (encrypted, signed, expiring cookie) + `bcryptjs` | No third-party auth service required; password never stored in reversible form. |
| Validation | `zod` | Structural validation, layered in front of `src/lib/scoring.ts`. |

All dependency versions are pinned in `package.json`; `npm audit` reports **0
vulnerabilities** at the time of writing (two transitive advisories — `deepmerge-ts` via
`@prisma/config` and a stale `postcss` bundled by an internal tool — are pinned to patched
versions via `overrides`).

## Data model

See `prisma/schema.prisma` for the full schema. The key design rule from the build brief —
**raw answers, computed scores, and timestamps are stored separately** — is implemented as:

- `Response` — one row per submission: timestamps, consent timestamp, optional
  team/department/cycle label. No name, email, or employee ID field exists anywhere in the
  schema (see [Decisions Log](#decisions-log)).
- `QuadrantAudit` — the four raw Section A percentages, 1:1 with `Response`.
- `BehavioralItem` — one row per Section B item (8 rows per response) with the raw 1–5 score.
- `ComputedScore` — server-computed pair sums, dominant baseline (with explicit tie
  handling), and risk-zone labels. **Always** written by `src/lib/scoring.ts`, never by
  client input.
- `AdminUser`, `LoginAttempt`, `AuditLog`, `SubmissionRateLimit` — auth, brute-force
  lockout, and the PDPL audit trail.

**Scoring logic is centralized in `src/lib/scoring.ts`.** It's the single source of truth
for: percentage-sum validation, item-range validation, pair sums, dominant-baseline/tie
detection, risk-zone banding, and the derived stress/energy coordinates used by the admin
2×2 scatter chart. The frontend (`src/components/SurveyWizard.tsx`) only does light UX
validation (is the total 100% yet, are all 8 items answered) — every submission is
re-validated and (re-)scored server-side in `src/app/api/submit/route.ts` before anything
is written to the database.

## Getting started (local development)

**Prerequisites:** Node.js ≥ 20, a PostgreSQL 14+ instance.

```bash
npm install                    # also runs `prisma generate` via postinstall
cp .env.example .env
# edit .env — at minimum set DATABASE_URL and SESSION_SECRET (see below)

npx prisma migrate deploy      # applies prisma/migrations/ to your database
npm run admin:create           # interactive: creates the admin username/password

npm run dev                    # http://localhost:3000
```

> **On Windows (Command Prompt):** `cp` isn't a `cmd.exe` command — use `copy .env.example .env`
> instead, and edit `.env` with Notepad or VS Code (not a word processor). If you hit
> `the URL must start with the protocol postgresql://` from a command that just printed
> "Environment variables loaded from .env", the `.env` file's encoding or a stray
> character is confusing the parser — don't debug it, just set the variable for that
> terminal session directly and re-run the command:
> ```
> set DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
> echo %DATABASE_URL%
> npx prisma migrate deploy
> ```
> (no quotes around the value in `cmd.exe` — unlike bash, quotes become part of the
> string.) If `npm run admin:create` fails with `@prisma/client did not initialize yet`,
> run `npx prisma generate` once — it should already have run via `postinstall`, but
> run it manually if `npm install` was invoked with `--ignore-scripts` or similar.

Visit `http://localhost:3000` (redirects to `/en`) for the questionnaire, or
`/admin/login` for the dashboard.

### Environment variables

All secrets are read from the environment — nothing is hard-coded, nothing is committed.
See `.env.example` for the full list with inline documentation:

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string (Prisma format). |
| `SESSION_SECRET` | yes | ≥32-char random string encrypting the admin session cookie. Generate with `openssl rand -base64 32`. |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH` | optional | Used only by `npm run db:seed` as an alternative to `npm run admin:create`. |
| `DATA_RETENTION_MONTHS` | optional (default 18) | Retention window enforced by `scripts/retention.ts` and shown to respondents in the consent notice. |
| `FORCE_SECURE_COOKIES` | optional (default true) | Set to `false` only for local `http://` development — controls the `Secure` cookie flag. |

### Migrations & seeding

```bash
npx prisma migrate deploy   # production: apply committed migrations
npx prisma migrate dev      # development: create a new migration from schema changes
npm run db:seed             # idempotent: upserts ADMIN_USERNAME/ADMIN_PASSWORD_HASH if set
```

### Creating / resetting the admin account

There is a single shared admin credential in v1 (per the build brief). Create or reset it
directly against the database — the password is bcrypt-hashed (cost 12) before it touches
storage and is never logged:

```bash
npm run admin:create -- --username admin --password 'a-strong-passphrase-12-chars-min'
# or run with no flags for interactive prompts
```

### Running the checks used in CI/before a deploy

```bash
npm run typecheck   # tsc --noEmit
npm run lint         # next lint (ESLint, flat config)
npm run build         # prisma generate + next build
```

## Deployment

This is a standard Next.js app (App Router, Node.js runtime for all API routes and
server-rendered pages, Edge runtime only for `middleware.ts`) — deploy it anywhere that
runs `npm run build` + `npm run start` and gives you a persistent Postgres connection
(Vercel + a managed Postgres, a container platform, or a VM). Concretely:

1. Provision PostgreSQL. **Data-residency is a deployment decision Tharwah must confirm** —
   PDPL expects personal data about Saudi-based employees to be hosted consistently with
   Saudi regulatory expectations; pick a provider/region accordingly (see
   [Decisions Log](#decisions-log)).
2. Set the environment variables above on the host.
3. Run `npx prisma migrate deploy` against the production database (once, and again on
   every deploy that adds a migration).
4. Run `npm run admin:create` once to create the real admin credential.
5. `npm run build && npm run start`, behind HTTPS (see [Security](#security) — HSTS is
   already sent by the app, but TLS termination is the host's job).
6. Schedule `npm run retention:run` (see [PDPL compliance](#pdpl-compliance)).

## Security

- **Password hashing:** `bcryptjs`, cost factor 12. Plaintext is never stored, logged, or
  transmitted anywhere except the initial HTTPS login request.
- **Sessions:** `iron-session` — an encrypted + signed, `HttpOnly`, `SameSite=Lax` cookie
  with an 8-hour expiry, re-validated on every admin request (`src/lib/session.ts`). Not a
  permanent cookie.
- **CSRF:** double-submit-cookie pattern (`src/lib/csrf.ts`, `src/middleware.ts`) on every
  state-changing request — questionnaire submission, admin login, logout, delete, and (as
  defense in depth) also checked for consistency on the export link's session requirement.
- **Brute-force protection:** admin login locks out after 5 failed attempts per username
  within a 15-minute window (`src/lib/auth.ts`); a nonexistent username still runs a dummy
  bcrypt compare so response timing doesn't leak account existence.
- **Rate limiting:** the public `/api/submit` endpoint is limited to 20 submissions per IP
  per hour, enforced in the database (`src/lib/rate-limit.ts`) — no extra infrastructure
  required.
- **Input validation:** every field is validated server-side with `zod`
  (`src/lib/validation.ts`) *and* re-checked by the scoring module's own business rules
  (percentage sum, rating range) before anything is persisted.
- **Security headers:** HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  a restrictive CSP, and `Referrer-Policy` are set for every response (`next.config.mjs`).
- **No secrets in the client bundle:** all secrets are read via `process.env` in
  server-only modules (route handlers, Server Components); nothing prefixed
  `NEXT_PUBLIC_` is used for sensitive configuration.
- **Audit trail:** every admin login, dashboard view, response view, CSV export, and
  response deletion is logged to `AuditLog` (who, what, when, source IP) and surfaced in
  the dashboard's "recent admin activity" panel.
- **Admin routes excluded from search indexing:** `robots.txt` disallows `/admin/` and
  `/api/`; the admin layout also sets `robots: noindex`.

## PDPL compliance

Implemented in code (not just documented):

- ✅ **Explicit consent screen** before any data is collected (`SurveyWizard` consent
  step) — states what's collected, why, retention period, and who can access it.
- ✅ **Data minimization** — team/department/cycle are optional, clearly marked, free-text
  fields; no name, email, or employee ID is collected anywhere.
- ✅ **Anonymous by default** — see [Decisions Log](#decisions-log).
- ✅ **Retention enforcement** — `scripts/retention.ts` anonymizes (clears
  team/department/cycle, stamps `anonymizedAt`) any response older than
  `DATA_RETENTION_MONTHS`. Quadrant/behavioral/computed data is kept (it carries no
  identifying information) so historical trend charts keep working.
- ✅ **Encryption in transit** — HSTS enforced; the app assumes/requires HTTPS termination
  at the host.
- ✅ **Audit trail** — see above.
- ✅ **Admin-only access** — password-protected, session-expiring, rate-limited.

Requires a manual/organizational process (v1 — flagged explicitly rather than silently
assumed away):

- ⚠️ **Right to access/erasure for a specific individual.** Because responses are
  anonymous by default, Tharwah generally *cannot* look up "which response belongs to
  employee X" — there is nothing linking a response to an identity. If an employee asks
  what was collected about them, the honest answer is "an anonymous record that cannot be
  distinguished from any other" unless named tracking is explicitly enabled (it isn't, in
  this build). If a specific response nonetheless needs to be deleted (e.g., a respondent
  self-identifies and asks), an admin can do this from **Admin → Responses → \[response\]
  → Delete (erasure request)**, which is a real, audited, cascading delete
  (`DELETE /api/admin/responses/[id]`) — this is the "manual admin action for v1"
  referenced in the build brief.
- ⚠️ **Scheduling the retention job.** `npm run retention:run` is a script, not a
  self-scheduling cron daemon (keeping the deployable surface to "a Next.js app + a
  database", per the brief). Schedule it with your host's scheduled-job/cron feature or an
  OS-level cron entry — see the comment at the top of `scripts/retention.ts` for an example
  crontab line.
- ⚠️ **Encryption at rest.** This app doesn't manage disk encryption itself — enable it at
  the database provider level (most managed Postgres offerings encrypt at rest by
  default; confirm with your provider).
- ⚠️ **Data residency.** See [Decisions Log](#decisions-log) — pick a provider/region and
  confirm it meets Tharwah's regulatory obligations.

## Decisions Log

Things this build had to decide unilaterally, in the absence of the actual source
instrument text or explicit direction — confirm or override each with Tharwah:

1. **Anonymous by default, no named tracking.** The build brief flagged this explicitly as
   a decision point. This build defaults to fully anonymous submissions (no name, email,
   or employee ID field exists in the schema at all) because it's the safer PDPL default
   and matches "results are admin-only, to avoid self-diagnosis anxiety." If Tharwah needs
   named tracking (e.g., to follow one respondent's trend over time), that's a schema
   change and a separate, explicitly-consented flow — it should not be silently retrofitted
   onto this anonymous flow.
2. **Behavioral item wording.** The 8 statements in `src/lib/i18n/dictionaries.ts`
   (`sectionB.items`) were authored to fit the instrument's stated structure (2 items per
   quadrant, 1–5 "Never–Always" scale) because the source instrument's exact item text
   wasn't supplied. **Confirm this wording against the real Tharwah instrument before this
   ships** — the scoring math (`src/lib/scoring.ts`) is independent of the exact wording,
   so swapping in the real text is a one-file change to the dictionary.
3. **Quadrant descriptors (Section A helper text).** Same caveat as above — authored to
   match the four quadrant definitions given in the brief, not sourced from the original
   instrument.
4. **7–10 zone-name mapping.** The brief named four zone labels ("overload, preservation,
   crisis, optimization") without stating which belongs to which quadrant. This build maps:
   Survival → *Overload Zone*, Performance → *Optimization Zone*, Burnout → *Crisis Zone*,
   Renewal → *Preservation Zone* (see the comment above `ZONE_BY_QUADRANT` in
   `src/lib/scoring.ts`). Confirm or correct this mapping — it's a one-line change per
   quadrant.
5. **Risk-flag thresholds.** `RISK_THRESHOLDS` in `src/lib/scoring.ts`: Survival-dominant
   share >30% (matches the brief's example), Burnout-dominant share >20%, average
   Burnout-quadrant time >25%, and the ">30% Survival for two consecutive cycles" flag.
   These are reasonable playbook-style defaults, not values sourced from an official
   Tharwah playbook — tune them in that one file.
6. **Tech stack** (see the [table above](#tech-stack)) — Next.js/Postgres/Prisma chosen for
   a single deployable repo with no undocumented separate services, per the constraint.
7. **Data region/hosting provider** — deliberately left unset; see
   [PDPL compliance](#pdpl-compliance).
8. **Tharwah Academy logo.** The authentic vector/transparent asset still wasn't supplied
   as a file — only a reference image shown in chat, which this session has no tool to
   save as-is. `public/brand/tharwah-logo.svg` is a hand-recreated approximation built
   from that reference (same layout: ring mark, THARWAH wordmark, "ACADEMY" pill,
   ~1.793 aspect ratio) and is wired into both the respondent header
   (`src/components/Header.tsx`) and the admin header (`src/components/AdminShell.tsx`).
   **Treat it as a placeholder, not the final brand asset** — replace that one file with
   the real logo (transparent background) once Tharwah provides it; nothing else needs to
   change. Bahij Janna
   (the brand's Arabic display font) is referenced first in the Arabic font stack but is a
   licensed, non-web font — it will only render for a visitor who already has it installed
   locally; everyone else gets the documented fallback, IBM Plex Sans Arabic, loaded from
   Google Fonts.
9. **Submission-cycle grouping.** "Cycle" is a free-text optional field (e.g. `2026-Q1`)
   rather than a managed list of cycles — simplest thing that supports the trend view
   without adding an admin "manage cycles" screen. If no cycle labels are collected yet,
   the trend chart falls back to grouping by submission month so it's still useful from
   day one.

## Project structure

```
prisma/schema.prisma          Data model (see "Data model" above)
prisma/migrations/            Generated + applied against a real Postgres instance
prisma/seed.ts                Idempotent admin-user seed
scripts/create-admin.ts       Create/reset the admin credential
scripts/retention.ts          PDPL retention job
src/lib/scoring.ts            Single source of truth for all scoring logic
src/lib/validation.ts         zod schemas (structural validation)
src/lib/session.ts, auth.ts, csrf.ts, rate-limit.ts, audit.ts   Security building blocks
src/lib/i18n/                 Locale config + EN/AR dictionaries
src/lib/admin-data.ts         Admin dashboard query + aggregation layer
src/app/[locale]/             Respondent-facing flow (landing → survey → thank-you)
src/app/admin/                Admin login + protected dashboard/responses
src/app/api/                  Route handlers (submit, admin login/logout, export, delete)
src/components/               Shared UI, survey wizard, admin shell, charts
```
