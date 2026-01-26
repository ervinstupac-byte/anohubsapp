
# Contributing — Forensic Integrity & Merge Policy

This repository enforces a mandatory Forensic Integrity Gate. All contributors must follow these rules; failures block merges.

1) Forensic Integrity Gate (MANDATORY)
- The CI workflow `.github/workflows/integration-test.yml` is the authoritative gate: it must pass for any branch to be merged into `main`. The gate enforces two immutable checks:
  - NC-10.2 dossier integrity: `scripts/verify_nc102_integrity.cjs` must verify that `scripts/hashes_applied.json` contains exactly **854** dossiers. Any deviation fails the gate.
  - NC-10.3 simulation persistence: the workflow must run `scripts/persist_test.cjs` under `INTEGRATION_MODE=true` and `scripts/assert_audit_row.cjs` must detect a persisted audit row (e.g., `asset_id = 'test-asset-1'`). If persistence fails, the gate fails.

2) Canonical Dossiers Preservation (NON-NEGOTIABLE)
- The 854 dossiers are the canonical truth. Any change to `scripts/hashes_applied.json`, `scripts/generate_library.py`, or the generated `DOSSIER_LIBRARY` requires a formal engineering justification included in the PR:
  - A numeric delta (added / removed / modified file list).
  - Engineering math and rationale demonstrating why the change is required (attach a design doc or link to a ticket).  
  - A deterministic regeneration step (update `scripts/generate_library.py` and include regenerated outputs or a reproducible script).  
  - A CI run demonstrating the new manifest reproduces and passes the integrity check.

3) Physics Core Security & Efficiency Invariant
- Any modifications to the physics/decision code (notably under `src/hooks` and `src/services`) must preserve the core efficiency invariant unless explicitly justified and reviewed:

  Efficiency invariant (must be preserved or replaced with documented justification):

  $$\eta = \frac{P}{\rho \cdot g \cdot Q \cdot H}$$

  - P: output power (W)
  - ρ: fluid density (kg/m^3)
  - g: gravitational acceleration (9.81 m/s^2)
  - Q: volumetric flow (m^3/s)
  - H: net head (m)

- If a PR proposes changes to any coefficients, thresholds, or the RUL kernel, it must include:
  - Explicit revised equations with unit annotations.
  - A regression harness report demonstrating no unintended degradation (include `artifacts/` outputs or CI artifacts).  

4) Automated Actions & Audit Trail (AUDITABILITY)
- All automated actions emitted by `MasterIntelligenceEngine` are mandatory to persist to `automated_actions_audit` in Supabase. The code path that writes audit records is protected by `INTEGRATION_MODE` in tests but must be enabled in CI for verification. PRs that remove, bypass, or obfuscate audit persistence will be rejected.

5) Deployment Standards & Secrets Management
- GitHub Actions Secrets required for CI:  
  - `SUPABASE_URL`  
  - `SUPABASE_KEY` (service role key or a key with insert/select privileges for the audit table)

- Vercel / Production env vars (required):  
  - `VITE_SUPABASE_URL`  
  - `VITE_SUPABASE_ANON_KEY`

- Best practices:
  - Never commit service-role keys or production secrets to the repo.  
  - Rotate keys regularly and audit usage logs.  
  - Limit CI key privileges to the minimal set required (prefer scoped tokens where possible).  

6) Local Testing Guidance
- Use `node ./scripts/sensor_harness.cjs` for offline simulation (writes safe artifacts to `./artifacts`).  
- To validate live persistence locally, set `INTEGRATION_MODE=true` and provide `SUPABASE_URL` + `SUPABASE_KEY` in your shell before running `node ./scripts/persist_test.cjs`.

7) Merge & Emergency Policy
- All PRs must target `main` via pull request with the Forensic Gate passing. No direct pushes to `main` are allowed.  
- For emergency patches, follow the on-call approval process and submit a post-merge audit that demonstrates system health within 24 hours.

8) Enforcement
- Repository maintainers will reject PRs that do not include required engineering justification, test artifacts, or that fail the Forensic Gate. The gate is non-negotiable for `main` merges.

Thank you for preserving the integrity and safety of the AnoHUB Forensic Gate.
