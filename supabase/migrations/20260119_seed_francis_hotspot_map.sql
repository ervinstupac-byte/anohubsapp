-- Seed hotspot_map entries for Francis horizontal designs
-- Created: 2026-01-19

-- This migration will merge a canonical hotspot_map into any existing turbine_designs
-- rows that reference Francis turbines. It uses JSONB merge (||) so existing keys
-- will be preserved and new keys added/overwritten as needed.

-- Defensive: ensure `hotspot_map` column exists for older schemas.
ALTER TABLE IF EXISTS public.turbine_designs
  ADD COLUMN IF NOT EXISTS hotspot_map jsonb DEFAULT '{}'::jsonb;

UPDATE public.turbine_designs
SET hotspot_map = COALESCE(hotspot_map, '{}'::jsonb) || (
  '{
    "shaft": "part:shaft:main",
    "wicket_gates": "part:wicket_ring",
    "spiral_case": "part:spiral_case",
    "runner": "part:runner",
    "draft_tube": "part:draft_tube",
    "seal_package": "part:seal_package",
    "upper_guide_bearing": "part:guide_bearing_upper",
    "guide_bearing_indicator": "part:guide_bearing_indicator",
    "guide_vanes": "part:guide_vanes_ring",
    "guide_bearing_pad1": "part:guide_bearing_pad1",
    "guide_bearing_pad2": "part:guide_bearing_pad2",
    "guide_bearing_pad3": "part:guide_bearing_pad3",
    "runner_blades": {
        "count": 12,
        "pattern": "runner_blade_{{n}}"
    },
    "runner_blade_1": "part:runner_blade_1",
    "runner_blade_2": "part:runner_blade_2",
    "runner_blade_3": "part:runner_blade_3",
    "runner_blade_4": "part:runner_blade_4",
    "runner_blade_5": "part:runner_blade_5",
    "runner_blade_6": "part:runner_blade_6",
    "runner_blade_7": "part:runner_blade_7",
    "runner_blade_8": "part:runner_blade_8",
    "runner_blade_9": "part:runner_blade_9",
    "runner_blade_10": "part:runner_blade_10",
    "runner_blade_11": "part:runner_blade_11",
    "runner_blade_12": "part:runner_blade_12"
  }'::jsonb
)
WHERE COALESCE(recommended_turbine, '') ILIKE '%FRANCIS%'
  OR COALESCE(recommended_turbine, '') ILIKE '%FRANCIS-%'
  OR (parameters->> 'turbine_type') ILIKE '%francis%';

-- Optionally, for systems that store a single canonical design per asset, you can
-- insert a new turbine_designs row with this hotspot_map for a known asset id.
