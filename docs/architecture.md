# The Sovereign Architecture Map

## 1. Overview
The Sovereign HPP Management System is a closed-loop digital twin that governs the physical asset through a cycle of **Ingestion**, **Analysis**, **Decision**, and **Execution**.

## 2. Data Flow Architecture

### A. Ingestion Layer (`scripts/scheduled_ingest.mjs`)
The system heartbeat begins here.
1.  **Trigger**: Runs hourly (via cron or scheduler).
2.  **Source**: Fetches telemetry from `PRIMARY_SENSOR_URL` (or synthetic mock).
3.  **Normalization**: Converts raw sensor JSON into a standardized SI-unit format (`asset_id`, `timestamp`, `output_power`, `francis_data`).
4.  **Persistance**: Upserts data into the `dynamic_sensor_data` table in Supabase.
5.  **Calibration Check**: Immediately runs `scripts/compute_pf_for_asset.mjs` to detect sensor drift.

### B. The Sovereign Executive Engine (`src/services/Sovereign_Executive_Engine.ts`)
The "Brain" that processes the ingested data.
1.  **Wake Cycle**: Instantiated as a singleton in the application context.
2.  **Input**: Subscribes to `useTelemetryStore` updates (fed by Supabase realtime subscriptions).
3.  **Processing Core**:
    *   **TruthJudge**: Validates sensor integrity.
    *   **MolecularIntegrityMonitor**: Checks for material fatigue (accumulated stress).
    *   **VibrationBaseline**: Compares current vibration against the "Golden Point".
    *   **FinancialImpactEngine**: Calculates real-time revenue and loss.
4.  **Decision Output**:
    *   Determines `PermissionTier` (READ_ONLY, ADVISORY, AUTONOMOUS).
    *   Generates `ExecutiveState` (Health Score, Active Protections, Operator Messages).

### C. Forensic Feedback Loop
1.  **Detection**: `VisionAnalyzer` and `SandErosionTracker` monitor specific degradation modes.
2.  **Reaction**: If critical thresholds are breached (e.g., High Erosion), the Executive Engine triggers a **Lockdown** (Protocol 9), disabling unsafe control modes via the `KillSwitch`.

## 3. Data Schema
*   **dynamic_sensor_data**: High-frequency time-series storage.
*   **telemetry_store**: Client-side Zustand store for immediate UI reactivity.
*   **_SOVEREIGN_ARCHIVE**: Cold storage for historical compliance data.

---
*Architected by The Sovereign Engineering Corps.*
