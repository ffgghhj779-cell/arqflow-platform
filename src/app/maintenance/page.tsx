import { createAdminClient } from "@/lib/supabase/admin";
import MaintenanceClient from "./MaintenanceClient";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  let whatsapp = "";
  try {
    const db = createAdminClient();
    const { data: whatsappSetting } = await db
      .from("app_settings")
      .select("value")
      .eq("key", "support_whatsapp")
      .maybeSingle();

    whatsapp = (whatsappSetting?.value as string) || "";
  } catch (e) {
    console.error("Error fetching support_whatsapp setting:", e);
  }

  return <MaintenanceClient whatsapp={whatsapp} />;
}
