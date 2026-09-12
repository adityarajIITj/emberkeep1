import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SUPABASE_URL) ||
    "https://prpvxnozlooykklpetne.supabase.co";
  const supabaseAnonKey =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBycHZ4bm96bG9veWtrbHBldG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxOTI3MzQsImV4cCI6MjEwNDc2ODczNH0.8i2aNeUVEE3XCuGht38-Nl5lhv8eeUHmNKbONpr4Z2U";

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } catch (authErr) {
    console.error("Middleware auth verification error:", authErr);
  }

  const pathname = request.nextUrl.pathname;

  // Protected paths that require authentication
  const isProtectedPath =
    pathname.startsWith("/keep") ||
    pathname.startsWith("/quests") ||
    pathname.startsWith("/character") ||
    pathname.startsWith("/armory") ||
    pathname.startsWith("/merchant") ||
    pathname.startsWith("/chronicle") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/onboarding");

  // Auth paths (login, signup)
  const isAuthPath = pathname === "/login" || pathname === "/signup";

  if (!user && isProtectedPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/keep";
    url.searchParams.delete("next");
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
