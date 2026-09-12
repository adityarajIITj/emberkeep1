import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://prpvxnozlooykklpetne.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBycHZ4bm96bG9veWtrbHBldG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxOTI3MzQsImV4cCI6MjEwNDc2ODczNH0.8i2aNeUVEE3XCuGht38-Nl5lhv8eeUHmNKbONpr4Z2U",
  },
};

export default nextConfig;
