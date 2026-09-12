import { createClient } from "@/lib/supabase/server";
import { jsonError } from "./api-response";
import { User } from "@supabase/supabase-js";

export interface VerifiedSession {
  user: User;
  userId: string;
  email: string;
}

/**
 * Authoritatively verifies the Supabase session from httpOnly cookies.
 * User ID is always sourced from the cryptographically verified JWT,
 * never from client-provided headers or bodies (anti-IDOR guarantee §11 & §12).
 */
export async function verifySession(): Promise<VerifiedSession | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user || !user.email) {
      return null;
    }

    return {
      user,
      userId: user.id,
      email: user.email,
    };
  } catch (err) {
    console.error("Session verification failure:", err);
    return null;
  }
}

/**
 * Convenience helper for API route handlers that halts with a clean 401 response
 * if no valid session exists.
 */
export async function requireSession(): Promise<
  | { session: VerifiedSession; errorResponse: null }
  | { session: null; errorResponse: ReturnType<typeof jsonError> }
> {
  const session = await verifySession();
  if (!session) {
    return {
      session: null,
      errorResponse: jsonError(
        "UNAUTHORIZED",
        "Valid adventurer authentication session required",
        401
      ),
    };
  }
  return { session, errorResponse: null };
}
