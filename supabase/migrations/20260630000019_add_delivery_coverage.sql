-- ============================================================
-- Migration: Add coverage controls to delivery_zones
-- ============================================================

ALTER TABLE public.delivery_zones
ADD COLUMN IF NOT EXISTS coverage_type text DEFAULT 'radius',
ADD COLUMN IF NOT EXISTS coverage_value text;
