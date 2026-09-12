import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/server/prisma";
import { CharacterService } from "@/lib/server/services/character.service";
import { jsonSuccess, jsonError } from "@/lib/server/api-response";
import { loginSchema } from "@/lib/validation/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return jsonError(
        "VALIDATION_ERROR",
        validation.error.issues[0]?.message || "Invalid login credentials",
        400,
        validation.error.flatten()
      );
    }

    const { email, password } = validation.data;
    const supabase = await createClient();

    // 1. Authenticate with Supabase Auth on server
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return jsonError("AUTH_ERROR", error.message, 401);
    }

    const userId = data.user?.id;
    if (userId) {
      // Ensure PostgreSQL user record exists
      try {
        const existing = await prisma.user.findUnique({ where: { id: userId } });
        if (!existing) {
          await CharacterService.initCharacter(userId, email, {
            displayName: data.user.user_metadata?.display_name || email.split("@")[0],
            timezone: data.user.user_metadata?.timezone || "UTC",
          });
        }
      } catch (dbErr) {
        console.warn("User record sync warning on login:", dbErr);
      }
    }

    return jsonSuccess({
      success: true,
      user: data.user,
      session: data.session,
    });
  } catch (err: any) {
    console.error("Unhandled login route error:", err);
    return jsonError("SERVER_ERROR", err?.message || "Failed to process sign in", 500);
  }
}
