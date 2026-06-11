#!/usr/bin/env node
/**
 * run_migration.cjs
 * Executes a SQL migration file against Supabase via the pg pooler.
 */
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = 'postgresql://postgres.cplfoowmdakqzoljuwcf:Tresnja369@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?uselibpqcompat=true&sslmode=require';

const sqlFile = path.resolve(__dirname, '../supabase/migrations/20260611_create_missing_tables.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

(async () => {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log('✅ Connected to Supabase Postgres');
    await client.query(sql);
    console.log('✅ Migration executed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
