#!/usr/bin/env node
/**
 * deploy_edge_function.cjs
 * Deploys the iot-ingest edge function via the Supabase Management API.
 * Uses the service role key for authorization.
 *
 * NOTE: The Supabase Management API for edge functions requires a Personal
 * Access Token (PAT), not a service role key. 
 * Run: npx supabase login  (then deploy manually)
 * OR:  Set SUPABASE_ACCESS_TOKEN env variable with your PAT.
 *
 * Instructions to get a PAT:
 * 1. Go to https://supabase.com/dashboard/account/tokens
 * 2. Click "Generate new token"
 * 3. Run: $env:SUPABASE_ACCESS_TOKEN = "your-pat-here"
 * 4. Then run: npx supabase functions deploy iot-ingest --project-ref cplfoowmdakqzoljuwcf
 */

console.log(`
iot-ingest Edge Function Deploy Instructions
============================================

The iot-ingest function is ready at:
  supabase/functions/iot-ingest/index.ts

To deploy it, run ONE of the following:

Option A — Login via browser:
  npx supabase login
  npx supabase functions deploy iot-ingest --project-ref cplfoowmdakqzoljuwcf

Option B — Use Personal Access Token:
  1. Get your PAT at: https://supabase.com/dashboard/account/tokens
  2. In PowerShell:
     $env:SUPABASE_ACCESS_TOKEN = "sbp_yourtoken..."
     npx supabase functions deploy iot-ingest --project-ref cplfoowmdakqzoljuwcf

What the function does:
  POST https://cplfoowmdakqzoljuwcf.supabase.co/functions/v1/iot-ingest
  Body: { asset_id: "uuid", vibration: 2.3, temperature: 45.2, output: 4800 }
  - Validates asset_id
  - Applies CRITICAL threshold check (vibration > 4.5 or temp > 75)
  - Upserts into hpp_status
  - Appends to dynamic_sensor_data
`);
