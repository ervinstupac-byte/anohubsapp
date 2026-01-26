import { supabase } from './supabaseClient';

const RHO = 1000;
const G = 9.81;

export type IntegrityReport = {
  tableStatuses: Record<string, { exists: boolean; count?: number }>;
  physicsCheck: { expected: number; actual: number; ok: boolean } | null;
  financialCheck: { aggregatedLoss: number; triggered: boolean; ok: boolean } | null;
  errors: string[];
};

const TABLES_TO_CHECK = [
  'plants','assets','hydrology_context','dynamic_sensor_data','turbine_designs','expert_efficiency_curves',
  'eta_aggregates','pricing_history','financial_ledger','production_forecast','production_planning',
  'maintenance_logs','maintenance_expenditure','capex_plan','depreciation_schedule','financial_projections','century_plans','invoices'
];

export async function runForensicPulseCheck(): Promise<IntegrityReport> {
  const report: IntegrityReport = { tableStatuses: {}, physicsCheck: null, financialCheck: null, errors: [] };

  // 1) Table existence and simple counts
  for (const t of TABLES_TO_CHECK) {
    try {
      const { data, error } = await supabase.from(t).select('id', { count: 'exact', head: false }).limit(1);
      if (error) {
        report.tableStatuses[t] = { exists: false };
      } else {
        // If count returned, use getTableCount pattern is heavier; here we only confirm select works
        report.tableStatuses[t] = { exists: true, count: Array.isArray(data) ? data.length : undefined };
      }
    } catch (e: any) {
      report.tableStatuses[t] = { exists: false };
    }
  }

  // 2) Physics check: call compute_eta_from_pqh RPC and compare with local calc
  try {
    const samplePkw = 5000; // 5 MW in kW units (5000 kW)
    const sampleQ = 6.0; // m3/s
    const sampleH = 80.0; // m
    // Call RPC
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('compute_eta_from_pqh', { p_kw: samplePkw, q_cms: sampleQ, h_m: sampleH });
    let rpcEta = 0;
    if (!rpcErr && rpcRes != null) {
      // rpc returns numeric; supabase-js returns an array or value depending
      rpcEta = typeof rpcRes === 'object' && Array.isArray(rpcRes) ? Number(rpcRes[0]) : Number(rpcRes);
    }
    const expected = (samplePkw * 1000) / (RHO * G * sampleQ * sampleH);
    const ok = Math.abs(expected - rpcEta) < 1e-8 || Math.abs((expected - rpcEta) / Math.max(1e-12, expected)) < 1e-6;
    report.physicsCheck = { expected, actual: rpcEta, ok };
  } catch (e: any) {
    report.errors.push('Physics check failed: ' + (e.message || String(e)));
  }

  // 3) Financial check: create temporary eta_aggregates row and call compute_loss_from_aggregates
  try {
    // Insert a transient aggregate with avg_eta below optimal to trigger loss
    const temp = {
      asset_id: null,
      period_start: new Date().toISOString().slice(0,10),
      period_end: new Date().toISOString().slice(0,10),
      avg_power_kw: 5000,
      avg_flow_cms: 6.0,
      avg_head_m: 80.0,
      avg_eta: 0.80,
      optimal_eta: 0.92,
      hours: 24,
    } as any;
    const { data: insData, error: insErr } = await supabase.from('eta_aggregates').insert([temp]).select('id').single();
    if (insErr || !insData || !insData.id) {
      report.financialCheck = { aggregatedLoss: 0, triggered: false, ok: false };
    } else {
      const aggId = insData.id;
      // ensure there's a pricing row for null asset — fallback price
      const { data: pData } = await supabase.from('pricing_history').select('price_per_kwh').order('effective_from', { ascending: false }).limit(1).maybeSingle();
      let price = pData?.price_per_kwh ?? 0.05;
      // call RPC to compute loss
      const { data: lossRes, error: lossErr } = await supabase.rpc('compute_loss_from_aggregates', { agg_id: aggId });
      let lossVal = 0;
      if (!lossErr && lossRes != null) {
        lossVal = typeof lossRes === 'object' && Array.isArray(lossRes) ? Number(lossRes[0]) : Number(lossRes);
      }
      const triggered = lossVal > 0;
      report.financialCheck = { aggregatedLoss: lossVal, triggered, ok: triggered };
      // cleanup temporary aggregate
      await supabase.from('eta_aggregates').delete().eq('id', aggId);
    }
  } catch (e: any) {
    report.errors.push('Financial check failed: ' + (e.message || String(e)));
    report.financialCheck = { aggregatedLoss: 0, triggered: false, ok: false };
  }

  return report;
}
