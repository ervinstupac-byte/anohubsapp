import { runBackfill } from '../src/services/BackfillService';

async function main() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);
  const startStr = start.toISOString().slice(0,10);
  const endStr = end.toISOString().slice(0,10);
  console.log(`Triggering backfill from ${startStr} to ${endStr}`);
  try {
    const res = await runBackfill(startStr, endStr);
    console.log('Backfill RPC returned:', res);
  } catch (e: any) {
    console.error('Backfill failed:', e?.message || e);
    process.exit(1);
  }
}

main();
