# FLEET STATUS REPORT
**Generated**: 2026-01-24 20:00:00  
**System**: Sovereign Intelligence v28.0  
**Fleet Size**: 6 active units

---

## Executive Summary

- **Total Capacity**: 240 MW
- **Fleet Uptime**: 98.7%
- **Average H_eff**: 0.91 (91%)
- **Model Coverage**: 5/6 units (83.3%)
- **Model Gap**: 1 Banki-Michell turbine (UNIT-6) **NO SPECIALIZED MODEL**

---

## Active Fleet Inventory

### UNIT-1: "HE Zakučac - Agregat 1"
- **Type**: Francis Turbine
- **Model**: Rade Končar 1985
- **Capacity**: 50 MW
- **Current Load**: 42 MW (84%)
- **Health Status**: 🟢 OPERATIONAL
- **H_eff**: 0.93 (93%)
- **Operational Hours**: 187,420 h
- **Last Major Overhaul**: 2019

**Specialized Model**: ✅ `FrancisOptimizer` active
- Vortex monitoring enabled
- Air injection system installed
- Draft tube pressure @ 100Hz

**Pain Points** (from veto history + RCA):
1. **Draft tube vortex** at 45-65% load (15 veto incidents)
   - Rheingans frequency: 1.8-2.2 Hz
   - Operator preference: Manual air injection at 55% load
   - AI learned threshold: +12% penalty on auto-injection <60% load
2. **Bearing #2 temperature** spike during summer (8 RCA events)
   - Root cause: Cooling water temp >22°C → bearing oil >48°C
   - Self-healing: Auto cooling boost activated 6 times in 2024

---

### UNIT-2: "HE Zakučac - Agregat 2"
- **Type**: Francis Turbine
- **Model**: Rade Končar 1986 (identical to UNIT-1)
- **Capacity**: 50 MW
- **Current Load**: 45 MW (90%)
- **Health Status**: 🟢 OPERATIONAL
- **H_eff**: 0.92 (92%)
- **Operational Hours**: 185,100 h
- **Last Major Overhaul**: 2020

**Specialized Model**: ✅ `FrancisOptimizer` active

**Pain Points**:
1. **Spiral case pulsation** at high load >48 MW (4 veto incidents)
   - RSI (rotor-stator interaction) amplitude >0.15 bar
   - Operator preference: Manual load reduction to 47 MW
   - AI learned: Conservative 48 MW hard limit (swarm learning applied from UNIT-1)

---

### UNIT-3: "HE Peruća - Kaplan 1"
- **Type**: Kaplan Turbine
- **Model**: Voith Hydro 1968
- **Capacity**: 40 MW
- **Current Load**: 35 MW (87.5%)
- **Health Status**: 🟡 MONITORING (conjugate curve deviation)
- **H_eff**: 0.89 (89%) - **BELOW OPTIMAL**
- **Operational Hours**: 412,890 h
- **Last Major Overhaul**: 2015

**Specialized Model**: ✅ `KaplanOptimizer` active
- Conjugate curve monitoring enabled
- Blade angle servo: WEAR DETECTED

**Pain Points**:
1. **Conjugate curve deviation** >1.2% (23 optimization attempts)
   - Gate opening: 65% | Blade angle: 14.2° (optimal: 16.3°)
   - **Efficiency gap**: 1.8% (€280k/year loss)
   - Root cause: Servomotor backlash (2.1° deadband)
   - AI recommendation: **SERVO REPLACEMENT CRITICAL** (scheduled Q2 2026)
2. **Hub cavitation** at low head <18m (6 RCA events)
   - Hub pressure drops to -0.35 bar
   - Self-healing: Auto gate reduction to maintain hub pressure >-0.2 bar

---

### UNIT-4: "HE Peruća - Kaplan 2"
- **Type**: Kaplan Turbine
- **Model**: Voith Hydro 1969 (sister unit to UNIT-3)
- **Capacity**: 40 MW
- **Current Load**: 38 MW (95%)
- **Health Status**: 🟢 OPERATIONAL
- **H_eff**: 0.94 (94%)
- **Operational Hours**: 395,200 h
- **Last Major Overhaul**: 2021 (servo replaced)

**Specialized Model**: ✅ `KaplanOptimizer` active

**Pain Points**:
1. **Minimal issues** - best performer in fleet
   - Only 2 veto incidents in 2024 (both operator training errors)
   - Conjugate curve adherence: <0.3% deviation
   - **Model unit** for swarm learning

---

### UNIT-5: "HE Senj - Pelton 1"
- **Type**: Pelton Turbine (6 nozzles)
- **Model**: Litostroj 1978
- **Capacity**: 35 MW
- **Current Load**: 30 MW (85.7%)
- **Health Status**: 🟢 OPERATIONAL
- **H_eff**: 0.90 (90%)
- **Operational Hours**: 358,700 h
- **Last Major Overhaul**: 2018

