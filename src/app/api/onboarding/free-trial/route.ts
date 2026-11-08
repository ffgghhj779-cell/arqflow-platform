import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { generateOrderId } from "@/lib/utils";
import { notifyNewPayment } from "@/lib/telegram";
import { buildIndustryPromptContext } from "@/lib/modules/ai";
import { resolveCapabilities } from "@/lib/capabilities";
import type { Json } from "@/lib/database.types";

const productSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.string().max(50).optional().default(""),
  description: z.string().max(500).optional().default(""),
});

const onboardingSchema = z.object({
  // plan
  plan_id: z.enum(["free_trial", "starter", "business", "enterprise"]),
  // identity
  business_name: z.string().min(2).max(200),
  business_type: z.string().min(2).max(100),
  description: z.string().max(2000).optional().default(""),
  website: z.string().max(300).optional().default(""),
  social_media: z.record(z.string(), z.string().max(300)).optional().default({}),
  languages: z.array(z.enum(["ar", "en"])).min(1).default(["ar"]),
  // contact
  owner_name: z.string().min(2).max(150),
  contact_email: z.string().email().max(200),
  contact_phone: z.string().regex(/^\d{10,15}$/),
  whatsapp_number: z.string().regex(/^\d{10,15}$/),
  // operations
  working_hours: z.string().min(1).max(300),
  working_hours_struct: z
    .object({
      always: z.boolean().default(false),
      open: z.string().max(8).optional().default(""),
      close: z.string().max(8).optional().default(""),
      days: z.array(z.enum(["sat", "sun", "mon", "tue", "wed", "thu", "fri"])).max(7).default([]),
    })
    .optional()
    .nullable(),
  address: z.string().max(500).optional().default(""),
  location: z.string().max(500).optional().default(""),
  delivery_info: z.string().max(1000).optional().default(""),
  return_policy: z.string().max(1000).optional().default(""),
  order_instructions: z.string().max(1000).optional().default(""),
  payment_methods: z.array(z.string().max(50)).default([]),
  // AI config
  primary_goal: z.string().max(500).optional().default(""),
  tone_of_voice: z.enum(["formal", "friendly", "egyptian"]).default("egyptian"),
  fallback_behavior: z.enum(["handover", "collect", "apologize"]).default("handover"),
  greeting_message: z.string().max(500).optional().default(""),
  assistant_personality: z.string().max(1000).optional().default(""),
  knowledge_base_raw: z.string().max(20000).optional().default(""),
  policy: z.string().max(5000).optional().default(""),
  faqs: z.array(z.object({ question: z.string().max(500), answer: z.string().max(2000) })).default([]),
  products: z.array(productSchema).default([]),
  services: z.array(productSchema).default([]),
  // uploaded file paths (already in storage)
  logo_path: z.string().max(500).optional().nullable(),
  image_paths: z.array(z.string().max(500)).default([]),
  kb_file_paths: z.array(z.string().max(500)).default([]),
  // payment (optional for free trial)
  payment_method: z.string().optional().nullable(),
  transaction_ref: z.string().optional().nullable(),
  screenshot_path: z.string().optional().nullable(),
}).refine((data) => data.contact_phone !== data.whatsapp_number, {
  message: "Bot WhatsApp number must be different from manager phone number",
  path: ["whatsapp_number"],
});

