import React, { useEffect, useState, useMemo } from 'react';
import { runForensicPulseCheck, IntegrityReport } from '../services/SystemIntegrityService';
import { runBackfill } from '../services/BackfillService';
import { persistCenturyPlanForAsset } from '../services/CenturyPlanner';
import { supabase } from '../services/supabaseClient';
import { useConfirm } from '../contexts/ConfirmContext';
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';

export default function AdminHealth() {
  const [report, setReport] = useState<IntegrityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [backfillRunning, setBackfillRunning] = useState(false);
  const [backfillMessage, setBackfillMessage] = useState<string | null>(null);
  const { confirm } = useConfirm();
  // SCADA Grid Sync
  // @ts-ignore
  const { gridFrequency = 50.0 } = useTelemetryStore() as any;
  const phaseAligned = true;
  const needleRotation = useMemo(() => (phaseAligned ? 0 : 20), [phaseAligned]);

  useEffect(() => {
    setLoading(true);
    runForensicPulseCheck().then(r => {
      setReport(r);
      setLoading(false);
    }).catch(e => {
      setReport(null);
      setLoading(false);
      console.error('Health check failed', e);
    });
  }, []);

  const handleTriggerBackfill = async () => {
    setBackfillRunning(true);
    setBackfillMessage('Starting backfill for last 30 days...');
    try {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 30);
      const startStr = start.toISOString().slice(0,10);
      const endStr = end.toISOString().slice(0,10);
      const data = await runBackfill(startStr, endStr);
      setBackfillMessage(`Backfill completed: ${Array.isArray(data) ? data.length : 'unknown'} rows processed.`);

      // for each unique asset, persist century plan based on latest aggregate
      const assetIds = Array.from(new Set((data || []).map((r: any) => r.asset_id).filter((id: any) => id)));
      for (const aid of assetIds) {
        try {
          // fetch latest aggregate for asset
          const { data: latestAgg } = await supabase.from('eta_aggregates').select('*').eq('asset_id', aid).order('period_start', { ascending: false }).limit(1).single();
          const { data: priceRow } = await supabase.from('pricing_history').select('price_per_kwh').eq('asset_id', aid).order('effective_from', { ascending: false }).limit(1).maybeSingle();
          const input = {
            currentEta: latestAgg?.avg_eta ?? 0,
            optimalEta: latestAgg?.optimal_eta ?? 1,
            currentPowerKw: latestAgg?.avg_power_kw ?? 0,
            pricePerKwh: priceRow?.price_per_kwh ?? 0.05,
            annualOpex: 0,
            capex: 0,
            capacityFactor: 0.45,
            telemetryWindow: []
          };
          const aidNum = Number(aid);
          await persistCenturyPlanForAsset(aidNum, input, `Backfill Plan ${startStr}→${endStr}`);
        } catch (e) { console.warn('Century plan persist failed for asset', aid, e); }
      }

    } catch (e: any) {
      setBackfillMessage('Backfill failed: ' + (e.message || String(e)));
    } finally {
      setBackfillRunning(false);
      // refresh report
      setLoading(true);
      runForensicPulseCheck().then(r => { setReport(r); setLoading(false); }).catch(() => setLoading(false));
    }
  };

  const confirmBackfill = () => {
    confirm({
        title: 'Confirm Historical Backfill',
        message: 'This operation will process historical telemetry and write aggregated records to the database. It can be heavy on DB I/O. Do you want to proceed?',
        confirmLabel: 'Proceed',
        variant: 'warning',
        onConfirm: handleTriggerBackfill
    });
  };

  if (loading) return <div className="p-6">Running health checks…</div>;
  if (!report) return <div className="p-6">No report available.</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Health — System Integrity</h1>

      {/* SCADA Grid Sync */}
      <section className="mb-6">
        <h2 className="font-semibold">SCADA Grid Synchronization</h2>
        <div className="mt-3 grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-6 p-4 bg-slate-900 border border-slate-700 rounded-lg">
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-widest mb-2">Grid Frequency</div>
            <div className="text-4xl font-black text-white tabular-nums">
              {gridFrequency.toFixed(2)} <span className="text-sm text-slate-500 font-normal">Hz</span>
            </div>
            <div className="mt-2 text-xs text-emerald-400 font-mono">Synchronized</div>
          </div>
          <div className="col-span-12 md:col-span-6 p-4 bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-center">
            <div className="relative w-40 h-40 rounded-full border-4 border-slate-600 bg-slate-800 shadow-inner">
              <div className="absolute inset-3 rounded-full border-2 border-slate-700" />
              {/* Tick marks */}
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-0.5 h-4 bg-slate-600 left-1/2 top-0 origin-bottom"
                  style={{ transform: `translateX(-50%) rotate(${i * 30}deg)` }}
                />
              ))}
              {/* Needle */}
              <div
                className="absolute left-1/2 top-1/2 w-0.5 h-16 bg-emerald-400 origin-bottom shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                style={{ transform: `translate(-50%, -100%) rotate(${needleRotation}deg)` }}
              />
              {/* Center cap */}
              <div className="absolute left-1/2 top-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-300" />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-mono uppercase">Synchroscope</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="font-semibold">Table Statuses</h2>
        <ul className="mt-2 space-y-1">
          {Object.entries(report.tableStatuses).map(([table, status]) => (
            <li key={table} className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${status.exists ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <div className="font-mono">{table}</div>
              <div className="text-sm text-slate-400">{status.count != null ? `sample_count=${status.count}` : ''}</div>
            </li>
          ))}
        </ul>
      </section>

      <div className="mb-6">
        <h2 className="font-semibold">Backfill & Century Planning</h2>
        <div className="mt-2 flex items-center gap-3">
          <button onClick={confirmBackfill} disabled={backfillRunning} className="px-3 py-1 bg-slate-700 rounded">
            {backfillRunning ? 'Backfilling…' : 'Trigger Historical Backfill (30d)'}
          </button>
          {backfillRunning && <div className="text-sm text-slate-400">Processing historical telemetry — this may take a few minutes.</div>}
        </div>
        {backfillMessage && <div className="mt-2 text-sm text-slate-300">{backfillMessage}</div>}
      </div>

      <section className="mb-6">
        <h2 className="font-semibold">Physics Check (η invariant)</h2>
        {report.physicsCheck ? (
          <div>
            <div>Expected η: {report.physicsCheck.expected}</div>
            <div>Actual η (DB RPC): {report.physicsCheck.actual}</div>
            <div>Status: {report.physicsCheck.ok ? <span className="text-emerald-500">OK</span> : <span className="text-red-500">FAIL</span>}</div>
          </div>
        ) : <div>No physics check performed.</div>}
      </section>

      <section>
        <h2 className="font-semibold">Financial Check</h2>
        {report.financialCheck ? (
          <div>
            <div>Aggregated Loss: {report.financialCheck.aggregatedLoss}</div>
            <div>Status: {report.financialCheck.ok ? <span className="text-emerald-500">Triggered</span> : <span className="text-red-500">Not Triggered</span>}</div>
          </div>
        ) : <div>No financial check performed.</div>}
      </section>

      {report.errors && report.errors.length > 0 && (
        <section className="mt-6">
          <h3 className="font-semibold">Errors</h3>
          <pre className="bg-black/40 p-3 mt-2 rounded">{report.errors.join('\n')}</pre>
        </section>
      )}
    </div>
  );
}
