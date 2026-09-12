import { NextRequest } from "next/server";
import { requireSession } from "@/lib/server/auth";
import { jsonSuccess, jsonError } from "@/lib/server/api-response";
import { ShopService } from "@/lib/server/services/shop.service";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const result = await ShopService.purchaseItem(session.userId, id);
    return jsonSuccess(result, 200);
  } catch (error: unknown) {
    const customError = error as { code?: string; status?: number; message?: string };
    if (customError.status === 404) {
      return jsonError("NOT_FOUND", customError.message || "Shop item not found", 404);
    }
    if (customError.code === "ALREADY_OWNED" || customError.status === 409) {
      return jsonError("ALREADY_OWNED", customError.message || "Item already in inventory", 409);
    }
    if (customError.code === "INSUFFICIENT_GOLD" || customError.status === 400) {
      return jsonError("INSUFFICIENT_GOLD", customError.message || "Insufficient Gold", 400);
    }

    console.error("Purchase error:", error);
    return jsonError("SERVER_ERROR", "Failed to complete purchase", 500);
  }
}
