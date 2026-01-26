**Phase 45.0 — Universal Turbine Classifier & Kaplan Blade Physics**

- **Purpose:** Provide canonical turbine type registry and show how blade count affects cavitation sensitivity for Kaplan-style runners.

- **Blade Synchronization Errors (Kaplan specific):**
  - Symptom: Asymmetric forces, sudden 1x/2x tonal increases, or differential blade pitch commands.
  - Quick checks:
    - Verify blade pitch command vs actual for each blade (if per-blade sensors available).
    - Check oil supply and servo command pressure for hub actuators.
    - Run `BladeSync` diagnostic: command each blade to a neutral pitch and measure response; any outlier indicates a stuck/tripped actuator.
  - Remediation:
    - Perform local manual release of blade lock, inspect pitch bearings, verify hydraulic manifold pressure, then re-calibrate synchronization.

- **Oil-in-Water Leakage (Kaplan hub):**
  - Symptoms: Elevated oil-in-water PPM in turbine sump, emulsified oil on weirs, decreased bearing lubrication quality.
  - Quick checks:
    - Sample oil-in-water PPM and temperature; check seals at hub bearing housings.
    - Inspect hub breather and drain piping for signs of water ingress.
  - Remediation:
    - Isolate hub seal and perform pressure test, replace O-rings/seals as needed, perform controlled sump dewatering and filter replacement.

- **Cavitation Sensitivity & Blade Count:**
  - The system computes an `adjustedSigma` for Kaplan units based on blade count using `KaplanBladePhysics.adjustedSigmaLimit(baseSigma, z)`.
  - Higher blade counts reduce local pressure per area and increase cavitation resistance; lower blade counts increase sensitivity.
