import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const db = createAdminClient();

    const { data: settings, error } = await db
      .from("app_settings")
      .select("key, value")
      .in("key", ["facebook_pixel_id", "google_analytics_id", "popup_settings"]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const settingsMap = Object.fromEntries(
      (settings ?? []).map((s) => [s.key, s.value])
    );

    return NextResponse.json({
      facebook_pixel_id: settingsMap["facebook_pixel_id"] ?? null,
      google_analytics_id: settingsMap["google_analytics_id"] ?? null,
      popup_settings: settingsMap["popup_settings"] ?? { enabled: false, delay: 5 },
    });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}
