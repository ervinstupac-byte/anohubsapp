# Database Usage Report

Source: `supabase_schema.sql` (extracted tables)

| Table Name | Used in Code | File Reference | Purpose |
|---|---:|---|---|
| `assets` | Yes | `src/contexts/AssetContext.tsx`, `src/contexts/TelemetryContext.tsx`, `src/types.ts`, `src/components/dashboard/ExecutiveDashboard.tsx` | Base asset registry (id, name, type, location, turbine_type). Used to populate UI asset lists and telemetry contexts. |
| `inventory_assets` | Yes | `src/contexts/InventoryContext.tsx` | Inventory / spare parts registry; used by inventory UI and maintenance flows. |
| `work_orders` | Yes | `src/contexts/WorkOrderContext.tsx`, `src/contexts/MaintenanceContext.tsx` | Work order execution table; create/update workflow and real-time subscription hooks. |
| `work_order_steps` | Yes | `src/contexts/WorkOrderContext.tsx` | Steps for work orders; joined/selected in work order queries (`select('*, steps:work_order_steps(*)')`). |
| `expert_knowledge_base` | Yes | `src/contexts/DiagnosticContext.tsx` | Diagnosis knowledge base used by diagnostics logic to resolve symptom keys to actions. |
| `experience_ledger` | Yes | `src/contexts/DiagnosticContext.tsx` | Historical experience / resolved cases ledger; appended during diagnostics for lessons learned. |
| `audit_logs` | Yes | `src/contexts/AuditContext.tsx` | Integrity/audit logging table used by audit-related UI and logging inserts/queries. |
| `diagnostic_drafts` | Yes | `src/components/Questionnaire.tsx`, `src/contexts/DiagnosticContext.tsx` | Temporary saved diagnostic session drafts per user+asset. |

Notes:
- Table list was taken from `supabase_schema.sql` located at repository root.
- File references are the files where the table name appears in Supabase client calls or comments; this is a code-level usage map and may not capture external infra scripts or manual SQL interactions.

## Logic Consistency Check

- Telemetry mapping: The TypeScript `TelemetryData` interface (defined in `src/contexts/TelemetryContext.tsx`) is an enriched, in-memory representation containing many derived fields (vibration, temperature, efficiency, reservoirLevel, wicketGatePosition, etc.). The proposed persisted table `telemetry_samples` (see `supabase/migrations/20260123_sovereign_memory.sql`) is a normalized, per-metric time-series table (`metric_name`, `numeric_value`, `value_text`, `captured_at`, `metadata`). Mapping occurs in the ingestion layer: `TelemetryContext.tsx` (realtime subscription to `hpp_status`) and `ProjectStateContext.tsx` (`ProjectStateManager.updateFromTelemetry`) are responsible for converting raw DB rows or realtime payloads into the canonical `TelemetryData` and `TechnicalProjectState`.

	- Files involved: `src/contexts/TelemetryContext.tsx`, `src/contexts/ProjectStateContext.tsx`, `src/components/dashboard/ExecutiveDashboard.tsx` (reads `telemetry_history_cache`).
	- Verdict: CONSISTENT at a high level — the code uses a mapping layer rather than mirroring SQL columns 1:1. Recommend adding a short mapping doc to explicitly map `telemetry_samples` (or `telemetry_history_cache`) JSON shapes to `TelemetryData` fields.

- Utility Grid & Environmental Monitoring wiring: Executive dashboard and related services are wired to read grid/environment signals:
	- `src/components/dashboard/ExecutiveDashboard.tsx` reads `specializedState?.sensors?.gridFrequency` and uses `telemetry_history_cache` for trend charts.
	- `EnvironmentalBaseline` is defined in `src/types/assetIdentity.ts` and used by `src/components/HPPBuilder.tsx` and tests (`src/__tests__/expert-inference.test.ts`).
	- Services referencing grid logic: `src/services/DrTurbineAI.ts`, `src/services/EnergyMerchant.ts`.
	- Verdict: CONNECTED — grid and environmental fields are present in `TechnicalSchema` and surface in the UI and services. Ensure persisted schema for `telemetry_history_cache` (or `telemetry_samples`) captures grid-frequency/time-series data if authoritative historical analysis is needed.

## Ghost Tables (Candidates for Deprecation)

- None in `supabase_schema.sql` — all current tables defined in `supabase_schema.sql` are referenced by the TypeScript codebase.

## Next Steps

- Review and finalize `supabase/migrations/20260123_sovereign_memory.sql` and apply to Supabase to make `telemetry_samples`, `physics_results`, and `project_state_snapshots` available for historical analysis.
- Add `telemetry_history_cache` and `hpp_status` to the canonical SQL schema or document their provisioning/migrations so `SystemManifest.md` and `supabase_schema.sql` are aligned.

