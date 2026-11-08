import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.user) {
      const user = data.user;

      // Ensure the profile row exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!existingProfile) {
        const admin = createAdminClient();
        await admin.from("profiles").upsert({
          id: user.id,
          email: user.email ?? "",
          full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? "User",
          role: "client",
        });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Redirect to login page with an error parameter
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
