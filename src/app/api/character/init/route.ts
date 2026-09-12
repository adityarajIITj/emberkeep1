import { NextRequest } from "next/server";
import { requireSession } from "@/lib/server/auth";
import { jsonSuccess, jsonError } from "@/lib/server/api-response";
import { characterInitSchema } from "@/lib/validation/character";
import { CharacterService } from "@/lib/server/services/character.service";

export async function POST(request: NextRequest) {
  const { session, errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  try {
    const rawBody = await request.json();
    const result = characterInitSchema.safeParse(rawBody);

    if (!result.success) {
      return jsonError(
        "VALIDATION_ERROR",
        "Invalid character initialization data",
        400,
        result.error.flatten()
      );
    }

    const { displayName, timezone } = result.data;
    const characterData = await CharacterService.initCharacter(
      session.userId,
      session.email,
      { displayName, timezone }
    );

    return jsonSuccess(characterData, 201);
  } catch (error: unknown) {
    const customError = error as { code?: string; status?: number; message?: string };
    if (customError?.code === "CHARACTER_EXISTS" || customError?.status === 409) {
      return jsonError(
        "ALREADY_EXISTS",
        "Character has already been initialized for this adventurer",
        409
      );
    }

    console.error("Character init error:", error);
    return jsonError(
      "SERVER_ERROR",
      "Failed to initialize adventurer character",
      500
    );
  }
}
