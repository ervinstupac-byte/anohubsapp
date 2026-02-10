# Sovereign Engineering Glossary
**Reference Protocol: NC-11300**

This document defines the core physics and engineering terminology used throughout the codebase.

| Term | Definition | Code Reference |
|------|------------|----------------|
| **Hoop Stress** | The circumferential stress in a cylinder caused by internal pressure ($\sigma_h = \frac{P \cdot D}{2t}$). If it exceeds yield strength, pipe bursts. | [PhysicsEngine.ts](../src/core/PhysicsEngine.ts) |
| **Water Hammer** | Pressure surge caused by sudden flow stoppage ($\Delta P = \rho \cdot a \cdot \Delta v$). Joukowski Equation. | [WaterHammer.tsx](../src/components/francis/WaterHammer.tsx) |
| **Resonance** | Oscillation amplitude spike at specific frequencies (e.g., Runaway Speed). | [VibrationBaseline.ts](../src/services/VibrationBaseline.ts) |
| **Erosion** | Mechanical wear from abrasive particles ($E \propto v^3 \cdot C$). | [SandErosionTracker.ts](../src/services/SandErosionTracker.ts) |
| **Cavitation** | Vapor bubble collapse causing pitting. Occurs when local pressure drops below vapor pressure. | [HydraulicLimits.ts](../src/services/HydraulicLimits.ts) |
| **Runaway Speed** | The maximum speed a turbine reaches at full flow with no load. A critical structural limit. | [SafetyInterlockEngine.ts](../src/services/SafetyInterlockEngine.ts) |
| **NPSH** | Net Positive Suction Head ($NPSH = \frac{P_{atm} - P_v}{\rho g} - \Delta h_s$). Margin against cavitation. | [HydraulicLimits.ts](../src/services/HydraulicLimits.ts) |
| **Joukowski Surge** | Theoretical maximum pressure rise during instantaneous valve closure. See Water Hammer. | [WaterHammer.tsx](../src/components/francis/WaterHammer.tsx) |
| **Erosion Rate** | The speed of material loss ($\mu m/year$), driven by sediment hardness and velocity cubed. | [SandErosionTracker.ts](../src/services/SandErosionTracker.ts) |
| **Specific Speed** | Dimensionless index ($n_s = \frac{n \sqrt{P}}{H^{5/4}}$) used to classify turbine geometry (Pelton vs Francis vs Kaplan). | [UnifiedPhysicsCore.ts](../src/features/physics-core/UnifiedPhysicsCore.ts) |

---
*Maintained by the Sovereign Engineering Corps.*
