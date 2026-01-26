# SCADA Telemetry Audit & Sensor Manifest
## NC-26.0 - Physical Interface Documentation

---

## SCADA Connection Overview

**System**: Hydropower Plant SCADA Integration  
**Protocol**: OPC UA / Modbus TCP (depending on PLC infrastructure)  
**Connection Type**: Read + Write (Bidirectional)  
**Polling/Streaming**: WebSocket stream (real-time) with 100ms base frequency

---

## Complete Sensor Manifest

### 1. **Vibration Sensors** (4x accelerometers)

#### VIB_BEARING_1
- **Tag**: `TURBINE.VIB.BEARING_1.RMS`
- **Location**: Upper guide bearing
- **Sampling Frequency**: 100ms (10 Hz)
- **Raw Unit**: mm/s (RMS velocity)
- **Range**: 0 - 10 mm/s
- **Thresholds**:
  - 🟢 **Green Zone**: 0.0 - 1.8 mm/s (Normal operation)
  - 🟡 **Yellow Zone**: 1.8 - 2.5 mm/s (Monitoring required)
  - 🔴 **Red Zone**: > 2.5 mm/s (Critical - intervention required)
  - 🚨 **Emergency**: > 4.0 mm/s (Auto shutdown trigger)

#### VIB_BEARING_2  
- **Tag**: `TURBINE.VIB.BEARING_2.RMS`
- **Location**: Lower guide bearing
- **Sampling Frequency**: 100ms
- **Unit**: mm/s
- **Thresholds**: Same as BEARING_1

#### VIB_THRUST_BEARING
- **Tag**: `TURBINE.VIB.THRUST.RMS`
- **Location**: Thrust bearing (axial loads)
- **Sampling Frequency**: 100ms
- **Unit**: mm/s
- **Thresholds**:
  - 🟢 Green: 0.0 - 2.2 mm/s
  - 🟡 Yellow: 2.2 - 3.0 mm/s
  - 🔴 Red: > 3.0 mm/s

#### VIB_FOUNDATION
- **Tag**: `TURBINE.VIB.FOUNDATION.RMS`
- **Location**: Foundation/structure
- **Sampling Frequency**: 100ms
- **Unit**: mm/s
- **Thresholds**:
  - 🟢 Green: 0.0 - 1.0 mm/s
  - 🟡 Yellow: 1.0 - 1.5 mm/s
  - 🔴 Red: > 1.5 mm/s

---

### 2. **Temperature Sensors** (6x RTD PT100)

#### TEMP_BEARING_1
- **Tag**: `TURBINE.TEMP.BEARING_1`
- **Location**: Upper guide bearing oil
- **Sampling Frequency**: 1s (1 Hz)
- **Raw Unit**: °C (Celsius)
- **Range**: 0 - 100°C
- **Thresholds**:
  - 🟢 **Green Zone**: 20 - 40°C (Optimal)
  - 🟡 **Yellow Zone**: 40 - 50°C (Warning)
  - 🔴 **Red Zone**: > 50°C (Critical)
  - 🚨 **Emergency**: > 65°C (Auto shutdown)

#### TEMP_BEARING_2
- **Tag**: `TURBINE.TEMP.BEARING_2`  
- **Location**: Lower guide bearing oil
- **Sampling Frequency**: 1s
- **Unit**: °C
- **Thresholds**: Same as BEARING_1

#### TEMP_THRUST_BEARING
- **Tag**: `TURBINE.TEMP.THRUST`
- **Location**: Thrust bearing oil reservoir
- **Sampling Frequency**: 1s
- **Unit**: °C
- **Thresholds**: Same as BEARING_1

#### TEMP_GENERATOR_WINDING
- **Tag**: `GENERATOR.TEMP.WINDING`
- **Location**: Generator stator winding (avg of 6 points)
- **Sampling Frequency**: 1s
- **Unit**: °C
- **Thresholds**:
  - 🟢 Green: 20 - 80°C
  - 🟡 Yellow: 80 - 100°C
  - 🔴 Red: > 100°C
  - 🚨 Emergency: > 120°C

#### TEMP_COOLING_WATER_IN
- **Tag**: `COOLING.TEMP.INLET`
- **Sampling Frequency**: 5s
- **Unit**: °C

