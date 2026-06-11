const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const sqlFile = path.resolve(__dirname, '..', 'supabase', 'migrations', '20260611_draft_rls_policies.sql');
if (!fs.existsSync(sqlFile)) {
  console.error('SQL file not found:', sqlFile);
  process.exit(2);
}

const sql = fs.readFileSync(sqlFile, 'utf8');
let connectionString = process.env.DATABASE_URL || process.argv[2];
if (!connectionString) {
  console.error('Missing connection string. Set DATABASE_URL env var or pass as argument.');
  process.exit(2);
}

// pg v8+ treats sslmode=require as verify-full; use libpq compat for Supabase pooler/direct.
if (!/[?&]sslmode=/.test(connectionString)) {
  const sep = connectionString.includes('?') ? '&' : '?';
  connectionString += `${sep}uselibpqcompat=true&sslmode=require`;
}

(async () => {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  try {
    await client.connect();
    console.log('[test_rls_sql] Connected to database. Beginning transaction (will ROLLBACK).');
    await client.query('BEGIN');

    console.log('[test_rls_sql] Executing SQL file... (this may take a moment)');
    // Execute entire SQL script. If any statement fails, we'll catch and rollback.
    await client.query(sql);

    console.log('[test_rls_sql] SQL executed without error. Rolling back transaction now.');
    await client.query('ROLLBACK');
    console.log('[test_rls_sql] Rolled back successfully. No changes applied.');
    await client.end();
    process.exit(0);
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch (e) { /* ignore */ }
    console.error('[test_rls_sql] ERROR executing SQL:', err && err.message ? err.message : err);
    try { await client.end(); } catch (e) { }
    process.exit(1);
  }
})();
