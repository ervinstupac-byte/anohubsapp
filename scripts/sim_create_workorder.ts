import { supabase } from '../src/services/supabaseClient';
import idAdapter from '../src/utils/idAdapter';

(async () => {
  try {
    const order = {
      assetId: 3001,
      assetName: 'Iron Gorge HPP',
      component: 'TEST_COMPONENT',
      description: 'E2E test auto-dispatch simulation',
      priority: 'HIGH',
      trigger: 'AI_PREDICTION'
    } as any;

    const numeric = idAdapter.toNumber(order.assetId);
    const assetDbId = numeric !== null ? idAdapter.toDb(numeric) : (order.assetId ? String(order.assetId) : null);

    const payload: any = {
      asset_name: order.assetName,
      component: order.component,
      description: order.description,
      priority: order.priority,
      status: 'PENDING',
      trigger_source: order.trigger
    };

    if (assetDbId !== null && assetDbId !== undefined) payload.asset_id = assetDbId;

    console.log('[sim_create_workorder] Payload attempt 1:', payload);
    let res: any;
    try {
      res = await supabase.from('work_orders').insert(payload).select().single();
    } catch (err) {
      res = { data: null, error: err };
    }
    console.log('[sim_create_workorder] Result attempt 1:', { data: res.data, error: res.error && (res.error.message || res.error) });

    if (res && res.error) {
      const msg = String(res.error?.message || res.error || '').toLowerCase();
      if (msg.includes('invalid input syntax for type uuid') || msg.includes('invalid input syntax for type uuid')) {
        delete payload.asset_id;
        console.warn('[sim_create_workorder] Detected UUID error; retrying without asset_id:', payload);
        let res2: any;
        try {
          res2 = await supabase.from('work_orders').insert(payload).select().single();
        } catch (err) {
          res2 = { data: null, error: err };
        }
        console.log('[sim_create_workorder] Result attempt 2:', { data: res2.data, error: res2.error && (res2.error.message || res2.error) });
      }
    }

    console.log('[sim_create_workorder] Done.');
    process.exit(0);
  } catch (e) {
    console.error('[sim_create_workorder] Fatal error', e);
    process.exit(1);
  }
})();
