# Migration Guide — Applying `20260123_sovereign_memory.sql`

Purpose: Steps to safely apply the promoted migration `supabase/migrations/20260123_sovereign_memory.sql` which adds `telemetry_samples`, `physics_results`, `project_state_snapshots`, `telemetry_history_cache`, and `hpp_status`. Follow these steps in the Supabase Dashboard or via psql CLI.

Pre-flight checks (do these before applying):

- Backup current database: create a full SQL dump or use Supabase Backups snapshot. Example (pg_dump):

```bash
pg_dump --format=custom --file=backup_before_sovereign_memory.dump \
  --dbname="postgres://<user>:<pass>@<host>:5432/<db>"
```

- Export the current `public.assets` table for safety (contains turbine types/specs):

```bash
psql $DATABASE_URL -c "COPY (SELECT * FROM public.assets) TO STDOUT WITH CSV HEADER" > assets_backup.csv
```

- Verify you have a recent working copy of `supabase_schema.sql` and the migration file `supabase/migrations/20260123_sovereign_memory.sql` in the repo.

- Confirm no long-running writes or ingestion pipelines are active during migration window (quiesce telemetry writers if possible).

- Run the app in a staging environment (if available) with the migration applied first to validate behavior.

Applying via Supabase SQL Editor (UI):

1. Open the Supabase project -> Database -> SQL Editor.
2. Create a new query and paste the contents of `supabase/migrations/20260123_sovereign_memory.sql` or upload the file content.
3. Review the DDL for any references to sequences/constraints that might conflict with existing objects.
4. Run the query in a transaction if possible. Example wrapper:

```sql
BEGIN;
-- <contents of migration file>
COMMIT;
```

5. Inspect the results, check for errors. If an error occurs, run `ROLLBACK;` and inspect the error message.

Applying via psql / CLI (recommended for automation):

```bash
psql $DATABASE_URL -f supabase/migrations/20260123_sovereign_memory.sql
```

Post-apply verification (immediately after applying):

- Confirm tables exist:

```sql
SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN (
  'telemetry_samples','physics_results','project_state_snapshots','telemetry_history_cache','hpp_status'
);
```

- Inspect a sample row from each new table (should be empty initially):

```sql
SELECT * FROM public.telemetry_history_cache LIMIT 5;
SELECT * FROM public.hpp_status LIMIT 5;
```

- Validate `public.assets` default value (turbine_type = 'PELTON'):

```sql
SELECT column_default FROM information_schema.columns WHERE table_schema='public' AND table_name='assets' AND column_name='turbine_type';
```

- If you use Supabase Realtime, enable replication for `public.hpp_status` so it is broadcast to clients. In the Supabase Dashboard: Database -> Replication / Realtime -> add `public.hpp_status` as a published table (or follow provider docs).

Backout plan (if migration causes issues):

- Restore the DB from the pre-flight backup created earlier.
- Alternatively, drop the newly created tables if you need a quick rollback (only if safe to lose created data):

```sql
BEGIN;
DROP TABLE IF EXISTS public.telemetry_samples CASCADE;
DROP TABLE IF EXISTS public.physics_results CASCADE;
DROP TABLE IF EXISTS public.project_state_snapshots CASCADE;
DROP TABLE IF EXISTS public.telemetry_history_cache CASCADE;
DROP TABLE IF EXISTS public.hpp_status CASCADE;
COMMIT;
```

Post-migration tasks:

- Add ingestion/collector jobs that write per-sample telemetry into `telemetry_samples` and upsert latest-state into `hpp_status` for realtime.
- Implement a periodic worker to populate/refresh `telemetry_history_cache` (1–5 minute cadence recommended).
- Update any server-side triggers or functions to compute `summary` fields in `telemetry_history_cache`.
- Document the data retention policy and create retention jobs for `telemetry_samples` (e.g., keep raw high-frequency data for N days/months, then aggregate).

Security notes:

- Ensure the Supabase service role or ingestion credentials used by collectors have only necessary permissions (INSERT/UPDATE on relevant tables). Do not use a full-superuser role in production ingestion.

Contact/Support:

- If you need help applying this migration in a production environment, I can produce a step-by-step shell script or CI job to run it safely.
