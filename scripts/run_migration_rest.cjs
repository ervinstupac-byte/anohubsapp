#!/usr/bin/env node
/**
 * run_migration_rest.cjs
 * Applies migration SQL via Supabase Management API (/pg/query endpoint)
 * which accepts the service-role JWT and runs arbitrary SQL.
 */
const fs   = require('fs');
const path = require('path');

const SUPABASE_URL  = 'https://cplfoowmdakqzoljuwcf.supabase.co';
const SERVICE_KEY   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwbGZvb3dtZGFrcXpvbGp1d2NmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDUxMjE3NSwiZXhwIjoyMDk2MDg4MTc1fQ.tFTDn1l78BEYlloK_jsQ1U5NXzWbvJDUP4BSOml61o8';
const REF           = 'cplfoowmdakqzoljuwcf';

const sqlFile = path.resolve(__dirname, '../supabase/migrations/20260611_create_missing_tables.sql');
// Filter out comments-only lines and storage bucket note for clean execution
let sql = fs.readFileSync(sqlFile, 'utf8')
  .replace(/-- .*\n/g, '\n')     // strip line comments
  .replace(/\/\*[\s\S]*?\*\//g, '') // strip block comments
  .trim();

// Split on double-newlines to get logical statements, then join back
// Actually, send as one big SQL block to the management API

(async () => {
  // Use the Supabase Management API - POST to /v1/projects/{ref}/database/query
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', text.slice(0, 1000));

  if (res.ok) {
    console.log('\n✅ Migration applied successfully!');
  } else {
    console.error('\n❌ Migration failed via Management API. Trying pg-gateway approach...');
  }
})();
