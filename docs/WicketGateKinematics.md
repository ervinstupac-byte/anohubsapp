# Wicket Gate Kinematics — Expert Action Guide

Purpose: operational and maintenance procedures for gate kinematics alerts.

Stuck Gate Recovery (pokušaj oslobađanja nanosa malim pomacima):
- **Procedure:** Apply small, controlled back-and-forth servo commands (±1–2% stroke) to attempt to free deposits. Monitor force and position feedback continuously.
- **Limits:** Do not exceed ±5% repeated cycles and stop if force spikes > 2x baseline or vibration increases.
- **Follow-up:** If freed, run full stroke tests at reduced speed and inspect for abrasion or deposits.

Shear Pin / Manual Pin Replacement:
- **Detection:** `SHEAR_PIN_BROKEN` alert from `WicketGateKinematics` (sudden discontinuity in force/position ratio).
- **Action:** Immediately command limiting of maximum gate opening to a conservative safe value (e.g., 30%).
- **Replacement:** Lock out automatic control, follow mechanical isolation and safety lock/tag procedures, replace pin per Drawing 84 (Pin Assembly) and torque to spec. Re-verify with manual jog tests.

Lubrication Deficiency:
- **Trigger:** Friction increase > 15% above baseline.
- **Action:** Schedule lubrication inspection, increase flushing cycles, check servo hydraulic oil contamination and filter state.

Integration Notes:
- `WicketGateKinematics.addMeasurement()` returns a `WicketAction`. The Master Executive should apply `getHealthImpactForAction()` mapping to `HealthScore.overall` and enforce `limitGateOpenPct` where applicable.
