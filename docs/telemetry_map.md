# Telemetry Field-Level Mapping

Source: `src/contexts/TelemetryContext.tsx` — `TelemetryData` (in-memory)

Purpose: Map in-memory telemetry fields to persisted DB columns in `telemetry_samples` (per-metric time-series) and `telemetry_history_cache` (precomputed per-asset history JSONB). Include transformation logic and recommended persistence frequency.

| In-Memory Field | DB Column(s) | Transformation Logic | Frequency (recommended) |
|---|---|---|---:|
| `assetId` | `telemetry_samples.asset_id` / `telemetry_history_cache.asset_id` | Raw UUID mapping | Per-sample / on cache write |
| `timestamp` | `telemetry_samples.captured_at` / `telemetry_history_cache.history[*].timestamp` | Raw ISO timestamp / epoch -> timestamptz | Per-sample / on cache write |
| `status` | `telemetry_samples.metric_name='status'` (value_text) / `hpp_status.payload.status` | Stored as text; history cache stores full snapshot in JSONB | Per-sample (event) / realtime update |
| `vibration` | `telemetry_samples.metric_name='vibration'` (numeric_value) / `telemetry_history_cache.history[*].vibration` | Raw numeric (mm/s) | High-frequency (1s-60s) into `telemetry_samples`; cache updated every 1–5 min or on significant change |
| `temperature` | `telemetry_samples.metric_name='temperature'` / `telemetry_history_cache.history[*].temperature` | Raw numeric (°C) | High-frequency into `telemetry_samples`; cache every 1–5 min |
| `efficiency` | `telemetry_samples.metric_name='efficiency'` (numeric_value as percent) / `telemetry_history_cache.history[*].efficiency` | Stored as percent (0-100) or as fraction per your ingestion; in `TechnicalProjectState` efficiency is 0-1. Transformation: UI uses percent; physics uses fraction. | Per-sample into `telemetry_samples`; cache every 5 min |
| `output` | `telemetry_samples.metric_name='output'` / `telemetry_history_cache.history[*].output` | Raw numeric (MW) | Per-sample or aggregated (1m) into samples; cache every 5 min |
| `incidentDetails` | `telemetry_samples.metric_name='incidentDetails'` (value_text) / `hpp_status.payload.incidentDetails` | Free-form text stored in `value_text` or in `payload` JSONB | On incident event (immediate) |
| `piezometricPressure` | `telemetry_samples.metric_name='piezometric_pressure'` | Raw numeric (bar) | Per-sample or on event |
| `seepageRate` | `telemetry_samples.metric_name='seepage_rate'` | Raw numeric (l/min) | Per-sample or on event |
| `reservoirLevel` | `telemetry_samples.metric_name='reservoir_level'` | Raw numeric (m) | Per-sample or periodic snapshot |
| `foundationDisplacement` | `telemetry_samples.metric_name='foundation_displacement'` | Raw numeric | Per-sample or periodic snapshot |
| `wicketGatePosition` / `wicketGateSetpoint` | `telemetry_samples.metric_name='wicket_gate_position'` / `'wicket_gate_setpoint'` | Raw numeric (%) | Event-driven / periodic |
| `tailwaterLevel` | `telemetry_samples.metric_name='tailwater_level'` | Raw numeric (m) | Periodic snapshot |
| `cylinderPressure` / `actuatorPosition` / `oilPressureRate` / `hoseTension` | `telemetry_samples` metric rows with respective `metric_name` | Raw numeric values | Per-sample or event-driven |
| `pipeDiameter` | `telemetry_samples.metric_name='pipe_diameter'` / `assets.specs` | Typically static; stored in `assets.specs` JSONB for canonical spec; `telemetry_samples` may record changes | On spec change or measurement |
| `safetyValveActive` / boolean flags | `telemetry_samples.metric_name='<flag_name>'` with numeric 0/1 or `value_text` 'true' | Map boolean to numeric (0/1) or JSONB in history cache | Event-driven (immediate) |
| `vibrationSpectrum` | `telemetry_samples.metric_name='vibration_spectrum'` (value_text JSON) / `telemetry_history_cache.history[*].vibrationSpectrum` | Store array as JSON (value_text or metadata) or compressed blob in `history` | Per-sample (lower resolution) / cache aggregated hourly/daily |
| `fatiguePoints` | `telemetry_samples.metric_name='fatigue_points'` / `telemetry_history_cache.history[*].fatiguePoints` | Numeric accumulator | On update (event) |
| `oilViscosity` / `bearingLoad` / `statorTemperatures` / `actualBladePosition` | `telemetry_samples` metric rows or stored inside `payload`/`history` JSONB | Raw numeric or array (JSON) | Per-sample or periodic |
| `proximityX/proximityY` / `shaftSag` / `rotorEccentricity` | `telemetry_samples` metric rows | Raw numeric | High-frequency for proximity sensors; downsample into cache |
| `cavitationIntensity` / `bearingGrindIndex` / `acousticBaselineMatch` / `ultrasonicLeakIndex` | telemetry_samples metrics / history | Raw numeric (indices) | Event-driven / periodic |

Notes and Transformation Rules
- `telemetry_samples` is the canonical high-frequency time-series table. Each measurement should be ingested as an individual row with `metric_name` and `numeric_value` or `value_text`. Use `metadata` JSONB for units, sensor_id, aggregation info.
- `telemetry_history_cache` is a per-asset precomputed cache intended for fast dashboard reads and AI consumption. The `history` JSONB may store an array of recent telemetry snapshots (e.g., last N minutes) or compressed summaries. Update cadence: recommended every 1–5 minutes or on significant changes; also support server-side backfill jobs.
- `hpp_status` is the low-latency latest-state table used by realtime. Writers should upsert a single row per `asset_id` with `payload` containing the full `TelemetryData`-equivalent snapshot. Realtime subscribers (client) will listen to changes on `public.hpp_status` (replicated as `realtime_hpp_status`).

Recommended Ingestion Patterns
- For streaming sensors: push raw samples into `telemetry_samples` via an ingestion pipeline (Edge/Hub -> Collector -> Supabase). Persist `metric_name`, `numeric_value`, `captured_at`, `sensor_id`, and `metadata` with units.
- Periodically aggregate / compress into `telemetry_history_cache` (server-side job or on-write trigger) for dashboard and model performance.
- Use `hpp_status` as a latest-state upsert target for realtime broadcasting; keep `payload` small (most-used fields) to minimize replication payload.