#### TEMP_COOLING_WATER_OUT
- **Tag**: `COOLING.TEMP.OUTLET`
- **Sampling Frequency**: 5s
- **Unit**: °C

---

### 3. **Pressure Sensors** (8x analog transmitters)

#### PRESS_INLET
- **Tag**: `TURBINE.PRESS.INLET`
- **Location**: Turbine inlet (spiral case)
- **Sampling Frequency**: 100ms
- **Raw Unit**: bar (absolute)
- **Range**: 0 - 50 bar
- **Thresholds**:
  - 🟢 Green: 10 - 45 bar (Operating range)
  - 🟡 Yellow: 5 - 10 bar or 45 - 48 bar
  - 🔴 Red: < 5 bar or > 48 bar

#### PRESS_DRAFT_TUBE
- **Tag**: `TURBINE.PRESS.DRAFT_TUBE`
- **Location**: Draft tube (outlet)
- **Sampling Frequency**: 100ms
- **Unit**: bar (absolute)
- **Range**: -0.5 - 2 bar
- **Thresholds** (Cavitation detection):
  - 🟢 Green: > -0.2 bar
  - 🟡 Yellow: -0.2 to -0.4 bar
  - 🔴 Red: < -0.4 bar (cavitation risk)

#### PRESS_OIL_MAIN
- **Tag**: `LUBRICATION.PRESS.MAIN`
- **Location**: Main lubricating oil pump discharge
- **Sampling Frequency**: 500ms
- **Unit**: bar
- **Thresholds**:
  - 🟢 Green: 2.0 - 4.0 bar
  - 🔴 Red: < 1.5 bar (low oil pressure alarm)

#### PRESS_GOVERNOR
- **Tag**: `GOVERNOR.PRESS.HPU`
- **Location**: Governor HPU (hydraulic pressure unit)
- **Sampling Frequency**: 100ms
- **Unit**: bar
- **Thresholds**:
  - 🟢 Green: 60 - 80 bar
  - 🔴 Red: < 50 bar or > 85 bar

---

### 4. **Power & Electrical** (Generator)

#### POWER_ACTIVE
- **Tag**: `GENERATOR.POWER.ACTIVE`
- **Sampling Frequency**: 500ms
- **Raw Unit**: MW (Megawatts)
- **Range**: 0 - 50 MW
- **Thresholds**:
  - 🟢 Green: 0 - 48 MW
  - 🔴 Red: > 48 MW (overload)

#### POWER_REACTIVE
- **Tag**: `GENERATOR.POWER.REACTIVE`
- **Sampling Frequency**: 500ms
- **Unit**: MVAr

#### VOLTAGE
- **Tag**: `GENERATOR.VOLTAGE`
- **Sampling Frequency**: 100ms
- **Unit**: kV (kilovolts)
- **Range**: 0 - 20 kV

#### CURRENT_PHASE_A/B/C
- **Tag**: `GENERATOR.CURRENT.PHASE_A/B/C`
- **Sampling Frequency**: 100ms
- **Unit**: A (Amperes)

#### FREQUENCY
- **Tag**: `GENERATOR.FREQUENCY`
- **Sampling Frequency**: 100ms
- **Unit**: Hz
- **Thresholds**:
  - 🟢 Green: 49.9 - 50.1 Hz
  - 🟡 Yellow: 49.5 - 49.9 Hz or 50.1 - 50.5 Hz
  - 🔴 Red: < 49.5 Hz or > 50.5 Hz

---

### 5. **Flow & Hydraulic**

#### FLOW_RATE
- **Tag**: `HYDRAULIC.FLOW.RATE`
- **Sampling Frequency**: 1s
- **Unit**: m³/s (cubic meters per second)

#### GATE_OPENING
- **Tag**: `TURBINE.GATE.OPENING`
- **Sampling Frequency**: 100ms
- **Unit**: % (percentage, 0-100%)

#### RUNNER_SPEED
- **Tag**: `TURBINE.RUNNER.SPEED`
- **Sampling Frequency**: 100ms
- **Unit**: RPM (revolutions per minute)

---

### 6. **Cavitation Index** (Derived)

