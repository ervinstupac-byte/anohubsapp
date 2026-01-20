import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { jsPDF } from 'jspdf';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL_PUBLIC;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const VIBRATION_THRESHOLD = 4.5; // mm/s

function fmtPct(v) {
  return (v * 100).toFixed(2) + ' %';
}

function fmtCurrency(v) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(v || 0));
}

async function run() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);
  const startStr = start.toISOString().slice(0,10);
  const endStr = end.toISOString().slice(0,10);

  console.log(`Querying eta_aggregates from ${startStr} to ${endStr}`);

  const { data: rows, error } = await supabase
    .from('eta_aggregates')
    .select('id, asset_id, period_start, period_end, avg_eta, optimal_eta, computed_loss_cost, metadata')
    .gte('period_start', startStr)
    .lte('period_end', endStr)
    .order('period_start', { ascending: true });

  if (error) {
    console.error('Failed to fetch eta_aggregates:', error);
    process.exit(2);
  }

  const list = Array.isArray(rows) ? rows : [];

  // Efficiency trend: average avg_eta per day (period_start)
  const byDate = new Map();
  for (const r of list) {
    const d = r.period_start;
    const cur = byDate.get(d) || { sum: 0, count: 0, rows: [] };
    cur.sum += Number(r.avg_eta || 0);
    cur.count += 1;
    cur.rows.push(r);
    byDate.set(d, cur);
  }

  const trend = Array.from(byDate.entries()).map(([date, v]) => ({ date, avg_eta: v.count ? v.sum / v.count : 0, count: v.count }));

  // Alerts: any row where metadata indicates vibration above threshold
  const alerts = [];
  for (const r of list) {
    const meta = r.metadata || {};
    // Check multiple possible keys for max vibration
    const vibCandidates = [];
    if (meta.max_vibration !== undefined) vibCandidates.push(meta.max_vibration);
    if (meta.vibration_max !== undefined) vibCandidates.push(meta.vibration_max);
    if (meta.vibration !== undefined) vibCandidates.push(meta.vibration);
    if (meta.sensor_vibration !== undefined) vibCandidates.push(meta.sensor_vibration);
    // metadata nested keys
    if (meta.francis && meta.francis.max_vibration !== undefined) vibCandidates.push(meta.francis.max_vibration);

    const maxVib = vibCandidates.map(Number).filter(n => !Number.isNaN(n)).reduce((a,b) => Math.max(a,b), 0);
    if (maxVib > VIBRATION_THRESHOLD) {
      alerts.push({ id: r.id, asset_id: r.asset_id, period_start: r.period_start, max_vibration: maxVib });
    }
  }

  // Total calculated financial loss
  const totalLoss = list.reduce((acc, r) => acc + Number(r.computed_loss_cost || 0), 0);

  // Build PDF summary
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  doc.setFontSize(18);
  doc.text('Management Dashboard Summary — Last 30 Days', 15, 20);
  doc.setFontSize(11);
  doc.text(`Period: ${startStr} → ${endStr}`, 15, 28);
  doc.setFontSize(12);
  doc.text('Efficiency Trend (daily average η):', 15, 40);

  // Table header
  let y = 46;
  doc.setFontSize(10);
  doc.text('Date', 15, y);
  doc.text('Avg η', 70, y);
  doc.text('Samples', 110, y);
  y += 4;

  for (const t of trend) {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.text(t.date, 15, y);
    doc.text(fmtPct(t.avg_eta), 70, y);
    doc.text(String(t.count), 110, y);
    y += 6;
  }

  if (y + 30 > 280) { doc.addPage(); y = 20; }
  y += 6;
  doc.setFontSize(12);
  doc.text('Vibration Alerts (days with any sensor > 4.5 mm/s):', 15, y);
  y += 6;

  if (alerts.length === 0) {
    doc.setFontSize(10);
    doc.text('No vibration alerts above 4.5 mm/s detected in the period.', 15, y);
    y += 8;
  } else {
    doc.setFontSize(10);
    doc.text('Date', 15, y);
    doc.text('Asset ID', 55, y);
    doc.text('Max Vib (mm/s)', 110, y);
    y += 4;
    for (const a of alerts) {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(a.period_start, 15, y);
      doc.text(String(a.asset_id), 55, y);
      doc.text(String(a.max_vibration.toFixed(2)), 110, y);
      y += 6;
    }
  }

  if (y + 20 > 280) { doc.addPage(); y = 20; }
  y += 8;
  doc.setFontSize(12);
  doc.text('Total Calculated Financial Loss (period)', 15, y);
  y += 6;
  doc.setFontSize(14);
  doc.setTextColor(220, 38, 38);
  doc.text(fmtCurrency(totalLoss), 15, y);

  // Save PDF to artifacts
  const outDir = path.join(process.cwd(), 'artifacts');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `management_summary_30d_${startStr}_to_${endStr}.pdf`);

  // jsPDF output as ArrayBuffer
  const arrayBuffer = doc.output('arraybuffer');
  fs.writeFileSync(outPath, Buffer.from(arrayBuffer));

  // Also write JSON summary for easier inspection
  const summary = { period: { start: startStr, end: endStr }, trend, alerts, totalLoss };
  fs.writeFileSync(path.join(outDir, `management_summary_30d_${startStr}_to_${endStr}.json`), JSON.stringify(summary, null, 2));

  console.log('Management summary generated:');
  console.log('PDF:', outPath);
  console.log('JSON:', path.join(outDir, `management_summary_30d_${startStr}_to_${endStr}.json`));

  // Print first report preview to console (first 10 lines)
  console.log('\n--- SUMMARY PREVIEW ---');
  console.log('Total rows processed:', list.length);
  console.log('Daily trend sample (first 5):', trend.slice(0,5));
  console.log('Alerts sample (first 5):', alerts.slice(0,5));
  console.log('Total calculated loss:', fmtCurrency(totalLoss));

  return { outPath, summary };
}

(async () => {
  try {
    await run();
    process.exit(0);
  } catch (e) {
    console.error('Failed to generate management summary:', e);
    process.exit(3);
  }
})();
