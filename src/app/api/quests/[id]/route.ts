import { NextRequest } from "next/server";
import { requireSession } from "@/lib/server/auth";
import { jsonSuccess, jsonError } from "@/lib/server/api-response";
import { updateQuestSchema } from "@/lib/validation/quest";
import { QuestService } from "@/lib/server/services/quest.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const quest = await QuestService.getQuestById(session.userId, id);

    if (!quest) {
      // Return 404 (not 403) to prevent leaking existence of other users' IDs (§11 & §12)
      return jsonError("NOT_FOUND", "Quest not found", 404);
    }

    return jsonSuccess(quest);
  } catch (error) {
    console.error("Get quest by id error:", error);
    return jsonError("SERVER_ERROR", "Failed to retrieve quest", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const rawBody = await request.json();
    const result = updateQuestSchema.safeParse(rawBody);

    if (!result.success) {
      return jsonError(
        "VALIDATION_ERROR",
        result.error.issues[0]?.message || "Invalid update data",
        400,
        result.error.flatten()
      );
    }

    const updated = await QuestService.updateQuest(
      session.userId,
      id,
      result.data
    );

    if (!updated) {
      return jsonError("NOT_FOUND", "Quest not found or access denied", 404);
    }

    return jsonSuccess(updated);
  } catch (error: unknown) {
    const customError = error as { code?: string; status?: number; message?: string };
    if (customError.status === 400) {
      return jsonError("BAD_REQUEST", customError.message || "Invalid update", 400);
    }

    console.error("Update quest error:", error);
    return jsonError("SERVER_ERROR", "Failed to update quest", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const deleted = await QuestService.softDeleteQuest(session.userId, id);

    if (!deleted) {
      return jsonError("NOT_FOUND", "Quest not found or access denied", 404);
    }

    return jsonSuccess({ message: "Quest soft-deleted successfully", id });
  } catch (error) {
    console.error("Delete quest error:", error);
    return jsonError("SERVER_ERROR", "Failed to delete quest", 500);
  }
}
