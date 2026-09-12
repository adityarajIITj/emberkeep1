import { NextRequest } from "next/server";
import { requireSession } from "@/lib/server/auth";
import { jsonSuccess, jsonError } from "@/lib/server/api-response";
import { CompletionService } from "@/lib/server/services/completion.service";
import { checkRateLimit } from "@/lib/server/rate-limit";
import crypto from "crypto";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  // Rate-limiting check: max 10 mutating requests per 10s per user (§12)
  const rateLimit = checkRateLimit(`${session.userId}:quest-complete`, {
    limit: 10,
    windowMs: 10_000,
  });
  if (!rateLimit.success) {
    return jsonError(
      "TOO_MANY_REQUESTS",
      `Rate limit exceeded. Please wait ${Math.ceil(rateLimit.resetMs / 1000)}s before trying again.`,
      429
    );
  }

  try {
    const { id } = await params;
    let idempotencyKey: string | undefined;

    try {
      const body = await request.json();
      idempotencyKey = body.idempotencyKey;
    } catch {
      // Empty body allowed; generate key if omitted
    }

    if (!idempotencyKey) {
      idempotencyKey = crypto.randomUUID();
    }

    const result = await CompletionService.completeQuest(
      session.userId,
      id,
      idempotencyKey
    );

    return jsonSuccess(result, 200);
  } catch (error: unknown) {
    const customError = error as { code?: string; status?: number; message?: string };
    if (customError.status === 404) {
      return jsonError("NOT_FOUND", customError.message || "Quest not found", 404);
    }
    if (customError.code === "ALREADY_COMPLETED" || customError.status === 409) {
      return jsonError("ALREADY_COMPLETED", customError.message || "Quest already completed for this period", 409);
    }
    if (customError.status === 400) {
      return jsonError("BAD_REQUEST", customError.message || "Bad request", 400);
    }

    console.error("Complete quest error:", error);
    return jsonError("SERVER_ERROR", "Failed to complete quest", 500);
  }
}
