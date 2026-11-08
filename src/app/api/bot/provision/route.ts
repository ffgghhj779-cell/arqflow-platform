import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";
import type { Json } from "@/lib/database.types";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { businessId } = await req.json();
    if (!businessId) {
      return NextResponse.json({ error: "Missing businessId" }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: business } = await admin
      .from("businesses")
      .select("*")
      .eq("id", businessId)
      .eq("owner_id", user.id)
      .single();

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    if (business.status === "provisioning") {
      return NextResponse.json({ success: true, message: "Already provisioning" });
    }

    // 1) Update status to provisioning
    await admin
      .from("businesses")
      .update({ status: "provisioning" })
      .eq("id", businessId);

    // 2) Gather content for factory
    const [{ data: kb }, { data: products }, { data: services }] = await Promise.all([
      admin.from("knowledge_base").select("kind, category, question, answer, language").eq("business_id", businessId),
      admin.from("products").select("name, description, price_egp").eq("business_id", businessId),
      admin.from("services").select("name, description, price_egp").eq("business_id", businessId),
    ]);

    // 3) Trigger Factory
    const factoryUrl = process.env.N8N_FACTORY_WEBHOOK_URL;
    const secret = process.env.N8N_WEBHOOK_SECRET ?? "";
    const notifyNumber = business.whatsapp_number || business.contact_phone || null;

    const payload = {
      event: "provision_bot",
      source: "arqflow-platform",
      business_id: business.id,
      order_id: business.order_id,
      business_name: business.business_name,
      business_type: business.business_type,
      language: business.languages?.[0] ?? "ar",
      notify_number: notifyNumber,
      knowledge_base: kb ?? [],
      products: products ?? [],
      services: services ?? [],
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/n8n/callback`,
    };

    let factoryTriggered = false;
    let factoryError: string | null = null;

    if (factoryUrl) {
      try {
        const signature = crypto.createHmac("sha256", secret).update(JSON.stringify(payload)).digest("hex");
        const res = await fetch(factoryUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-ArqFlow-Signature": signature },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(25_000), // wait for n8n to respond
        });
        factoryTriggered = res.ok;
        if (!res.ok) factoryError = `Factory webhook returned ${res.status}`;
      } catch (e) {
        factoryError = e instanceof Error ? e.message : "Factory webhook unreachable";
      }
    } else {
      factoryError = "N8N_FACTORY_WEBHOOK_URL not configured";
    }

    // 4) Log Automation
    await admin.from("automation_logs").insert({
      business_id: businessId,
      workflow: "provisioning",
      event: factoryTriggered ? "factory_triggered" : "factory_trigger_failed",
      level: factoryTriggered ? "info" : "error",
      payload: { order_id: business.order_id, error: factoryError, source: "simulator_connect" } as unknown as Json,
    });

    if (!factoryTriggered) {
      // Revert status if factory failed so they can try again
      await admin.from("businesses").update({ status: "active" }).eq("id", businessId);
      return NextResponse.json({ error: factoryError }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Provision endpoint error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
