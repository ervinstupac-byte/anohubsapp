import { aiPredictionService } from './AIPredictionService';
import { supabase } from './supabaseClient';
import idAdapter from '../utils/idAdapter';

export async function fetchForecastForAsset(selectedAsset: any) {
    if (!selectedAsset) return null;
    const numeric = idAdapter.toNumber(selectedAsset.id);
    if (numeric === null) return null;

    const result: any = { forecast: null, residualStd: null, sampleCount: null, dec25Present: false, pf: null };

    try {
        const f = await aiPredictionService.forecastEtaBreakEven(numeric);
        result.forecast = f;
        result.residualStd = (f && typeof f.residualStd === 'number') ? f.residualStd : null;
    } catch (e) {
        // ignore forecast failure
    }

    try {
        const dbId = idAdapter.toDb(numeric);
        // Check if table exists/is accessible before throwing hard errors
        // 406 Not Acceptable usually means the table doesn't exist or RLS denies all
        const { data: cacheRes, error } = await supabase
            .from('telemetry_history_cache')
            .select('history')
            .eq('asset_id', dbId)
            .single();

        if (error) {
            // PGRST116 = JSON 0 rows (expected if no cache)
            // 406 = Not Acceptable (Table missing/RLS)
            if (error.code === 'PGRST116' || error.message.includes('406') || (error as any).status === 406) {
                // Return result with 0 samples, don't throw
                result.sampleCount = 0;
                result.dec25Present = false;
                return result;
            }
            throw error;
        }

        const hist = cacheRes?.history || [];
        const histCount = Array.isArray(hist) ? hist.length : 0;
        result.sampleCount = histCount;
        const hasDec25 = (hist || []).some((p: any) => {
            try { const d = new Date(p.t); return d.getUTCFullYear() === 2025 && d.getUTCMonth() === 11 && d.getUTCDate() === 25; } catch (e) { return false }
        });
        result.dec25Present = !!hasDec25;

        if (result.residualStd === null) {
            // attempt compute residual quickly from history
            const pts = (hist || []).map((p: any) => ({ t: p.t, y: p.y }));
            if (pts.length >= 5) {
                const n = pts.length;
                const meanT = pts.reduce((s: any, p: any) => s + p.t, 0) / n;
                const meanY = pts.reduce((s: any, p: any) => s + p.y, 0) / n;
                const Sxx = pts.reduce((s: any, p: any) => s + Math.pow(p.t - meanT, 2), 0);
                const Sxy = pts.reduce((s: any, p: any) => s + (p.t - meanT) * (p.y - meanY), 0);
                const a = Sxy / (Sxx || 1);
                const residuals = pts.map((p: any) => p.y - (a * p.t + (meanY - a * meanT)));
                const SSE = residuals.reduce((s: any, r: any) => s + r * r, 0);
                const sigma2 = SSE / Math.max(1, (n - 2));
                result.residualStd = Math.sqrt(sigma2);
            }
        }

        if (result.residualStd !== null) {
            const acceptableSigma = 0.5;
            const z = result.residualStd / acceptableSigma;
            const t = 1 / (1 + 0.2316419 * Math.abs(z));
            const d = 0.3989423 * Math.exp(-z * z / 2);
            let prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
            prob = 1 - prob;
            const pfVal = z < 0 ? 1 - prob : prob;
            result.pf = Math.min(99.99, Math.max(0.01, pfVal * 100));
        }
    } catch (e) {
        // ignore cache errors
        if (process.env.NODE_ENV === 'development' && !(e as any).__logged) {
            console.warn('[DashboardData] Cache query suppressed:', (e as Error).message);
            (e as any).__logged = true;
        }
    }

    return result;
}

export async function forecastExcludingDates(selectedAsset: any, excludeDates: string[]) {
    if (!selectedAsset) return null;
    const numeric = idAdapter.toNumber(selectedAsset.id);
    if (numeric === null) return null;
    try {
        // delegate to aiPredictionService convenience wrapper
        if (typeof (aiPredictionService as any).forecastExcludingDates === 'function') {
            return await (aiPredictionService as any).forecastExcludingDates(numeric, excludeDates);
        }
        return null;
    } catch (e) {
        return null;
    }
}

export default { fetchForecastForAsset, forecastExcludingDates };

// Predictive prefetch: warm-up forensic/dashboard assets during idle time
export function prefetchPredictiveAssets(selectedAsset: any) {
    try {
        const schedule = (cb: () => void) => {
            if ((window as any).requestIdleCallback) return (window as any).requestIdleCallback(cb, { timeout: 2000 });
            return window.setTimeout(cb, 1500);
        };

        schedule(async () => {
            try {
                // Warm up lazy forensic dashboard bundle
                import('../components/forensics/ForensicDashboard').catch(() => { });
                // Warm up heavy services and worker module (non-blocking)
                import('./ForensicReportService').catch(() => { });

                // Prefetch predictive forecast & telemetry cache for instant open
                if (selectedAsset) await fetchForecastForAsset(selectedAsset);
            } catch (e) {
                // noop — best-effort only
            }
        });
    } catch (e) {
        // noop
    }
}

// Lazy hydration: prefetch physics snapshots 2s after session start
export function lazyHydratePhysicsSnapshots(delayMs = 2000, maxAssets = 3) {
    try {
        setTimeout(async () => {
            try {
                const { data: assets } = await supabase.from('assets').select('id,name').limit(maxAssets);
                if (!assets || !assets.length) return;
                for (const a of assets) {
                    try {
                        // best-effort: fetch forecast which will warm telemetry cache + any physics snapshots
                        await fetchForecastForAsset(a);
                    } catch (e) { /* ignore per-asset errors */ }
                }
            } catch (e) { /* ignore */ }
        }, delayMs);
    } catch (e) { /* noop */ }
}
