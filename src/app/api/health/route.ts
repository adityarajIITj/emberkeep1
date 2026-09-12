import { prisma } from "@/lib/server/prisma";
import { jsonSuccess, jsonError } from "@/lib/server/api-response";

export async function GET() {
  try {
    // Ping DB to verify connection health
    await prisma.$queryRaw`SELECT 1`;

    return jsonSuccess({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
      service: "EMBERKEEP API",
    });
  } catch (error) {
    console.error("Health check database ping failed:", error);
    return jsonError(
      "DATABASE_UNAVAILABLE",
      "Backend database connection failed",
      503
    );
  }
}
