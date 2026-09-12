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

    // 1. Initialize or update character and 5 disciplines (idempotent)
    const initResult = await CharacterService.initCharacter(userId, email, {
      displayName,
      timezone,
    });

    // 2. Fetch or auto-seed categories if bare
    let categories = await QuestService.getCategories(userId);
    if (categories.length === 0) {
      const attributes = await prisma.attribute.findMany();
      for (const attr of attributes) {
        await prisma.questCategory.create({
          data: {
            attribute_id: attr.id,
            label: `General ${attr.label}`,
            icon_key: attr.icon_key,
            color_hex: attr.color_hex,
            user_id: null,
          },
        });
      }
      categories = await QuestService.getCategories(userId);
    }

    // 3. Seed starter quests only if user has no quests yet
    const existingQuests = await QuestService.getQuests(userId);
    if (existingQuests.length === 0 && categories.length > 0) {
      const primaryCat =
        categories.find((c) => c.attribute?.key === primaryDiscipline) || categories[0];
      const mindCat =
        categories.find((c) => c.attribute?.key === "MIND") || categories[0];
      const focusCat =
        categories.find((c) => c.attribute?.key === "FOCUS") || categories[0];

      const starterQuests = [
        {
          title: `Kindle the ${primaryCat.attribute?.label || "Discipline"}: Daily Practice`,
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

      for (const q of starterQuests) {
        try {
          await QuestService.createQuest(userId, q);
        } catch (questErr) {
          console.warn("Starter quest creation non-fatal error:", questErr);
        }
      }
    }

    return jsonSuccess({
      character: initResult.character,
      redirect: "/keep",
    }, 201);
  } catch (error) {
    console.error("Onboarding error:", error);
    const msg = error instanceof Error ? error.message : "Failed to complete onboarding ritual";
    return jsonError("SERVER_ERROR", msg, 500);
  }
}
