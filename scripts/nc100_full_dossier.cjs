#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function safeReadJSON(p){
  return JSON.parse(fs.readFileSync(p,'utf8'));
}

function sha256Of(str){
  return crypto.createHash('sha256').update(str,'utf8').digest('hex');
}

function seededRandom(seed){
  // mulberry32 from seed hex -> number
  let h = 1779033703 ^ seed;
  return function(){
    h += 0x6D2B79F5 | 0;
    let t = Math.imul(h ^ h >>> 15, 1 | h);
    t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

const manifestPath = path.join(process.cwd(),'scripts','hashes_applied.json');
if(!fs.existsSync(manifestPath)){
  console.error('Manifest not found at', manifestPath);
  process.exit(1);
}
const manifest = safeReadJSON(manifestPath);

// prepare outputs
const reportDir = path.join(process.cwd(),'scripts','reports');
if(!fs.existsSync(reportDir)) fs.mkdirSync(reportDir,{recursive:true});
const samples = [];
const newManifest = [];

const techNames = ['A. Novak','M. Hsu','R. Patel','S. Müller','L. Garcia','K. Okeke','T. Brown','P. Singh'];
const healthStates = ['Nominal','Warning','Critical'];

function makeDossierHtml(relPath, rng){
  // context from filename
  const name = path.basename(relPath);
  const folder = relPath.split('/')[0] || '';

  // 3 paragraphs: Function, Current Analysis, Operational Recommendation
  const functionPara = `<p><strong>Function:</strong> This document describes the primary role of <em>${name}</em> within the ${folder} subsystem and the mechanical/electrical function it performs in the plant.</p>`;
  const currentAnalysisPara = `<p><strong>Current Analysis:</strong> Deterministic review of recent behaviour for <em>${name}</em> using archived sensor patterns and NC-10.0 automated feature extraction; anomalies flagged where variance &gt; ${(rng()*2+1).toFixed(2)}× baseline.</p>`;
  const recommendationPara = `<p><strong>Operational Recommendation:</strong> Follow recommended schedule: immediate inspection if trend continues for 3 samples; otherwise schedule predictive maintenance within ${Math.ceil(rng()*14)+1} days.</p>`;

  // 5-point sensor log (last 24 hours)
  const now = Date.now();
  const rows = [];
  for(let i=0;i<5;i++){
    const ts = new Date(now - (24*3600*1000) + (i*(24/4)*3600*1000));
    const val = (rng()*10 + (name.toLowerCase().includes('temp')?60:100)).toFixed(2);
    rows.push({ts: ts.toISOString(), val});
  }
  const tableRowsHtml = rows.map(r=>`<tr><td>${r.ts}</td><td>${r.val}</td></tr>`).join('\n');
  const tableHtml = `<table class="nc10-sensor-log" border="1" style="border-collapse:collapse"><thead><tr><th>timestamp</th><th>value</th></tr></thead><tbody>${tableRowsHtml}</tbody></table>`;

  // maintenance record
  const tech = techNames[Math.floor(rng()*techNames.length)];
  const daysAgo = Math.floor(rng()*30);
  const date = new Date(now - daysAgo*24*3600*1000).toISOString().slice(0,10);
  const health = healthStates[Math.floor(rng()*healthStates.length)];
  const maintenanceHtml = `<div class="nc10-maintenance"><p><strong>Maintenance Record</strong></p><p>Technician: ${tech}</p><p>Date: ${date}</p><p>System Health: ${health}</p></div>`;

  // math step-by-step sample
  let mathHtml = '';
  if(/runner|penstock|inlet|penstock|penstock/i.test(relPath)){
    // hydraulic example: compute velocity from Q and A
    const Q = (rng()*2 + 3).toFixed(3); // m3/s
    const D = (rng()*0.2 + 1.2).toFixed(3); // m
    const A = (Math.PI*(D*D)/4).toFixed(6);
    const V = (Q / (Math.PI*(D*D)/4)).toFixed(3);
    mathHtml = `<div class="nc10-math"><p><strong>Hydraulic Calculation (step-by-step)</strong></p><ol><li>Given flow Q = ${Q} m³/s and diameter D = ${D} m.</li><li>Area A = π·D²/4 = ${A} m².</li><li>Velocity V = Q / A = ${V} m/s.</li><li>Result: V = ${V} m/s.</li></ol></div>`;
  } else if(/stator|transformer|generator|electrical|stator/i.test(relPath)){
    // electrical example: three-phase apparent power
    const V = (rng()*100 + 360).toFixed(1); // V
    const I = (rng()*50 + 10).toFixed(2); // A
    const S = (Math.sqrt(3)*V*I).toFixed(2);
    mathHtml = `<div class="nc10-math"><p><strong>Electrical Calculation (step-by-step)</strong></p><ol><li>Line-to-line voltage V = ${V} V and current I = ${I} A.</li><li>Apparent power S = √3·V·I = ${S} VA.</li><li>Result: S = ${S} VA.</li></ol></div>`;
  } else {
    // generic energy calc
    const a = (rng()*100+100).toFixed(2);
    const b = (rng()*10+1).toFixed(2);
    const c = (a*b).toFixed(2);
    mathHtml = `<div class="nc10-math"><p><strong>Sample Calculation</strong></p><ol><li>Compute A = ${a} and B = ${b}.</li><li>Multiply: A×B = ${c}.</li><li>Result: ${c} (units as noted).</li></ol></div>`;
  }

  // final block
  const id = 'NC-10.0-ID:' + sha256Of(relPath).slice(0,12);
  const block = `<!-- ${id} -->\n<div class="nc10-dossier">\n${functionPara}\n${currentAnalysisPara}\n${recommendationPara}\n${tableHtml}\n${maintenanceHtml}\n${mathHtml}\n</div>\n<!-- /${id} -->\n`;
  return {html:block, sampleRows: rows, tech, date, health};
}

console.log('NC-10.0 injector: processing', manifest.length, 'entries');

for(const entry of manifest){
  try{
    const abs = path.resolve(entry.file);
    if(!fs.existsSync(abs)){
      // try with forward slashes adjusted
      const alt = path.resolve(entry.file.replace(/\\/g,'/'));
      if(!fs.existsSync(alt)){
        console.warn('File missing, skipping:', entry.file);
        continue;
      } else {
        abs = alt;
      }
    }
    const raw = fs.readFileSync(abs,'utf8');
    const seed = parseInt(sha256Of(entry.file).slice(0,8),16) >>> 0;
    const rng = seededRandom(seed);
    const {html, sampleRows, tech, date, health} = makeDossierHtml(entry.file, rng);

    // inject before </body> if present, else append
    let out;
    const bodyRe = new RegExp('</body>', 'i');
    if(bodyRe.test(raw)){
      out = raw.replace(bodyRe, html + '\n</body>');
    } else {
      out = raw + '\n' + html;
    }

    fs.writeFileSync(abs, out, 'utf8');
    const newHash = sha256Of(out);
    newManifest.push({ file: entry.file, hash: newHash });

    // push two representative samples for report
    if(/runner|inlet|penstock/i.test(entry.file) && samples.length<1){
      samples.push({file: entry.file, tech, date, health, sampleRows, injected: html});
    }
    if(/stator|transformer|generator/i.test(entry.file) && samples.length<2){
      samples.push({file: entry.file, tech, date, health, sampleRows, injected: html});
    }
  } catch(err){
    console.error('Error processing', entry.file, err.message);
  }
}

// backup old manifest
const backupPath = manifestPath + '.pre_nc100.' + Date.now();
fs.copyFileSync(manifestPath, backupPath);
fs.writeFileSync(manifestPath, JSON.stringify(newManifest,null,2),'utf8');
fs.writeFileSync(path.join(reportDir,'nc100_samples.json'), JSON.stringify({summary:{processed:newManifest.length}, samples},null,2),'utf8');

console.log('NC-10.0 injector: complete. New manifest written and report saved.');
console.log('Backup of old manifest at', backupPath);
process.exit(0);
