import { createAdminClient } from "@/lib/supabase/admin";
import MarketingClient from "./MarketingClient";

export const dynamic = "force-dynamic";

export default async function MarketingPage() {
  const db = createAdminClient();

  const { data: settings } = await db.from("app_settings").select("*");

  const settingsMap: Record<string, unknown> = {};
  for (const s of settings ?? []) {
    settingsMap[s.key] = s.value;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold gradient-text">Marketing & Tracking / التسويق والتتبع</h2>
        <p className="text-muted text-sm mt-1">Configure advertising pixels, analytics, and visitor popup</p>
      </div>
      <MarketingClient settingsMap={settingsMap} />
    </div>
  );
}
