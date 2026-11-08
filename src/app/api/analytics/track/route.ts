import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/database.types";

export const dynamic = "force-dynamic";

type AnalyticsData = {
  total: number;
  month: number;
  week: number;
  today: number;
  last_updated_day: string; // YYYY-MM-DD
  last_updated_week: number; // Week number (0-53)
  last_updated_month: number; // Month number (0-11)
  today_signatures: string[]; // Hash of IP + Date
  history: { date: string; count: number }[]; // Last 15 days
  locations: Record<string, number>;
};

const INITIAL_ANALYTICS: AnalyticsData = {
  total: 0,
  month: 0,
  week: 0,
  today: 0,
  last_updated_day: "",
  last_updated_week: -1,
  last_updated_month: -1,
  today_signatures: [],
  history: [],
  locations: {},
};

// Hashing function for privacy
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

// Helper to get week number
function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export async function GET(req: NextRequest) {
  return trackVisit(req);
}

export async function POST(req: NextRequest) {
  return trackVisit(req);
}

async function trackVisit(req: NextRequest) {
  try {
    const db = createAdminClient();

    // 1. Fetch current analytics data
    const { data: setting } = await db
      .from("app_settings")
      .select("value")
      .eq("key", "visitor_analytics_v2")
      .maybeSingle();

    let data: AnalyticsData = setting?.value
      ? (setting.value as unknown as AnalyticsData)
      : { ...INITIAL_ANALYTICS };

    // Ensure properties exist
    if (!data.history) data.history = [...INITIAL_ANALYTICS.history];
    if (!data.locations) data.locations = { ...INITIAL_ANALYTICS.locations };

    // 2. Identify IP and check signature
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const now = new Date();
    // Adjust to local Egypt time (UTC+2 or UTC+3 depending on DST, 2026 local time is UTC+3)
    const egyptTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    
    const year = egyptTime.getUTCFullYear();
    const month = egyptTime.getUTCMonth(); // 0-11
    const day = egyptTime.getUTCDate();
    const dayStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const weekNum = getWeekNumber(egyptTime);

    const signature = hashString(`${ip}-${dayStr}`);

    // Check if day/week/month changed to reset counters
    let updated = false;

    if (data.last_updated_day !== dayStr) {
      // New Day: Reset today counter and today's signatures
      data.today = 0;
      data.today_signatures = [];
      data.last_updated_day = dayStr;

      // Add a new entry to the 15-day history
      const formattedDate = `${String(month + 1).padStart(2, "0")}/${String(day).padStart(2, "0")}`;
      data.history.push({ date: formattedDate, count: 0 });
      if (data.history.length > 15) {
        data.history.shift(); // Keep only last 15 days
      }
      updated = true;
    }

    if (data.last_updated_week !== weekNum) {
      // New Week: Reset week counter
      data.week = 0;
      data.last_updated_week = weekNum;
      updated = true;
    }

    if (data.last_updated_month !== month) {
      // New Month: Reset month counter
      data.month = 0;
      data.last_updated_month = month;
      updated = true;
    }

    // Check if this signature is unique for today
    if (!data.today_signatures.includes(signature)) {
      data.today_signatures.push(signature);
      data.today += 1;
      data.week += 1;
      data.month += 1;
      data.total += 1;

      // Update today's count in the history array
      if (data.history.length > 0) {
        data.history[data.history.length - 1].count += 1;
      }

      // Geo-IP detection
      // Vercel Geo-IP provides: x-vercel-ip-country-region (e.g. "EG-C" for Cairo, "EG-GZ" for Giza)
      const region = req.headers.get("x-vercel-ip-country-region") || "";
      let resolvedRegion = "";

      if (region.includes("EG-")) {
        const code = region.split("EG-")[1];
        if (code === "C" || code === "CAI") resolvedRegion = "Cairo Governorate";
        else if (code === "GZ" || code === "GIZ") resolvedRegion = "Giza";
        else if (code === "ALX") resolvedRegion = "Alexandria";
        else if (code === "DK" || code === "DKH") resolvedRegion = "Dakahlia";
        else if (code === "GH" || code === "GHR") resolvedRegion = "Gharbia";
        else if (code === "SH" || code === "SHR") resolvedRegion = "Sharqia";
        else if (code === "KB" || code === "QAL") resolvedRegion = "Qalyubia";
      }

      // Only add to locations if we successfully resolved a region
      // Ignore localhost / unknown regions to maintain accuracy.


      if (resolvedRegion) {
        data.locations[resolvedRegion] = (data.locations[resolvedRegion] || 0) + 1;
      }

      updated = true;
    }

    // Save back if data updated
    if (updated || !setting?.value) {
      await db
        .from("app_settings")
        .upsert({
          key: "visitor_analytics_v2",
          value: data as unknown as Json,
          updated_at: new Date().toISOString(),
        }, { onConflict: "key" });
    }

    return NextResponse.json({ success: true, tracking: true });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}
