const SUPABASE_URL = 'https://cplfoowmdakqzoljuwcf.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwbGZvb3dtZGFrcXpvbGp1d2NmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDUxMjE3NSwiZXhwIjoyMDk2MDg4MTc1fQ.tFTDn1l78BEYlloK_jsQ1U5NXzWbvJDUP4BSOml61o8';
const H = { apikey: KEY, Authorization: 'Bearer ' + KEY };

fetch(SUPABASE_URL + '/rest/v1/', { headers: H })
  .then(r => r.json())
  .then(spec => {
    const defs = spec.definitions || {};
    ['profiles','assets','sensor_registry','threshold_configs','hpp_status','maintenance_logs','work_orders'].forEach(t => {
      if (defs[t]) {
        console.log('\n=== ' + t + ' ===');
        Object.entries(defs[t].properties || {}).forEach(([col, def]) => {
          const type = def.type || def.format || def['x-supabase-type'] || JSON.stringify(def).slice(0,50);
          console.log('  ' + col.padEnd(30) + type);
        });
      } else {
        console.log('\n=== ' + t + ' === NOT IN SPEC');
      }
    });
  }).catch(console.error);
