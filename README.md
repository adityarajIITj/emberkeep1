# EMBERKEEP — Life RPG

> **Turn your to-do list into your legend.**

EMBERKEEP is a full-stack Life RPG where real tasks are **Quests**, your streak is an **Ember** you must keep lit, and progress is tracked through an auditable Character Sheet across five core Disciplines: **Body, Mind, Spirit, Craft, and Focus**.

---

## Live Demo
- **App**: [https://emberkeep1.vercel.app](https://emberkeep1.vercel.app)

---

## Features
- **Secure Authentication & Session Management**: Supabase Auth (email+password) with httpOnly cookie sessions via `@supabase/ssr`.
- **Character Progression & Streaks**: Server-computed, timezone-aware Ember streak persisting across sessions.
- **Non-Linear Leveling**: Quadratic leveling formula $xpToNext(L) = 50L + 10L^2$ (Levels 1 to 20 verified).
- **5 Disciplines Radar Chart**: Categorizing quests feeds specific attributes (Body, Mind, Spirit, Craft, Focus) visualized via Recharts pentagon.
- **The Keep Dashboard**: 3-column Guildhall hub with central animated Ember flame, Today's Quests checklist, and optimistic UI.
- **Quest CRUD**: Instant optimistic mutations with rollback and anti-cheat validation.
- **Cosmetic Economy & Armory**: Working gold purchase flow with balance checks and exclusive cosmetic equipping (Titles, Frames, Banners).
- **The Chronicle**: Append-only immutable audit trail and 35-day activity contribution heatmap.
- **Accessible & Responsive**: Keyboard navigable, WCAG AA contrast, reduced-motion support, and mobile-first design.

---

## Architecture

```
Browser (React client components)
 │ fetch() via TanStack Query
 ▼
Next.js Route Handlers (src/app/api/**)
 │ 1. verify Supabase session from cookie → userId
 │ 2. validate request body with Zod
 ▼
Service layer (src/lib/server/services/*.service.ts)
 │ pure business logic + RPG formulas (src/lib/server/rpg-engine.ts)
 │ wraps mutations in prisma.$transaction(...)
 ▼
Prisma ORM
 ▼
PostgreSQL (Supabase, pooled connection)
```

---

## Tech Stack
- **Frontend/Backend**: Next.js 16 (App Router, TypeScript)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Auth**: Supabase Auth (@supabase/ssr)
- **Styling**: Tailwind CSS + shadcn/ui primitives
- **Animation**: Framer Motion + GSAP + canvas-confetti
- **Data fetching**: TanStack Query
- **Hosting**: Vercel

---

## Local Setup
1. `git clone https://github.com/themadjocker/Web_Hackathon.git && cd Web_Hackathon && npm install`
2. Copy `.env.example` to `.env` and fill in your Supabase project's values
3. `npx prisma migrate dev` (or `npx prisma db push`)
4. `npx tsx prisma/seed.ts`
5. `npm run dev`

---

## Environment Variables
See `.env.example`.

```env
DATABASE_URL="postgresql://...supabase pooled connection..."
DIRECT_URL="postgresql://...supabase direct connection..."
NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
SENTRY_DSN=""
```

---

## Database Setup & Migrations
`npx prisma migrate deploy` (production) / `npx prisma migrate dev` (local)

---

## API Overview
- `POST /api/character/init` — initialize character profile & 5 disciplines
- `GET /api/character` — fetch live stats, level, gold, streak, equipped cosmetics
- `GET /api/quests` — list active quests for caller
- `POST /api/quests` — create quest (validated title, category, difficulty, recurrence)
- `PATCH /api/quests/:id` — update quest (allow-listed fields only)
- `DELETE /api/quests/:id` — soft delete quest (`deleted_at = now()`)
- `POST /api/quests/:id/complete` — atomic quest completion, idempotency check, period_key unique guard, reward calculation, and ledger append
- `GET /api/shop` — cosmetic merchant catalog with owned/equipped flags
- `POST /api/shop/:id/purchase` — transactional cosmetic purchase with balance check
- `GET /api/inventory` — player armory inventory
- `POST /api/inventory/:id/equip` — cosmetic slot equipping / unequipping
- `GET /api/chronicle` — aggregated activity timeline and lifetime stats
- `GET /api/health` — database connectivity probe for deployment verification

---

## Security
- **Server Authority**: Reward calculation is entirely server-side; client never dictates XP or Gold values (`/src/lib/server/rpg-engine.ts`).
- **Atomic Transactions**: All mutations wrapped in `prisma.$transaction`.
- **Idempotency**: Every mutating request uses a client-generated UUID idempotency key.
- **Anti-Duplication**: `@@unique([quest_id, period_key])` prevents double-completion exploits.
- **Mass-Assignment Defense**: Explicit field allow-listing on all endpoints.
- **Cross-Tenant IDOR Protection**: Scoped by `user_id = session.userId`; returns 404 (never 403).
- **Currency Invariants**: Server verifies $\text{gold} \ge \text{price}$ inside transaction (no negative balance).

---

## Accessibility
- Full keyboard navigation across all core interactive elements.
- Semantic HTML (`<main>`, `<nav>`, `<header>`, real `<button>` elements).
- High-contrast focus rings (`:focus-visible`).
- Dynamic `prefers-reduced-motion` detection degrading motion animations to instant opacity transitions.
- Minimum $44 \times 44\text{px}$ touch targets on mobile devices.

---

## Deployment
- Deployed on Vercel with PostgreSQL hosted on Supabase (pooled via PgBouncer).
- Health check verified via `GET /api/health`.
