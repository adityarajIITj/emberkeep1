import { NextRequest } from "next/server";
import { requireSession } from "@/lib/server/auth";
import { jsonSuccess, jsonError } from "@/lib/server/api-response";
import { CharacterService } from "@/lib/server/services/character.service";
import { QuestService } from "@/lib/server/services/quest.service";
import { prisma } from "@/lib/server/prisma";
import { z } from "zod";

const onboardingSchema = z.object({
  displayName: z.string().trim().min(1, "Adventurer alias cannot be empty").max(30),
  timezone: z.string().trim().min(1, "Timezone is required"),
  primaryDiscipline: z.enum(["BODY", "MIND", "SPIRIT", "CRAFT", "FOCUS"]).default("BODY"),
});

export async function POST(request: NextRequest) {
  const { session, errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  try {
    const rawBody = await request.json();
    const result = onboardingSchema.safeParse(rawBody);

    if (!result.success) {
      return jsonError(
        "VALIDATION_ERROR",
        result.error.issues[0]?.message || "Invalid onboarding parameters",
        400,
        result.error.flatten()
      );
    }

    const { displayName, timezone, primaryDiscipline } = result.data;
    const userId = session.userId;
    const email = session.email;

    // 1. Initialize character and 5 disciplines
    const initResult = await CharacterService.initCharacter(userId, email, {
      displayName,
      timezone,
    });

    // 2. Fetch categories to seed starting quests (§9 & §15)
    const categories = await QuestService.getCategories(userId);

    // Find category for primary discipline
    const primaryCat =
      categories.find((c) => c.attribute.key === primaryDiscipline) || categories[0];

    // Find category for mind or focus
    const mindCat =
      categories.find((c) => c.attribute.key === "MIND") || categories[1];

    // Find category for focus
    const focusCat =
      categories.find((c) => c.attribute.key === "FOCUS") || categories[2];

    // 3. Seed 3 Starter Quests (guaranteeing never-bare board on first login!)
    const starterQuests = [
      {
        title: `Kindle the ${primaryCat.attribute.label}: Daily Practice`,
        description: `Dedicate 20 minutes to your chosen discipline: ${primaryCat.label}.`,
        categoryId: primaryCat.id,
        difficulty: "EASY" as const,
        recurrence: "DAILY" as const,
      },
      {
        title: "Wisdom of the Archives: Read 10 Pages",
        description: "Expand your intellect and keep the flame of curiosity burning.",
        categoryId: mindCat.id,
        difficulty: "EASY" as const,
        recurrence: "DAILY" as const,
      },
      {
        title: "Tend the Hearth: Conquer Your First Quest",
        description: "Welcome to Emberkeep! Check off any quest today to ignite your streak.",
        categoryId: focusCat.id,
        difficulty: "EASY" as const,
        recurrence: "ONE_TIME" as const,
      },
    ];

    // Create starter quests in DB
    const createdQuests = [];
    for (const q of starterQuests) {
      const created = await QuestService.createQuest(userId, q);
      createdQuests.push(created);
    }

    return jsonSuccess({
      character: initResult.character,
      starterQuestsCount: createdQuests.length,
      redirect: "/keep",
    }, 201);
  } catch (error) {
    console.error("Onboarding error:", error);
    return jsonError("SERVER_ERROR", "Failed to complete onboarding ritual", 500);
  }
}
