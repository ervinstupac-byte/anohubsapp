import { supabase } from '../services/supabaseClient';

export function subscribeLatestSensor(assetId: number, onMessage: (payload: any) => void) {
    if (!assetId) return () => { };
    // Guard against noop supabase client used during SSG/build.
    if (!supabase || typeof (supabase as any).channel !== 'function') {
        console.warn('Supabase real client unavailable; telemetry subscription disabled (build/CI environment).');
        // Return a noop unsubscribe. UI should display a connecting/disabled state.
        return () => { };
    }

    const channel = (supabase as any).channel(`telemetry_asset_${assetId}`);

    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'dynamic_sensor_data', filter: `asset_id=eq.${assetId}` }, (payload: any) => {
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
        try { channel.unsubscribe(); } catch (e) { /* ignore */ }
    };
}
