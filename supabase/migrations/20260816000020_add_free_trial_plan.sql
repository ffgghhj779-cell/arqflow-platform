-- Add 'free_trial' plan to the plans table
INSERT INTO public.plans (id, name, name_ar, tier_level, setup_fee_egp, monthly_fee_egp, validity_days, features, features_ar, capabilities, active, ai_model, fallback_model, max_tokens, memory_window, tools, media_support)
VALUES (
    'free_trial',
    'Free Trial',
    'تجربة مجانية',
    3,
    0,
    0,
    1,
    '["Credit to try the system", "24-hour validity", "Full dashboard access"]'::jsonb,
    '["رصيد لتجربة النظام", "صلاحية لمدة ٢٤ ساعة", "لوحة تحكم كاملة"]'::jsonb,
    '{"operational_modules": true, "broadcasts": true, "advanced_analytics": true, "voice": true, "image": true, "customer_memory": true, "priority_support": true}'::jsonb,
    true,
    'anthropic/claude-sonnet-4.5',
    'anthropic/claude-haiku-4.5',
    1024,
    12,
    '["log_inquiry","escalate","send_link","save_transaction","lookup_order_status","calculator","save_preference"]'::jsonb,
    '["text","audio","location","image"]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name, 
    name_ar = EXCLUDED.name_ar, 
    tier_level = EXCLUDED.tier_level, 
    setup_fee_egp = EXCLUDED.setup_fee_egp, 
    monthly_fee_egp = EXCLUDED.monthly_fee_egp, 
    validity_days = EXCLUDED.validity_days, 
    features = EXCLUDED.features, 
    features_ar = EXCLUDED.features_ar, 
    capabilities = EXCLUDED.capabilities, 
    active = EXCLUDED.active,
    ai_model = EXCLUDED.ai_model,
    fallback_model = EXCLUDED.fallback_model,
    max_tokens = EXCLUDED.max_tokens,
    memory_window = EXCLUDED.memory_window,
    tools = EXCLUDED.tools,
    media_support = EXCLUDED.media_support;