#### CAVITATION_INDEX
- **Tag**: `TURBINE.CAVITATION.SIGMA` (calculated on SCADA)
- **Sampling Frequency**: 500ms
- **Unit**: σ (sigma, dimensionless)
- **Formula**: σ = (P_atm + P_draft - P_vapor) / (ρ * g * H_net)
- **Thresholds**:
  - 🟢 Green: σ > 0.12
  - 🟡 Yellow: σ = 0.08 - 0.12
  - 🔴 Red: σ < 0.08

---

## Turbine-Specific Specialized Sensors

### **KAPLAN TURBINE** Specialized Tags

#### BLADE_ANGLE_PHI
- **Tag**: `KAPLAN.BLADE.ANGLE`
- **Location**: Runner blade servo position
- **Sampling Frequency**: 100ms
- **Raw Unit**: ° (degrees)
- **Range**: -5° to +25° (from horizontal)
- **Thresholds**:
  - 🟢 Green: Following conjugate curve (±0.5° deviation)
  - 🟡 Yellow: 0.5° - 1.0° deviation from optimal
  - 🔴 Red: > 1.0% efficiency gap (triggers CAM optimization)

#### HUB_PRESSURE
- **Tag**: `KAPLAN.HUB.PRESSURE`
- **Location**: Runner hub cavity (draft tube side)
- **Sampling Frequency**: 100ms
- **Unit**: bar (absolute)
- **Range**: -0.5 to 2 bar
- **Purpose**: Hub cavitation detection

#### SERVOMOTOR_POSITION
- **Tag**: `KAPLAN.SERVO.POSITION`
- **Location**: Blade pitch servo actuator
- **Sampling Frequency**: 50ms
- **Unit**: mm (stroke length)

#### CONJUGATE_CURVE_ERROR
- **Tag**: `KAPLAN.CONJUGATE.ERROR` (calculated)
- **Sampling Frequency**: 500ms
- **Unit**: % (efficiency deviation)
- **Formula**: Error = |η_actual - η_hill_chart(α, φ)|
- **Thresholds**:
  - 🟢 Green: < 0.5% efficiency loss
  - 🟡 Yellow: 0.5% - 1.0%
  - 🔴 Red: > 1.0% (auto-optimization triggered)

---

### **FRANCIS TURBINE** Specialized Tags

#### SPIRAL_CASE_PULSATION
- **Tag**: `FRANCIS.SPIRAL.PULSATION`
- **Location**: Spiral case pressure tap (8x around circumference)
- **Sampling Frequency**: 50ms (20 Hz)
- **Unit**: bar (fluctuation amplitude)
- **Purpose**: Rotor-stator interaction monitoring
- **Thresholds**:
  - 🟢 Green: < 0.1 bar amplitude
  - 🟡 Yellow: 0.1 - 0.2 bar
  - 🔴 Red: > 0.2 bar (RSI resonance)

#### DRAFT_TUBE_VORTEX_FREQ
- **Tag**: `FRANCIS.DRAFT.VORTEX.FREQ` (FFT analysis)
- **Sampling Frequency**: 10ms (100 Hz for FFT)
- **Unit**: Hz (vortex rope frequency)
- **Formula**: f_vortex = (0.2 - 0.4) × (RPM / 60)
- **Thresholds**:
  - 🟢 Green: No resonance peak
  - 🟡 Yellow: Peak at Rheingans frequency (f = 0.2-0.4 × f_rotation)
  - 🔴 Red: Amplitude > 0.3 bar at resonance (auto air injection)

#### DRAFT_TUBE_CONE_PRESS
- **Tag**: `FRANCIS.DRAFT.CONE.PRESSURE`
- **Location**: Draft tube cone (elbow entry)
- **Sampling Frequency**: 10ms
- **Unit**: bar
- **Purpose**: Vortex rope intensity measurement

#### AIR_INJECTION_RATE
- **Tag**: `FRANCIS.AIR.INJECTION.RATE`
- **Sampling Frequency**: 1s
- **Unit**: m³/h (air flow)
- **Control**: Write-enabled for vortex suppression
- **Range**: 0 - 500 m³/h

---

### **PELTON TURBINE** Specialized Tags

#### NEEDLE_POSITION (per nozzle, 4-6 nozzles)
- **Tag**: `PELTON.NOZZLE_1.NEEDLE.POS` (... NOZZLE_2, etc.)
- **Location**: Nozzle needle servo position
- **Sampling Frequency**: **10ms** (100 Hz - HIGH FREQUENCY)
- **Unit**: mm (stroke from seat)
- **Range**: 0 - 150 mm
- **Thresholds**:
  - 🟢 Green: Smooth positioning (< 5 mm/s closing rate)
  - 🟡 Yellow: Rapid movement 5-10 mm/s
  - 🔴 Red: > 10 mm/s (water hammer risk)

