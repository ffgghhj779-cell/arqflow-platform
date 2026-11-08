import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/database.types";

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { key, value } = body as { key?: string; value?: unknown };

  if (!key) {
    return NextResponse.json({ error: "key is required" }, { status: 400 });
  }

  const db = createAdminClient();

  const { error } = await db
    .from("app_settings")
    .upsert({ key, value: value as Json, updated_at: new Date().toISOString() }, { onConflict: "key" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const res = NextResponse.json({ success: true });

  if (key === "currency" && typeof value === "string") {
    res.cookies.set("arqflow_currency", value.trim().toUpperCase(), {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });
  } else if (
    key === "payment_accounts" &&
    value &&
    typeof value === "object" &&
    "currency" in value &&
    typeof (value as { currency?: unknown }).currency === "string"
  ) {
    const curr = ((value as { currency: string }).currency || "").trim().toUpperCase();
    if (curr) {
      res.cookies.set("arqflow_currency", curr, {
        path: "/",
        maxAge: 31536000,
        sameSite: "lax",
      });
    }
  }

  return res;
}
