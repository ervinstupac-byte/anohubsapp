# Thrust Bearing Master — Expert Action Guide

Purpose: describe response protocols for thrust bearing conditions detected by `ThrustBearingMaster`.

Pad Temperature Divergence:
- **Trigger:** pad temperature standard deviation exceeds configured divergence threshold (default 5°C). 
- **Action:** Issue `PAD_TEMPERATURE_DIVERGENCE` advisory. Monitor closely, schedule inspection for pad load balance and oil film uniformity.
- **Operator Steps:** Verify oil supply and cooling, perform thermographic scan of pads, check alignment and pad pivot condition within 24 hours.

Mechanical Misalignment Alarm:
- **Trigger:** pad temperature standard deviation exceeds critical threshold (default 12°C).
- **Action:** Issue `MECHANICAL_MISALIGNMENT` alarm. Recommend immediate speed reduction and precision alignment survey.
- **Operator Steps:** Stop if vibration or rubbing suspected; perform laser alignment and bearing geometry check; escalate to mechanical engineer.

Lubrication Crisis / Sovereign Trip:
- **Trigger:** Estimated `h_min` < 20 μm => `LUBRICATION_CRISIS` warning. If `h_min` < 12 μm => `SOVEREIGN_TRIP` emergency shutdown.
- **Action:** For warning, derate machine and increase lubrication flow; for trip, execute sovereign shutdown and preserve telemetry for forensic analysis.

Oil Emulsification ("voda u ulju"):
- **Detection Hints:** Sudden viscosity drop at measured temperature, foaming in sight glass, or abrupt pad temperature changes.
- **Action:** If emulsification suspected, isolate lube system, sample oil for water content, and consider forced oil replacement.

Jacking Oil During Startup:
- **Action:** If `jackingPressureBar` is below required minimum during startup, `ThrustBearingMaster` emits `BLOCK_START`. The Sovereign Executive must prevent the start sequence and notify operations.

Integration Notes:
- `ThrustBearingMaster.addMeasurement()` returns a `ThrustAction`. The Master Executive should map these to `DERATE`, `HARD_TRIP`, or `BLOCK_START` automated actions and apply `getHealthImpactForAction()` to `HealthScore.overall`.
- Tune thresholds to unit-specific geometry via constructor options or asset configuration.
