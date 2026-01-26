# Stator Insulation Guardian — Expert Action Guide

Purpose: monitor Partial Discharge (PD) activity and protect stator winding insulation.

PD Classification:
- Differentiate PD events by `q_pC`, `PPS`, and `Voltage`:
  - **Surface Tracking:** many small pulses, high PPS, lower q_pC — often surface contamination.
  - **Slot Discharge:** medium q_pC and moderate PPS — indicates slot corona or conductor stress.
  - **Internal Void Discharge:** large q_pC at moderate PPS and elevated voltage — critical internal defects.

PD Trending & Protection:
- Compute `Q_max` in 30-day windows. If `Q_max` rises >20% (critical), flag `CRITICAL_INSULATION_DEGRADATION` and schedule immediate inspection and outage planning.

RUL Modeling:
- Use combined thermal and electrical stress model. Higher winding temperature and increased PD energy accelerate ageing and reduce RUL. Use recent 7-day averages for short-term RUL guidance.

Expert Protocols:
- **Ozone Smell Detection:** If operators detect ozone smell near generator hall, perform immediate surface cleaning, increase VFD/ventilation, and schedule infrared + borescope inspection.
- **Contamination Cleaning:** Apply approved solvents, avoid high-pressure washing. After cleaning, re-check PD levels at reduced voltage and monitor for reappearance.

Integration Notes:
- `StatorInsulationGuardian.addMeasurement()` returns a `StatorAction`. The Master Executive must reduce `HealthScore.overall` for high PD activity and recommend a `BOROSCOPE_INSPECTION_RECOMMENDED` automated action.
