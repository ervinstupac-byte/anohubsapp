# Transformer Oil Guardian — Expert Action Guide

Purpose: detect gas patterns that indicate thermal or electrical faults, manage oil sampling and paper aging.

Duval Triangle (practical heuristic):
- Use relative hydrocarbon composition (CH4, C2H6, C2H4, C2H2) together with H2 to classify likely fault type.
- **Thermal Faults:** C2H4-dominant with elevated oil temperature. Inspect for overheating and cooling failure.
- **Electrical Faults / PD:** Elevated H2 and light hydrocarbons; investigate partial discharge sources and winding stress.
- **Arcing/High-energy faults:** Any detection of acetylene (C2H2) is treated as critical — immediate isolation and detailed gas analysis.

Paper Aging Model:
- Estimate remaining paper life using recent top-oil temperature and moisture. High moisture and high temperature accelerate aging non-linearly.

Gas Trend Monitoring:
- Track Q_max (max hydrocarbon reading) across 30-day windows. If Q_max increases >20%, treat as critical degradation and schedule inspection.

Expert Protocols:
- **Oil Sampling Procedure:** Follow isolation, temperature stabilization, vacuum sampling for DGA, and chain-of-custody to lab. Avoid sampling during transient load steps.
- **Cooling Fan Failure:** Immediately reduce load and increase cooling redundancy; high top-oil temp plus rising hydrocarbon ratio indicates urgent cooling intervention.

Integration Notes:
- `TransformerOilGuardian.addMeasurement()` returns `TransformerAction`. The Master Executive must enforce power restrictions when required, and treat transformer health as a top-level gating element for MasterHealthScore.
