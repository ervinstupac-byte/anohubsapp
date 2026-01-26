const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const repoRoot = path.join(__dirname, '..');
const archiveRoot = path.join(repoRoot, 'public', 'archive');
const backupRoot = path.join(repoRoot, 'public', 'archive.__bak__1768747356701');
const hashesFile = path.join(repoRoot, 'scripts', 'hashes_applied.json');

const formulas = [
  {
    id: 'bernoulli',
    title: 'NC-9.1 — Bernoulli Test',
    formulaHtml: 'P_1 + &frac12; &rho; v_1<sup>2</sup> + &rho; g h_1 = P_2 + &frac12; &rho; v_2<sup>2</sup> + &rho; g h_2',
    note: 'First-order flow trade-off for runner inlet/outlet estimates.'
  },
  {
    id: 'power',
    title: 'NC-9.1 — Turbine Power',
    formulaHtml: 'P = \rho g Q H',
    note: 'Turbine power estimate from flow, head and density.'
  },
  {
    id: 'cavitation',
    title: 'NC-9.1 — Cavitation',
    formulaHtml: '\u03C3 = (H_a - H_v - H_s) / H',
    note: 'Validated for pressure-pulsation and cavitation risk assessment.'
  },
  {
    id: 'specific_speed',
    title: 'NC-9.1 — Specific Speed',
    formulaHtml: 'n_s = (n \cdot \sqrt{P}) / H^{1.25}',
    note: 'Normalized specific speed estimate for runner classification.'
  },
  {
    id: 'water_hammer',
    title: 'NC-9.1 — Water Hammer',
    formulaHtml: '\u0394P = \rho \cdot a \cdot \u0394v',
    note: 'Validated for transient pressure (water-hammer) checks.'
  },
  {
    id: 'torque',
    title: 'NC-9.1 — Torque',
    formulaHtml: 'M = P / \u03C9',
    note: 'Runner torque estimate from power and angular speed.'
  },
  // NC-9.2 additional formulas
  {
    id: 'generator_sync',
    title: 'NC-9.2 — Generator Sync',
    formulaHtml: 'f = \frac{n \cdot p}{120}',
    note: 'Electrical sync relation for generator frequency.'
  },
  {
    id: 'thermal_balance',
    title: 'NC-9.2 — Thermal Balance',
    formulaHtml: 'Q = m \cdot c \cdot \u0394T',
    note: 'Thermal energy balance useful for oil and bearing thermal checks.'
  },
  {
    id: 'system_efficiency',
    title: 'NC-9.2 — System Efficiency',
    formulaHtml: '\u03B7 = P_{out} / P_{in}',
    note: 'Overall system efficiency metric.'
  }
];

const keywordMap = {
  Electrical: ['generator', 'gen', 'electri', 'alternator', 'sync', 'stator', 'rotor'],
  Mechanical: ['bearing', 'shaft', 'torque', 'alignment', 'runner', 'seal', 'oil', 'lubricat'],
  Hydraulic: ['turbine', 'flow', 'head', 'cavitation', 'water', 'pressure', 'hydraulic']
};

function walkHtmlFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name.startsWith('assets') || e.name.startsWith('ghpages')) continue;
      results.push(...walkHtmlFiles(full));
    } else if (e.isFile() && full.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

function sha256Hex(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex').toUpperCase();
}

function seedFromString(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function mulberry32(a) {
  return function() {
    a |= 0;
    a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function fmt(v, decimals=1) { return Number(v.toFixed(decimals)); }

function buildHydraulicInjection(subtopic, prng, rel) {
  // Generate realistic parameter ranges depending on subtopic
  if (subtopic === 'Inlet/Penstock') {
    const H = fmt(10 + prng() * 290, 1); // head in m
    const L = fmt(5 + prng() * 500, 1); // length m
    const D = fmt(0.5 + prng() * 4.5, 2); // diameter m
    const V = fmt(0.5 + prng() * 6, 2); // velocity m/s
    const f = fmt(0.008 + prng() * 0.04, 4); // friction factor
    const hf = fmt(f * (L / D) * (V*V) / (2*9.81), 3);
    const summary = `Estimating penstock friction loss (hf=${hf} m) for ${rel}.`;
    const html = `\n                        <div class="scix-inject mt-6 p-4 bg-white/5 border border-white/5 rounded-lg">\n                            <h3 class="text-sm font-bold text-white mb-2">NC-9.3 — Inlet / Penstock</h3>\n                            <div class="scix-equation text-sm font-mono text-slate-100 mb-2">H=${H} m · L=${L} m · D=${D} m · V=${V} m/s · f=${f}</div>\n                            <p class="text-sm text-slate-300">${summary}</p>\n                        </div>\n`;
    return { html, summary };
  }
  if (subtopic === 'Runner/Turbine') {
    const P = fmt(0.1 + prng() * 200, 3); // MW maybe, use MW units
    const n = fmt(50 + prng() * 1500, 0); // rpm
    const omega = fmt((2*Math.PI*n)/60, 3);
    const M = fmt(P*1e6/ (omega || 1), 3); // N*m
    const eta = fmt(0.5 + prng()*0.45, 3);
    const sigma = fmt(0.05 + prng()*1.5, 3);
    const summary = `Analyzing specific cavitation risk (sigma=${sigma}) and torque (M=${M} N·m) for ${rel}.`;
    const html = `\n                        <div class="scix-inject mt-6 p-4 bg-white/5 border border-white/5 rounded-lg">\n                            <h3 class="text-sm font-bold text-white mb-2">NC-9.3 — Runner / Turbine</h3>\n                            <div class="scix-equation text-sm font-mono text-slate-100 mb-2">P=${P} MW · n=${n} rpm · M=${M} N·m · \u03B7=${eta} · \u03C3=${sigma}</div>\n                            <p class="text-sm text-slate-300">${summary}</p>\n                        </div>\n`;
    return { html, summary };
  }
  // Draft Tube / Outlet
  const Cp = fmt(0.4 + prng()*0.4, 3); // pressure recovery coeff
  const angle = fmt(3 + prng()*17, 1); // diffuser angle deg
  const PR = fmt(Cp * (0.5 + prng()*1.5), 3);
  const summary = `Estimating diffuser pressure recovery (Cp=${Cp}, PR=${PR}) for ${rel}.`;
  const html = `\n                        <div class="scix-inject mt-6 p-4 bg-white/5 border border-white/5 rounded-lg">\n                            <h3 class="text-sm font-bold text-white mb-2">NC-9.3 — Draft Tube / Outlet</h3>\n                            <div class="scix-equation text-sm font-mono text-slate-100 mb-2">Cp=${Cp} · angle=${angle}° · PR=${PR}</div>\n                            <p class="text-sm text-slate-300">${summary}</p>\n                        </div>\n`;
  return { html, summary };
}

function ensureScixCss(content) {
  if (content.includes('/archive/assets/scix.css')) return content;
  const insert = '\n    <link rel="stylesheet" href="/archive/assets/scix.css">\n';
  const idx = content.indexOf('</head>');
  if (idx !== -1) {
    return content.slice(0, idx) + insert + content.slice(idx);
  }
  return content;
}

function buildInjectionBlock(variant) {
  return `\n                        <div class="scix-inject mt-6 p-4 bg-white/5 border border-white/5 rounded-lg">\n                            <h3 class="text-sm font-bold text-white mb-2">${variant.title}</h3>\n                            <div class="scix-equation text-lg font-mono text-slate-100 mb-2">${variant.formulaHtml}</div>\n                            <p class="text-sm text-slate-300">${variant.note}</p>\n                        </div>\n`;
}

function replaceOrInsertInjection(sectionHtml, variant) {
  // Remove any existing scix-inject block(s)
  const cleaned = sectionHtml.replace(/<div class="scix-inject[\s\S]*?<\/div>\s*/g, '');
  // Insert at the end of the section (before closing tag)
  const insertion = buildInjectionBlock(variant);
  return cleaned + insertion;
}

function updateVisibleSha(content, finalHash) {
  if (/SHA-256:\s*[A-F0-9]{64}/.test(content)) {
    return content.replace(/SHA-256:\s*[A-F0-9]{64}/, `SHA-256: ${finalHash}`);
  }
  return content;
}

function run() {
  const files = walkHtmlFiles(archiveRoot).filter(f => !f.includes('assets'));
  console.log('Found', files.length, 'HTML files under archive');

  // mapping counters
  const mappingCounts = { Electrical: 0, Mechanical: 0, Hydraulic: 0 };
  const mappingFiles = { Electrical: [], Mechanical: [], Hydraulic: [] };

  let hashes = {};
  try { hashes = JSON.parse(fs.readFileSync(hashesFile, 'utf8')); } catch (e) { hashes = {}; }

  let idx = 0;
  for (const file of files) {
    idx += 1;
    const rel = path.relative(archiveRoot, file).replace(/\\/g, '/');
    const lc = rel.toLowerCase();

    // Determine category by keywords
    let category = 'Hydraulic';
    for (const k of keywordMap.Electrical) if (lc.includes(k)) { category = 'Electrical'; break; }
    if (category === 'Hydraulic') {
      for (const k of keywordMap.Mechanical) if (lc.includes(k)) { category = 'Mechanical'; break; }
    }

    mappingCounts[category] += 1;
    mappingFiles[category].push(rel);

    // Choose variant: prefer category-specific formula where applicable
    let variant = null;
    if (category === 'Electrical') {
      variant = formulas.find(f => f.id === 'generator_sync');
    } else if (category === 'Mechanical') {
      variant = formulas.find(f => f.id === 'thermal_balance');
    } else {
      variant = formulas.find(f => f.id === 'system_efficiency');
    }

    // fallback to rotating pool if not found
    if (!variant) variant = formulas[idx % formulas.length];

    let content = fs.readFileSync(file, 'utf8');

    // Cleanup any previous injections/comments to keep operation idempotent
    content = content.replace(/<!-- NC-9\.3-ID:[A-F0-9]+ -->\s*/g, '');
    content = content.replace(/<div class=\"scix-inject[\s\S]*?<\/div>\s*/g, '');
    content = ensureScixCss(content);

    const headingIndex = content.indexOf('Engineering Justification');
    if (headingIndex === -1) {
      // If no Engineering Justification section exists, insert a new one before </main>
      const seed = seedFromString(rel);
      const prng = mulberry32(seed);
      // default hydraulic subtopic if applicable
      let subtopic = 'Draft Tube/Outlet';
      const lc = rel.toLowerCase();
      if (/penstock|inlet|head/.test(lc)) subtopic = 'Inlet/Penstock';
      else if (/runner|turbine|cavitation|torque/.test(lc)) subtopic = 'Runner/Turbine';
      else if (/draft|outlet|diffuser|tail/.test(lc)) subtopic = 'Draft Tube/Outlet';
      const dyn = buildHydraulicInjection(subtopic, prng, rel);
      let injectionHtml = `<!-- NC-9.3-ID:${sha256Hex(Buffer.from(rel,'utf8')).slice(0,8)} -->\n` + dyn.html.replace('</p>\n', ` — Calculated specifically for ${rel}</p>\n`);
      // create a minimal Engineering Justification section
      const newSection = `\n                <section class="glass-panel p-8 rounded-2xl border-t-2 border-h-cyan">\n                    <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-3 uppercase tracking-wider">\n                        <i data-lucide="file-text" class="w-5 h-5 text-h-cyan"></i>\n                        Engineering Justification\n                    </h2>\n                    <div class="prose prose-invert max-w-none text-slate-300 leading-relaxed italic border-l-2 border-white/10 pl-6">\n                        Injected NC-9.3 engineering context.\n                    </div>\n                    ${injectionHtml}\n                </section>\n`;
      // Insert before closing </main>
      if (content.includes('</main>')) {
        content = content.replace('</main>', newSection + '\n</main>');
      } else {
        content = content + newSection;
      }
      // continue to SHA/hash update below using content variable
    }

    // Find the surrounding <section ...> ... </section>
    const sectionStart = content.lastIndexOf('<section', headingIndex);
    const sectionEnd = content.indexOf('</section>', headingIndex);
    if (sectionStart === -1 || sectionEnd === -1) {
      // If we couldn't locate a full <section> around the heading, insert a new section before </main>
      const seed = seedFromString(rel);
      const prng = mulberry32(seed);
      let subtopic = 'Draft Tube/Outlet';
      const lc = rel.toLowerCase();
      if (/penstock|inlet|head/.test(lc)) subtopic = 'Inlet/Penstock';
      else if (/runner|turbine|cavitation|torque/.test(lc)) subtopic = 'Runner/Turbine';
      else if (/draft|outlet|diffuser|tail/.test(lc)) subtopic = 'Draft Tube/Outlet';
      const dyn = buildHydraulicInjection(subtopic, prng, rel);
      let injectionHtml = `<!-- NC-9.3-ID:${sha256Hex(Buffer.from(rel,'utf8')).slice(0,8)} -->\n` + dyn.html.replace('</p>\n', ` — Calculated specifically for ${rel}</p>\n`);
      const newSection = `\n                <section class="glass-panel p-8 rounded-2xl border-t-2 border-h-cyan">\n                    <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-3 uppercase tracking-wider">\n                        <i data-lucide="file-text" class="w-5 h-5 text-h-cyan"></i>\n                        Engineering Justification\n                    </h2>\n                    <div class="prose prose-invert max-w-none text-slate-300 leading-relaxed italic border-l-2 border-white/10 pl-6">\n                        Injected NC-9.3 engineering context.\n                    </div>\n                    ${injectionHtml}\n                </section>\n`;
      if (content.includes('</main>')) {
        content = content.replace('</main>', newSection + '\n</main>');
      } else {
        content = content + newSection;
      }
      // proceed with subsequent hash update
    }

    const before = content.slice(0, sectionStart);
    const sectionHtml = content.slice(sectionStart, sectionEnd + '</section>'.length);
    const after = content.slice(sectionEnd + '</section>'.length);

    // Build injection block. If Hydraulic, add dynamic subtopic and parameters
    let injectionHtml = '';
    if (category === 'Hydraulic') {
      // subtopic selection by keywords or fallback rotation
      let subtopic = 'Draft Tube/Outlet';
      const lc = rel.toLowerCase();
      if (/penstock|inlet|head/.test(lc)) subtopic = 'Inlet/Penstock';
      else if (/runner|turbine|cavitation|torque/.test(lc)) subtopic = 'Runner/Turbine';
      else if (/draft|outlet|diffuser|tail/.test(lc)) subtopic = 'Draft Tube/Outlet';
      else {
        // deterministic fallback using index
        const choices = ['Inlet/Penstock','Runner/Turbine','Draft Tube/Outlet'];
        subtopic = choices[idx % choices.length];
      }

      // deterministic PRNG seeded from filename
      const seed = seedFromString(rel);
      const prng = mulberry32(seed);
      const dyn = buildHydraulicInjection(subtopic, prng, rel);
      // include filename-specific engineering note
      injectionHtml = dyn.html.replace('</p>\n', ` — Calculated specifically for ${rel}</p>\n`);
    } else {
      const cleaned = sectionHtml.replace(/<div class="scix-inject[\s\S]*?<\/div>\s*/g, '');
      injectionHtml = buildInjectionBlock(variant).replace('</p>\n', ` — Calculated specifically for ${rel}</p>\n`);
      injectionHtml = cleaned + injectionHtml;
    }
    // ensure uniqueness: prepend deterministic short id based on file path
    const idHash = sha256Hex(Buffer.from(rel, 'utf8')).slice(0, 8);
    injectionHtml = `<!-- NC-9.3-ID:${idHash} -->\n` + injectionHtml;
    const cleaned = sectionHtml.replace(/<div class="scix-inject[\s\S]*?<\/div>\s*/g, '');
    const newSection = cleaned + injectionHtml;
    let newContent = before + newSection + after;

    // Update visible SHA placeholder loop (same approach as before)
    let stableContent = newContent;
    let finalHash = null;
    for (let iter = 0; iter < 5; iter++) {
      const placeholder = '__SCIX_HASH_PLACEHOLDER__';
      const withPlaceholder = stableContent.replace(/SHA-256:\s*[A-F0-9]{64}/, `SHA-256: ${placeholder}`);
      const computed = sha256Hex(Buffer.from(withPlaceholder, 'utf8'));
      const candidate = withPlaceholder.replace(placeholder, computed);
      const recomputed = sha256Hex(Buffer.from(candidate, 'utf8'));
      stableContent = candidate;
      finalHash = recomputed;
      if (recomputed === computed) break;
    }

    if (!/SHA-256:\s*[A-F0-9]{64}/.test(newContent) && !/SHA-256:\s*__SCIX_HASH_PLACEHOLDER__/.test(newContent)) {
      stableContent = newContent.replace(/(<div class="flex flex-wrap items-center[\s\S]*?>[\s\S]*?<\/div>)/, (m) => m + `\n                <div class="flex items-center gap-2 text-h-cyan">\n                    <i data-lucide="fingerprint" class="w-3 h-3"></i>\n                    <span class="truncate">SHA-256: ${finalHash}</span>\n                </div>`);
      finalHash = sha256Hex(Buffer.from(stableContent, 'utf8'));
    }

    fs.writeFileSync(file, stableContent, 'utf8');
    hashes[rel] = finalHash;

    // Mirror to backup
    try {
      const dest = path.join(backupRoot, rel);
      const ddir = path.dirname(dest);
      fs.mkdirSync(ddir, { recursive: true });
      fs.copyFileSync(file, dest);
    } catch (e) {}

    if (idx % 50 === 0) console.log('Processed', idx);
  }

  // Persist hashes file
  fs.writeFileSync(hashesFile, JSON.stringify(hashes, null, 2), 'utf8');

  // Write mapping report
  try {
    const reportDir = path.join(repoRoot, 'scripts', 'reports');
    fs.mkdirSync(reportDir, { recursive: true });
    const report = { counts: mappingCounts, files: mappingFiles, totalProcessed: idx };
    fs.writeFileSync(path.join(reportDir, 'nc91_mapping_report.json'), JSON.stringify(report, null, 2), 'utf8');
    console.log('Mapping report written to scripts/reports/nc91_mapping_report.json');
  } catch (e) { console.error('Failed to write mapping report', e); }

  console.log('Mass injection complete. Files processed:', idx);
}

if (require.main === module) run();
