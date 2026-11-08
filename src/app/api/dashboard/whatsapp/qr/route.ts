import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEvolutionQrCode } from "@/lib/evolution";

/**
 * POST /api/dashboard/whatsapp/qr
 * Fetches a fresh WhatsApp pairing QR code and optional pairing code
 * for the user's instance from Evolution API.
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
    return NextResponse.json({ error: "Instance not provisioned yet" }, { status: 400 });
  }

  const res = await getEvolutionQrCode(instanceName);

  if (!res.ok) {
    return NextResponse.json({ error: res.error || "Failed to fetch QR code" }, { status: 502 });
  }

  if (res.connected) {
    return NextResponse.json({ connected: true });
  }

  if (!res.qr_base64) {
    return NextResponse.json({ error: "QR code not ready, please retry" }, { status: 503 });
  }

  // Update DB instance status to reflect QR pending
  const admin = createAdminClient();
  const now = new Date().toISOString();
  await admin
    .from("instances")
    .update({
      evolution_status: "qr_pending",
      qr_sent_at: now,
      updated_at: now,
    })
    .eq("instance_name", instanceName);

  return NextResponse.json({
    connected: false,
    qr_base64: res.qr_base64,
    pairing_code: res.pairing_code ?? null,
    ttl_seconds: res.ttl_seconds ?? 40,
  });
}
