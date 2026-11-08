import type { Metadata } from "next";
import PricingClient from "./client";
import { createClient } from "@/lib/supabase/server";
import {
  PLANS,
  DEFAULT_PAYMENT_CONFIG,
  resolvePaymentAccounts,
  mapDbPlanToMarketingPlan,
  type Plan,
  type PaymentAccountsConfig,
} from "@/lib/plans";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "الأسعار · Pricing",
  description:
    "باقات ArqFlow الذكية: ستارتر، بيزنس، إنتربرايز. رسوم تأسيس لمرة واحدة + اشتراك شهري. دفع مرن عبر التحويل البنكي والبطاقات والدفع الفوري.",
};

export default async function PricingPage() {
  let plans: Plan[] = PLANS;
  let paymentConfig: PaymentAccountsConfig = DEFAULT_PAYMENT_CONFIG;

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
        .in("key", ["payment_accounts", "payment_instapay", "payment_vodafone", "payment_wepay", "currency"]),
    ]);

    if (dbSettings) {
      const settingsMap = Object.fromEntries(dbSettings.map((s) => [s.key, s.value]));
      paymentConfig = resolvePaymentAccounts(settingsMap);
    }

    if (dbPlans && dbPlans.length > 0) {
      plans = dbPlans.map((p) => mapDbPlanToMarketingPlan(p, paymentConfig.currency));
    }
  } catch (err) {
    console.error("Failed to fetch dynamic pricing/payment settings, using fallback:", err);
  }

  return <PricingClient plans={plans} paymentConfig={paymentConfig} />;
}
