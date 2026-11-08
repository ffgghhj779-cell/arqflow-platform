import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logoutEvolutionInstance, getEvolutionQrCode } from "@/lib/evolution";

/**
 * POST /api/dashboard/whatsapp/disconnect
 * Disconnects/logs out the current WhatsApp session in Evolution API,
 * clears the connected number, and fetches a fresh QR code so the user
 * can link their new or second phone number.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: business } = await supabase
    .from("businesses")
    .select("id, status, instance_name")
    .eq("owner_id", user.id)
    .single();

  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  const { data: instance } = await supabase
    .from("instances")
    .select("*")
    .eq("business_id", business.id)
    .maybeSingle();

  const instanceName = instance?.instance_name || business.instance_name;
  if (!instanceName) {
    return NextResponse.json({ error: "Instance not provisioned" }, { status: 400 });
  }

  // 1. If connected via Evolution API, logout from Evolution
  if (!instance?.phone_number_id && instanceName) {
    try {
      await logoutEvolutionInstance(instanceName);
    } catch {
      // Ignore evolution error on disconnect
    }
  }

  // 2. Clear connected number, Meta fields, and set status to disconnected
  const admin = createAdminClient();
  const now = new Date().toISOString();
  await admin
    .from("instances")
    .update({
      evolution_status: "disconnected",
      connection_status: "disconnected",
      connected_number: null,
      display_phone_number: null,
      phone_number_id: null,
      waba_id: null,
      meta_access_token: null,
      health_status: "warning",
      updated_at: now,
    })
    .eq("instance_name", instanceName);

  await admin.from("automation_logs").insert({
    business_id: business.id,
    workflow: "whatsapp",
    event: "change_number_requested",
    level: "info",
    payload: {
      instance_name: instanceName,
      previous_number: instance?.connected_number ?? null,
      requested_at: now,
    },
  });

  // 3. Request a fresh QR code for the new number
  // Small delay to let Evolution reset session state
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const qrRes = await getEvolutionQrCode(instanceName);

  return NextResponse.json({
    ok: true,
    message: "Disconnected successfully",
    qr_base64: qrRes.qr_base64 ?? null,
    pairing_code: qrRes.pairing_code ?? null,
    ttl_seconds: qrRes.ttl_seconds ?? 40,
  });
}
