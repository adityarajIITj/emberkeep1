import { requireSession } from "@/lib/server/auth";
import { jsonSuccess, jsonError } from "@/lib/server/api-response";
import { ShopService } from "@/lib/server/services/shop.service";

export async function GET() {
  const { session, errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  try {
    const catalog = await ShopService.getShopCatalog(session.userId);
    return jsonSuccess(catalog);
  } catch (error) {
    console.error("Get shop catalog error:", error);
    return jsonError("SERVER_ERROR", "Failed to retrieve merchant catalog", 500);
  }
}
