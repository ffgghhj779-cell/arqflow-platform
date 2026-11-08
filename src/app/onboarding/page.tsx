import type { Metadata } from "next";
import { Suspense } from "react";
import OnboardingWizard, { OnboardingHeader } from "./OnboardingWizard";
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
  title: "Get Started — Onboarding",
  description:
    "Set up your AI WhatsApp assistant in minutes. Tell us about your business, train your assistant, and go live.",
};

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;

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
    console.error("Failed to load onboarding dynamic data, using fallbacks:", err);
  }

  return (
    <div className="min-h-screen bg-app relative overflow-x-clip">
      {/* ambient decoration */}
      <div className="glow-orb w-[480px] h-[480px] bg-brand-teal -top-40 -start-40" />
      <div className="glow-orb w-[420px] h-[420px] bg-brand-navy bottom-0 -end-32" />
      <div className="grid-bg absolute inset-0 opacity-30 pointer-events-none" />

      <div className="relative z-10">
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="skeleton w-full max-w-3xl h-96 mx-4" />
            </div>
          }
        >
          <OnboardingHeader />
          <OnboardingWizard
            initialPlan={plan ?? null}
            plans={plans}
            paymentConfig={paymentConfig}
          />
        </Suspense>
      </div>
    </div>
  );
}
