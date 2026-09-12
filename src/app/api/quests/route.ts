import { NextRequest } from "next/server";
import { requireSession } from "@/lib/server/auth";
import { jsonSuccess, jsonError } from "@/lib/server/api-response";
import { createQuestSchema } from "@/lib/validation/quest";
import { QuestService } from "@/lib/server/services/quest.service";
import { checkRateLimit } from "@/lib/server/rate-limit";

export async function GET(request: NextRequest) {
  const { session, errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  try {
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      status: searchParams.get("status") ?? undefined,
      difficulty: searchParams.get("difficulty") ?? undefined,
      recurrence: searchParams.get("recurrence") ?? undefined,
      discipline: searchParams.get("discipline") ?? undefined,
    };

    const quests = await QuestService.getQuests(session.userId, filters);
    return jsonSuccess(quests);
  } catch (error) {
    console.error("Get quests error:", error);
    return jsonError("SERVER_ERROR", "Failed to retrieve quest board", 500);
  }
}

export async function POST(request: NextRequest) {
  const { session, errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  // Rate-limiting check: max 10 mutating requests per 10s per user (§12)
  const rateLimit = checkRateLimit(`${session.userId}:quest-create`, {
    limit: 10,
    windowMs: 10_000,
  });
  if (!rateLimit.success) {
    return jsonError(
      "TOO_MANY_REQUESTS",
      `Rate limit exceeded. Please wait ${Math.ceil(rateLimit.resetMs / 1000)}s before posting another quest.`,
      429
    );
  }

  try {
    const rawBody = await request.json();
    const result = createQuestSchema.safeParse(rawBody);

    if (!result.success) {
      return jsonError(
        "VALIDATION_ERROR",
        result.error.issues[0]?.message || "Invalid quest parameters",
        400,
        result.error.flatten()
      );
    }

    const quest = await QuestService.createQuest(session.userId, result.data);
    return jsonSuccess(quest, 201);
  } catch (error: unknown) {
    const customError = error as { code?: string; status?: number; message?: string };
    if (customError.status === 403) {
      return jsonError("FORBIDDEN", customError.message || "Forbidden category", 403);
    }
    if (customError.status === 404) {
      return jsonError("NOT_FOUND", customError.message || "Category not found", 404);
    }

    console.error("Create quest error:", error);
    return jsonError("SERVER_ERROR", "Failed to post new quest", 500);
  }
}
