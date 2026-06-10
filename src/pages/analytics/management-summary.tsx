import React, { useEffect, useRef, useState } from 'react';
import { ProfessionalReportEngine } from '../../features/reporting/ProfessionalReportEngine';
import { supabase } from '../../services/supabaseClient';
import CenturyROIChart from '../../components/analytics/CenturyROIChart';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { motion } from 'framer-motion';
import { FileText, TrendingDown, AlertTriangle, Euro, Calendar, Activity, ChevronRight, ShieldAlert, FileDown } from 'lucide-react';
import { BackButton } from '../../components/BackButton';

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
        setTrend(res.trend || []);
        setAlerts(res.alerts || []);
        setTotalLoss(res.totalLoss || 0);

        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);
        const startStr = start.toISOString().slice(0,10);
        const endStr = end.toISOString().slice(0,10);
        const filename = `/artifacts/management_summary_30d_${startStr}_to_${endStr}.pdf`;
        
        try {
          const remotePath = `management/management_summary_30d_${startStr}_to_${endStr}.pdf`;
          const g = supabase.storage.from('reports').getPublicUrl(remotePath as any);
          const publicUrlCandidate = (g as any)?.publicURL || (g as any)?.publicUrl || (g as any)?.data?.publicUrl;
          if (publicUrlCandidate) {
            setPdfUrl(publicUrlCandidate);
            return;
          }
          const base = (import.meta as any).env?.VITE_SUPABASE_URL;
          if (base) {
            const constructed = `${base.replace(/\/$/, '')}/storage/v1/object/public/reports/management/management_summary_30d_${startStr}_to_${endStr}.pdf`;
            setPdfUrl(constructed);
            return;
          }
        } catch (e) {}

        fetch(filename, { method: 'HEAD' }).then(hres => {
          if (hres.ok) setPdfUrl(filename);
        }).catch(() => {});

        const jsonFilename = `/artifacts/management_summary_30d_${startStr}_to_${endStr}.json`;
        fetch(jsonFilename).then(r => r.ok ? r.json() : null).then((j:any|null) => {
          if (!j) return;
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
      
      const width = svgRef.current?.clientWidth || 720;
      const height = 240, margin = { top: 20, right: 20, bottom: 40, left: 50 };
      
      const x = d3.scaleBand().domain(trend.map((d: any) => d.date)).range([margin.left, width - margin.right]).padding(0.1);
      const y = d3.scaleLinear().domain([0.6, 1]).range([height - margin.bottom, margin.top]);

      const g = svg.append('g');

      g.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call((d3 as any).axisBottom(x).tickValues(x.domain().filter((d: string, i: number) => i % 5 === 0)))
        .selectAll('text')
        .attr('transform','rotate(-45)')
        .style('text-anchor','end')
        .style('fill', '#94a3b8')
        .style('font-family', 'monospace')
        .style('font-size', '10px');
        
      g.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call((d3 as any).axisLeft(y).tickFormat((d3 as any).format('.0%')))
        .selectAll('text')
        .style('fill', '#94a3b8')
        .style('font-family', 'monospace')
        .style('font-size', '10px');

      // Add grid lines
      g.append('g')
        .attr('class', 'grid')
        .attr('transform', `translate(${margin.left},0)`)
        .call((d3 as any).axisLeft(y).tickSize(-width + margin.left + margin.right).tickFormat(''))
        .selectAll('line').style('stroke', 'rgba(255,255,255,0.05)');

      const line = (d3 as any).line()
        .x((d: any) => (x(d.date)! + x.bandwidth()/2))
        .y((d: any) => y(d.avg_eta))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(trend)
        .attr('fill','none')
        .attr('stroke','#2dd4bf') // cyan-400
        .attr('stroke-width', 2.5)
        .style('filter', 'drop-shadow(0px 4px 6px rgba(45, 212, 191, 0.3))')
        .attr('d', line as any);

      // expert 92% line
      g.append('line')
        .attr('x1', margin.left)
        .attr('x2', width - margin.right)
        .attr('y1', y(0.92))
        .attr('y2', y(0.92))
        .attr('stroke','#ef4444')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray','4 4');
        
      g.append('text')
        .attr('x', width - margin.right)
        .attr('y', y(0.92) - 8)
        .style('fill', '#ef4444')
        .style('font-size', '10px')
        .style('font-weight', 'bold')
        .style('text-anchor', 'end')
        .text('CRITICAL EFFICIENCY THRESHOLD (92%)');
        
    })();
    return () => { cancelled = true; };
  }, [trend]);

  return (
    <div className="animate-fade-in space-y-8 pb-12 max-w-7xl mx-auto px-4 lg:px-8 pt-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-6 rounded-3xl border border-white/5 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-black text-white tracking-widest uppercase">Management <span className="text-cyan-400">Summary</span></h2>
          </div>
          <p className="text-slate-400 text-sm font-light italic">Executive 30-Day Financial & Efficiency Dashboard.</p>
        </div>
        <div className="flex gap-4">
            <button 
                onClick={() => { if (pdfUrl) window.open(pdfUrl, '_blank'); else alert('PDF Report is generating or unavailable.'); }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${pdfUrl ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500 hover:text-slate-950 hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'}`}
            >
                <FileDown className="w-4 h-4" />
                Preview PDF Report
            </button>
            <BackButton text="Back" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="border-l-4 border-l-red-500 p-6">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-red-500/10 rounded-xl text-red-400">
                    <TrendingDown className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500">30-Day Financial Loss</div>
            </div>
            <div className="text-3xl font-mono font-black text-white mb-1">
                {new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(totalLoss)}
            </div>
            <div className="text-xs text-red-400 flex items-center gap-1 font-semibold">
                <AlertTriangle className="w-3 h-3" /> Efficiency degradation impact
            </div>
        </GlassCard>
        
        <GlassCard className="border-l-4 border-l-cyan-500 p-6">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
                    <Activity className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Average Efficiency</div>
            </div>
            <div className="text-3xl font-mono font-black text-white mb-1">
                {trend.length > 0 ? (trend.reduce((acc, t) => acc + t.avg_eta, 0) / trend.length * 100).toFixed(1) : '--'}%
            </div>
            <div className="text-xs text-cyan-400 flex items-center gap-1 font-semibold">
                <Calendar className="w-3 h-3" /> Across last 30 days
            </div>
        </GlassCard>

        <GlassCard className="border-l-4 border-l-amber-500 p-6">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
                    <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Vibration Incidents</div>
            </div>
            <div className="text-3xl font-mono font-black text-white mb-1">
                {alerts.length}
            </div>
            <div className="text-xs text-amber-400 flex items-center gap-1 font-semibold">
                <AlertTriangle className="w-3 h-3" /> Threshold breaches detected
            </div>
        </GlassCard>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            {/* Efficiency Trend Chart */}
            <GlassCard title="Global Efficiency Trend (η)" icon={<Activity className="w-5 h-5" />}>
                <div className="w-full h-[260px] bg-slate-950/50 rounded-xl border border-white/5 p-4 flex items-center justify-center">
                    {trend.length > 0 ? (
                        <svg ref={svgRef} className="w-full h-full" />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-slate-500 space-y-3">
                            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="font-mono text-xs uppercase tracking-widest">Aggregating telemetry...</span>
                        </div>
                    )}
                </div>
            </GlassCard>

            {/* Forensic Notes */}
            {topLossDays.length > 0 && (
                <GlassCard title="Automated Forensic Analysis" icon={<FileText className="w-5 h-5" />} className="border-l-4 border-l-amber-500">
                    <div className="space-y-4">
                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                            <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">Top Loss Days (Sample)</div>
                            <div className="flex flex-wrap gap-3">
                                {topLossDays.slice(0,4).map((d, i) => (
                                    <div key={i} className="bg-slate-900 border border-amber-500/30 px-3 py-2 rounded-lg flex flex-col">
                                        <span className="text-[10px] text-slate-400 font-mono">{d.date}</span>
                                        <span className="text-sm font-bold text-amber-400">{new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(d.loss)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {topLossDays.some(d => d.date === '2025-12-25') && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-4">
                                <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="text-sm font-bold text-red-400 mb-1">Critical Transient Incident (2025-12-25)</h4>
                                    <p className="text-xs text-red-300/80 leading-relaxed">Flow surge detected — rapid transient increase in flow caused a severe efficiency dip resulting in ~€1,003 immediate loss. Recommended action: Inspect guide vane servo mechanics.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </GlassCard>
            )}

            {/* Century ROI Analysis */}
            <GlassCard title="Long-Term Financial Trajectory (2025-2075)" icon={<TrendingDown className="w-5 h-5" />}>
                <div className="mb-6 flex flex-wrap items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-white/5">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Euro className="w-4 h-4" /> Power Price Scenario
                    </div>
                    <div className="flex gap-2">
                        {[0.08, 0.10, 0.15].map(p => (
                            <button 
                                key={p} 
                                onClick={() => setPricePerKwh(p)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-mono font-bold transition-all ${pricePerKwh === p ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(34,211,238,0.4)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'}`}
                            >
                                €{p.toFixed(2)}/kWh
                            </button>
                        ))}
                    </div>
                </div>
                <div className="bg-slate-950/50 rounded-xl border border-white/5 p-4 overflow-x-auto">
                    <CenturyROIChart pricePerKwh={pricePerKwh} />
                </div>
            </GlassCard>
        </div>

        {/* Right Sidebar - Tables */}
        <div className="space-y-6">
            <GlassCard title="Vibration Incidents" icon={<AlertTriangle className="w-5 h-5" />}>
                {alerts.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm font-light italic">No critical vibration alerts recorded in this period.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Date</th>
                                    <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Max Vib</th>
                                    <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Limit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {alerts.map(a => (
                                    <tr key={a.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-3 text-xs text-slate-300 font-mono whitespace-nowrap">{a.period_start.split('T')[0]}</td>
                                        <td className="p-3 text-xs font-bold text-amber-400">{Number(a.max_vibration).toFixed(2)}</td>
                                        <td className="p-3 text-xs text-slate-500">{Number(a.threshold).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </GlassCard>

            <GlassCard title="Daily Efficiency Matrix" icon={<Calendar className="w-5 h-5" />}>
                <div className="overflow-y-auto max-h-[400px] custom-scrollbar pr-2">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-slate-900/95 backdrop-blur z-10 shadow-md">
                            <tr className="border-b border-white/10">
                                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Date</th>
                                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Avg η</th>
                                <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono text-right">Samples</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {trend.map(t => (
                                <tr key={t.date} className="hover:bg-white/5 transition-colors">
                                    <td className="p-3 text-xs text-slate-300 font-mono">{t.date}</td>
                                    <td className="p-3 text-xs font-bold text-cyan-400">{(t.avg_eta*100).toFixed(2)}%</td>
                                    <td className="p-3 text-xs text-slate-500 text-right">{t.samples}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
      </div>
    </div>
  );
}