**Specialized Model**: ✅ `PeltonOptimizer` active
- High-frequency monitoring @ 10ms
- Water hammer detection enabled

**Pain Points**:
1. **Nozzle #3 needle sticking** (11 water hammer events)
   - Pressure surges up to 32 bar during rapid closing
   - Root cause: Servo valve contamination + needle seal wear
   - AI mitigation: Auto-reduced closing rate to 4 mm/s on nozzle #3
   - **Maintenance scheduled**: Q1 2026 needle/seal replacement
2. **Bucket erosion** on runners 1-3 (sediment-related)
   - Erosion index: 67/100 (approaching overhaul threshold 75)
   - Estimated remaining life: 18-24 months

---

### UNIT-6: "HE Lešće - Banki-Michell 1" 🚨
- **Type**: **Banki-Michell (Crossflow) Turbine**
- **Model**: Local manufacturer 1992
- **Capacity**: 25 MW
- **Current Load**: 18 MW (72%)
- **Health Status**: 🔴 **MODEL GAP DETECTED**
- **H_eff**: 0.85 (85%) - **NO OPTIMIZATION AVAILABLE**
- **Operational Hours**: 201,400 h
- **Last Major Overhaul**: 2017

**Specialized Model**: ❌ **NOT AVAILABLE**
- **Banki-Michell turbines NOT covered** by NC-27.0
- Operating on generic health monitoring only
- **NO turbine-specific optimization logic**

**Pain Points**:
1. **Efficiency significantly below rated** (target: 88-90%)
   - Suspected: Nozzle wear, runner blade erosion
   - **NO automated diagnosis** - requires manual inspection
2. **Vibration trending upward** (12 alerts in 2024)
   - VIB_BEARING_1: 2.6-2.9 mm/s (yellow zone)
   - Root cause: **UNKNOWN** (no Banki-Michell RCA logic)
3. **High veto rate**: 18 interventions in 2024
   - Operators have low confidence in AI recommendations
   - Reason: Generic thresholds don't match Banki-Michell characteristics

**RECOMMENDATION**: 
- ⚠️ **CRITICAL**: Develop `BankiMichellOptimizer` module
- Or: Consider replacement with Francis turbine during next overhaul

---

## Fleet-Wide Analysis

### Model Coverage
| Turbine Type | Units | Model Available | Coverage |
|-------------|-------|-----------------|----------|
| Francis | 2 | ✅ Yes | 100% |
| Kaplan | 2 | ✅ Yes | 100% |
| Pelton | 1 | ✅ Yes | 100% |
| **Banki-Michell** | **1** | **❌ NO** | **0%** |
| **TOTAL** | **6** | **5** | **83.3%** |

### Pain Point Summary (Sorted by Severity)

**CRITICAL** (Requires immediate action):
1. UNIT-3 Kaplan servo backlash → €280k/year efficiency loss
2. UNIT-6 Banki-Michell → No optimization model

**HIGH** (Scheduled maintenance):
1. UNIT-5 Pelton nozzle #3 → Water hammer risk
2. UNIT-5 Pelton bucket erosion → Approaching overhaul

**MEDIUM** (Monitoring):
1. UNIT-1 Francis draft tube vortex → Managed via air injection
2. UNIT-2 Francis spiral pulsation → Load limit at 48 MW
3. UNIT-3 Kaplan hub cavitation → Auto-managed

**LOW**:
1. UNIT-1 Francis bearing temp → Auto-managed via cooling boost
2. UNIT-4 Kaplan → Minimal issues

---

## Swarm Learning Effectiveness

**Cross-Asset Knowledge Transfer**:
- UNIT-1 Francis draft tube vetoes → Applied to UNIT-2 (same model)
- UNIT-3 Kaplan servo issues → Preemptive monitoring on UNIT-4
- UNIT-5 Pelton water hammer → Would apply to additional Pelton units (none in fleet)

**Knowledge Gap**:
- UNIT-6 Banki-Michell operates **in isolation** - no swarm learning possible

---

## Recommendations

1. **Immediate**: Develop `BankiMichellOptimizer` for UNIT-6
   - Study manufacturer curves
   - Implement crossflow-specific efficiency monitoring
   - Add nozzle wear detection

2. **Q1 2026**: UNIT-5 Pelton maintenance (nozzle #3 + seals)

3. **Q2 2026**: UNIT-3 Kaplan servo replacement (critical efficiency recovery)

4. **Long-term**: UNIT-5 runner replacement (erosion index monitoring)

---

**End of Fleet Status Report**
