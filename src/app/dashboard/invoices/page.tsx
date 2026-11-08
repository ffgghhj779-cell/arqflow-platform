import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import InvoicesClient from "./InvoicesClient";

export default async function InvoicesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses").select("id").eq("owner_id", user.id).single();
  if (!business) redirect("/onboarding");

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  const { data: usage } = await supabase
    .from("usage_counters")
    .select("wallet_egp, balance_egp, cost_egp")
    .eq("business_id", business.id)
    .single();

  let displayBalance = 0;
  if (usage && usage.balance_egp > 0) {
    displayBalance = usage.wallet_egp * (1 - usage.cost_egp / usage.balance_egp);
    displayBalance = Math.max(0, displayBalance);
  }

  return <InvoicesClient businessId={business.id} invoices={invoices ?? []} walletBalance={displayBalance} />;
}
