# Shaft Seal Guardian — Expert Action Guide

Purpose: define operator and executive responses driven by the `ShaftSealGuardian` probabilistic engine.

**Probabilistic Warning**:
- **Trigger:** `P_fail` in code between 0.50 and 0.84.
- **Action:** Automatic advisory issued to Sovereign Executive recommending a controlled derate. Suggested derate is returned as `recommendedDerateMw` by the guardian.
- **Operator Protocol:** Schedule immediate inspection; limit continuous operation at reduced MW until seal replacement window is prepared.

**Hard Trip (Immediate Sovereign Shutdown)**:
- **Trigger:** `P_fail >= 0.85`.
- **Action:** Immediate hard trip of the affected unit. The guardian emits a `HARD_TRIP` action and should be wired to the Sovereign Executive shutdown path.
- **Operator Protocol:** Follow emergency shutdown checklist. Preserve evidence (telemetry, photos), and do not attempt restart until mechanical clearance.

**Leakage Trend & Predictive Window**:
- The guardian computes a linear predictive window (hours remaining) based on measured `leakagePitLevel` and its recent rate. Use this to plan replacement if hours remaining is small (<72h) with high probability.

**Integration Notes**:
- `ShaftSealGuardian.addMeasurement()` returns `SealAction` objects. The Sovereign Executive should map `PROBABILISTIC_WARNING` to a derate workflow and `HARD_TRIP` to shutdown.
- The guardian exposes `getHealthImpact()` for MasterHealthScore adjustments (returns `overallDelta`). Apply this delta to the `HealthScore.overall` aggregated by the MasterHealth engine.

**Replacement & Maintenance**:
- For full replacement follow Drawing 42 (Seal assembly & flange work). See: Drawing 42 (Seal Replacement Procedures).

Drawing 42: Reference the official mechanical drawing and seal replacement procedure (Drawing 42) during planning and execution.
