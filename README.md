# EMBERKEEP — Life RPG

> **Turn your to-do list into your legend.**
> Built for the IIT Bhubaneswar Web Hackathon.

EMBERKEEP is a full-stack Life RPG where real-world tasks are **Quests**, your streak is an **Ember** you must keep roaring, and progress is tracked through an auditable Character Sheet across five core Disciplines: **Body, Mind, Spirit, Craft, and Focus**.

---

## ⚔️ Key Features

- **The Keep**: Torchlit dark-fantasy central hall featuring your live animated Ember, daily quest roster, and quick stat counters.
- **Quest Engine**: Optimistic CRUD quest management with anti-cheat server-side verification and idempotency keys.
- **5 Disciplines Radar**: Visual pentagon attribute progression balancing fitness, intellectual study, mindfulness, craftsmanship, and deep focus.
- **Non-Linear Progression**: Quadratic leveling formula $xpToNext(L) = 50L + 10L^2$, making early levels fast and higher ranks prestigious.
- **Cosmetic Economy**: The Merchant and The Armory with cosmetic Banners, Titles, Sigils, and Avatar Frames purchased using earned Gold.
- **The Chronicle**: GitHub-style activity heatmaps and append-only audit ledgers for XP and currency.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Database & ORM**: Prisma ORM with PostgreSQL / SQLite support
- **Auth**: Supabase Auth (SSR Cookie Session Management)
- **State & Data Fetching**: TanStack Query (React Query)
- **Styling**: Tailwind CSS, Pixel typography (`Press Start 2P`), Inter font
- **Animations**: Framer Motion, Canvas Confetti

---

## 🚀 Local Setup

1. **Clone and install dependencies**:
   ```bash
   git clone https://github.com/themadjocker/Web_Hackathon.git
   cd Web_Hackathon
   npm install
   ```

2. **Environment configuration**:
   ```bash
   cp .env.example .env
   ```

3. **Database setup & seed**:
   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.
