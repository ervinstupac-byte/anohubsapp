const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const manifestPath = path.join(__dirname, 'hashes_applied.json');
const outReport = path.join(__dirname, 'reports', 'nc102_report.json');
if (!fs.existsSync(path.join(__dirname, 'reports'))) fs.mkdirSync(path.join(__dirname, 'reports'), { recursive: true });

function sha256Of(str){ return crypto.createHash('sha256').update(str,'utf8').digest('hex'); }

function inferTopic(rel){
  const s = rel.toLowerCase();
  // Prioritize electrical/generator terms so folders containing 'generator' map to electrical
  if (/stator|rotor|generator|transformer|electrical|excitation|winding/.test(s)) {
    // prefer 'Generator Unit' when generator keyword present, otherwise 'Electrical Stator/Rotor'
    if (/generator/.test(s)) return { topic: 'Generator Unit', kind: 'electrical' };
    return { topic: 'Electrical Stator/Rotor', kind: 'electrical' };
  }
  if (/penstock|inlet|valve/.test(s)) return { topic: 'Main Inlet Valve', kind: 'hydraulic' };
  if (/runner|turbine|impeller/.test(s)) return { topic: 'Hydraulic Runner', kind: 'hydraulic' };
  if (/bearing|lubrication|shaft|coupling|linkage|foundation|vibration|governor|braking/.test(s)) return { topic: 'Mechanical Subsystem', kind: 'mechanical' };
  // fallback by folder hints (avoid mapping 'francis' alone to hydraulic)
  if (s.includes('turbine')) return { topic: 'Hydraulic Runner', kind: 'hydraulic' };
  return { topic: 'Asset Component', kind: 'mechanical' };
}

function polishBlock(block, rel){
  const info = inferTopic(rel);
  // extract multiplier from existing analysis if present
  let mult = (block.match(/variance\s*&gt;\s*([0-9.]+)×/i) || [])[1] || (block.match(/variance\s*>\s*([0-9.]+)×/i) || [])[1] || '2.5';
  // extract days from existing recommendation if present
  let days = (block.match(/within\s*(\d+)\s*days/i) || [])[1] || (block.match(/within\s*(\d+)\s*day/i) || [])[1] || '7';

  const fn = `<p><strong>Function:</strong> This document describes the primary role of <em>${info.topic}</em> within the public/archive/${rel.replace(/\\/g,'/')} subsystem and the mechanical/electrical function it performs in the plant.</p>`;

  const analysis = `<p><strong>Current Analysis:</strong> Deterministic review of recent behaviour for <em>${info.topic}</em> using archived sensor patterns and NC-10.0 automated feature extraction; anomalies flagged where variance &gt; ${mult}× baseline.</p>`;

  let recSpecific = '';
  if (info.kind === 'hydraulic') recSpecific = 'Monitor flow stability and pressure surges; review inlet valve actuation timing.';
  else if (info.kind === 'electrical') recSpecific = 'Check insulation integrity and winding temperature; verify excitation control.';
  else recSpecific = 'Monitor vibration levels and lubrication quality; check coupling alignment.';

  const recommendation = `<p><strong>Operational Recommendation:</strong> Follow recommended schedule: immediate inspection if trend continues for 3 samples; ${recSpecific} Otherwise schedule predictive maintenance within ${days} days.</p>`;

  // Replace sections in block
  let out = block.replace(/<p>\s*<strong>Function:\<\/strong>[\s\S]*?<\/p>/i, fn);
  out = out.replace(/<p>\s*<strong>Current Analysis:\<\/strong>[\s\S]*?<\/p>/i, analysis);
  out = out.replace(/<p>\s*<strong>Operational Recommendation:\<\/strong>[\s\S]*?<\/p>/i, recommendation);
  return out;
}

// Backup manifest
const stamp = Date.now();
const manifestBackup = manifestPath + `.pre_nc102.${stamp}`;
fs.copyFileSync(manifestPath, manifestBackup);
console.log('Backed up manifest to', manifestBackup);

const manifest = JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const processed = [];

manifest.forEach(entry => {
  const rel = entry.file.replace(/\\/g,'/');
  const full = path.join(__dirname, '..', rel);
  if (!fs.existsSync(full)) return;
  let raw = fs.readFileSync(full,'utf8');
  const rx = /<!--\s*NC-10\.0-ID:([0-9a-f]+)\s*-->([\s\S]*?)<!--\s*\/NC-10\.0-ID:\1\s*-->/i;
  const m = raw.match(rx);
  if (!m) return;
  const id = m[1];
  const block = m[2];
  const newBlock = polishBlock(block, rel.replace(/^public\/archive\//i,''));
  const replaced = raw.replace(rx, `<!-- NC-10.0-ID:${id} -->${newBlock}<!-- /NC-10.0-ID:${id} -->`);
  if (replaced !== raw) {
    fs.writeFileSync(full, replaced, 'utf8');
    const newHash = sha256Of(replaced);
    entry.hash = newHash;
    processed.push({ file: rel, hash: newHash });
  }
});

// write updated manifest
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
fs.writeFileSync(outReport, JSON.stringify({ processed: processed.length, items: processed, manifestBackup }, null, 2));
console.log('NC-10.2 polish complete. processed=', processed.length, 'report=', outReport);
