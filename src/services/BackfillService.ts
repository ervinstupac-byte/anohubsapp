import { supabase } from './supabaseClient';

export async function runBackfill(startDate: string, endDate: string) {
  // call RPC backfill_eta_aggregates
  try {
    const { data, error } = await supabase.rpc('backfill_eta_aggregates', { start_date: startDate, end_date: endDate });
    if (error) throw error;

    // Defensive filter: ensure returned rows come from calibrated sensors (sensor_registry.calibrated = true)
    try {
      const rows = Array.isArray(data) ? data : [];
      // collect sensor ids referenced (best-effort)
      const sensorIds = Array.from(new Set(rows.map((r: any) => r.sensor_id).filter(Boolean)));
      if (sensorIds.length === 0) return data;

      const { data: sensors } = await supabase.from('sensor_registry').select('sensor_id, asset_id, calibrated').in('sensor_id', sensorIds);
      const calibrated = new Set((sensors || []).filter((s:any) => s.calibrated).map((s:any) => s.sensor_id));
      const filtered = rows.filter((r: any) => {
        if (!r.sensor_id) return true; // cannot judge, keep
        return calibrated.has(r.sensor_id);
      });
      return filtered;
    } catch (e) {
      console.warn('Backfill post-filter failed', e);
      return data;
    }
  } catch (e) {
    console.error('Backfill failed', e);
    throw e;
  }
}
