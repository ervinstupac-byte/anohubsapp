# Supabase Migrations — Execution Guide

## Overview

All migrations must be applied in **filename order** (chronological). The consolidated schema must always run first.

## Execution Order

| # | File | Status | Notes |
|---|------|--------|-------|
| 1 | `000_CONSOLIDATED_SCHEMA_RUN_FIRST.sql` | ✅ Applied | Base schema — all tables, RLS, enums |
| 2 | `001_create_automated_actions_audit.sql` | ✅ Applied | Audit trail for automated actions |
| 3 | `20231221_create_logs.sql` | ✅ Applied | System log tables |
| 4 | `20231221_inventory_schema.sql` | ✅ Applied | Inventory management |
| 5 | `20231221_maintenance_schema.sql` | ✅ Applied | Maintenance records |
| 6 | `20231221_master_linkage.sql` | ✅ Applied | Cross-entity linkage |
| 7 | `20231222_work_orders.sql` | ✅ Applied | Work order system |
| 8 | `20231223_ekb_schema.sql` | ✅ Applied | Engineering knowledge base |
| 9 | `20240104_infrastructure_genesis.sql` | ✅ Applied | Infrastructure tables |
| 10 | `20241221_safety_forensics_schema.sql` | ✅ Applied | Safety & forensics |
| 11 | `20241221_universal_turbine_schema.sql` | ✅ Applied | Universal turbine data model |
| 12 | `20260119_add_erp_business_tables.sql` | ✅ Applied | ERP / business logic tables |
| 13 | `20260119_add_expert_efficiency_curves.sql` | ✅ Applied | Efficiency curve data |
| 14 | `20260119_add_turbine_designs_and_hotspot_map.sql` | ✅ Applied | Turbine design + heatmap data |
| 15 | `20260119_add_utility_and_compliance.sql` | ✅ Applied | Utility & compliance tables |
| 16 | `20260119_create_financial_and_planning_tables.sql` | ✅ Applied | Financial planning |
| 17 | `20260119_create_reports_table.sql` | ✅ Applied | Reports table |
| 18 | `20260119_fix_financial_backfill.sql` | ✅ Applied | Financial data backfill |
| 19 | `20260119_seed_francis_curves_more.sql` | ✅ Applied | Francis turbine curve seeds |
| 20 | `20260119_seed_francis_hotspot_map.sql` | ✅ Applied | Hotspot map seeds |
| 21 | `20260119_thresholds_and_backfill.sql` | ✅ Applied | Alert thresholds + backfill |
| 22 | `20260120_create_reports_table.sql` | ✅ Applied | Reports table v2 (idempotent) |
| 23 | `20260123_harden_trash_suggested.sql` | ✅ Applied | Hardening pass |
| 24 | `20260123_sovereign_memory.sql` | ⚠️ **PENDING** | See note below |
| 25 | `20260124_industrial_integrity_foundation.sql` | ✅ Applied | Industrial integrity foundation |
| 26 | `20260124_operator_feedback.sql` | ✅ Applied | Operator feedback table |
| 27 | `20260129_harden_experience_ledger.sql` | ✅ Applied | Experience ledger hardening |
| 28 | `20260607_create_diagnostic_snapshots.sql` | ✅ Applied | Diagnostic snapshots table |

---

## ⚠️ Pending Migration: `20260123_sovereign_memory.sql`

**What it creates:**
- `public.telemetry_samples` — raw telemetry batches from the physics worker
- `public.physics_results` — outputs of the `PhysicsEngine` D_mol / NP calculations
- `public.hpp_status` — current operational mode per asset (OPTIMAL / CAVITATION_RISK / MAINTENANCE)

**Why it's safe to apply:**
All `CREATE TABLE` statements use `IF NOT EXISTS` guards, making this migration fully **idempotent**. RLS is enabled on all three tables.

**To apply (requires Supabase CLI):**
```bash
# Option A — Supabase CLI (recommended)
supabase db push

# Option B — Direct SQL execution in Supabase dashboard
# Paste contents of 20260123_sovereign_memory.sql into the SQL Editor
# and run against the target project.
```

**Dependency:** Requires the `public.assets` table to exist (created in `000_CONSOLIDATED_SCHEMA_RUN_FIRST.sql`).

---

## How to Apply New Migrations

1. Create a new file with format `YYYYMMDD_description.sql`
2. Use `IF NOT EXISTS` / `IF EXISTS` / `CREATE OR REPLACE` where possible for idempotency
3. Add the file to the table above with status `⚠️ PENDING`
4. Apply via `supabase db push` or the Supabase SQL Editor
5. Update the status to `✅ Applied` after successful execution
