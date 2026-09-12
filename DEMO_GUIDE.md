# EMBERKEEP — Video Demo Storyboard & Judging Guide

> **Target Duration:** Strictly 90–180 seconds (optimal target: **120 seconds**).  
> **Target File Size:** Under 100MB (export at 1080p H.264, ~2.5 Mbps lands at ~20MB).  
> **Rule:** Must demo the **live deployed URL** in an incognito window, not localhost (§24).

---

## 🎬 120-Second Scene-by-Scene Script (§24)

### 0:00 – 0:08 | Scene 1: The Landing Page (The Hook)
- **Visual**: Hover over the hero section, show the torchlit animated Ember flame and responsive layout.
- **Narrate**:
  > *"This is EMBERKEEP — a full-stack Life RPG that turns your daily to-do list into an epic personal legend. Instead of generic tasks and shallow gamification skins, your streak is an Ember you must keep roaring, backed by an immutable server-side ledger."*

### 0:08 – 0:20 | Scene 2: Authentication & Onboarding
- **Action**: Click **"Begin Your Quest"**. Sign up with a fresh email.
- **Action**: In the Onboarding wizard, enter an Adventurer alias (e.g. *"Roland Emberheart"*), show the auto-detected timezone (`Intl.DateTimeFormat`), and select a Primary Discipline (e.g. **Mind**).
- **Narrate**:
  > *"Authentication is powered by Supabase with httpOnly session cookies. Onboarding auto-detects our local timezone to ensure midnight resets align to our real clock, and seeds three starter quests across disciplines so the board is never bare."*

### 0:20 – 0:35 | Scene 3: The Keep (Home Dashboard)
- **Visual**: Land on `/keep`. Point out the Adventurer Dossier, liquid XP progression bar, Treasury Gold count, and the Central Ember flame.
- **Narrate**:
  > *"We land in The Keep. Our central hearth reflects our active streak tier. On the left is our adventurer dossier and liquid XP progress bar; on the right is our discipline summary."*

### 0:35 – 0:55 | Scene 4: Add & Complete a Quest (Tactile Interaction)
- **Action**: Click to check off an active bounty in **Today's Bounties**.
- **Visual**: Watch the optimistic strikethrough, particle confetti burst radiating from the checkbox, floating `+XP`/`+Gold` indicator, and the liquid XP bar animating forward.
- **Narrate**:
  > *"Completing a quest triggers instant optimistic feedback with particle confetti and floating reward badges. Under the hood, rewards are strictly calculated on the server with idempotency keys and ACID transaction logging — the client never dictates XP or Gold."*

### 0:55 – 1:20 | Scene 5: Trigger a Rank-Up (Ascension Moment!)
- **Action**: Complete the remaining starter quests to cross the Level 2 threshold (60 XP).
- **Visual**: The screen lights up with golden confetti cannons, the **Ascension Level-Up Modal** appears showing previous rank $\rightarrow$ new rank, title unlock, and bonus gold ($+10 \times \text{level}$).
- **Narrate**:
  > *"And we've achieved Ascension! Leveling in EMBERKEEP uses a strictly increasing quadratic curve ($50L + 10L^2$), making early ranks exciting and high ranks prestigious. We unlock our Apprentice title and bonus gold."*

### 1:20 – 1:35 | Scene 6: Character Sheet & 5-Discipline Radar Pentagon
- **Action**: Navigate to `/character`.
- **Visual**: Showcase the 5-Discipline Radar Chart (Body, Mind, Spirit, Craft, Focus) and 35-day activity heatmap. Hover over nodes to show custom tooltips.
- **Narrate**:
  > *"Our Character Sheet visualizes life balance across the five foundational disciplines — Body, Mind, Spirit, Craft, and Focus — using an interactive Recharts radar polygon, alongside a 35-day activity heatmap."*

### 1:35 – 1:50 | Scene 7: The Merchant Bazaar & The Armory
- **Action**: Go to `/merchant`. Buy a cosmetic Title or Frame with earned gold.
- **Visual**: Confetti fires on purchase, gold balance deducts live in the persistent HUD, and click **"Equip Now"**.
- **Action**: Jump to `/armory` to show the equipped cosmetic item actively styling the avatar crest.
- **Narrate**:
  > *"In The Merchant bazaar, earned gold buys cosmetic titles, frames, and banner themes. We purchase the Novice title and equip it immediately, updating our HUD crest."*

### 1:50 – 2:00 | Scene 8: The Hard Browser Refresh (Persistence Proof)
- **Action**: Hit `Ctrl + R` (Hard Page Refresh) on `/keep`.
- **Visual**: The page reloads: Rank, XP, Gold, streak flame, and equipped items all reappear identically!
- **Narrate**:
  > *"And to prove zero-tolerance persistence: refreshing the browser keeps our exact level, streak, gold, and inventory intact. It's stored in real PostgreSQL with append-only audit ledgers, not localStorage. Thank you!"*

---

## 🏆 Checklist Before Submitting Video
- [ ] Strictly between 90 and 180 seconds.
- [ ] File size < 100MB.
- [ ] No login required to view video (unlisted YouTube, Google Drive with "Anyone with link can view", or committed to GitHub).
- [ ] Shows all 4 required beats: Signup/Login $\rightarrow$ Complete Quest $\rightarrow$ Level Up $\rightarrow$ Hard Refresh.
