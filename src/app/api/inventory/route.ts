import { requireSession } from "@/lib/server/auth";
import { jsonSuccess, jsonError } from "@/lib/server/api-response";
import { ShopService } from "@/lib/server/services/shop.service";

export async function GET() {
  const { session, errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  try {
    const inventory = await ShopService.getUserInventory(session.userId);
    return jsonSuccess(inventory);
  } catch (error) {
    console.error("Get inventory error:", error);
    return jsonError("SERVER_ERROR", "Failed to retrieve armory inventory", 500);
  }
}
