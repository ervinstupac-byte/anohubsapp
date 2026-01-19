-- Migration: add expert_efficiency_curves to store canonical efficiency-by-flow curves
-- Created: 2026-01-19

CREATE TABLE IF NOT EXISTS expert_efficiency_curves (
    id BIGSERIAL PRIMARY KEY,
    turbine_variant TEXT,
    asset_family TEXT,
    curve_json JSONB NOT NULL,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expert_efficiency_curves_variant ON expert_efficiency_curves (turbine_variant);
CREATE INDEX IF NOT EXISTS idx_expert_efficiency_curves_family ON expert_efficiency_curves (asset_family);

-- Seed: sample curve for Francis horizontal 5MW (replace with validated curves later)
INSERT INTO expert_efficiency_curves (turbine_variant, asset_family, curve_json, notes)
VALUES (
    'Francis-5MW-Horizontal',
    'francis_horizontal_5mw',
    $curve${"points":[{"q":0.0,"eta":0.0},{"q":2.0,"eta":0.75},{"q":4.0,"eta":0.86},{"q":6.0,"eta":0.90},{"q":8.0,"eta":0.92},{"q":10.0,"eta":0.91}]}$curve$,
    'Seed sample curve: replace with validated manufacturer curves.'
);
