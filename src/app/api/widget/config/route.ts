import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("business_id");

  if (!businessId) {
    return NextResponse.json({ error: "Missing business_id" }, { status: 400, headers: corsHeaders });
  }

  try {
    const { data, error } = await supabase
      .from("businesses")
      .select("widget_config, status, plan_id, business_name, logo_url, webhook_path")
      .eq("id", businessId)
      .single();

    if (error) {
      console.error("Error fetching widget config:", error);
      return NextResponse.json({ error: "Business not found" }, { status: 404, headers: corsHeaders });
    }

    if (data.status !== "active") {
      return NextResponse.json({ error: "Bot is not active" }, { status: 403, headers: corsHeaders });
    }
    
    if (data.plan_id !== "enterprise") {
      return NextResponse.json({ error: "Feature not available on this plan" }, { status: 403, headers: corsHeaders });
    }

    return NextResponse.json({
      config: data.widget_config || {
        color: "#2563eb",
        bot_name: data.business_name || "المساعد الذكي",
        welcome_message: "مرحباً بك! كيف يمكنني مساعدتك اليوم؟",
      },
      logo_url: data.logo_url,
      debug_webhook_path: data.webhook_path,
      powered_by_url: process.env.NEXT_PUBLIC_APP_URL || "https://arqflow.com",
      powered_by_name: "Arq Flow"
    }, { headers: corsHeaders });
  } catch (err) {
    console.error("Unexpected error in widget config:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}
