import { createAdminClient } from "@/lib/supabase/admin";
import VisitorsClient from "./VisitorsClient";

export const dynamic = "force-dynamic";

export default async function VisitorsPage() {
  const db = createAdminClient();

  // Fetch the analytics aggregates from app_settings
  const { data: setting } = await db
    .from("app_settings")
    .select("value")
    .eq("key", "visitor_analytics_v2")
    .maybeSingle();

  // Default fallback statistics if the DB record doesn't exist yet
  const defaultAnalytics = {
    total: 0,
    month: 0,
    week: 0,
    today: 0,
    history: [],
    locations: {},
  };

  const analyticsData = setting?.value
    ? (setting.value as typeof defaultAnalytics)
    : defaultAnalytics;

  return <VisitorsClient analyticsData={analyticsData} />;
}
