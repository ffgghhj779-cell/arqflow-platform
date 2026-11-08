import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEvolutionInstanceStatus } from "@/lib/evolution";

/**
 * GET /api/dashboard/whatsapp/status
 * Queries Evolution API directly for live WhatsApp connection state.
 * Performs database self-healing: updates `instances` table with real status and phone number.
 */
export async function GET() {
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
  const admin = createAdminClient();
  const now = new Date().toISOString();

  // If connected via Meta WhatsApp Cloud API, return Meta status directly
  if (instance?.phone_number_id || instance?.waba_id) {
    const isMetaConnected = instance.connection_status === "connected" || instance.evolution_status === "connected";
    return NextResponse.json({
      ok: true,
      connected: isMetaConnected,
      provider: "meta",
      evolution_status: isMetaConnected ? "connected" : "disconnected",
      connection_status: instance.connection_status ?? "connected",
      connected_number: instance.display_phone_number || instance.connected_number,
      display_phone_number: instance.display_phone_number,
      phone_number_id: instance.phone_number_id,
      waba_id: instance.waba_id,
      instance_name: instanceName,
      health_status: instance.health_status ?? "healthy",
      last_health_check: instance.last_health_check ?? now,
    });
  }

  if (!instanceName) {
    return NextResponse.json({
      connected: false,
      evolution_status: "not_provisioned",
      connected_number: null,
      instance_name: null,
      health_status: "degraded",
      last_health_check: null,
    });
  }

  // Live check with Evolution API
  const live = await getEvolutionInstanceStatus(instanceName);

  let effectiveStatus = instance?.evolution_status ?? (live.connected ? "connected" : "disconnected");
  let effectiveNumber = instance?.connected_number ?? live.number;
  let effectiveHealth = instance?.health_status ?? (live.connected ? "healthy" : "degraded");

  if (live.ok) {
    if (live.connected) {
      effectiveStatus = "connected";
      effectiveNumber = live.number || effectiveNumber;
      effectiveHealth = "healthy";

      await admin
        .from("instances")
        .update({
          evolution_status: "connected",
          connected_number: effectiveNumber,
          health_status: "healthy",
          last_health_check: now,
          updated_at: now,
        })
        .eq("instance_name", instanceName);

      if (business.status !== "active" && ["qr_pending", "under_review", "provision_failed"].includes(business.status ?? "")) {
        await admin
          .from("businesses")
          .update({
            status: "active",
            health_status: "healthy",
            last_health_check: now,
            activated_at: now,
          })
          .eq("id", business.id);
      }
    } else if (live.state === "close") {
      effectiveStatus = "disconnected";
      effectiveHealth = "degraded";

      await admin
        .from("instances")
        .update({
          evolution_status: "disconnected",
          health_status: "degraded",
          last_health_check: now,
          updated_at: now,
        })
        .eq("instance_name", instanceName);
    } else if (live.state === "connecting") {
      effectiveStatus = "qr_pending";
      effectiveHealth = "degraded";
    }
  }

  return NextResponse.json({
    ok: true,
    connected: live.connected,
    evolution_status: effectiveStatus,
    connected_number: effectiveNumber,
    instance_name: instanceName,
    health_status: effectiveHealth,
    last_health_check: now,
    raw_state: live.state,
    error: live.error ?? null,
  });
}
