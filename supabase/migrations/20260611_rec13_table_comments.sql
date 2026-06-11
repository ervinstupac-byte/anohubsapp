-- =============================================================================
-- MIGRATION #13: COMMENT ON TABLE — inline schema documentation
-- Helps future engineers understand the purpose of each table at a glance.
-- =============================================================================

-- Core Asset Management
COMMENT ON TABLE public.assets IS
  'Primary asset registry. Each row is a physical turbine unit (Francis, Pelton, Kaplan). The specs JSONB column holds engineering parameters. Linked to by almost all other tables.';

COMMENT ON TABLE public.profiles IS
  'User profiles extending auth.users. Contains display name, role (admin|consultant|engineer|operator|finance), company, and avatar. Auto-created by handle_new_user trigger.';

COMMENT ON TABLE public.plants IS
  'Hydropower plant (site) master records. A plant contains multiple assets/turbines. Stores geospatial and environmental baseline data.';

COMMENT ON TABLE public.sensor_registry IS
  'Registry of physical sensors attached to assets. Defines sensor type, unit, and nominal operating range. Referenced by dynamic_sensor_data.';

-- Telemetry / Time-Series
COMMENT ON TABLE public.dynamic_sensor_data IS
  'High-frequency IoT sensor ingest. Written by the iot-ingest edge function. Auto-purged after 90 days by pg_cron job. Index on (asset_id, timestamp DESC).';

COMMENT ON TABLE public.telemetry_logs IS
  'Structured event logs from the app (LoggingService). Contains event_type, severity, and a JSONB details payload. Auto-purged after 180 days.';

COMMENT ON TABLE public.telemetry_samples IS
  'Lightweight diagnostic telemetry for system-level errors (e.g., PDF worker failures). Auto-purged after 30 days.';

COMMENT ON TABLE public.telemetry_history_cache IS
  'Aggregated/cached telemetry window for the AI prediction engine. Reduces repeated full-table scans.';

COMMENT ON TABLE public.eta_aggregates IS
  'Daily ETA (estimated time to action) aggregates per asset, computed from risk_assessments by pg_cron at 3am. Used by the century planner and management summary.';

COMMENT ON TABLE public.enriched_telemetry IS
  'Pre-computed enriched telemetry view combining raw sensor data with asset metadata. Populated by ETL or triggers.';

-- Maintenance & Operations
COMMENT ON TABLE public.maintenance_logs IS
  'Full maintenance event history per asset. Includes digital seal hash for tamper-evidence. Linked to work_orders.';

COMMENT ON TABLE public.work_orders IS
  'Structured maintenance/repair work orders. Tracks issue type, priority, assignment, and completion. Real-time enabled.';

COMMENT ON TABLE public.work_order_steps IS
  'Step-by-step checklist items within a work order. Ordered execution steps for technicians.';

COMMENT ON TABLE public.installation_audits IS
  'Formal installation audit records. Documents compliance checks during turbine installation or major overhaul.';

COMMENT ON TABLE public.logbook_entries IS
  'Shift-based digital logbook written by operators. Contains measurements, shift info, and operator notes.';

COMMENT ON TABLE public.hpp_status IS
  'Real-time HPP operating status per asset. Written by the iot-ingest edge function on every sensor push. Upserted on conflict asset_id.';

-- Diagnostics & Intelligence
COMMENT ON TABLE public.diagnostic_drafts IS
  'Draft/in-progress diagnostic reports. Saved by DiagnosticContext before finalization.';

COMMENT ON TABLE public.diagnostic_snapshots IS
  'Finalized diagnostic snapshots capturing the full system state at a point in time for an asset.';

COMMENT ON TABLE public.risk_assessments IS
  'Risk scoring records per asset. Feeds eta_aggregates aggregation and the management summary report.';

COMMENT ON TABLE public.process_instability_events IS
  'Records of detected hydraulic instability, cavitation, or vibration events. Real-time enabled.';

COMMENT ON TABLE public.expert_knowledge_base IS
  'Curated symptom-to-diagnosis knowledge base. Keyed by symptom_key (unique). Used by DiagnosticContext for AI-assisted troubleshooting.';

COMMENT ON TABLE public.expert_efficiency_curves IS
  'Engineering efficiency curves (Hill charts) per turbine variant or family. Used by AgingEstimator for degradation modeling.';

