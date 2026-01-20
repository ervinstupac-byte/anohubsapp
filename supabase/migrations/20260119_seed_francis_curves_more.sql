-- Seed additional Francis horizontal efficiency curves (baseline canonical shapes)
-- Created: 2026-01-19

INSERT INTO expert_efficiency_curves (turbine_variant, asset_family, curve_json, notes)
VALUES
('Francis-5MW-Horizontal', 'francis_horizontal_5mw', $c${"points":[{"q":0,"eta":0},{"q":1,"eta":0.70},{"q":2,"eta":0.82},{"q":4,"eta":0.88},{"q":6,"eta":0.915},{"q":8,"eta":0.92},{"q":10,"eta":0.91}]}$c$, 'Baseline sample curve for 5MW horizontal Francis'),
('Francis-3MW-Horizontal', 'francis_horizontal_3mw', $c${"points":[{"q":0,"eta":0},{"q":0.5,"eta":0.68},{"q":1.5,"eta":0.80},{"q":3,"eta":0.88},{"q":4.5,"eta":0.90}]}$c$, 'Baseline sample curve for 3MW horizontal Francis'),
('Francis-1MW-Horizontal', 'francis_horizontal_1mw', $c${"points":[{"q":0,"eta":0},{"q":0.2,"eta":0.6},{"q":0.6,"eta":0.75},{"q":1.0,"eta":0.85}]}$c$, 'Baseline sample curve for 1MW horizontal Francis');
