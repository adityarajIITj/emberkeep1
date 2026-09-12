import { prisma } from "../src/lib/server/prisma";
import { CharacterService } from "../src/lib/server/services/character.service";
import { QuestService } from "../src/lib/server/services/quest.service";
import { CompletionService } from "../src/lib/server/services/completion.service";
import { ShopService } from "../src/lib/server/services/shop.service";
import crypto from "crypto";

async function runPhase6Tests() {
  console.log("💰 === Testing Phase 6 Completion & Economy System ===\n");

  const testUserId = "completion-tester-uuid-" + Date.now();
  const testEmail = `hero-${Date.now()}@emberkeep.realm`;

  // 1. Setup Adventurer
  console.log("1. Creating test adventurer profile...");
  const init = await CharacterService.initCharacter(testUserId, testEmail, {
    displayName: "Ember Champion",
    timezone: "UTC",
  });
  console.log(`   Character initialized at Level ${init.character.level}, 0 XP, 0 Gold.\n`);

  // 2. Fetch categories & create Quests
  console.log("2. Creating test quests...");
  const categories = await QuestService.getCategories(testUserId);
  const focusCat = categories.find((c) => c.attribute.key === "FOCUS")!;
  const mindCat = categories.find((c) => c.attribute.key === "MIND")!;

  const q1 = await QuestService.createQuest(testUserId, {
    title: "Tidy Alchemy Workshop",
    categoryId: focusCat.id,
    difficulty: "EASY",
    recurrence: "ONE_TIME",
  });

  const q2 = await QuestService.createQuest(testUserId, {
    title: "Read Grimoire Chapters 1-3",
    categoryId: mindCat.id,
    difficulty: "MEDIUM",
    recurrence: "DAILY",
  });
  console.log(`   Created Quest 1 (One-Time, EASY): "${q1.title}"`);
  console.log(`   Created Quest 2 (Daily, MEDIUM): "${q2.title}"\n`);

  // 3. Complete Quest 1
  console.log("3. Testing atomic Quest completion (The Critical Endpoint)...");
  const key1 = crypto.randomUUID();
  const res1 = await CompletionService.completeQuest(testUserId, q1.id, key1);

  console.log("   Completion Result:");
  console.log(`     - XP Awarded: +${res1.rewards.xp}`);
  console.log(`     - Gold Awarded: +${res1.rewards.gold}`);
  console.log(`     - Discipline XP (${q1.category.attribute.label}): +${res1.rewards.disciplineXp}`);
  console.log(`     - Streak: ${res1.character?.current_streak ?? 1} days`);
  console.log(`     - New Character Level: ${res1.character?.level ?? 1}`);

  if (res1.rewards.xp !== 10 || res1.rewards.gold !== 4) {
    throw new Error(`Unexpected reward output: ${JSON.stringify(res1.rewards)}`);
  }

  // Verify ledgers in DB
  const xpLedgers = await prisma.xPLedger.findMany({ where: { user_id: testUserId } });
  const goldLedgers = await prisma.goldLedger.findMany({ where: { user_id: testUserId } });
  if (xpLedgers.length !== 1 || goldLedgers.length !== 1) {
    throw new Error("Ledger audit trail missing completion entries!");
  }
  console.log("   ✅ XP and Gold ledgers recorded append-only records!");

  // Verify one-time quest status archived
  const rawQ1 = await prisma.quest.findUnique({ where: { id: q1.id } });
  if (rawQ1?.status !== "ARCHIVED") {
    throw new Error("One-time quest was not archived upon completion!");
  }
  console.log("   ✅ One-time quest successfully archived!\n");

  // 4. Test Duplicate Completion Guard (Unique Constraint Protection)
  console.log("4. Testing duplicate completion prevention (double-click / replay attack)...");
  try {
    const keyDuplicate = crypto.randomUUID(); // Different key, same quest
    await CompletionService.completeQuest(testUserId, q1.id, keyDuplicate);
    throw new Error("Double-completion succeeded! Anti-cheat failure.");
  } catch (err: unknown) {
    const customErr = err as { code?: string };
    if (customErr.code === "ALREADY_COMPLETED" || (err as Error).message.includes("archived")) {
      console.log("   ✅ Successfully blocked duplicate completion attempt!");
    } else {
      throw err;
    }
  }

  // 5. Test Idempotency Key Repeat
  console.log("\n5. Testing idempotency key replay...");
  const key2 = "idempotent-test-key-555";
  const res2First = await CompletionService.completeQuest(testUserId, q2.id, key2);
  console.log(`   First attempt completed quest 2: +${res2First.rewards.xp} XP`);

  // Repeat with exact same key
  const res2Second = await CompletionService.completeQuest(testUserId, q2.id, key2);
  if (!res2Second.isIdempotentRepeat) {
    throw new Error("Expected idempotent repeat flag on replay!");
  }
  console.log("   ✅ Idempotent replay safely returned cached completion without double-crediting!\n");

  // 6. Test Shop & Economy
  console.log("6. Testing Merchant catalog & purchase balance checks...");
  const catalog = await ShopService.getShopCatalog(testUserId);
  console.log(`   Merchant offers ${catalog.length} items.`);

  const cheapTitle = catalog.find((i) => i.key === "title_novice")!; // 50 Gold
  const midTitle = catalog.find((i) => i.key === "title_diligent")!;   // 250 Gold
  const expensiveBanner = catalog.find((i) => i.key === "banner_abyss")!; // 2000 Gold

  // Test Insufficient Gold check (Invariant: No negative balance §11)
  console.log(`   Attempting to buy expensive banner (${expensiveBanner.price_gold}g) with 14g balance...`);
  try {
    await ShopService.purchaseItem(testUserId, expensiveBanner.id);
    throw new Error("Purchase succeeded with insufficient balance! Currency exploit.");
  } catch (err: unknown) {
    const customErr = err as { code?: string };
    if (customErr.code === "INSUFFICIENT_GOLD") {
      console.log("   ✅ Successfully blocked purchase with INSUFFICIENT_GOLD!");
    } else {
      throw err;
    }
  }

  // Credit gold to player
  await prisma.character.update({
    where: { user_id: testUserId },
    data: { gold: 500 },
  });
  console.log("   Credited 500g for cosmetic armory testing.");

  // Purchase affordable title
  const purchase1 = await ShopService.purchaseItem(testUserId, cheapTitle.id);
  console.log(`   Purchased "${cheapTitle.name}" for ${cheapTitle.price_gold}g. New balance: ${purchase1.newGoldBalance}g`);
  if (purchase1.newGoldBalance !== 450) throw new Error("Balance calculation mismatch!");

  // Attempt duplicate purchase of same item
  console.log("   Attempting duplicate purchase of already owned title...");
  try {
    await ShopService.purchaseItem(testUserId, cheapTitle.id);
    throw new Error("Allowed duplicate purchase of same cosmetic!");
  } catch (err: unknown) {
    const customErr = err as { code?: string };
    if (customErr.code === "ALREADY_OWNED") {
      console.log("   ✅ Duplicate purchase blocked with ALREADY_OWNED!");
    } else {
      throw err;
    }
  }

  // Purchase second title
  const purchase2 = await ShopService.purchaseItem(testUserId, midTitle.id);
  console.log(`   Purchased second title "${midTitle.name}". New balance: ${purchase2.newGoldBalance}g\n`);

  // 7. Test Armory Equipping
  console.log("7. Testing Armory exclusive slot equipping...");
  // Equip Title 1
  await ShopService.equipItem(testUserId, purchase1.inventoryItem.id, true);
  let char = await CharacterService.getCharacter(testUserId);
  if (char?.equipped.title?.id !== cheapTitle.id) {
    throw new Error("Failed to equip title 1!");
  }
  console.log(`   Equipped Title: "${char.equipped.title?.name}"`);

  // Equip Title 2 (should auto-unequip Title 1)
  await ShopService.equipItem(testUserId, purchase2.inventoryItem.id, true);
  char = await CharacterService.getCharacter(testUserId);
  if (char?.equipped.title?.id !== midTitle.id) {
    throw new Error("Failed to swap equipped title!");
  }
  console.log(`   Swapped to Title: "${char.equipped.title?.name}"`);

  // Unequip
  await ShopService.equipItem(testUserId, purchase2.inventoryItem.id, false);
  char = await CharacterService.getCharacter(testUserId);
  if (char?.equipped.title !== null) {
    throw new Error("Failed to unequip title!");
  }
  console.log("   Unequipped title successfully (slot cleared).");
  console.log("   ✅ Armory slot management verified!\n");

  // Cleanup
  console.log("8. Cleaning up test data...");
  await prisma.user.delete({ where: { id: testUserId } });
  console.log("   ✅ Cleanup complete!");

  console.log("\n🎉 ALL PHASE 6 COMPLETION & ECONOMY TESTS PASSED! 🎉");
}

runPhase6Tests()
  .catch((err) => {
    console.error("❌ Phase 6 test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
