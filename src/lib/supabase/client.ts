import { createBrowserClient } from "@supabase/ssr";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (browserClient) return browserClient;

  const supabaseUrl =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SUPABASE_URL) ||
    "https://prpvxnozlooykklpetne.supabase.co";
  const supabaseAnonKey =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBycHZ4bm96bG9veWtrbHBldG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxOTI3MzQsImV4cCI6MjEwNDc2ODczNH0.8i2aNeUVEE3XCuGht38-Nl5lhv8eeUHmNKbONpr4Z2U";

  browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return browserClient;
}
