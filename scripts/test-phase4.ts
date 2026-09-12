import { prisma } from "../src/lib/server/prisma";
import { CharacterService } from "../src/lib/server/services/character.service";
import { QuestService } from "../src/lib/server/services/quest.service";
import { createQuestSchema, updateQuestSchema } from "../src/lib/validation/quest";

async function runPhase4Tests() {
  console.log("⚔️ === Testing Phase 4 Quest System (CRUD & Anti-Cheat) ===\n");

  const testUserId = "quest-tester-uuid-" + Date.now();
  const testEmail = `tester-${Date.now()}@emberkeep.realm`;

  // 1. Initialize Adventurer
  console.log("1. Setting up test adventurer...");
  await CharacterService.initCharacter(testUserId, testEmail, {
    displayName: "Quest Knight",
    timezone: "UTC",
  });
  console.log("   ✅ Adventurer created!\n");

  // 2. Fetch categories
  console.log("2. Fetching seeded categories...");
  const categories = await QuestService.getCategories(testUserId);
  console.log(`   Found ${categories.length} categories.`);
  const bodyCategory = categories.find((c) => c.attribute.key === "BODY")!;
  const mindCategory = categories.find((c) => c.attribute.key === "MIND")!;
  console.log(`   Body category: ${bodyCategory.label} (${bodyCategory.id})`);
  console.log(`   Mind category: ${mindCategory.label} (${mindCategory.id})`);
  console.log("   ✅ Categories retrieved!\n");

  // 3. Test Empty Task Edge Case (§1D & §18 - explicitly named in PDF)
  console.log("3. Testing empty task title rejection (PDF named edge case)...");
  const emptyTitleResult = createQuestSchema.safeParse({
    title: "   ",
    categoryId: bodyCategory.id,
    difficulty: "EASY",
    recurrence: "ONE_TIME",
  });
  if (emptyTitleResult.success) {
    throw new Error("Validation failed: empty/whitespace title should have been rejected!");
  }
  console.log("   Rejected whitespace title with message:", emptyTitleResult.error.issues[0]?.message);
  console.log("   ✅ Empty title successfully blocked!\n");

  // 4. Test Valid Quest Creation
  console.log("4. Testing valid quest creations...");
  const quest1 = await QuestService.createQuest(testUserId, {
    title: "Morning 5K Trail Run",
    description: "Keep steady heart rate and pace",
    categoryId: bodyCategory.id,
    difficulty: "EASY",
    recurrence: "DAILY",
  });
  console.log(`   Created Quest 1: "${quest1.title}" (${quest1.difficulty}, ${quest1.category.attribute.label})`);

  const quest2 = await QuestService.createQuest(testUserId, {
    title: "Study Next.js Route Handlers",
    description: "Read serverless architectural best practices",
    categoryId: mindCategory.id,
    difficulty: "MEDIUM",
    recurrence: "ONE_TIME",
  });
  console.log(`   Created Quest 2: "${quest2.title}" (${quest2.difficulty}, ${quest2.category.attribute.label})`);

  const quest3 = await QuestService.createQuest(testUserId, {
    title: "Forge Life RPG Hackathon Victory",
    description: "Build state-of-the-art gamified web application",
    categoryId: mindCategory.id,
    difficulty: "EPIC",
    recurrence: "WEEKLY",
  });
  console.log(`   Created Quest 3: "${quest3.title}" (${quest3.difficulty}, ${quest3.category.attribute.label})`);
  console.log("   ✅ All quests created successfully!\n");

  // 5. Test Filtering Quests
  console.log("5. Testing Quest filtering...");
  const allQuests = await QuestService.getQuests(testUserId);
  console.log(`   All active quests count: ${allQuests.length} (expected 3)`);
  if (allQuests.length !== 3) throw new Error("Expected 3 quests!");

  const mindQuests = await QuestService.getQuests(testUserId, { discipline: "MIND" });
  console.log(`   Mind discipline quests count: ${mindQuests.length} (expected 2)`);
  if (mindQuests.length !== 2) throw new Error("Expected 2 Mind quests!");

  const dailyQuests = await QuestService.getQuests(testUserId, { recurrence: "DAILY" });
  console.log(`   Daily recurrence quests count: ${dailyQuests.length} (expected 1)`);
  if (dailyQuests.length !== 1) throw new Error("Expected 1 Daily quest!");
  console.log("   ✅ Quest filtering verified!\n");

  // 6. Test Allow-Listed Update (Mass-Assignment Protection)
  console.log("6. Testing allow-listed quest update...");
  const updatePayload = {
    title: "Morning 5K Trail Run (Updated Reps)",
    description: "Increased pace to 5:00/km",
    difficulty: "HARD" as const,
  };
  const updatedQuest = await QuestService.updateQuest(testUserId, quest1.id, updatePayload);
  if (!updatedQuest || updatedQuest.title !== updatePayload.title || updatedQuest.difficulty !== "HARD") {
    throw new Error("Quest update failed!");
  }
  console.log(`   Updated Quest 1: "${updatedQuest.title}" now difficulty ${updatedQuest.difficulty}`);

  // Test that extra fields in updateQuestSchema are ignored/rejected
  const massAssignParsed = updateQuestSchema.safeParse({
    title: "Sneaky Title",
    xp: 99999, // Should be ignored/not in schema
    gold: 99999,
  });
  const dataKeys = Object.keys(massAssignParsed.data ?? {});
  if (dataKeys.includes("xp") || dataKeys.includes("gold")) {
    throw new Error("Mass assignment vulnerability detected: xp/gold made it through schema!");
  }
  console.log("   ✅ Mass assignment defense verified (xp/gold stripped by schema)!\n");

  // 7. Test Soft Delete
  console.log("7. Testing soft delete...");
  const deleted = await QuestService.softDeleteQuest(testUserId, quest2.id);
  if (!deleted || !deleted.deleted_at) {
    throw new Error("Soft delete failed to set deleted_at timestamp!");
  }

  const activeAfterDelete = await QuestService.getQuests(testUserId);
  console.log(`   Active quests count after delete: ${activeAfterDelete.length} (expected 2)`);
  if (activeAfterDelete.length !== 2) throw new Error("Deleted quest still appearing in active list!");

  // Verify in database that the row still exists with deleted_at set (audit preservation)
  const rawDeleted = await prisma.quest.findUnique({ where: { id: quest2.id } });
  if (!rawDeleted || !rawDeleted.deleted_at) {
    throw new Error("Row was hard-deleted! Expected soft-delete for audit trail.");
  }
  console.log(`   Raw DB record preserved with deleted_at: ${rawDeleted.deleted_at.toISOString()}`);
  console.log("   ✅ Soft-delete verified!\n");

  // 8. Test Non-Owner Isolation (IDOR Defense)
  console.log("8. Testing IDOR / cross-user isolation...");
  const otherUserId = "stranger-user-uuid-999";
  const crossFetch = await QuestService.getQuestById(otherUserId, quest1.id);
  if (crossFetch !== null) {
    throw new Error("IDOR failure: User B was able to fetch User A's quest!");
  }
  console.log("   Cross-user fetch returned null (safely converts to 404)");
  console.log("   ✅ IDOR defense verified!\n");

  // Cleanup
  console.log("9. Cleaning up test data...");
  await prisma.user.delete({ where: { id: testUserId } });
  console.log("   ✅ Cleanup complete!");

  console.log("\n🎉 ALL PHASE 4 QUEST CRUD & SECURITY TESTS PASSED!");
}

runPhase4Tests()
  .catch((err) => {
    console.error("❌ Phase 4 test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
