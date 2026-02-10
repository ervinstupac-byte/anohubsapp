# THE SOVEREIGN HPP MANIFESTO

**Protocol**: NC-14400 | **Status**: PRODUCTION PURE | **Certification**: Feb 2026

## 📜 Preamble
The Sovereign Hydroelectric Power Plant (HPP) Platform is not merely software; it is a codified engineering standard. Every line of code in this repository serves the physical reality of hydraulic energy conversion. We reject "magic numbers" and "black boxes." Our logic is transparent, our physics are absolute, and our integrity is non-negotiable.

---

## 🏗️ Engineering Governance

### 1. Vibration & Structural Integrity
We strictly adhere to **ISO 10816-5** standards for hydraulic machine vibration monitoring.
*   **Zone A (Green)**: $< 1.8 \, \text{mm/s}$ (Newly Commissioned)
*   **Zone B (Yellow)**: $1.8 - 4.5 \, \text{mm/s}$ (Acceptable Operation)
*   **Zone C (Orange)**: $4.5 - 7.1 \, \text{mm/s}$ (Restricted Operation)
*   **Zone D (Red)**: $> 7.1 \, \text{mm/s}$ (Immediate Trip/Danger)

### 2. Cavitation & Hydraulic Physics
The **Thoma Criterion ($\sigma$)** is the supreme law of suction head.
*   **Safe Zone**: $\sigma > 1.3$
*   **Cavitation Warning**: $\sigma \leq 1.3$ (AncestralOracle Trigger)
*   **Critical Cavitation**: $\sigma < 1.1$ (Immediate efficiency penalty)

---

## ⚙️ Mechanical Constants

The physical assembly of the Sovereign Turbine is governed by the following immutable constants. These values are hard-coded into the `SovereignPhysicsEngine` and `AlignmentWizard` to ensure physical compliance.

| Parameter | Standard Value | Tolerance / Limit |
| :--- | :--- | :--- |
| **M36 Bolt Torque** | **1850 Nm** | $\pm 25 \, \text{Nm}$ |
| **Shaft Alignment** | **0.05 mm/m** | Max Deviation |
| **Bearing Temp** | **70°C** | Alarm Threshold |
| **Runner Clearance** | **0.3 - 0.5 mm** | Wearing Ring Gap |

---

## 🛡️ Operational Safety Protocols

Safety is not a feature; it is a constraint. The **SafetyInterlockEngine** enforces these rules at the kernel level.

*   **RPM Lockout**: Manual alignment tools are PHYSICALLY DISABLED if `RPM > 5`.
*   **Dead-Stop Logic**: Maintenance workflows cannot be initiated unless `State == STANDSTILL` and `Flow == 0`.
*   **Kill Switch**: The `Sovereign_Executive_Engine` has a hard-wired override to force a `0%` Guide Vane opening in $< 200ms$.

---

## 💶 Sovereign Economics

Financial forensics are calculated using fixed benchmarks to ensure historical consistency in ROI reporting.

*   **Energy Value**: **65 €/MWh** (Base Load Reference)
*   **Efficiency Target**: **92%** (The "Sovereign Standard")
*   **Loss Calculation**: Revenue leaks are derived from `(Target_Eff - Actual_Eff) * Flow * Head * 9.81`.

---

## 🏛️ System Integrity Signature

> **CERTIFICATE OF PURITY**
>
> We, the Sovereign Engineering Corps, certify that as of **February 2026**, this codebase is **PRODUCTION PURE**.
>
> *   **Zero Orphans**: All legacy files have been purged or securely archived in `_SOVEREIGN_ARCHIVE/`.
> *   **Integrated Logic**: The `ForensicReportService`, `AlignmentWizard`, and `PhysicsEngine` are fully grafted and operational.
> *   **Hardened Type System**: `HydraulicStream` and all core interfaces are strictly typed.
> *   **Legacy Free**: `src/features/discovery-vault/` has been obliterated.
>
> *Signed,*
> **The Architect (NC-14400)**