// naive in-memory rate limit (per runtime instance)
const hits = new Map<string, { count: number; ts: number }>();
function rateLimit(ip: string, max = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.ts > windowMs) {
    hits.set(ip, { count: 1, ts: now });
    return true;
  }
  h.count += 1;
  return h.count <= max;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }
  const d = parsed.data;

  const supabase = createAdminClient();

  // plan snapshot
  // For free trial, we don't need a DB plan record. We can just grant full capabilities (tier 3).
  const plan = { id: "free_trial", tier_level: 3 };

  const order_id = generateOrderId();

  const owner_id = user.id;

  // 2) Create business
  const { data: business, error: bizErr } = await supabase
    .from("businesses")
    .insert({
      owner_id,
      order_id,
      plan_id: d.plan_id,
      status: "active", // ACTIVE instantly
      business_name: d.business_name,
      business_type: d.business_type,
      description: d.description,
      website: d.website,
      social_media: d.social_media,
      languages: d.languages,
      owner_name: d.owner_name,
      contact_email: d.contact_email,
      contact_phone: d.contact_phone,
      whatsapp_number: d.whatsapp_number,
      working_hours: d.working_hours,
      working_hours_struct: (d.working_hours_struct ?? null) as Json,
      address: d.address,
      location: d.location,
      delivery_info: d.delivery_info,
      return_policy: d.return_policy,
      order_instructions: d.order_instructions,
      payment_methods: d.payment_methods,
      primary_goal: d.primary_goal,
      tone_of_voice: d.tone_of_voice,
      fallback_behavior: d.fallback_behavior,
      greeting_message: d.greeting_message,
      assistant_personality: d.assistant_personality,
      knowledge_base_raw: d.knowledge_base_raw,
      policy: d.policy,
      logo_url: d.logo_path
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/business-assets/${d.logo_path}`
        : null,
      setup_fee_egp: 0,
      monthly_fee_egp: 0,
      form_data_raw: body as Json,
    })
    .select("id, order_id")
    .single();

  if (bizErr || !business) {
    console.error("business insert failed", bizErr);
    // rollback user creation if possible, but for trial it's okay to just fail
    return NextResponse.json({ error: "Could not create business" }, { status: 500 });
  }

  const bid = business.id;

  // 3) Create 10 EGP usage counter for 1 day
  const periodStart = new Date();
  const periodEnd = new Date();
  periodEnd.setDate(periodEnd.getDate() + 1);

  await supabase.from("usage_counters").insert({
    business_id: bid,
    balance_egp: 10,
    wallet_egp: 10,
    cost_egp: 0,
    period_start: periodStart.toISOString(),
    period_end: periodEnd.toISOString(),
  });

  // seed tenant content
  if (d.faqs.length) {
    await supabase.from("knowledge_base").insert(
      d.faqs.map((f) => ({
        business_id: bid,
        kind: "faq",
        question: f.question,
        answer: f.answer,
        language: d.languages[0] ?? "ar",
      }))
    );
  }
  if (d.knowledge_base_raw) {
    await supabase.from("knowledge_base").insert({
      business_id: bid,
      kind: "doc",
      category: "general",
      answer: d.knowledge_base_raw,
      language: d.languages[0] ?? "ar",
    });
  }
  if (d.products.length) {
    await supabase.from("products").insert(
      d.products.map((p, i) => ({
        business_id: bid,
        name: p.name,
        description: p.description || null,
        price_egp: p.price ? Number(p.price.replace(/[^\d.]/g, "")) || null : null,
        sort_order: i,
      }))
    );
  }
  if (d.services.length) {
    await supabase.from("services").insert(
      d.services.map((s) => ({
        business_id: bid,
        name: s.name,
        description: s.description || null,
        price_egp: s.price ? Number(s.price.replace(/[^\d.]/g, "")) || null : null,
      }))
    );
  }

  // file records
  const fileRows = [
    ...(d.logo_path ? [{ kind: "logo", bucket: "business-assets", path: d.logo_path }] : []),
    ...d.image_paths.map((p) => ({ kind: "image", bucket: "business-assets", path: p })),
    ...d.kb_file_paths.map((p) => ({ kind: "kb_doc", bucket: "kb-files", path: p })),
    ...(d.screenshot_path ? [{ kind: "payment_screenshot", bucket: "payment-screenshots", path: d.screenshot_path }] : []),
  ];
  await supabase.from("business_files").insert(
    fileRows.map((f) => ({
      business_id: bid,
      kind: f.kind,
      bucket: f.bucket,
      storage_path: f.path,
      file_name: f.path.split("/").pop() ?? f.path,
    }))
  );

  const industry = buildIndustryPromptContext(d.business_type, resolveCapabilities(plan));

  await supabase.from("automation_logs").insert({
    business_id: bid,
    workflow: "onboarding",
    event: "free_trial_started", // special event for n8n 7-day workflow
    level: "info",
    payload: { order_id, plan: d.plan_id, business_type: d.business_type, industry } as unknown as Json,
  });

  // We DO NOT notify admin or trigger telegram since this is a free trial.
  // Instead, the user will be redirected to the simulator and they already have their auto-generated credentials?
  // Wait, the client needs the password to log in. In the onboarding wizard, they don't get the password.
  // Let's return the password in the response so the frontend can automatically log them in or save it.

  return NextResponse.json({ ok: true, order_id, business_id: bid });
}
