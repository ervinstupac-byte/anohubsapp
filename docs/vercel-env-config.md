```markdown
Vercel Environment Variables Checklist

Required (client build):
- VITE_SUPABASE_URL = https://<your-project>.supabase.co
- VITE_SUPABASE_ANON_KEY = <anon-public-key>

Required (server-only / secure):
- SUPABASE_URL = https://<your-project>.supabase.co
- SUPABASE_KEY = <service-role-key>  # MUST be set as a secret and never exposed to client
- SUPABASE_SERVICE_ROLE_KEY = <service-role-key>  # alias used by some scripts

Optional / Worker / Backfill:
- PRIMARY_SENSOR_URL = https://sensors.example.com/api/v1/telemetry?api_key=KEY&asset_id=1&hours=24  (or 'use-synthetic' for testing)
- ASSET_ID = 1
- INGEST_HOURS = 24
- BACKFILL_DAYS = 45
- REPORT_TMP_DIR = /tmp/anohub  (optional override for ephemeral report storage)
- INTEGRATION_MODE = false

Notes & Security:
- Put all `SUPABASE_*` service-role keys into Vercel's Environment -> "Environment Variables" and mark them as Protected/Encrypted (do not expose to client builds).
- All client-side keys must use the `VITE_` prefix so Vite will inject them at build time.
- The background ingestion heartbeat should run as a GitHub Actions workflow or an external scheduler (do NOT run `scheduled_ingest.mjs` as a Vercel Serverless Function).
- For Level-5 auditability, report artifacts should be stored in Supabase Storage or an object-storage bucket; avoid relying on ephemeral file system in serverless.

Quick example secrets mapping (GitHub Actions):
- SUPABASE_URL -> secrets.SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY -> secrets.SUPABASE_SERVICE_ROLE_KEY
- PRIMARY_SENSOR_URL -> secrets.PRIMARY_SENSOR_URL
- ASSET_ID -> secrets.ASSET_ID

Checklist complete.

```