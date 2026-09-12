import { NextRequest } from "next/server";
import { requireSession } from "@/lib/server/auth";
import { jsonSuccess, jsonError } from "@/lib/server/api-response";
import { ShopService } from "@/lib/server/services/shop.service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    let equip = true;

    try {
      const body = await request.json();
      if (typeof body.equip === "boolean") {
        equip = body.equip;
      }
    } catch {
      // Default to equip: true
    }

    const result = await ShopService.equipItem(session.userId, id, equip);
    return jsonSuccess(result, 200);
  } catch (error: unknown) {
    const customError = error as { code?: string; status?: number; message?: string };
    if (customError.status === 404) {
      return jsonError("NOT_FOUND", customError.message || "Armory item not found", 404);
    }

    console.error("Equip error:", error);
    return jsonError("SERVER_ERROR", "Failed to update equipment", 500);
  }
}
