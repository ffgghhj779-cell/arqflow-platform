import type { Metadata } from "next";
import HomeClient from "./home-client";
import { createClient } from "@/lib/supabase/server";
import { PLANS, mapDbPlanToMarketingPlan, resolvePaymentAccounts, type Plan } from "@/lib/plans";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ArqFlow — موظف ذكاء اصطناعي على واتساب | AI WhatsApp Employee",
  description:
    "موظف ذكاء اصطناعي يرد على عملاءك على واتساب ٢٤ ساعة — ياخد طلبات، يحجز مواعيد، ويتكلم مصري. ArqFlow: AI WhatsApp agents for Egyptian businesses.",
};

export default async function HomePage() {
  let plans: Plan[] = PLANS;

  try {
    const supabase = await createClient();
    const [{ data: dbPlans }, { data: dbSettings }] = await Promise.all([
      supabase
        .from("plans")
        .select("id, name, name_ar, setup_fee_egp, monthly_fee_egp, validity_days, features, features_ar, highlighted, active, tier_level")
        .eq("active", true)
        .order("tier_level", { ascending: true }),
      supabase
        .from("app_settings")
        .select("key, value")
        .in("key", ["currency", "payment_accounts"]),
    ]);

    const settingsMap = Object.fromEntries((dbSettings ?? []).map((s) => [s.key, s.value]));
    const paymentConfig = resolvePaymentAccounts(settingsMap);

    if (dbPlans && dbPlans.length > 0) {
      plans = dbPlans.map((p) => mapDbPlanToMarketingPlan(p, paymentConfig.currency));
    }
  } catch (err) {
    console.error("Failed to load plans for home page, falling back to static:", err);
  }

  return <HomeClient plans={plans} />;
}
