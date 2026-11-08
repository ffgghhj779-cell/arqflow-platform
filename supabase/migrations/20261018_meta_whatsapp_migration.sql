-- ============================================================
-- Meta WhatsApp Cloud API Migration
-- Applied to ArqFlow Supabase Project: zjathejcdkpxjyvululp
-- Date: 2026-10-18
-- ============================================================

-- 1. Enhance instances table for Meta Cloud API
ALTER TABLE instances 
    ADD COLUMN IF NOT EXISTS waba_id TEXT,
    ADD COLUMN IF NOT EXISTS phone_number_id TEXT,
    ADD COLUMN IF NOT EXISTS meta_access_token TEXT,
    ADD COLUMN IF NOT EXISTS meta_token_expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS display_phone_number TEXT,
    ADD COLUMN IF NOT EXISTS connection_status TEXT DEFAULT 'disconnected';

CREATE INDEX IF NOT EXISTS idx_instances_phone_number_id ON instances(phone_number_id);
CREATE INDEX IF NOT EXISTS idx_instances_waba_id ON instances(waba_id);

-- 2. Enhance conversations table for 24-hour service window tracking
ALTER TABLE conversations 
    ADD COLUMN IF NOT EXISTS meta_conversation_id TEXT,
    ADD COLUMN IF NOT EXISTS window_expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS conversation_category TEXT DEFAULT 'service';

CREATE INDEX IF NOT EXISTS idx_conversations_window_expires ON conversations(window_expires_at);

-- 3. Enhance messages table for delivery status tracking (sent, delivered, read, failed)
ALTER TABLE messages 
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent',
    ADD COLUMN IF NOT EXISTS error_message TEXT,
    ADD COLUMN IF NOT EXISTS meta_raw JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_messages_wa_message_id ON messages(wa_message_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(business_id, status);

-- 4. Create whatsapp_templates table for managing Meta pre-approved templates
CREATE TABLE IF NOT EXISTS whatsapp_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    meta_template_id TEXT,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('MARKETING', 'UTILITY', 'AUTHENTICATION')),
    language TEXT NOT NULL DEFAULT 'ar',
    status TEXT NOT NULL DEFAULT 'APPROVED' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'PAUSED', 'DISABLED')),
    components JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_business_template UNIQUE(business_id, name, language)
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_business ON whatsapp_templates(business_id, status);
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;

-- 5. RLS policies for whatsapp_templates
CREATE POLICY templates_owner_all ON whatsapp_templates
    FOR ALL
    USING (
        business_id IN (
            SELECT id FROM businesses WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY templates_service_all ON whatsapp_templates
    FOR ALL
    USING (auth.role() = 'service_role');
