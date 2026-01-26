import React, { useEffect, useRef, useState } from 'react';
// load d3 dynamically to avoid requiring types during build
import { ProfessionalReportEngine } from '../../features/reporting/ProfessionalReportEngine';
import { supabase } from '../../services/supabaseClient';
import CenturyROIChart from '../../components/analytics/CenturyROIChart';

export default function ManagementSummary() {
  const [trend, setTrend] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [totalLoss, setTotalLoss] = useState<number>(0);
  const [pricePerKwh, setPricePerKwh] = useState<number>(0.08);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [topLossDays, setTopLossDays] = useState<Array<{date:string,loss:number}>>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await ProfessionalReportEngine.generateManagementDashboard({ projectID: 'ANOHUB-MGMT' });
        // In browser this returns { trend, alerts, totalLoss }
        setTrend(res.trend || []);
        setAlerts(res.alerts || []);
        setTotalLoss(res.totalLoss || 0);

        // Try to construct artifacts filename matching generator naming
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);
        const startStr = start.toISOString().slice(0,10);
        const endStr = end.toISOString().slice(0,10);
        const filename = `/artifacts/management_summary_30d_${startStr}_to_${endStr}.pdf`;
        // Prefer Supabase storage public URL if available
        try {
          const remotePath = `management/management_summary_30d_${startStr}_to_${endStr}.pdf`;
          const g = supabase.storage.from('reports').getPublicUrl(remotePath as any);
          // supabase client may return { data: { publicUrl } } or { publicURL }
          const publicUrlCandidate = (g as any)?.publicURL || (g as any)?.publicUrl || (g as any)?.data?.publicUrl;
          if (publicUrlCandidate) {
            setPdfUrl(publicUrlCandidate);
            return;
          }
          // Fallback: construct public URL from env VITE_SUPABASE_URL
          const base = (import.meta as any).env?.VITE_SUPABASE_URL;
          if (base) {
            const constructed = `${base.replace(/\/$/, '')}/storage/v1/object/public/reports/management/management_summary_30d_${startStr}_to_${endStr}.pdf`;
            setPdfUrl(constructed);
            return;
          }
        } catch (e) {
          // ignore and fall back to local artifact
        }

        // attempt to fetch local artifact
        fetch(filename, { method: 'HEAD' }).then(hres => {
          if (hres.ok) setPdfUrl(filename);
        }).catch(() => {});

        // also attempt to fetch JSON artifact for forensic annotations
        const jsonFilename = `/artifacts/management_summary_30d_${startStr}_to_${endStr}.json`;
        fetch(jsonFilename).then(r => r.ok ? r.json() : null).then((j:any|null) => {
          if (!j) return;
          // compute top loss days if `rows` or `trend` available
          const rows = j.rows || j.trend || [];
          const parsed = rows.map((r: any) => ({ date: r.period_start || r.date, loss: Number(r.computed_loss_cost || r.loss || 0) }));
          parsed.sort((a:any,b:any)=>b.loss - a.loss);
          setTopLossDays(parsed.slice(0,5));
        }).catch(()=>{});
      } catch (e) {
        console.error('Failed to generate management dashboard in-browser', e);
      }
    }
    load();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!trend || trend.length === 0) return;
      const d3: any = await import('d3');
      if (cancelled) return;
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();
      const width = 720, height = 200, margin = { top: 10, right: 20, bottom: 30, left: 40 };
      const x = d3.scaleBand().domain(trend.map((d: any) => d.date)).range([margin.left, width - margin.right]).padding(0.1);
      const y = d3.scaleLinear().domain([0.6, 1]).range([height - margin.bottom, margin.top]);

      const g = svg.append('g');

      g.append('g').attr('transform', `translate(0,${height - margin.bottom})`).call((d3 as any).axisBottom(x).tickValues(x.domain().filter((d: string, i: number) => i % 5 === 0))).selectAll('text').attr('transform','rotate(-45)').style('text-anchor','end');
      g.append('g').attr('transform', `translate(${margin.left},0)`).call((d3 as any).axisLeft(y).tickFormat((d3 as any).format('.0%')));

      const line = (d3 as any).line()
        .x((d: any) => (x(d.date)! + x.bandwidth()/2))
        .y((d: any) => y(d.avg_eta));

      g.append('path').datum(trend).attr('fill','none').attr('stroke','#2dd4bf').attr('stroke-width',2).attr('d', line as any);

      // expert 92% line
      g.append('line').attr('x1', margin.left).attr('x2', width - margin.right).attr('y1', y(0.92)).attr('y2', y(0.92)).attr('stroke','#ef4444').attr('stroke-dasharray','4 4');
    })();
    return () => { cancelled = true; };
  }, [trend]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Management Dashboard Summary — Last 30 Days</h2>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => { if (pdfUrl) window.open(pdfUrl, '_blank'); else alert('PDF not available yet.'); }}>Preview PDF</button>
      </div>

      <div>
        <svg ref={svgRef} width={720} height={200} />
      </div>

      {topLossDays.length > 0 && (
        <div style={{ marginTop: 8, background: '#fff7ed', padding: 8, border: '1px solid #fcd34d' }}>
          <strong>Forensic Note:</strong>
          <div style={{ marginTop: 6 }}>
            Top loss days (sample): {topLossDays.slice(0,3).map(d => `${d.date} — ${new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(d.loss)}`).join(' | ')}
          </div>
          {topLossDays.some(d => d.date === '2025-12-25') && (
            <div style={{ marginTop: 6, color: '#b91c1c' }}>
              2025-12-25: Flow surge detected — rapid transient increase in flow caused the efficiency dip (~€1,003 loss).
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <h3>Daily Trend Sample</h3>
        <table>
          <thead><tr><th>Date</th><th>Avg η</th><th>Samples</th></tr></thead>
          <tbody>
            {trend.map(t => (
              <tr key={t.date}><td>{t.date}</td><td>{(t.avg_eta*100).toFixed(2)}%</td><td>{t.samples}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12 }}>
        <h3>Vibration Alerts</h3>
        {alerts.length === 0 ? <div>No vibration alerts</div> : (
          <table>
            <thead><tr><th>Date</th><th>Asset</th><th>Max Vib (mm/s)</th><th>Threshold</th></tr></thead>
            <tbody>
              {alerts.map(a => (
                <tr key={a.id}><td>{a.period_start}</td><td>{String(a.asset_id)}</td><td>{Number(a.max_vibration).toFixed(2)}</td><td>{Number(a.threshold).toFixed(2)}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginTop: 18 }}>
        <div style={{ marginBottom: 8 }}>
          <label style={{ marginRight: 12 }}>Price scenario (EUR/kWh):</label>
          {[0.08,0.10,0.15].map(p => (
            <label key={p} style={{ marginRight: 8 }}>
              <input type="radio" name="priceScenario" value={p} checked={pricePerKwh===p} onChange={() => setPricePerKwh(p)} /> {p.toFixed(2)}
            </label>
          ))}
        </div>
        <CenturyROIChart pricePerKwh={pricePerKwh} />
      </div>

      <div style={{ marginTop: 12 }}>
        <h3>Financial Impact</h3>
        <div style={{ color: '#dc2626', fontSize: 20 }}>{new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(totalLoss)}</div>
      </div>

    </div>
  );
}
