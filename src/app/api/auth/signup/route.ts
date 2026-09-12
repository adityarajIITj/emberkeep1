import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/server/prisma";
import { CharacterService } from "@/lib/server/services/character.service";
import { jsonSuccess, jsonError } from "@/lib/server/api-response";
import { signupSchema } from "@/lib/validation/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      return jsonError(
        "VALIDATION_ERROR",
        validation.error.issues[0]?.message || "Invalid registration fields",
        400,
        validation.error.flatten()
      );
    }

    const { email, password } = validation.data;
    const detectedTimezone = body.timezone || "UTC";
    const displayName = body.displayName || email.split("@")[0];

    const supabase = await createClient();

    // 1. Register user in Supabase Auth via Server
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          timezone: detectedTimezone,
          display_name: displayName,
        },
      },
    });

    if (error) {
      console.error("Server Supabase signUp error:", error);
      return jsonError("AUTH_ERROR", error.message, 400);
    }

    const userId = data.user?.id;
    if (!userId) {
      return jsonError("AUTH_ERROR", "Failed to retrieve user ID from authentication provider", 500);
    }

    // 2. Auto-provision in PostgreSQL database
    try {
      const existing = await prisma.user.findUnique({ where: { id: userId } });
      if (!existing) {
        await CharacterService.initCharacter(userId, email, {
          displayName,
          timezone: detectedTimezone,
        });
      }
    } catch (dbErr) {
      console.warn("Auto-provisioning warning during signup:", dbErr);
    }

    return jsonSuccess({
      success: true,
      user: data.user,
      session: data.session,
      requiresEmailConfirmation: !data.session,
    });
  } catch (err: any) {
    console.error("Unhandled signup route error:", err);
    return jsonError("SERVER_ERROR", err?.message || "Failed to process registration", 500);
  }
}
