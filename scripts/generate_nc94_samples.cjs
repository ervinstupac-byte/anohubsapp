const fs = require('fs');
const crypto = require('crypto');

function sha256(b){return crypto.createHash('sha256').update(b).digest('hex').toUpperCase();}
function seedFromString(s){let h=2166136261>>>0; for(let i=0;i<s.length;i++){h^=s.charCodeAt(i); h=Math.imul(h,16777619)>>>0;} return h>>>0;}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
function fmt(v,d=2){return Number(v.toFixed(d));}

function buildFormulaBlock(topic, prng){
  if(topic==='inlet'){ const H = fmt(5 + prng()*300,1); return { html: `H = ${H} m`, summary: `Selected head H=${H} m to parameterize flow energy available at the inlet/penstock.` }; }
  if(topic==='runner'){ const M = fmt(100 + prng()*1e4,2); const eta = fmt(0.5 + prng()*0.45,3); return { html: `M = ${M} N·m · η = ${eta}`, summary: `Torque M=${M} N·m and efficiency η=${eta} capture mechanical loading and conversion efficiency on the runner.` }; }
  if(topic==='magnetic'){ const B = fmt(0.1 + prng()*2,3); const A = fmt(0.01 + prng()*1,4); const theta = fmt(prng()*Math.PI,3); const Phi = fmt(B*A*Math.cos(theta),6); return { html: `Φ = ${Phi} Wb (B=${B} T, A=${A} m², θ=${theta} rad)`, summary: `Magnetic flux Φ=${Phi} Wb estimated from B, A and orientation θ to characterize induction performance.` }; }
  if(topic==='vibration'){ const k = fmt(1e3 + prng()*1e6,2); const m = fmt(10 + prng()*2000,2); const fn = fmt((1/(2*Math.PI))*Math.sqrt(k/m),3); return { html: `f_n = ${fn} Hz (k=${k} N/m, m=${m} kg)`, summary: `Natural frequency f_n=${fn} Hz computed from stiffness k and mass m to evaluate resonance risk.` }; }
  if(topic==='structural'){ const M = fmt(1e3 + prng()*1e6,2); const y = fmt(0.1 + prng()*2,3); const I = fmt(1e-4 + prng()*1e-2,6); const Fs = fmt(1.5 + prng()*2,3); const sigma_y = fmt(Fs*(M*y/I),3); return { html: `σ_y = ${sigma_y} (F_s=${Fs}, M=${M}, y=${y}, I=${I})`, summary: `Yield stress estimate σ_y=${sigma_y} using safety factor and section properties for structural assessment.` }; }
  return { html: 'η = 0.85', summary: 'Fallback efficiency used for generic performance estimation.' };
}

const picks = [
  {topic:'inlet', rel:'turbine_friend/francis_h/francis_sop_penstock/index.html'},
  {topic:'runner', rel:'turbine_friend/francis_emergency_protocols/index.html'},
  {topic:'magnetic', rel:'protocol/anohub_sync_v2/index.html'},
  {topic:'magnetic', rel:'turbine_friend/francis_sop_generator/index.html'},
  {topic:'vibration', rel:'turbine_friend/francis_sop_shaft_alignment/index.html'},
  {topic:'structural', rel:'turbine_friend/francis_sop_foundation/index.html'}
];

const samples = {};
for(const p of picks){
  const seed = seedFromString(p.rel+':nc94');
  const prng = mulberry32(seed);
  const b = buildFormulaBlock(p.topic, prng);
  const id = sha256(Buffer.from(p.rel,'utf8')).slice(0,8);
  const injection = `<!-- NC-9.4-ID:${id} -->\n<div class="scix-inject mt-6 p-4 bg-white/5 border border-white/5 rounded-lg">\n  <h3 class="text-sm font-bold text-white mb-2">NC-9.4 — ${p.topic.toUpperCase()}</h3>\n  <div class="scix-equation text-sm font-mono text-slate-100 mb-2">${b.html}</div>\n  <p class="text-sm text-slate-300">${b.summary} This formula is applied to ${p.rel} because the filename indicates the sub-topic '${p.topic}', making the parameters relevant for local diagnostics.</p>\n</div>\n`;
  samples[p.topic+'|'+pathSafe(p.rel)] = { rel: p.rel, injection };
}

function pathSafe(s){return s.replace(/\//g,'__').replace(/[^a-zA-Z0-9_]/g,'');}

fs.mkdirSync('scripts/reports', { recursive: true });
fs.writeFileSync('scripts/reports/nc94_samples_expanded.json', JSON.stringify(samples, null, 2));
console.log('samples written to scripts/reports/nc94_samples_expanded.json');
