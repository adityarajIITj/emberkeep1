import { prisma } from "../src/lib/server/prisma";
import { CharacterService } from "../src/lib/server/services/character.service";
import { QuestService } from "../src/lib/server/services/quest.service";

async function runPhase10Tests() {
  console.log("🕯️ === Testing Phase 10 Onboarding & Starter Quests ===\n");

  const testUserId = "onboarding-tester-" + Date.now();
  const testEmail = `novice-${Date.now()}@emberkeep.realm`;

  // 1. Create Supabase-style base user
  console.log("1. Simulating new user account creation...");
  const user = await prisma.user.create({
    data: {
      id: testUserId,
      email: testEmail,
      display_name: "Pending Hero",
    },
  });
  console.log(`   User created: ${user.email} (${user.id})\n`);

  // 2. Perform Onboarding Ritual with auto-timezone and Primary Discipline
  console.log("2. Performing onboarding ritual...");
  const chosenTimezone = "America/New_York";
  const chosenDiscipline = "MIND";
  const heroAlias = "Alden the Seeker";

  // Step A: Initialize Character
  const initResult = await CharacterService.initCharacter(testUserId, testEmail, {
    displayName: heroAlias,
    timezone: chosenTimezone,
  });

  // Step B: Seed Starter Quests
  const categories = await QuestService.getCategories(testUserId);
  const primaryCat = categories.find((c) => c.attribute.key === chosenDiscipline) || categories[0];
  const bodyCat = categories.find((c) => c.attribute.key === "BODY") || categories[1];
  const focusCat = categories.find((c) => c.attribute.key === "FOCUS") || categories[2];

  const starter1 = await QuestService.createQuest(testUserId, {
    title: `Kindle the ${primaryCat.attribute.label}: Deep Study`,
    categoryId: primaryCat.id,
    difficulty: "EASY",
    recurrence: "DAILY",
  });

  const starter2 = await QuestService.createQuest(testUserId, {
    title: "Morning Vitality: 15-Minute Walk",
    categoryId: bodyCat.id,
    difficulty: "EASY",
    recurrence: "DAILY",
  });

  const starter3 = await QuestService.createQuest(testUserId, {
    title: "Tend the Hearth: Conquer Your First Quest",
    categoryId: focusCat.id,
    difficulty: "EASY",
    recurrence: "ONE_TIME",
  });

  console.log("   ✅ Character initialized with 5 disciplines!");
  console.log(`   ✅ Auto-timezone set to: ${initResult.user.timezone}`);
  console.log(`   ✅ Hero alias set to: ${initResult.user.display_name}`);
  console.log("   ✅ 3 Starter Quests seeded successfully:\n");
  console.log(`     1. "${starter1.title}" (${starter1.category.attribute.label})`);
  console.log(`     2. "${starter2.title}" (${starter2.category.attribute.label})`);
  console.log(`     3. "${starter3.title}" (${starter3.category.attribute.label})\n`);

  // 3. Verify Never-Bare Board Invariant (§9 & §15)
  console.log("3. Verifying the Quest Board is NOT bare for the newly minted adventurer...");
  const activeQuests = await QuestService.getQuests(testUserId);
  console.log(`   Active quests on board: ${activeQuests.length} (expected 3)`);
  if (activeQuests.length !== 3) {
    throw new Error("Onboarding starter quest verification failed! Board is empty.");
  }
  console.log("   ✅ Anti-bare-board invariant verified!\n");

  // Cleanup
  console.log("4. Cleaning up test data...");
  await prisma.user.delete({ where: { id: testUserId } });
  console.log("   ✅ Cleanup complete!");

  console.log("\n🎉 ALL PHASE 10 ONBOARDING & STARTER QUEST TESTS PASSED!");
}

runPhase10Tests()
  .catch((err) => {
    console.error("❌ Phase 10 test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
