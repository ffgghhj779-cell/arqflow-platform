import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/whatsapp/connect
 * Handles connecting WhatsApp via Meta WhatsApp Cloud API.
 * Supports both:
 * 1. Embedded Signup OAuth code exchange (Live / Production)
 * 2. Sandbox / Developer direct token configuration (Testing / Development)
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: business } = await supabase
    .from("businesses")
    .select("id, status, instance_name, business_name, owner_id")
    .eq("owner_id", user.id)
    .single();

  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  let body: {
    code?: string;
    phone_number_id?: string;
    waba_id?: string;
    access_token?: string;
    display_phone_number?: string;
    mode?: "embedded" | "sandbox";
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();
  let targetPhoneId = body.phone_number_id || null;
  let targetWabaId = body.waba_id || null;
  let targetToken = body.access_token || null;
  let targetDisplayNumber = body.display_phone_number || null;

  // Case 1: OAuth Code from Meta Embedded Signup
  if (body.code) {
    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;

    if (appId && appSecret) {
      try {
        const tokenUrl = `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${encodeURIComponent(
          body.code
        )}`;
        const tokenRes = await fetch(tokenUrl, { method: "GET" });
        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          targetToken = tokenData.access_token || targetToken;
        }
      } catch (e) {
        console.error("Meta token exchange error:", e);
      }
    }
  }

  // If we have token & phone_number_id, fetch live phone number info from Meta Graph API
  if (targetPhoneId && targetToken) {
    try {
      const phoneUrl = `https://graph.facebook.com/v21.0/${encodeURIComponent(
        targetPhoneId
      )}?fields=display_phone_number,verified_name,quality_rating`;
      const phoneRes = await fetch(phoneUrl, {
        headers: { Authorization: `Bearer ${targetToken}` },
        signal: AbortSignal.timeout(8000),
      });
      if (phoneRes.ok) {
        const pData = await phoneRes.json();
        targetDisplayNumber = pData.display_phone_number || targetDisplayNumber;
      }
    } catch {
      // Continue with provided display number
    }
  }

  const instanceName = business.instance_name || `biz_${business.id.replace(/-/g, "").slice(0, 12)}`;

  // Upsert instance record with Meta credentials
  const { error: upsertErr } = await admin.from("instances").upsert(
    {
      business_id: business.id,
      instance_name: instanceName,
      evolution_status: "connected",
      connection_status: "connected",
      phone_number_id: targetPhoneId,
      waba_id: targetWabaId,
      meta_access_token: targetToken,
      display_phone_number: targetDisplayNumber,
      connected_number: targetDisplayNumber?.replace(/\D/g, "") || null,
      health_status: "healthy",
      last_health_check: now,
      updated_at: now,
    },
    { onConflict: "instance_name" }
  );

  if (upsertErr) {
    return NextResponse.json({ error: upsertErr.message }, { status: 500 });
  }

  // Activate business if it was in setup / onboarding
  if (["provisioning", "qr_pending", "under_review", "provision_failed"].includes(business.status ?? "")) {
    await admin
      .from("businesses")
      .update({
        status: "active",
        health_status: "healthy",
        last_health_check: now,
        activated_at: now,
        instance_name: instanceName,
        whatsapp_number: targetDisplayNumber?.replace(/\D/g, "") || null,
      })
      .eq("id", business.id);
  }

  // Log automation event
  await admin.from("automation_logs").insert({
    business_id: business.id,
    workflow: "whatsapp",
    event: "meta_connected",
    level: "info",
    payload: {
      provider: "meta_cloud_api",
      phone_number_id: targetPhoneId,
      waba_id: targetWabaId,
      display_phone_number: targetDisplayNumber,
      mode: body.mode || "live",
      connected_at: now,
    },
  });

  return NextResponse.json({
    ok: true,
    connected: true,
    provider: "meta",
    display_phone_number: targetDisplayNumber,
    phone_number_id: targetPhoneId,
    waba_id: targetWabaId,
  });
}
