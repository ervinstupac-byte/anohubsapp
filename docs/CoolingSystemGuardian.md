**Cooling System Guardian — Operator Guide**

- **Purpose:** Monitor heat exchanger thermal efficiency and pump health. Detect fouling, cavitation, and suction blockages. Provide recommendations for scheduled maintenance and automated lead/lag rotation.

- **Thermal Efficiency Tracking:**
  - The guardian computes LMTD from oil inlet/outlet and water inlet/outlet temperatures.
  - The effective overall heat-transfer coefficient `U` is estimated from measured water-side heat duty: Q = m_dot * cp * ΔT = U * A * LMTD.
  - **Fouling Alert:** If `U` falls by 20% or more vs the clean baseline, a `Cooling Efficiency Warning` (fouling) is raised. Recommended immediate actions: inspect strainers, perform backwashing, and plan for chemical cleaning if backwashing ineffective.

- **Pump Performance Audit:**
  - Cavitation heuristic: pump vibration > 8 (mm/s) combined with pressure < 0.8 bar indicates probable cavitation.
  - Suction blockage heuristic: pump motor current > 80 A while water flow < 5 m3/h suggests suction blockage or clogged strainer.
  - If pump issues detected, check suction strainers and NPSH conditions; reduce pump speed/load until cleared.

- **Automated Pump Rotation (Lead/Lag):**
  - Weekly rotation by default (configurable). The guardian tracks `lastRotation` and sets `rotationDue` when interval elapsed.
  - To mark rotation executed call the `markRotation()` method (or perform via SCADA action).

- **Backwashing & Strainer Cleaning Protocols (Quick):**
  - **Backwashing:** Isolate exchanger bypass, initiate reverse flow/backwash at design pressure for 10–20 minutes or until clarity achieved. Monitor turbidity and ΔP recovery.
  - **Strainer Cleaning:** Isolate pump inlet, depressurize, remove strainer cover, inspect and remove debris. Reassemble and re-pressurize. Log strainer change in maintenance ledger.

- **Executive Actions:**
  - On fouling detection, guardian sets `p_fail` and the Outage Optimizer will consider bundling cooling work with other medium-priority items.
  - If fouling + backup not started, guardian triggers immediate `LOAD_REDUCTION` automated action to protect bearings and heat-sensitive systems.
