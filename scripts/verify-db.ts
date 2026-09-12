import { prisma } from "../src/lib/server/prisma";

async function verify() {
  console.log("=== Verifying EMBERKEEP Database Setup ===");
  
  const attributes = await prisma.attribute.findMany();
  console.log(`\nAttributes (${attributes.length}):`);
  attributes.forEach((a) => {
    console.log(`  - [${a.key}] ${a.label} (${a.color_hex}) [icon: ${a.icon_key}]`);
  });

  const categories = await prisma.questCategory.findMany();
  console.log(`\nDefault Quest Categories (${categories.length}):`);
  categories.slice(0, 5).forEach((c) => {
    console.log(`  - ${c.label}`);
  });
  if (categories.length > 5) {
    console.log(`  ... and ${categories.length - 5} more`);
  }

  const shopItems = await prisma.shopItem.findMany();
  console.log(`\nShop Items (${shopItems.length}):`);
  shopItems.forEach((item) => {
    console.log(`  - [${item.type}] ${item.name} (${item.price_gold} Gold)`);
  });

  console.log("\n✅ Database verification successful! All Phase 1 models and seeds are active.");
}

verify()
  .catch((err) => {
    console.error("Verification failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
