import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SUPABASE_URL) ||
    "https://prpvxnozlooykklpetne.supabase.co";
  const supabaseAnonKey =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBycHZ4bm96bG9veWtrbHBldG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxOTI3MzQsImV4cCI6MjEwNDc2ODczNH0.8i2aNeUVEE3XCuGht38-Nl5lhv8eeUHmNKbONpr4Z2U";

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if middleware is refreshing sessions.
        }
      },
    },
  });
}
