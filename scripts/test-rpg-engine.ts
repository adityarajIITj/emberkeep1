import {
  xpToNextLevel,
  totalXpForLevel,
  levelFromXp,
  xpProgressInLevel,
  computeReward,
  checkStreakMilestones,
  getLevelUpBonus,
  getRankTitle,
} from "../src/lib/server/rpg-engine";

// Blueprint §7 Authoritative Table: Level 1 to 20
const SPEC_TABLE = [
  { level: 1, cumulative: 0, delta: 60 },
  { level: 2, cumulative: 60, delta: 140 },
  { level: 3, cumulative: 200, delta: 240 },
  { level: 4, cumulative: 440, delta: 360 },
  { level: 5, cumulative: 800, delta: 500 },
  { level: 6, cumulative: 1300, delta: 660 },
  { level: 7, cumulative: 1960, delta: 840 },
  { level: 8, cumulative: 2800, delta: 1040 },
  { level: 9, cumulative: 3840, delta: 1260 },
  { level: 10, cumulative: 5100, delta: 1500 },
  { level: 11, cumulative: 6600, delta: 1760 },
  { level: 12, cumulative: 8360, delta: 2040 },
  { level: 13, cumulative: 10400, delta: 2340 },
  { level: 14, cumulative: 12740, delta: 2660 },
  { level: 15, cumulative: 15400, delta: 3000 },
  { level: 16, cumulative: 18400, delta: 3360 },
  { level: 17, cumulative: 21760, delta: 3740 },
  { level: 18, cumulative: 25500, delta: 4140 },
  { level: 19, cumulative: 29640, delta: 4560 },
  { level: 20, cumulative: 34200, delta: 5000 },
];

