ZERO-DEFECT MAIN CONFIRMED (80/80). The 720-point anchor is our new baseline.

This document describes the Level-5 operationalization steps for maintainers/operators.

1) Add `ADMIN_TOKEN` (one-time prep)
- Create a GitHub Personal Access Token (PAT) with `repo` and `admin:repo_hook` scopes (or equivalent admin permissions).
- In the repository, go to Settings → Secrets and variables → Actions → New repository secret and add `ADMIN_TOKEN` with that PAT value.

2) Populate runtime secrets securely (repeatable)
- Use the manual workflow `Secrets Setup` (file: `.github/workflows/secrets-setup.yml`) to securely create repository secrets without checking them into code.
- From the CLI (recommended):

  Bash
  -----
  gh workflow run secrets-setup.yml -f supabase_service_role_key="<SUPABASE_SERVICE_ROLE_KEY>" -f primary_sensor_url="<PRIMARY_SENSOR_URL>"

  PowerShell
  ----------
  gh workflow run secrets-setup.yml -f supabase_service_role_key="<SUPABASE_SERVICE_ROLE_KEY>" -f primary_sensor_url="<PRIMARY_SENSOR_URL>"

- Or use the GitHub UI: Actions → Secrets Setup → Run workflow → provide inputs.

Notes:
- The `secrets-setup.yml` workflow requires `ADMIN_TOKEN` repo secret to exist (step 1). It will create/update `SUPABASE_SERVICE_ROLE_KEY` and `PRIMARY_SENSOR_URL` repository secrets.

3) Relaunch the cloud heartbeat (immediate)
- After secrets are in place, dispatch the ingest workflow to run the first live heartbeat.

  Bash / PowerShell (use from repo root):

  gh workflow run ingest.yml --ref main

4) Verify cache and Pf anchor
- After the ingest run completes, check the workflow logs and then run the local check script to confirm the 720-point anchor is present and Pf behavior:

  node scripts/check_cache.mjs 1
  node scripts/compute_pf_for_asset.mjs 1
  node scripts/compare_pf_anchor.mjs 1

The `compare_pf_anchor.mjs` script will compare the live `residualStd` and `Pf` to our anchor values (`residualStd = 0.0135`, `Pf = 51.077%`) and will write a 'Live Operational Event' into the `telemetry_alerts` table if a meaningful deviation is detected.

5) Repeatability & audits
- All steps above are repeatable by any operator with repository admin privileges.
- Keep `ADMIN_TOKEN` limited in access and rotate it periodically.

If you'd like, I can also add a tiny helper script to dispatch the ingest workflow and poll for completion — tell me which runner (bash/PowerShell) you prefer.
