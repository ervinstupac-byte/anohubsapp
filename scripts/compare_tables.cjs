#!/usr/bin/env node
/**
 * compare_tables.cjs
 * Compares Supabase live tables vs app .from() references and prints a gap report.
 */

const SUPABASE_TABLES = [
  "asset_configs",
  "assets",
  "audit_logs",
  "automated_actions_audit",
  "diagnostic_drafts",
  "diagnostic_snapshots",
  "digital_integrity",
  "digital_integrity_ledger",
  "enriched_telemetry",
  "eta_aggregates",
  "event_journal",
  "forensic_reports",
  "hpp_improvements",
  "hpp_status",
  "installation_audits",
  "inventory",
  "inventory_assets",
  "maintenance_logs",
  "measurement_submissions",
  "pricing_history",
  "process_instability_events",
  "profiles",
  "pulse_archive",
  "purchase_orders",
  "risk_assessments",
  "sensor_registry",
  "sovereign_dossiers",
  "sovereign_ledger",
  "sovereignty_chain",
  "spare_parts_inventory",
  "telemetry_history_cache",
  "threshold_configs",
  "turbine_families",
  "turbine_variants",
  "work_order_steps",
  "work_orders"
];

const APP_TABLES = [
  "asset_financials_with_eta",
  "assets",
  "audit_logs",
  "automated_actions_audit",
  "avatars",
  "century_plans",
  "component_encyclopedia",
  "diagnostic_drafts",
  "diagnostic_snapshots",
  "digital_integrity",
  "digital_integrity_ledger",
  "dynamic_sensor_data",
  "eta_aggregates",
  "event_journal",
  "experience_ledger",
  "expert_efficiency_curves",
  "expert_knowledge_base",
  "hpp_improvements",
  "hydrology_context",
  "installation_audits",
  "inventory",
  "inventory_assets",
  "logbook_entries",
  "maintenance_logs",
  "operator_feedback",
  "plants",
  "pricing_history",
  "process_instability_events",
  "profiles",
  "purchase_orders",
  "reports",
  "risk_assessments",
  "sensor_registry",
  "spare_parts_inventory",
  "telemetry_history_cache",
  "telemetry_logs",
  "telemetry_samples",
  "threshold_configs",
  "turbine_bids",
  "turbine_designs",
  "work_order_steps",
  "work_orders"
];

const dbSet  = new Set(SUPABASE_TABLES);
const appSet = new Set(APP_TABLES);

// Tables the app references but DO NOT exist in Supabase (MISSING in DB)
const missingInDB = [...appSet].filter(t => !dbSet.has(t)).sort();

// Tables that exist in Supabase but are NOT referenced by the app (unused in code)
const unusedInApp = [...dbSet].filter(t => !appSet.has(t)).sort();

// Tables that exist in both
const matched = [...appSet].filter(t => dbSet.has(t)).sort();

console.log('\n========================================');
console.log(' SUPABASE vs APP — TABLE AUDIT REPORT');
console.log('========================================\n');

console.log(`✅  MATCHED (${matched.length} tables exist in both):`);
matched.forEach(t => console.log(`    • ${t}`));

console.log(`\n🔴  MISSING IN SUPABASE — app uses these but DB doesn't have them (${missingInDB.length}):`);
missingInDB.forEach(t => console.log(`    ✗ ${t}`));

console.log(`\n🟡  IN SUPABASE BUT NOT IN APP CODE — possibly orphaned tables (${unusedInApp.length}):`);
unusedInApp.forEach(t => console.log(`    ? ${t}`));

console.log('\n========================================\n');
