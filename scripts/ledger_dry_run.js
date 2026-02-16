const simulatedAuditRecord = {
  timestamp: new Date().toISOString(),
  action: 'LEDGER_DRY_RUN',
  severity: 'INFO',
  description: 'Verifying offline-first ledger persistence.',
  context: {
    triggeredBy: 'Developer Script',
    environment: process.env.NODE_ENV || 'development'
  }
};

console.log('📝 Attempting to persist simulated audit record...');
console.log(JSON.stringify(simulatedAuditRecord, null, 2));

async function run() {
  const result = await persistAuditRecord(simulatedAuditRecord);
  if (result.inserted) {
    console.log('✅ SUCCESS: Record inserted into Supabase.');
    console.log('Data:', result.data);
  } else {
    console.log('⚠️  LOCAL FALLBACK (or Error):');
    if (result.path) {
      console.log(`✅ SUCCESS: Record written to local file: ${result.path}`);
    } else {
      console.error('❌ ERROR:', result.error);
    }
  }
}
