# Generator Air Gap Sentinel — Expert Action Guide

Purpose: protect the generator from eccentricity-driven magnetic instability and thermal-induced false alarms.

Eccentricity Monitoring & UMP Safeguard:
- **Inputs:** quadrant air-gap sensor readings (mm), rotor speed (rpm), excitation current (A), stator temperature (°C).
- **Eccentricity (%):** (maxGap - minGap) / avgGap * 100. If > 15% → Warning, if > 25% → Critical.
- **UMP Estimation:** heuristic proportional to `I_exc * eccentricity * rotorSpeed`. If UMP > warning/critical thresholds, flag warnings or trips.

Thermal Expansion Compensation:
- **Model:** gap reduction = `thermalCoef_m_perC * (statorTemp - refTemp)` applied to all sensor readings before analysis.
- **Startup suppression:** when stator warms rapidly (>20°C) and rotor speed is low (<200 rpm), suppress alarms to avoid false positives.

Responses:
- **MAGNETIC_INSTABILITY_WARNING:** Reduce excitation, monitor closely, inspect rotor alignment and bearings. Schedule a bore-scope or vibration survey.
- **EXCITATION_TRIP:** Immediate excitation removal to remove magnetic forces; followed by mechanical trip if rotor cannot be stabilized.
- **CRITICAL_GAP_REDUCTION:** Immediate Excitation Trip + Mechanical Trip. Preserve telemetry for forensic analysis.

Expert Procedures:
- **Stator Core Buckling:** On signs of asymmetric core temperature or unusual vibration, lock the unit out and perform infrared inspection and core wedge checks.
- **Loose Rotor Pole Detection:** If eccentricity persists after mechanical centering, inspect pole fastening and rotor assembly per Drawing 128.

Integration Notes:
- `GeneratorAirGapSentinel.addMeasurement()` returns `AirGapAction`. The Master Executive must map to excitation/mechanical trip paths and apply health impact via `getHealthImpactForAction()`.
