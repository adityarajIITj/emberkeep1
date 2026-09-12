import { prisma } from "../src/lib/server/prisma";
import { CharacterService } from "../src/lib/server/services/character.service";
import { QuestService } from "../src/lib/server/services/quest.service";
import { CompletionService } from "../src/lib/server/services/completion.service";
import { ShopService } from "../src/lib/server/services/shop.service";
import { checkRateLimit } from "../src/lib/server/rate-limit";
import { createQuestSchema } from "../src/lib/validation/quest";
import crypto from "crypto";

async function runPhase11SecurityTests() {
  console.log("🛡️ === Testing Phase 11 Security & Threat Model (§12) ===\n");

  const userA_Id = "security-user-a-" + Date.now();
  const userB_Id = "security-user-b-" + Date.now();

  // Setup Accounts
  console.log("1. Setting up two isolated test accounts (Account A & Account B)...");
  await CharacterService.initCharacter(userA_Id, `heroA-${Date.now()}@emberkeep.realm`, {
    displayName: "Knight A",
    timezone: "UTC",
  });
  await CharacterService.initCharacter(userB_Id, `heroB-${Date.now()}@emberkeep.realm`, {
    displayName: "Infiltrator B",
    timezone: "UTC",
  });

  const categoriesA = await QuestService.getCategories(userA_Id);
  const questA = await QuestService.createQuest(userA_Id, {
    title: "Account A Private Mission",
    categoryId: categoriesA[0].id,
    difficulty: "EASY",
    recurrence: "ONE_TIME",
  });
  console.log(`   Account A created quest "${questA.title}" (${questA.id})\n`);

  // 1. Cross-Tenant IDOR Protection
  console.log("2. Testing Cross-Tenant IDOR Protections (Account B attacking Account A)...");

  // Attack 1: Account B attempts to read Account A's quest
  const readAttempt = await QuestService.getQuestById(userB_Id, questA.id);
  if (readAttempt !== null) {
    throw new Error("IDOR VULNERABILITY: Account B read Account A's quest!");
  }
  console.log("   ✅ IDOR Read Blocked: Returns null / 404 (does not leak existence of ID)");

  // Attack 2: Account B attempts to complete Account A's quest
  try {
    await CompletionService.completeQuest(userB_Id, questA.id, crypto.randomUUID());
    throw new Error("IDOR VULNERABILITY: Account B completed Account A's quest!");
  } catch (err: unknown) {
    const custom = err as { status?: number; code?: string };
    if (custom.status === 404 || custom.code === "NOT_FOUND") {
      console.log("   ✅ IDOR Complete Blocked: Returns 404 on completion attempt");
    } else {
      throw err;
    }
  }

  // Attack 3: Account B attempts to modify Account A's quest
  const updateAttempt = await QuestService.updateQuest(userB_Id, questA.id, { title: "Malicious Edit" });
  if (updateAttempt !== null) {
    throw new Error("IDOR VULNERABILITY: Account B modified Account A's quest!");
  }
  console.log("   ✅ IDOR Update Blocked: Returns null / 404 on update attempt");

  // Attack 4: Account B attempts to delete Account A's quest
  const deleteAttempt = await QuestService.softDeleteQuest(userB_Id, questA.id);
  if (deleteAttempt !== null) {
    throw new Error("IDOR VULNERABILITY: Account B deleted Account A's quest!");
  }
  console.log("   ✅ IDOR Delete Blocked: Returns null / 404 on deletion attempt\n");

  // 2. Sliding-Window Rate Limiting (§12)
  console.log("3. Testing Sliding-Window Rate Limiting (10 requests / 10s per user)...");
  const rateLimitKey = "test-rate-limit-" + Date.now();
  for (let i = 1; i <= 10; i++) {
    const res = checkRateLimit(rateLimitKey, { limit: 10, windowMs: 10_000 });
    if (!res.success) {
      throw new Error(`Rate limiter tripped prematurely on request ${i}`);
    }
  }
  console.log("   ✅ 10 legitimate requests succeeded in sliding window.");

  const trippedRes = checkRateLimit(rateLimitKey, { limit: 10, windowMs: 10_000 });
  if (trippedRes.success) {
    throw new Error("Rate limiter failed to block 11th burst request!");
  }
  console.log(`   ✅ 11th request blocked: success=false, reset in ${trippedRes.resetMs}ms (HTTP 429)\n`);

  // 3. Anti-Cheat: Empty Task / Whitespace Rejection (§12 & §18)
  console.log("4. Testing Empty Task & Whitespace Defense (Named Edge Case)...");
  const emptyCheck1 = createQuestSchema.safeParse({
    title: "",
    categoryId: categoriesA[0].id,
    difficulty: "EASY",
    recurrence: "DAILY",
  });
  if (emptyCheck1.success) {
    throw new Error("Validation allowed empty string title!");
  }

  const emptyCheck2 = createQuestSchema.safeParse({
    title: "     ",
    categoryId: categoriesA[0].id,
    difficulty: "EASY",
    recurrence: "DAILY",
  });
  if (emptyCheck2.success) {
    throw new Error("Validation allowed whitespace-only title!");
  }
  console.log("   ✅ Empty title and whitespace-only strings rejected by Zod schema\n");

  // 4. Currency Invariant Check: No Negative Balance
  console.log("5. Testing Currency Invariants (No negative gold balance)...");
  const catalog = await ShopService.getShopCatalog(userA_Id);
  try {
    await ShopService.purchaseItem(userA_Id, catalog[0].id);
    throw new Error("Allowed purchase with 0 gold balance!");
  } catch (err: unknown) {
    const custom = err as { code?: string };
    if (custom.code === "INSUFFICIENT_GOLD") {
      console.log("   ✅ Server enforced invariant: gold >= price (blocked purchase)\n");
    } else {
      throw err;
    }
  }

  // Cleanup
  console.log("6. Cleaning up test data...");
  await prisma.user.delete({ where: { id: userA_Id } });
  await prisma.user.delete({ where: { id: userB_Id } });
  console.log("   ✅ Cleaned up isolated accounts!");

  console.log("\n🎉 ALL PHASE 11 SECURITY THREAT MODEL TESTS PASSED! 🎉");
}

runPhase11SecurityTests()
  .catch((err) => {
    console.error("❌ Phase 11 security tests failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
