import { prisma } from "../src/lib/server/prisma";
import { CharacterService } from "../src/lib/server/services/character.service";

async function runTests() {
  console.log("🧪 === Testing Phase 3 Backend Foundation ===\n");

  // 1. Test /api/health
  console.log("1. Testing GET /api/health...");
  const healthRes = await fetch("http://localhost:3000/api/health");
  const healthData = await healthRes.json();
  console.log("   Status:", healthRes.status);
  console.log("   Body:", healthData);
  if (healthRes.status !== 200 || healthData.database !== "connected") {
    throw new Error("Health check failed!");
  }
  console.log("   ✅ /api/health passed!\n");

  // 2. Test unauthenticated /api/character/init
  console.log("2. Testing unauthenticated POST /api/character/init...");
  const unauthInitRes = await fetch("http://localhost:3000/api/character/init", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ displayName: "Test", timezone: "UTC" }),
  });
  const unauthInitData = await unauthInitRes.json();
  console.log("   Status:", unauthInitRes.status);
  console.log("   Body:", unauthInitData);
  if (unauthInitRes.status !== 401) {
    throw new Error("Expected 401 Unauthorized for unauthenticated init!");
  }
  console.log("   ✅ Unauthorized guard passed!\n");

  // 3. Test unauthenticated GET /api/character
  console.log("3. Testing unauthenticated GET /api/character...");
  const unauthCharRes = await fetch("http://localhost:3000/api/character");
  const unauthCharData = await unauthCharRes.json();
  console.log("   Status:", unauthCharRes.status);
  console.log("   Body:", unauthCharData);
  if (unauthCharRes.status !== 401) {
    throw new Error("Expected 401 Unauthorized for unauthenticated character fetch!");
  }
  console.log("   ✅ Unauthorized guard passed!\n");

  // 4. Test CharacterService transactional initialization
  console.log("4. Testing CharacterService.initCharacter transactional seeding...");
  const testUserId = "test-adventurer-uuid-" + Date.now();
  const testEmail = `adventurer-${Date.now()}@emberkeep.realm`;

  const created = await CharacterService.initCharacter(testUserId, testEmail, {
    displayName: "Flamekeeper Sir Test",
    timezone: "Asia/Kolkata",
  });

  console.log("   Created User:", created.user.display_name, "(timezone:", created.user.timezone, ")");
  console.log("   Created Character: Level", created.character.level, "XP:", created.character.total_xp, "Gold:", created.character.gold);
  console.log("   Created Disciplines count:", created.characterAttributes.length);
  created.characterAttributes.forEach((ca) => {
    console.log(`     - Discipline: ${ca.attribute.label} (${ca.attribute.key}) -> Level ${ca.level}, XP ${ca.xp}`);
  });

  if (created.characterAttributes.length !== 5) {
    throw new Error("Expected exactly 5 character attributes for the 5 Disciplines!");
  }

  // 5. Test idempotency / 409 conflict
  console.log("\n5. Testing duplicate init rejection (idempotency)...");
  try {
    await CharacterService.initCharacter(testUserId, testEmail, {
      displayName: "Duplicate Attempt",
      timezone: "UTC",
    });
    throw new Error("Should have thrown error on duplicate initialization!");
  } catch (err: unknown) {
    const customErr = err as { code?: string };
    if (customErr.code === "CHARACTER_EXISTS") {
      console.log("   ✅ Successfully rejected duplicate initialization with CHARACTER_EXISTS");
    } else {
      throw err;
    }
  }

  // 6. Test getCharacter
  console.log("\n6. Testing CharacterService.getCharacter...");
  const fetched = await CharacterService.getCharacter(testUserId);
  if (!fetched || fetched.disciplines.length !== 5) {
    throw new Error("Failed to fetch complete character state!");
  }
  console.log("   Fetched Character successfully for user:", fetched.user.display_name);
  console.log("   ✅ CharacterService.getCharacter passed!");

  // Cleanup test user
  console.log("\n7. Cleaning up test record...");
  await prisma.user.delete({ where: { id: testUserId } });
  console.log("   ✅ Cleanup complete!");

  console.log("\n🎉 ALL PHASE 3 BACKEND FOUNDATION TESTS PASSED!");
}

runTests()
  .catch((err) => {
    console.error("❌ Phase 3 test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
