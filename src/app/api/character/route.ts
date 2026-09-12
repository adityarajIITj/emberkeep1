import { requireSession } from "@/lib/server/auth";
import { jsonSuccess, jsonError } from "@/lib/server/api-response";
import { CharacterService } from "@/lib/server/services/character.service";

export async function GET() {
  const { session, errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  try {
    const character = await CharacterService.getCharacter(session.userId);

    if (!character) {
      return jsonError(
        "NOT_FOUND",
        "Character profile not found. Please complete onboarding.",
        404
      );
    }

    return jsonSuccess(character);
  } catch (error) {
    console.error("Get character error:", error);
    return jsonError("SERVER_ERROR", "Failed to retrieve character state", 500);
  }
}
