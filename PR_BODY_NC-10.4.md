Title: NC-10.4 — Forensic Gate: Audit Trail, Resolver, CI, and Documentation

Summary
-------
This draft PR introduces the Forensic Integrity Gate and supporting infrastructure required by NC-10.4:

- Integration test workflow: `.github/workflows/integration-test.yml` — enforces NC-10.2 and NC-10.3 checks (854 dossiers + audit persistence).  
- Supabase audit migration: `supabase/migrations/001_create_automated_actions_audit.sql` — creates `automated_actions_audit` table for persisting automated actions.  
- Supabase adapter + adapter.cjs: `src/lib/supabaseAuditAdapter.ts` and `.cjs` — server-side adapter used by `MasterIntelligenceEngine` to persist audit rows (with `INTEGRATION_MODE` guarding).  
- Resolver endpoint & library: `api/canonical.js`, `src/lib/canonicalResolver.*` — deterministic canonical mapping using `scripts/hashes_applied.json`.  
- Sensor harness + CI helpers: `scripts/sensor_harness.cjs`, `scripts/test_server.cjs`, `scripts/verify_nc102_integrity.cjs`, `scripts/persist_test.cjs`, `scripts/assert_audit_row.cjs` — for deterministic replay, insertion, and assertion.  
- Engine patch: `src/services/MasterIntelligenceEngine.ts` — emits automated actions and calls the audit adapter (writes mocked artifact locally when `INTEGRATION_MODE` is disabled).  
- Documentation: `README.md` and `CONTRIBUTING.md` — operational runbook, Forensic Gate SOP, and merge policy enforcing preservation of the 854 dossiers and physics-core invariants.

Invariant & Protection
----------------------
This PR enshrines and protects the core efficiency invariant used in our performance and safety logic:

$$\eta = \frac{P}{\rho \cdot g \cdot Q \cdot H}$$

Any prospective modifications to the physics core or this invariant must include explicit math, unit annotations, regression harness outputs, and pass the Forensic Gate.

Acceptance / Sign-off
---------------------
Please review and sign-off to merge. This PR is defined as the final gate for NC-10.4 system activation. After you merge, the Forensic Gate will be enforced on `main`.

Files changed (high level)
- `api/canonical.js`
- `src/lib/canonicalResolver.cjs` / `.js`
- `src/lib/supabaseAuditAdapter.ts` / `.cjs`
- `src/services/MasterIntelligenceEngine.ts` (audit persistence calls)
- `scripts/*.cjs` (sensor harness, test server, verification and assertion helpers)
- `supabase/migrations/001_create_automated_actions_audit.sql`
- `.github/workflows/integration-test.yml`
- `README.md`, `CONTRIBUTING.md`

Notes
-----
- The workflow requires the following GitHub Secrets to be configured: `SUPABASE_URL` and `SUPABASE_KEY` (service role key preferred).  
- CI will upload `artifacts/` for diagnostic review. `artifacts/` is gitignored to avoid pollution of the main branch.

Sign-off
--------
Merge author: ____________________  Date: __________
