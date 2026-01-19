import { supabase } from '../services/supabaseClient';

export function subscribeLatestSensor(assetId: number, onMessage: (payload: any) => void) {
    if (!assetId) return () => { };
    const channel = supabase.channel(`telemetry_asset_${assetId}`);

    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'dynamic_sensor_data', filter: `asset_id=eq.${assetId}` }, (payload) => {
        try {
            onMessage(payload.new);
        } catch (e) {
            console.error('Telemetry onMessage handler failed', e);
        }
    });

    channel.subscribe((status: any) => {
        const err = (status && (status as any).error) || (status && (status.error));
        if (err) console.error('Supabase channel subscribe error', err);
    });

    // return unsubscribe
    return () => {
        channel.unsubscribe();
    };
}
