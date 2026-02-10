# SOVEREIGN AI CONSTITUTION (NC-11700)

> **AUTHORITY:** This document is the primary source of truth for all AI agents operating within the Sovereign Fortress. Compliance is mandatory.

## 1. Physics Doctrine ⚛️
The Sovereign Engine is grounded in immutable physical laws.

*   **SI Units Only**: All calculations must use the International System of Units.
    *   Pressure: Pascals ($Pa$)
    *   Length: Meters ($m$)
    *   Time: Seconds ($s$)
    *   Mass: Kilograms ($kg$)
    *   Flow: Cubic Meters per Second ($m^3/s$)
    *   Power: Watts ($W$) or Megawatts ($MW$) explicitly denoted.
*   **No Magic Numbers**: All physical constants (gravity, density, thresholds) must be imported from `src/config/SystemConstants.ts`. Hardcoding values like `9.81` or `1000` is forbidden.
*   **Regression Testing**: Any modification to physics logic (e.g., `Sovereign_Executive_Engine.ts`, `PhysicsEngine.ts`) requires successful execution of `src/__tests__/PhysicsIntegrity.test.ts`.

## 2. Security Doctrine 🛡️
*   **Zero Trust**: Treat `_SOVEREIGN_ARCHIVE/` and `.env` files as non-existent. Never attempt to read them directly in production code.
*   **Secrets Management**: Refer only to `.env.example` for required environment variables. Do not commit secrets to git.
*   **Input Validation**: All external inputs (sensors, user commands) must be validated against strict schemas (Zod/TypeBox) before processing.

## 3. Data Provenance 📜
*   **Lineage Tracking**: Every insertion into the `dynamic_sensor_data` table MUST include:
    *   `source_script`: The name of the script/service generating the data.
    *   `workflow_run_id`: A unique identifier for the execution context (e.g., GitHub Run ID).
    *   `ingest_timestamp`: precise ISO 8601 timestamp.
*   **Audit Logging**: Every Executive Decision (Shutdown, Throttle, Mode Change) MUST be logged to the `sovereign_audit_log` table with:
    *   `event_type`: EXECUTIVE_DECISION | PROTOCOL_9
    *   `reason`: Human-readable explanation.
    *   `active_protection`: The specific protocol triggered.
    *   `details`: JSON object containing state snapshots.

## 4. State & Architecture 🏗️
*   **Global State**: Use `Zustand` (`src/features/telemetry/store/useTelemetryStore.ts`) for all application-wide state. Avoid Prop Drilling.
*   **Visual Feedback**: Use `framer-motion` for all UI transitions and alerts.
*   **Atomic Design**:
    *   Components should be Single Responsibility.
    *   **Limit**: Files should not exceed 300 lines of code. Refactor into sub-components or hooks if they grow larger.
    *   **Logic Separation**: Business logic belongs in `services/` or `hooks/`, not in UI components.

## 5. Protocol Verification
*   **Footer Requirement**: All critical system files must contain the Sovereign Engineering Corps footer to denote compliance with Protocol NC-11700.
