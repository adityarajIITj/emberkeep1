/**
 * EMBERKEEP RPG Progression Engine
 * Pure mathematical formulas isolated server-side (§7 & §11).
 * The client NEVER dictates XP or Gold amounts.
 */

export type QuestDifficulty = "EASY" | "MEDIUM" | "HARD" | "EPIC";

export const DIFFICULTY_BASE: Record<
  QuestDifficulty,
  { baseXp: number; baseGold: number }
> = {
  EASY: { baseXp: 10, baseGold: 4 },
  MEDIUM: { baseXp: 25, baseGold: 10 },
  HARD: { baseXp: 50, baseGold: 20 },
  EPIC: { baseXp: 100, baseGold: 40 },
};

/**
 * Quadratic leveling formula: xpToNextLevel(L) = 50*L + 10*L^2 (§7).
 * Delta XP needed to level up from rank L to rank L+1.
 */
export function xpToNextLevel(level: number): number {
  if (level < 1) return 60;
  return 50 * level + 10 * Math.pow(level, 2);
}

/**
 * Cumulative XP required to reach rank L from rank 1 (§7 table).
 * totalXpForLevel(1) = 0
 * totalXpForLevel(2) = 60
 * totalXpForLevel(3) = 200
 * ...
 */
export function totalXpForLevel(targetLevel: number): number {
  if (targetLevel <= 1) return 0;
  let total = 0;
  for (let i = 1; i < targetLevel; i++) {
    total += xpToNextLevel(i);
  }
  return total;
}

/**
 * Authoritative derivation of rank/level from cumulative total XP.
 * Level is strictly derived from totalXp, preventing level/XP desync bugs.
 */
export function levelFromXp(totalXp: number): number {
  if (totalXp <= 0) return 1;

  let level = 1;
  while (totalXp >= totalXpForLevel(level + 1)) {
    level++;
  }
  return level;
}

/**
 * Calculates current progress percentage towards the next rank.
 */
export function xpProgressInLevel(totalXp: number) {
  const currentLevel = levelFromXp(totalXp);
  const startXpForLevel = totalXpForLevel(currentLevel);
  const xpNeededForNext = xpToNextLevel(currentLevel);
  const xpIntoLevel = totalXp - startXpForLevel;
  const progressRatio = Math.min(Math.max(xpIntoLevel / xpNeededForNext, 0), 1);

  return {
    currentLevel,
    xpIntoLevel,
    xpNeededForNext,
    progressPercentage: Math.round(progressRatio * 100),
    totalXp,
  };
}

/**
 * Calculates authoritative rewards for completing a quest.
 * Uses only server-owned state (quest difficulty + character streak).
 * Streak multiplier: +1% per day capped at +30% (§7 & §11).
 */
export function computeReward(
  difficulty: QuestDifficulty,
  currentStreak: number
) {
  const base = DIFFICULTY_BASE[difficulty] || DIFFICULTY_BASE.EASY;

  // Streak multiplier capped at +30% (30 days) to prevent runaway inflation
  const streakBonusDays = Math.min(Math.max(currentStreak, 0), 30);
  const streakMultiplier = 1 + streakBonusDays * 0.01;

  const xp = Math.round(base.baseXp * streakMultiplier);
  const gold = Math.round(xp * 0.4);

  // Disciplines level at 60% rate to keep radar chart aspirational
  const disciplineXp = Math.round(xp * 0.6);

  return {
    xp,
    gold,
    disciplineXp,
    streakMultiplier,
  };
}

/**
 * One-time streak milestone bonuses (§7):
 * 7 days:  +50 Gold
 * 14 days: +120 Gold
 * 30 days: +300 Gold
 *
 * Evaluated against longestStreak high-water mark so breaking and rebuilding
 * a streak cannot be exploited to repeat-claim milestones.
 */
export function checkStreakMilestones(
  currentStreak: number,
  longestStreak: number
): { milestoneReached: number | null; bonusGold: number } {
  const MILESTONES = [
    { days: 30, bonus: 300 },
    { days: 14, bonus: 120 },
    { days: 7, bonus: 50 },
  ];

  for (const m of MILESTONES) {
    if (currentStreak >= m.days && longestStreak < m.days) {
      return { milestoneReached: m.days, bonusGold: m.bonus };
    }
  }

  return { milestoneReached: null, bonusGold: 0 };
}

/**
 * Bonus Gold awarded on level-up: +10 * newLevel (§7).
 */
export function getLevelUpBonus(newLevel: number): number {
  return Math.max(newLevel, 1) * 10;
}

/**
 * Rank Titles based on level brackets (§7):
 * 1–4:   Novice
 * 5–9:   Apprentice
 * 10–14: Journeyman
 * 15–19: Adept
 * 20+:   Master
 */
export function getRankTitle(level: number): string {
  if (level < 5) return "Novice";
  if (level < 10) return "Apprentice";
  if (level < 15) return "Journeyman";
  if (level < 20) return "Adept";
  return "Master";
}
