# Governor HPU Guardian — Expert Action Guide

Purpose: operational protocols for HPU accumulator health, varnish/filter detection, and emergency response validation.

Pump Hunting / Nitrogen Precharge Depletion:
- **Detection:** Decreasing intervals between pump starts at near-constant system load (stable main header pressure σ < 0.5 bar).
- **Action:** Flag `NITROGEN_PRECHARGE_DEPLETION` and schedule accumulator inspection and nitrogen topping. Investigate valve leaks and check bladder integrity.

Varnish & Filter Risk:
- **Detection:** Strong positive correlation between filter ΔP and oil temperature (corr ≥ 0.6) with elevated oil temperature (>~60°C) and ΔP above baseline.
- **Action:** Isolate and inspect filters, consider flushing oil, sample for varnish precursors and schedule filter element replacement.

Emergency Shutdown Validation:
- **Detection:** Emergency close time increased >20% vs baseline.
- **Action:** Flag `SAFETY_SYSTEM_DEGRADED` and schedule immediate emergency actuator inspection, hydraulic fluid checks (viscosity, air content), and servo response tuning.

Blocking & Failsafe Close:
- **Trigger:** Low main header pressure below safe threshold.
- **Action:** Block any gate opening commands and prepare an automated `FAILSAFE_CLOSE` action. Notify operations and persist audit.

Servo-Valve Stiction & Oil Overheat:
- **Hints:** Repeated pump cycles, rising oil temperature, and abrupt servo response variation. Use targeted flushing, filtration, and hydraulic oil temperature controls.

Integration Notes:
- `GovernorHPUGuardian.addMeasurement()` returns a `GovernorAction`. Master Executive must map to `BLOCK_OPENING`, `FAILSAFE_CLOSE`, schedule maintenance, or adjust health score via `getHealthImpactForAction()`.
