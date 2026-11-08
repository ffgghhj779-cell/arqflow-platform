import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// We use service role to get the webhook_path as it might be sensitive
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { business_id, session_id, message } = body;

    if (!business_id || !session_id || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400, headers: corsHeaders });
    }

    // 1. Fetch business details
    const { data: business, error } = await supabase
      .from("businesses")
      .select("webhook_path, status, plan_id")
      .eq("id", business_id)
      .single();

    if (error || !business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404, headers: corsHeaders });
    }

    if (business.status !== "active") {
      return NextResponse.json({ error: "Bot is not active" }, { status: 403, headers: corsHeaders });
    }

    if (business.plan_id !== "enterprise") {
      return NextResponse.json({ error: "Feature not available on this plan" }, { status: 403, headers: corsHeaders });
    }

    if (!business.webhook_path) {
      return NextResponse.json({ error: "Bot webhook not configured" }, { status: 500, headers: corsHeaders });
    }

    // 2. Forward to n8n webhook
    // Assuming n8n base URL is known. Typically we'd have N8N_BASE_URL env var, or hardcoded for the factory
    const n8nBaseUrl = process.env.N8N_BASE_URL || "https://bc1b1373.kube-ops.com";
    let webhookUrl = business.webhook_path;
    if (!webhookUrl.startsWith('http')) {
      webhookUrl = `${n8nBaseUrl}/webhook/${webhookUrl}`;
    }

    const n8nPayload = {
      channel: "web",
      customer: {
        id: session_id, // We use session_id as the customer id for web visitors
        name: "زائر الويب", // "Web Visitor"
        phone: "" // No phone for web widget by default
      },
      customer_message: message,
      timestamp: new Date().toISOString()
    };

    const n8nResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(n8nPayload)
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error("n8n responded with status:", n8nResponse.status, "Body:", errorText);
      return NextResponse.json({ 
        error: "Failed to process message", 
        n8n_status: n8nResponse.status,
        n8n_error: errorText 
      }, { status: 502, headers: corsHeaders });
    }

    // Safely parse response
    const textResponse = await n8nResponse.text();
    let responseData: any = {};
    try {
      responseData = JSON.parse(textResponse);
    } catch (e) {
      console.warn("n8n response was not JSON:", textResponse);
      responseData = { output: textResponse };
    }

    return NextResponse.json({
      reply: responseData.ai_response || responseData.output || "عفواً، حدث خطأ أثناء معالجة الطلب."
    }, { headers: corsHeaders });

  } catch (error: any) {
    console.error("Widget chat API error:", error.message || error);
    return NextResponse.json(
      { error: "Failed to process message", details: error.message || String(error) },
      { status: 502, headers: corsHeaders }
    );
  }
}
