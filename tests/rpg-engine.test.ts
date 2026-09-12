import {
  xpToNextLevel,
  totalXpForLevel,
  levelFromXp,
  xpProgressInLevel,
  computeReward,
  checkStreakMilestones,
  getRankTitle,
} from "../src/lib/server/rpg-engine";

async function runRPGEngineUnitTests() {
  console.log("⚔️ === Running RPG Engine Unit Tests (§7) ===\n");

  // 1. Validate Quadratic Formula: xpToNextLevel(L) = 50*L + 10*L^2
  console.log("1. Testing Quadratic xpToNextLevel formula...");
  for (let L = 1; L <= 20; L++) {
    const expected = 50 * L + 10 * L * L;
    const actual = xpToNextLevel(L);
    if (actual !== expected) {
      throw new Error(`Formula mismatch at Level ${L}: expected ${expected}, got ${actual}`);
    }
  }
  console.log("   ✅ xpToNextLevel(L) strictly matches 50*L + 10*L^2 for all L=1..20\n");

  // 2. Validate Cumulative XP Table matching PDF §7 verbatim
  console.log("2. Testing Cumulative XP Table (Levels 1 to 20)...");
  const pdfExpectedTable: Record<number, number> = {
    1: 0,
    2: 60,
    3: 200,
    4: 440,
    5: 800,
    6: 1300,
    7: 1960,
    8: 2800,
    9: 3840,
    10: 5100,
    11: 6600,
    12: 8360,
    13: 10400,
    14: 12740,
    15: 15400,
    16: 18400,
    17: 21760,
    18: 25500,
    19: 29640,
    20: 34200,
  };

  for (let lvl = 1; lvl <= 20; lvl++) {
    const expectedCumulative = pdfExpectedTable[lvl];
    const actualCumulative = totalXpForLevel(lvl);
    if (actualCumulative !== expectedCumulative) {
      throw new Error(
        `Cumulative table mismatch at Level ${lvl}: expected ${expectedCumulative}, got ${actualCumulative}`
      );
    }
  }
  console.log("   ✅ All 20 levels match cumulative XP table in §7 to the single integer!\n");

  // 3. Validate levelFromXp inversion
  console.log("3. Testing levelFromXp boundary resolution...");
  for (let lvl = 1; lvl <= 20; lvl++) {
    const minXp = totalXpForLevel(lvl);
    if (levelFromXp(minXp) !== lvl) {
      throw new Error(`Exact threshold failed: levelFromXp(${minXp}) should be ${lvl}`);
    }
    if (lvl > 1 && levelFromXp(minXp - 1) !== lvl - 1) {
      throw new Error(`Lower bound failed: levelFromXp(${minXp - 1}) should be ${lvl - 1}`);
    }
  }
  console.log("   ✅ Exact threshold and off-by-one boundary resolution verified!\n");

  // 4. Validate Streak Multiplier and Capping (+30% at 30 days)
  console.log("4. Testing Streak Multipliers and Caps...");
  const rewardDay0 = computeReward("EASY", 0);
  const rewardDay10 = computeReward("EASY", 10);
  const rewardDay30 = computeReward("EASY", 30);
  const rewardDay50 = computeReward("EASY", 50);

  if (rewardDay0.xp !== 10 || rewardDay0.streakMultiplier !== 1.0) {
    throw new Error(`Day 0 streak failed: expected 10 XP (1.0x), got ${rewardDay0.xp}`);
  }
  if (rewardDay10.xp !== 11 || rewardDay10.streakMultiplier !== 1.1) {
    throw new Error(`Day 10 streak failed: expected 11 XP (1.1x), got ${rewardDay10.xp}`);
  }
  if (rewardDay30.xp !== 13 || rewardDay30.streakMultiplier !== 1.3) {
    throw new Error(`Day 30 streak failed: expected 13 XP (1.3x), got ${rewardDay30.xp}`);
  }
  if (rewardDay50.xp !== 13 || rewardDay50.streakMultiplier !== 1.3) {
    throw new Error(`Day 50 cap failed: expected 13 XP (1.3x cap), got ${rewardDay50.xp}`);
  }
  console.log("   ✅ Streak multiplier scales from 1.0x to 1.3x and caps strictly at +30%\n");

  // 5. Validate Base Difficulties and Gold Conversion: ceil(XP * 0.4)
  console.log("5. Testing Difficulties and Gold Formula (ceil(XP * 0.4))...");
  const easy = computeReward("EASY", 0);
  const med = computeReward("MEDIUM", 0);
  const hard = computeReward("HARD", 0);
  const epic = computeReward("EPIC", 0);

  if (easy.xp !== 10 || easy.gold !== 4) throw new Error("Easy reward mismatch");
  if (med.xp !== 25 || med.gold !== 10) throw new Error("Medium reward mismatch");
  if (hard.xp !== 50 || hard.gold !== 20) throw new Error("Hard reward mismatch");
  if (epic.xp !== 100 || epic.gold !== 40) throw new Error("Epic reward mismatch");
  console.log("   ✅ Base XP and Gold conversion verified across all 4 difficulty tiers\n");

  // 6. Validate Streak Milestone Bonuses (50g at 7d, 120g at 14d, 300g at 30d)
  console.log("6. Testing Streak Milestone Bonuses & High-Water Mark...");
  if (checkStreakMilestones(7, 6).bonusGold !== 50) throw new Error("7-day milestone failed");
  if (checkStreakMilestones(7, 7).bonusGold !== 0) throw new Error("Duplicate 7-day milestone allowed!");
  if (checkStreakMilestones(14, 13).bonusGold !== 120) throw new Error("14-day milestone failed");
  if (checkStreakMilestones(30, 29).bonusGold !== 300) throw new Error("30-day milestone failed");
  console.log("   ✅ Milestones award +50g, +120g, +300g and respect high-water marks\n");

  // 7. Validate Rank Titles
  console.log("7. Testing Rank Titles Brackets...");
  if (getRankTitle(1) !== "Novice" || getRankTitle(4) !== "Novice") throw new Error("Novice bracket failed");
  if (getRankTitle(5) !== "Apprentice" || getRankTitle(9) !== "Apprentice") throw new Error("Apprentice bracket failed");
  if (getRankTitle(10) !== "Journeyman" || getRankTitle(14) !== "Journeyman") throw new Error("Journeyman bracket failed");
  if (getRankTitle(15) !== "Adept" || getRankTitle(19) !== "Adept") throw new Error("Adept bracket failed");
  if (getRankTitle(20) !== "Master" || getRankTitle(50) !== "Master") throw new Error("Master bracket failed");
  console.log("   ✅ Rank titles match Novice, Apprentice, Journeyman, Adept, Master\n");

  console.log("🎉 ALL RPG ENGINE UNIT TESTS PASSED WITH 100% PRECISION! 🎉");
}

runRPGEngineUnitTests().catch((err) => {
  console.error("❌ RPG Engine test failed:", err);
  process.exit(1);
});