#### NOZZLE_PRESSURE (per nozzle)
- **Tag**: `PELTON.NOZZLE_1.PRESSURE`
- **Sampling Frequency**: **10ms** (HIGH FREQUENCY)
- **Unit**: bar
- **Range**: 0 - 200 bar
- **Purpose**: Pressure surge detection during needle closing
- **Thresholds**:
  - 🟢 Green: Steady state ±5 bar
  - 🔴 Red: > 20 bar surge (water hammer detected)

#### DEFLECTOR_POSITION (per nozzle)
- **Tag**: `PELTON.NOZZLE_1.DEFLECTOR.POS`
- **Location**: Jet deflector plate position
- **Sampling Frequency**: 100ms
- **Unit**: % (0 = retracted, 100 = full deflection)
- **Purpose**: Emergency load rejection

#### BUCKET_EROSION_INDEX (calculated)
- **Tag**: `PELTON.BUCKET.EROSION` (derived from water quality × hours)
- **Sampling Frequency**: 1 hour
- **Unit**: Index (0-100)
- **Formula**: Erosion = f(sediment_ppm, operating_hours, head)

#### JET_QUALITY_FACTOR
- **Tag**: `PELTON.JET.QUALITY` (optical sensor)
- **Sampling Frequency**: 1s
- **Unit**: % (jet coherence)
- **Range**: 0-100%
- **Thresholds**:
  - 🟢 Green: > 95% (perfect jet)
  - 🟡 Yellow: 90-95%
  - 🔴 Red: < 90% (nozzle wear/cavitation)

---

## SCADA Write Access (Control Capabilities)

### ✅ **Write-Enabled Tags** (SovereignHealer CAN control):

1. **GOVERNOR.SETPOINT.LOAD** - Load setpoint adjustment
   - **Access**: Read/Write
   - **Range**: 0 - 100% (of rated power)
   - **Action**: `SovereignHealer` can reduce load for thermal stabilization

2. **GOVERNOR.SETPOINT.SPEED** - Speed governor setpoint
   - **Access**: Read/Write  
   - **Range**: 450 - 650 RPM
   - **Action**: Fine-tune for grid frequency support

3. **COOLING.PUMP.SPEED** - Cooling water pump VFD
   - **Access**: Read/Write
   - **Range**: 0 - 100% speed
   - **Action**: Boost cooling during thermal events

4. **LUBRICATION.PUMP.OVERRIDE** - Emergency lube pump activation
   - **Access**: Write (trigger)
   - **Action**: Activate auxiliary oil pump

### 🔒 **Read-Only Tags** (Safety interlocks):

- All vibration sensors (read-only)
- All temperature sensors (read-only)
- Emergency stop circuits (hardware interlocked)
- Protection relay status (read-only)

### ⚙️ **Control Authority Level**:

**Current Configuration**: `ADVISORY_WITH_EXECUTE_PERMISSION`
- SovereignHealer can write to governor/cooling setpoints
- All writes logged to `sovereignty_chain` (cryptographic audit)
- Hardware safety limits remain immutable (PLC enforced)
- Emergency stop authority: **Human only** (physical button)

---

## Data Flow Architecture

```
SCADA/PLC (OPC UA Server)
         ↓
  [LiveStreamConnector] 
         ↓ (WebSocket stream, 100ms base)
  [LegacyServiceBridge]
         ↓ (Sensor enrichment)
  [SovereignKernel]
         ↓ (Reactive pipeline)
[Correlate → Diagnose → Heal]
         ↓
  [SovereignHealer]
         ↓ (Write back to SCADA if needed)
SCADA/PLC (OPC UA Client writes)
```

---

## Safety Protocol

**Three-Layer Safety**:
1. **Hardware Layer**: PLC hard-coded limits (immutable)
2. **SCADA Layer**: Operator override capability (always available)
3. **Sovereign Layer**: AI autonomous control (with audit trail)

**Priority**: Hardware > Human > AI

---

**End of SCADA Manifest**
