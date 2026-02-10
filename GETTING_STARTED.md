# Getting Started with Sovereign HPP
**Protocol: NC-11300 | Onboarding Guide**

Welcome to the Sovereign Engineering Corps. This guide explains how to integrate a new physical sensor into the Digital Twin.

## How to Add a New Sensor (3 Steps)

### Step 1: Define the Signal
Add the new field to the global telemetry store interface.
**File:** `src/features/telemetry/store/useTelemetryStore.ts`

```typescript
interface HydraulicStream {
    // ... existing fields
    newSensorPressureBar: number; // <-- Add this
}
```

### Step 2: Ingest the Data
Map the raw input from the ingestion script to your new field.
**File:** `scripts/scheduled_ingest.mjs`

```javascript
function normalizeRow(r) {
  return {
    // ... existing mapping
    new_sensor_val: r.raw_pressure_val // <-- Map here
  };
}
```

### Step 3: Visualize
Add a sparkline or gauge to the SCADA Core.
**File:** `src/components/dashboard/ScadaCore.tsx`

```tsx
<div className="sensor-readout">
    <label>New Sensor</label>
    <value>{hydraulic.newSensorPressureBar.toFixed(2)} Bar</value>
</div>
```

---
*Safety First. Physics Always.*
