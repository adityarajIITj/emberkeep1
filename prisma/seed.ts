import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting EMBERKEEP database seeding...");

  // 1. Seed 5 Disciplines (Attributes)
  const disciplines = [
    {
      key: "BODY",
      label: "Body",
      color_hex: "#ef4444",
      icon_key: "Dumbbell",
    },
    {
      key: "MIND",
      label: "Mind",
      color_hex: "#3b82f6",
      icon_key: "Brain",
    },
    {
      key: "SPIRIT",
      label: "Spirit",
      color_hex: "#8b5cf6",
      icon_key: "Sparkles",
    },
    {
      key: "CRAFT",
      label: "Craft",
      color_hex: "#f59e0b",
      icon_key: "Hammer",
    },
    {
      key: "FOCUS",
      label: "Focus",
      color_hex: "#10b981",
      icon_key: "Compass",
    },
  ];

  console.log("Seeding Disciplines (Attributes)...");
  const attributeMap: Record<string, string> = {};
  for (const disc of disciplines) {
    const attribute = await prisma.attribute.upsert({
      where: { key: disc.key },
      update: {
        label: disc.label,
        color_hex: disc.color_hex,
        icon_key: disc.icon_key,
      },
      create: disc,
    });
    attributeMap[disc.key] = attribute.id;
  }

  // 2. Seed Default System Quest Categories
  console.log("Seeding Default Quest Categories...");
  const defaultCategories = [
    // Body
    { label: "Gym & Strength", attributeKey: "BODY", color_hex: "#ef4444", icon_key: "Dumbbell" },
    { label: "Cardio & Running", attributeKey: "BODY", color_hex: "#f87171", icon_key: "Activity" },
    { label: "Stretching & Yoga", attributeKey: "BODY", color_hex: "#fca5a5", icon_key: "Heart" },
    // Mind
    { label: "Coding & Building", attributeKey: "MIND", color_hex: "#3b82f6", icon_key: "Code" },
    { label: "Book Reading", attributeKey: "MIND", color_hex: "#60a5fa", icon_key: "BookOpen" },
    { label: "Study & Research", attributeKey: "MIND", color_hex: "#93c5fd", icon_key: "GraduationCap" },
    // Spirit
    { label: "Meditation & Calm", attributeKey: "SPIRIT", color_hex: "#8b5cf6", icon_key: "Sparkles" },
    { label: "Journaling", attributeKey: "SPIRIT", color_hex: "#a78bfa", icon_key: "PenTool" },
    { label: "Outdoor Walk", attributeKey: "SPIRIT", color_hex: "#c4b5fd", icon_key: "Sun" },
    // Craft
    { label: "Creative Design", attributeKey: "CRAFT", color_hex: "#f59e0b", icon_key: "Palette" },
    { label: "Writing & Content", attributeKey: "CRAFT", color_hex: "#fbbf24", icon_key: "Feather" },
    { label: "Hobby Craft", attributeKey: "CRAFT", color_hex: "#fcd34d", icon_key: "Scissors" },
    // Focus
    { label: "Deep Work Sprint", attributeKey: "FOCUS", color_hex: "#10b981", icon_key: "Clock" },
    { label: "Admin & Inbox Zero", attributeKey: "FOCUS", color_hex: "#34d399", icon_key: "CheckSquare" },
    { label: "Home Chores", attributeKey: "FOCUS", color_hex: "#6ee7b7", icon_key: "Home" },
  ];

  for (const cat of defaultCategories) {
    const attributeId = attributeMap[cat.attributeKey];
    if (!attributeId) continue;

    // Check if system default category with this label exists
    const existing = await prisma.questCategory.findFirst({
      where: {
        label: cat.label,
        user_id: null,
      },
    });

    if (!existing) {
      await prisma.questCategory.create({
        data: {
          user_id: null,
          label: cat.label,
          attribute_id: attributeId,
          color_hex: cat.color_hex,
          icon_key: cat.icon_key,
        },
      });
    }
  }

  // 3. Seed Cosmetic Shop Items
  console.log("Seeding Shop Items (Merchant Catalog)...");
  const shopItems = [
    // Titles
    {
      key: "title_novice",
      name: "the Novice",
      description: "A humble title marking the beginning of your journey.",
      type: "TITLE",
      price_gold: 50,
      is_active: true,
    },
    {
      key: "title_diligent",
      name: "the Diligent",
      description: "Carried by those who never let a day slip away in vain.",
      type: "TITLE",
      price_gold: 250,
      is_active: true,
    },
    {
      key: "title_emberkeeper",
      name: "Keeper of the Flame",
      description: "Awarded to legends who kindle hope across every discipline.",
      type: "TITLE",
      price_gold: 600,
      is_active: true,
    },

    // Badges / Sigils
    {
      key: "badge_first_spark",
      name: "First Spark",
      description: "Commemorates igniting your personal ember.",
      type: "BADGE",
      price_gold: 75,
      is_active: true,
    },
    {
      key: "badge_early_riser",
      name: "Early Riser",
      description: "For those who strike the anvil while dawn breaks.",
      type: "BADGE",
      price_gold: 150,
      is_active: true,
    },
    {
      key: "badge_iron_will",
      name: "Iron Will",
      description: "A crest of unbreakable commitment and discipline.",
      type: "BADGE",
      price_gold: 300,
      is_active: true,
    },

    // Avatar Frames
    {
      key: "frame_laurel",
      name: "Verdant Laurel",
      description: "A woven border of emerald ivy and sacred oak.",
      type: "AVATAR_FRAME",
      price_gold: 200,
      is_active: true,
    },
    {
      key: "frame_ember",
      name: "Ember-Wreathed",
      description: "A pulsating border of fiery embers that flickers.",
      type: "AVATAR_FRAME",
      price_gold: 400,
      is_active: true,
    },
    {
      key: "frame_celestial",
      name: "Celestial Crest",
      description: "An ornate gold border forged under the starlight.",
      type: "AVATAR_FRAME",
      price_gold: 750,
      is_active: true,
    },

    // Banners (Themes)
    {
      key: "banner_twilight",
      name: "Twilight Keep",
      description: "Infuses the Keep with deep indigo twilight accents.",
      type: "THEME",
      price_gold: 800,
      is_active: true,
    },
    {
      key: "banner_citadel",
      name: "Gilded Citadel",
      description: "Adorns UI panels with gold-trimmed nobility.",
      type: "THEME",
      price_gold: 1200,
      is_active: true,
    },
    {
      key: "banner_abyss",
      name: "Obsidian Abyss",
      description: "A sleek pitch-black aesthetic with piercing crimson embers.",
      type: "THEME",
      price_gold: 2000,
      is_active: true,
    },
  ];

  for (const item of shopItems) {
    await prisma.shopItem.upsert({
      where: { key: item.key },
      update: item,
      create: item,
    });
  }

  console.log("✅ EMBERKEEP seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
