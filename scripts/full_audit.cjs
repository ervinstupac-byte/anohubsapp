#!/usr/bin/env node
/**
 * full_audit.cjs
 * Comprehensive Supabase audit:
 * - Lists all tables with RLS status
 * - Lists all policies
 * - Lists all indexes
 * - Lists all triggers/functions
 * - Checks for missing updated_at triggers
 */
const SUPABASE_URL = 'https://cplfoowmdakqzoljuwcf.supabase.co';
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwbGZvb3dtZGFrcXpvbGp1d2NmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDUxMjE3NSwiZXhwIjoyMDk2MDg4MTc1fQ.tFTDn1l78BEYlloK_jsQ1U5NXzWbvJDUP4BSOml61o8';

const H = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' };

async function rpc(query) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, { method: 'POST', headers: H });
  return r;
}

async function query(sql) {
  // Use PostgREST's /rpc/ pg_catalog approach via service role
  // Actually use information_schema via REST views
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${sql}`, { headers: H });
  return r.json();
}

async function main() {
  console.log('\n=== 1. TABLES + RLS STATUS ===');
  const tablesRes = await fetch(
    `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
    {
      method: 'POST',
      headers: H,
      body: JSON.stringify({
        sql: `SELECT t.table_name, c.relrowsecurity AS rls_enabled
              FROM information_schema.tables t
              JOIN pg_class c ON c.relname = t.table_name
              JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = 'public'
              WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
              ORDER BY t.table_name`
      })
    }
  );
  console.log('RLS check status:', tablesRes.status);
  const tablesBody = await tablesRes.text();
  console.log(tablesBody.slice(0, 500));
}

main().catch(console.error);
