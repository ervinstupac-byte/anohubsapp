#!/usr/bin/env node
/**
 * audit_tables.cjs
 * Fetches the list of tables exposed by Supabase PostgREST (OpenAPI) using the service-role key.
 * Outputs a sorted JSON array to stdout.
 */

const SUPABASE_URL   = 'https://cplfoowmdakqzoljuwcf.supabase.co';
const SERVICE_KEY    = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwbGZvb3dtZGFrcXpvbGp1d2NmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDUxMjE3NSwiZXhwIjoyMDk2MDg4MTc1fQ.tFTDn1l78BEYlloK_jsQ1U5NXzWbvJDUP4BSOml61o8';

(async () => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
  });

  if (!res.ok) {
    console.error('HTTP error', res.status, await res.text());
    process.exit(1);
  }

  const spec = await res.json();

  // PostgREST OpenAPI v2 uses `definitions`, v3 uses `components.schemas`
  const defs = spec.definitions || (spec.components && spec.components.schemas) || {};
  const tables = Object.keys(defs).sort();

  if (tables.length === 0) {
    console.error('No tables found. Response keys:', Object.keys(spec));
    process.exit(1);
  }

  console.log(JSON.stringify(tables, null, 2));
})();
