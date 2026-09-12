import { requireSession } from "@/lib/server/auth";
import { jsonSuccess, jsonError } from "@/lib/server/api-response";
import { QuestService } from "@/lib/server/services/quest.service";

export async function GET() {
  const { session, errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  try {
    const categories = await QuestService.getCategories(session.userId);
    return jsonSuccess(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    return jsonError("SERVER_ERROR", "Failed to load quest categories", 500);
  }
}
