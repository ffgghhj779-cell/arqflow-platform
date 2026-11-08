import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderIndustryPromptScaffold } from "@/lib/modules/ai";

export async function POST(req: Request) {
  try {
    const { message, businessId, history } = await req.json();

    if (!message || !businessId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1) Fetch business, products, services in parallel
    const [bizRes, productsRes, servicesRes] = await Promise.all([
      supabase.from("businesses").select("*").eq("id", businessId).single(),
      supabase.from("products").select("name, price_egp, description").eq("business_id", businessId).eq("available", true),
      supabase.from("services").select("name, price_egp, description, duration_minutes").eq("business_id", businessId).eq("active", true),
    ]);

    const business = bizRes.data;
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const products = productsRes.data || [];
    const services = servicesRes.data || [];

    // Build the system prompt using the exact same scaffold the n8n bot factory uses
    const scaffold = renderIndustryPromptScaffold(business.business_type);
    
    // Fetch knowledge base
    const { data: kb } = await supabase
      .from("knowledge_base")
      .select("category, question, answer")
      .eq("business_id", businessId);

    const kbText = kb && kb.length > 0 
      ? kb.map((k) => `Q: ${k.question || k.category}\nA: ${k.answer}`).join("\n\n")
      : "No additional knowledge base provided.";

    // Format social media info
    let socialMediaStr = "";
    if (business.social_media && typeof business.social_media === "object") {
      const sm = business.social_media as Record<string, string>;
      const entries = Object.entries(sm).filter(([_, val]) => !!val);
      if (entries.length > 0) {
        socialMediaStr = entries.map(([platform, handle]) => `${platform}: ${handle}`).join(", ");
      }
    }

    // Format products list
    let productsText = "";
    if (products.length > 0) {
      productsText = products
        .map((p) => `- ${p.name}: ${p.price_egp ? `${p.price_egp} EGP` : "N/A"}${p.description ? ` (${p.description})` : ""}`)
        .join("\n");
    }

    // Format services list
    let servicesText = "";
    if (services.length > 0) {
      servicesText = services
        .map((s) => `- ${s.name}: ${s.price_egp ? `${s.price_egp} EGP` : "N/A"}${s.duration_minutes ? ` (${s.duration_minutes} min)` : ""}${s.description ? ` - ${s.description}` : ""}`)
        .join("\n");
    }

    // Format business details dynamically (only output keys that have values to conserve tokens)
    const contextItems = [
      `Name: ${business.business_name}`,
      `Type: ${business.business_type}`,
      business.description ? `About: ${business.description}` : "",
      business.primary_goal ? `Goal: ${business.primary_goal}` : "",
      business.assistant_personality ? `Personality: ${business.assistant_personality}` : "",
      business.tone_of_voice ? `Tone: ${business.tone_of_voice}` : "",
      business.contact_phone ? `Phone: ${business.contact_phone}` : "",
      business.whatsapp_number ? `WhatsApp: ${business.whatsapp_number}` : "",
      business.contact_email ? `Email: ${business.contact_email}` : "",
      business.website ? `Website: ${business.website}` : "",
      socialMediaStr ? `Social: ${socialMediaStr}` : "",
      business.working_hours ? `Hours: ${business.working_hours}` : "",
      business.address ? `Address: ${business.address}` : "",
      business.location ? `Location Link: ${business.location}` : "",
      business.delivery_info ? `Delivery: ${business.delivery_info}` : "",
      business.return_policy ? `Returns: ${business.return_policy}` : "",
      business.order_instructions ? `Ordering: ${business.order_instructions}` : "",
      business.policy ? `Policy: ${business.policy}` : "",
      business.payment_methods && business.payment_methods.length > 0 ? `Payments: ${business.payment_methods.join(", ")}` : "",
    ].filter(Boolean);

    const businessDetails = contextItems.join("\n");

    const systemPrompt = `
You are the AI assistant for a business with the following details:
${businessDetails}

${productsText ? `Products/Catalog:\n${productsText}` : ""}
${servicesText ? `Services:\n${servicesText}` : ""}

${scaffold ? `Industry Guidelines:\n${scaffold}` : ""}

Knowledge Base / FAQs:
${kbText}

Instructions (Strict):
- Be extremely concise and direct to save tokens. Respond in 1-2 short sentences maximum whenever possible.
- Respond in the language the user speaks.
- Speak in the tone of voice: "${business.tone_of_voice || "egyptian"}" (e.g. friendly Egyptian dialect if "egyptian").
- Do NOT make up information or promise anything outside the provided details.
- If you don't know something, follow the fallback behavior: "${business.fallback_behavior || "apologize"}".
`;

    // We check for a RooyaLLM key. If none exists (or if it's just a demo), we return a fallback.
    const apiKey = process.env.ROOYA_API_KEY;
    
    if (!apiKey) {
      // Mock response if no API key is provided
      const mockReply = `هذه رسالة محاكاة تلقائية لأن مفتاح ROOYA_API_KEY غير متوفر في السيرفر حالياً.\n\nبناءً على إعداداتك، البوت الخاص بك مبرمج للعمل في مجال (${business.business_type}).\n\nأرسلت: "${message}"`;
      return NextResponse.json({ reply: mockReply });
    }

    // Build the messages payload using history for context-awareness
    const messagesPayload = [
      { role: "system" as const, content: systemPrompt },
      ...(Array.isArray(history)
        ? history.map((h: any) => ({
            role: h.role === "assistant" ? ("assistant" as const) : ("user" as const),
            content: h.content || "",
          }))
        : []),
      { role: "user" as const, content: message },
    ];

    // Call RooyaLLM
    const aiRes = await fetch("https://llm.rooyai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // fast and cheap for simulator
        messages: messagesPayload,
        temperature: 0.7,
      }),
    });

    if (!aiRes.ok) {
      console.error("RooyaLLM error", await aiRes.text());
      return NextResponse.json({ error: "Failed to generate reply" }, { status: 500 });
    }

    const aiJson = await aiRes.json();
    const reply = aiJson.choices[0].message.content;

    // Record token usage cost
    const usage = aiJson.usage;
    if (usage) {
      const promptTokens = usage.prompt_tokens || 0;
      const completionTokens = usage.completion_tokens || 0;
      
      const INPUT_RATE = 0.15;  // per 1M tokens
      const OUTPUT_RATE = 0.60; // per 1M tokens
      const USD_TO_EGP = 1200;

      const costUSD = (promptTokens / 1_000_000) * INPUT_RATE + (completionTokens / 1_000_000) * OUTPUT_RATE;
      const costEGP = costUSD * USD_TO_EGP;

      await supabase.rpc("increment_usage", {
        b_id: businessId,
        in_tokens: promptTokens,
        out_tokens: completionTokens,
        msg_cost: costEGP
      });
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Simulator chat error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