COMMENT ON TABLE public.experience_ledger IS
  'Lessons-learned ledger. Field engineers record resolved symptoms, causes, and resolution steps after each diagnostic event.';

COMMENT ON TABLE public.component_encyclopedia IS
  'Structured knowledge base of turbine components. Searchable by name and description. Admin/consultant write only.';

-- Financial & Planning
COMMENT ON TABLE public.century_plans IS
  '100-year lifecycle financial projections per asset. Stored input parameters and computed projection series as JSONB.';

COMMENT ON TABLE public.asset_financials_with_eta IS
  'Financial aggregates per asset per time period. computed_loss_cost is the key metric for ProfessionalReportEngine.';

COMMENT ON TABLE public.pricing_history IS
  'Historical spare parts and service pricing. Write-restricted to finance/admin roles.';

COMMENT ON TABLE public.inventory IS
  'Spare parts inventory master. Tracks stock levels, reorder points, and part specifications.';

COMMENT ON TABLE public.inventory_assets IS
  'Junction table linking inventory items to specific assets (turbines). Tracks per-asset part allocation.';

COMMENT ON TABLE public.spare_parts_inventory IS
  'Extended spare parts catalog with availability and sourcing information.';

COMMENT ON TABLE public.purchase_orders IS
  'Purchase order records for parts and services procurement.';

COMMENT ON TABLE public.turbine_bids IS
  'Vendor bid evaluations for turbine procurement. Stores efficiency validation results from HydraulicIntegrity engine.';

-- Design & Engineering
COMMENT ON TABLE public.turbine_designs IS
  'Saved turbine design configurations from HPPBuilder. Per-user, per-asset. The parameters JSONB includes family, variant, design_points, hotspot_map, specs.';

COMMENT ON TABLE public.turbine_families IS
  'Reference table for turbine type families (Francis, Pelton, Kaplan). Used for FK and display.';

COMMENT ON TABLE public.turbine_variants IS
  'Reference table for specific turbine model variants within a family.';

COMMENT ON TABLE public.hydrology_context IS
  'Plant-level hydrology parameters (design head, flow, ecological flow, etc.). One row per plant, upserted on conflict.';

COMMENT ON TABLE public.hpp_improvements IS
  'Recorded improvement recommendations for HPP systems. Tracks engineering improvement history.';

-- Reports & Audit
COMMENT ON TABLE public.reports IS
  'Report metadata table. Actual PDF files are stored in the reports storage bucket. Links asset, period, and PDF URL.';

COMMENT ON TABLE public.forensic_reports IS
  'Detailed forensic/failure analysis reports. Access restricted by role (admin/consultant).';

COMMENT ON TABLE public.audit_logs IS
  'System-wide audit trail. Every significant action is logged here. Auto-purged after 365 days (compliance retention).';

COMMENT ON TABLE public.automated_actions_audit IS
  'Audit log specifically for automated/AI-driven actions taken by the SentinelKernel or automation rules.';

COMMENT ON TABLE public.digital_integrity IS
  'Digital integrity verification records. Ensures tamper-evidence for critical operational data.';

COMMENT ON TABLE public.digital_integrity_ledger IS
  'Immutable append-only ledger for digital integrity hashes. Never updated, only inserted.';

COMMENT ON TABLE public.sovereign_ledger IS
  'Sovereign state ledger — high-integrity operational state records with cryptographic binding.';

COMMENT ON TABLE public.sovereign_dossiers IS
  'Sovereign dossier documents — formal operational status dossiers per asset.';

COMMENT ON TABLE public.sovereignty_chain IS
  'Chain-of-custody records for sovereign operational state transitions.';

-- Feedback & Notifications
COMMENT ON TABLE public.operator_feedback IS
  'Veto/feedback records from operators who override automated recommendations. Logs action_id, reason, and context.';

COMMENT ON TABLE public.threshold_configs IS
  'Per-asset alarm threshold configuration. Currently tracks vibration_mm_s; expand for additional sensors.';

COMMENT ON TABLE public.measurement_submissions IS
  'Raw field measurement submissions before processing/validation.';

COMMENT ON TABLE public.pulse_archive IS
  'Historical pulse/heartbeat records from the monitoring system.';

COMMENT ON TABLE public.asset_configs IS
  'Additional configuration parameters per asset. May overlap with assets.specs — consider consolidating.';