function runTests() {
  console.log("⚡ === Testing RPG Engine Progression Math (§7) ===\n");

  // 1. Verify Level Table match
  console.log("1. Verifying xpToNextLevel & totalXpForLevel against Blueprint §7 table...");
  for (const row of SPEC_TABLE) {
    const computedCumulative = totalXpForLevel(row.level);
    const computedDelta = xpToNextLevel(row.level);

    if (computedCumulative !== row.cumulative) {
      throw new Error(
        `Cumulative XP mismatch at Level ${row.level}: expected ${row.cumulative}, got ${computedCumulative}`
      );
    }

    if (computedDelta !== row.delta) {
      throw new Error(
        `Delta XP mismatch at Level ${row.level}: expected ${row.delta}, got ${computedDelta}`
      );
    }

    console.log(
      `   Level ${row.level.toString().padStart(2)}: cumulative ${computedCumulative.toLocaleString()} XP, next requires ${computedDelta.toLocaleString()} XP  ✓`
    );
  }
  console.log("   ✅ All 20 levels match §7 table with 100% precision!\n");

  // 2. Test levelFromXp boundary conditions
  console.log("2. Testing levelFromXp boundary conditions (no off-by-one errors)...");
  const boundaryCases = [
    { xp: 0, expected: 1 },
    { xp: 59, expected: 1 },
    { xp: 60, expected: 2 },
    { xp: 199, expected: 2 },
    { xp: 200, expected: 3 },
    { xp: 799, expected: 4 },
    { xp: 800, expected: 5 },
    { xp: 5099, expected: 9 },
    { xp: 5100, expected: 10 },
    { xp: 34199, expected: 19 },
    { xp: 34200, expected: 20 },
    { xp: 100000, expected: 29 },
  ];

  for (const b of boundaryCases) {
    const lvl = levelFromXp(b.xp);
    if (lvl !== b.expected) {
      throw new Error(`Boundary failed for ${b.xp} XP: expected Level ${b.expected}, got ${lvl}`);
    }
  }
  console.log("   ✅ Boundary conditions verified (exact thresholds respected)!\n");

  // 3. Test xpProgressInLevel
  console.log("3. Testing xpProgressInLevel calculations...");
  const p1 = xpProgressInLevel(0);
  if (p1.currentLevel !== 1 || p1.progressPercentage !== 0) {
    throw new Error("Progress at 0 XP should be Level 1, 0%");
  }

  const p2 = xpProgressInLevel(30);
  if (p2.currentLevel !== 1 || p2.progressPercentage !== 50) {
    throw new Error("Progress at 30 XP should be Level 1, 50%");
  }

  const p3 = xpProgressInLevel(60);
  if (p3.currentLevel !== 2 || p3.progressPercentage !== 0) {
    throw new Error("Progress at 60 XP should be Level 2, 0%");
  }
  console.log("   ✅ In-level progress percentage verified!\n");

  // 4. Test computeReward and streak multiplier cap
  console.log("4. Testing computeReward base formulas & streak multiplier cap (+30%)...");
  // Baseline (0 streak)
  const rewEasy = computeReward("EASY", 0);
  if (rewEasy.xp !== 10 || rewEasy.gold !== 4 || rewEasy.disciplineXp !== 6) {
    throw new Error(`Easy reward mismatch: ${JSON.stringify(rewEasy)}`);
  }

  const rewMed = computeReward("MEDIUM", 0);
  if (rewMed.xp !== 25 || rewMed.gold !== 10 || rewMed.disciplineXp !== 15) {
    throw new Error(`Medium reward mismatch: ${JSON.stringify(rewMed)}`);
  }

  const rewHard = computeReward("HARD", 0);
  if (rewHard.xp !== 50 || rewHard.gold !== 20 || rewHard.disciplineXp !== 30) {
    throw new Error(`Hard reward mismatch: ${JSON.stringify(rewHard)}`);
  }

  const rewEpic = computeReward("EPIC", 0);
  if (rewEpic.xp !== 100 || rewEpic.gold !== 40 || rewEpic.disciplineXp !== 60) {
    throw new Error(`Epic reward mismatch: ${JSON.stringify(rewEpic)}`);
  }

  // With 10 day streak (1.1x multiplier)
  const rewEpic10 = computeReward("EPIC", 10);
  if (rewEpic10.xp !== 110 || rewEpic10.gold !== 44 || rewEpic10.disciplineXp !== 66) {
    throw new Error(`10-day streak reward mismatch: ${JSON.stringify(rewEpic10)}`);
  }

  // With 30 day streak (1.3x multiplier)
  const rewEpic30 = computeReward("EPIC", 30);
  if (rewEpic30.xp !== 130 || rewEpic30.gold !== 52 || rewEpic30.disciplineXp !== 78) {
    throw new Error(`30-day streak reward mismatch: ${JSON.stringify(rewEpic30)}`);
  }

  // With 100 day streak (should cap at +30% -> 1.3x multiplier)
  const rewEpic100 = computeReward("EPIC", 100);
  if (rewEpic100.xp !== 130 || rewEpic100.gold !== 52 || rewEpic100.disciplineXp !== 78) {
    throw new Error(`Streak multiplier not capped at 30%: ${JSON.stringify(rewEpic100)}`);
  }
  console.log("   ✅ Rewards and streak multiplier caps (+30%) verified!\n");

  // 5. Test checkStreakMilestones (high-water mark guard)
  console.log("5. Testing streak milestone bonuses with high-water mark protection...");
  // Reaching 7 days for the first time
  const m1 = checkStreakMilestones(7, 6);
  if (m1.bonusGold !== 50 || m1.milestoneReached !== 7) {
    throw new Error("Milestone 7d failed to trigger");
  }

  // Already reached 7 days in the past (longestStreak = 7)
  const m2 = checkStreakMilestones(7, 7);
  if (m2.bonusGold !== 0 || m2.milestoneReached !== null) {
    throw new Error("Milestone 7d re-triggered on rebuild streak (exploit vulnerability)!");
  }

  // Reaching 14 days
  const m3 = checkStreakMilestones(14, 10);
  if (m3.bonusGold !== 120 || m3.milestoneReached !== 14) {
    throw new Error("Milestone 14d failed to trigger");
  }

  // Reaching 30 days
  const m4 = checkStreakMilestones(30, 29);
  if (m4.bonusGold !== 300 || m4.milestoneReached !== 30) {
    throw new Error("Milestone 30d failed to trigger");
  }
  console.log("   ✅ Streak milestone bonuses and anti-reclaim guards verified!\n");

  // 6. Test Level-Up Bonus & Rank Titles
  console.log("6. Testing level-up gold bonus and Rank titles...");
  if (getLevelUpBonus(2) !== 20 || getLevelUpBonus(5) !== 50 || getLevelUpBonus(10) !== 100) {
    throw new Error("Level up bonus calculation failed");
  }

  const titles = [
    { level: 1, expected: "Novice" },
    { level: 4, expected: "Novice" },
    { level: 5, expected: "Apprentice" },
    { level: 9, expected: "Apprentice" },
    { level: 10, expected: "Journeyman" },
    { level: 14, expected: "Journeyman" },
    { level: 15, expected: "Adept" },
    { level: 19, expected: "Adept" },
    { level: 20, expected: "Master" },
    { level: 50, expected: "Master" },
  ];

  for (const t of titles) {
    const title = getRankTitle(t.level);
    if (title !== t.expected) {
      throw new Error(`Rank title for Level ${t.level}: expected ${t.expected}, got ${title}`);
    }
  }
  console.log("   ✅ Level-up gold bonuses and rank title brackets verified!\n");

  console.log("🎉 ALL RPG PROGRESSION ENGINE TESTS PASSED (100% ACCURACY)! 🎉");
}

runTests();
