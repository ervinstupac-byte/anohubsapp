const { persistAuditRecord } = require('../src/lib/supabaseAuditAdapter.cjs');

async function main(){
  // Sample critical action
  const rec = {
    asset_id: 'test-asset-1',
    action_type: 'TEST_CRITICAL_ACTION',
    payload: { reason: 'simulated critical', severity: 'CRITICAL' },
    status: 'COMPLETED',
    source: 'integration-harness'
  };

  try{
    const res = await persistAuditRecord(rec);
    console.log('Persist result:', res);
  }catch(err){
    console.error('Persist error', err);
  }
}

main();
