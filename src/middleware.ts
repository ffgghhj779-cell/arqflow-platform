import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const path = request.nextUrl.pathname;

  // If OAuth code landed on a non-auth page (e.g. root '/' due to Supabase fallback),
  // forward it directly to /auth/callback so the session exchange can complete.
  if (request.nextUrl.searchParams.has("code") && !path.startsWith("/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    return NextResponse.redirect(url);
  }

  // Skip middleware checks for API, static files, auth, favicon, and the maintenance page

  const isStaticOrApi =
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.startsWith("/auth") ||
    path === "/maintenance" ||
    path === "/favicon.ico" ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|css|js|woff|woff2|ttf|eot)$/i.test(path);

  if (isStaticOrApi) {
    return response;
  }

  // Cache user and profile lookups within the same request lifecycle
  let user: any = null;
  let userFetched = false;
  let profile: any = null;
  let profileFetched = false;

  async function getCachedUser() {
    if (userFetched) return user;
    const { data } = await supabase.auth.getUser();
    user = data.user;
    userFetched = true;
    return user;
  }

  async function getCachedProfile(userId: string) {
    if (profileFetched) return profile;
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    profile = data;
    profileFetched = true;
    return profile;
  }

  // 1. Maintenance Mode Check
  try {
    const { data: maintenanceSetting } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "maintenance_mode")
      .maybeSingle();

    const isMaintenance = maintenanceSetting?.value === true;

    if (isMaintenance) {
      const currentUser = await getCachedUser();
      let isAdmin = false;

      if (currentUser) {
        const userProfile = await getCachedProfile(currentUser.id);
        isAdmin = userProfile?.role === "admin";
      }

      // Allow admins to bypass maintenance mode, and skip blocking the login route itself
      if (!isAdmin && path !== "/login") {
        const url = request.nextUrl.clone();
        url.pathname = "/maintenance";
        return NextResponse.redirect(url);
      }
    }
  } catch (err) {
    console.error("Error checking maintenance mode setting:", err);
  }

  // 2. Standard Protected Routes & Authentication Flow
  const isProtected = path.startsWith("/dashboard") || path.startsWith("/admin") || path.startsWith("/onboarding");
  const currentUser = await getCachedUser();

  if (isProtected && !currentUser) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (currentUser && (isProtected || path === "/login")) {
    const userProfile = await getCachedProfile(currentUser.id);
    const role = userProfile?.role ?? "client";

    if (path.startsWith("/admin") && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    if (path === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = role === "admin" ? "/admin" : "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (authentication routes)
     */
    "/((?!api|_next/static|_next/image|auth|favicon.ico).*)",
  ],
};

