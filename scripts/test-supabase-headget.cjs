#!/usr/bin/env node
const fetch = global.fetch || require('node-fetch');
(async () => {
  const url = 'https://nehxtecejxklqknscbgf.supabase.co/rest/v1/risk_assessments?select=*';
  const key = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5laHh0ZWNlanhrbHFrbnNjYmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2MjA4NTksImV4cCI6MjA4MTE5Njg1OX0.AWWPN9ocAhjBTMtOgQ29ey3y4KcEXQLvfB98Z998n7A';
  const headers = {
    'apikey': key,
    'Authorization': 'Bearer ' + key,
    'accept-profile': 'public',
    'x-client-info': 'supabase-js-web/2.87.1'
  };

  try {
    console.log('HEAD ...');
    const start = Date.now();
    const h = await fetch(url, { method: 'HEAD', headers, timeout: 10000 });
    console.log('HEAD status', h.status, 'time', Date.now() - start);
  } catch (e) {
    console.error('HEAD ERR', e.message);
  }
  try {
    console.log('GET ...');
    const start = Date.now();
    const g = await fetch(url, { method: 'GET', headers, timeout: 15000 });
    console.log('GET status', g.status, 'time', Date.now() - start);
    const txt = await g.text();
    console.log('GET length', txt.length);
  } catch (e) {
    console.error('GET ERR', e.message);
  }
})();
