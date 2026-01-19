import React, { useEffect, useState } from 'react';
import { supabase } from '../../../services/supabaseClient';
import Decimal from 'decimal.js';
import { useAssetContext } from '../../../contexts/AssetContext';
import { subscribeLatestSensor } from '../../../hooks/useTelemetrySubscription';
import { evaluateAging, fetchExpertCurve } from '../../../services/AgingEstimator';
import DiagnosticAdvisory from '../../../components/DiagnosticAdvisory';

const RHO = new Decimal(1000);
const G = new Decimal(9.80665);

export const FrancisHorizontal5MW: React.FC = () => {
    const { selectedAsset } = useAssetContext();
    const assetId = selectedAsset?.id;
    const [design, setDesign] = useState<any>(null);
    const [hotspots, setHotspots] = useState<Record<string, any>>({});
    const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
    const [latestTelemetry, setLatestTelemetry] = useState<any>(null);
    const [hotspotLogs, setHotspotLogs] = useState<any[]>([]);
    const [hotspotAging, setHotspotAging] = useState<any | null>(null);
    const [thresholds, setThresholds] = useState<any | null>(null);
    const [expertCurveState, setExpertCurveState] = useState<any | null>(null);
    const [hydrologyContext, setHydrologyContext] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!assetId) return;
        let mounted = true;
        setLoading(true);
        (async () => {
            try {
                const { data } = await supabase
                    .from('turbine_designs')
                    .select("parameters->>family as family, parameters->>variant as variant, parameters->'design_points' as design_points, parameters->'hotspot_map' as hotspot_map, parameters->'specs' as specs")
                    .eq('asset_id', assetId)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();
                if (!mounted) return;
                // Parse nested JSON fields that may arrive as strings
                const parsed: any = {};
                try { parsed.family = (data as any).family; } catch {}
                try { parsed.variant = (data as any).variant; } catch {}
                try {
                    let dp = (data as any).design_points;
                    if (typeof dp === 'string') dp = JSON.parse(dp);
                    parsed.design_points = dp || null;
                } catch { parsed.design_points = null; }
                try {
                    let hm = (data as any).hotspot_map;
                    if (typeof hm === 'string') hm = JSON.parse(hm);
                    parsed.hotspot_map = hm || {};
                } catch { parsed.hotspot_map = {}; }
                try {
                    let specs = (data as any).specs;
                    if (typeof specs === 'string') specs = JSON.parse(specs);
                    parsed.specs = specs || {};
                } catch { parsed.specs = {}; }
                setDesign(parsed);
                const map = (parsed.hotspot_map) || {};
                setHotspots(map);
                // fetch threshold config for this asset
                try {
                    const { data: tcfg } = await supabase.from('threshold_configs').select('*').eq('asset_id', assetId).maybeSingle();
                    if (mounted) setThresholds(tcfg || null);
                } catch (e) { console.warn('Failed to load threshold configs', e); }
            } catch (e) {
                console.error('Failed to load turbine_designs:', e);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [assetId]);

    const fetchLatestTelemetry = async () => {
        if (!assetId) return;
        try {
            const { data: latest } = await supabase
                .from('dynamic_sensor_data')
                .select('*')
                .eq('asset_id', assetId)
                .order('timestamp', { ascending: false })
                .limit(1)
                .single();
            setLatestTelemetry(latest || null);
        } catch (e) {
            console.error('Failed to fetch telemetry:', e);
        }
    };

    useEffect(() => {
        if (!assetId) return;
        const unsubscribe = subscribeLatestSensor(assetId, (payload) => {
            setLatestTelemetry(payload);
        });
        // initial fetch
        fetchLatestTelemetry();
        return () => unsubscribe();
    }, [assetId]);

    // Global click handler: allow any element with `data-hotspot-id` to open the hotspot panel
    useEffect(() => {
        const handler = (ev: MouseEvent) => {
            try {
                const target = ev.target as HTMLElement | null;
                if (!target) return;
                const el = target.closest('[data-hotspot-id]') as HTMLElement | null;
                if (!el) return;
                const id = el.getAttribute('data-hotspot-id');
                if (id) setSelectedHotspot(id);
            } catch (e) { /* ignore */ }
        };
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, []);

    // Verify inventory: expected hotspot ids added by instrumentation
    useEffect(() => {
        if (!design) return;
        const expected = [
            'shaft', 'wicket_gates', 'spiral_case', 'runner', 'draft_tube', 'seal_package', 'upper_guide_bearing'
        ];
        // add runner blades
        for (let i = 1; i <= 12; i++) expected.push(`runner_blade_${i}`);
        const missing = expected.filter(id => !(id in (design?.hotspot_map || {})));
        if (missing.length > 0) console.warn('Missing hotspot_map entries for expected instrumented ids:', missing);
    }, [design]);

    // When a hotspot is selected, fetch related telemetry_logs and compute aging
    useEffect(() => {
        let mounted = true;
        async function loadDiagnostics() {
            if (!assetId || !selectedHotspot) return;
            const mapped = hotspots[selectedHotspot];
            try {
                // fetch recent logs that reference this part/hotspot
                const { data: logs } = await supabase
                    .from('telemetry_logs')
                    .select('*')
                    .eq('asset_id', assetId)
                    .or(`details->>part_id.eq.${mapped}, details->>hotspot_key.eq.${selectedHotspot}`)
                    .order('created_at', { ascending: false })
                    .limit(20);
                if (!mounted) return;
                setHotspotLogs(logs || []);

                // fetch recent sensor telemetry to form a telemetry window
                const { data: sensorSamples } = await supabase
                    .from('dynamic_sensor_data')
                    .select('*')
                    .eq('asset_id', assetId)
                    .order('timestamp', { ascending: false })
                    .limit(200);
                const telemetryWindow = (sensorSamples || []).map((s: any) => ({
                    eta: s.efficiency ?? undefined,
                    output_power: s.output_power,
                    francis_data: s.francis_data
                }));

                // fetch expert curve for this design
                const expertCurve = await fetchExpertCurve(assetId, (design as any)?.family, (design as any)?.variant);

                // fetch hydrology_context for asset's plant (if available)
                try {
                    const plantId = selectedAsset?.plant_id;
                    if (plantId) {
                        const { data: hc } = await supabase.from('hydrology_context').select('*').eq('plant_id', plantId).single();
                        if (mounted) setHydrologyContext(hc || null);
                    }
                } catch (e) { console.warn('Failed to load hydrology_context', e); }

                setExpertCurveState(expertCurve || null);

                const result = evaluateAging(telemetryWindow, (design as any)?.design_points?.design_eta, { design_flow_cms: (design as any)?.specs?.design_flow_cms, gross_head_m: (design as any)?.specs?.gross_head_m }, expertCurve);
                if (!mounted) return;
                setHotspotAging(result);

                // highlight DOM elements matching hotspot
                try {
                    document.querySelectorAll('[data-hotspot-id].francis-selected').forEach(el => el.classList.remove('francis-selected'));
                    const els = Array.from(document.querySelectorAll(`[data-hotspot-id="${selectedHotspot}"]`));
                    els.forEach((el: any) => el.classList.add('francis-selected'));
                } catch (e) { /* ignore DOM errors in SSR */ }
            } catch (e) {
                console.error('Failed to load hotspot diagnostics', e);
            }
        }
        loadDiagnostics();
        return () => { mounted = false; };
    }, [selectedHotspot, assetId, hotspots, design]);

    const computeEta = (telemetry: any) => {
        try {
            if (!telemetry) return new Decimal(0);
            // Expect output_power in kW or W; try to handle both
            let P = telemetry.output_power ?? telemetry.power ?? telemetry.francis_data?.output_power;
            if (P == null) return new Decimal(0);
            let Pd = new Decimal(P);
            // Heuristic: if > 1e4 assume W
            if (Pd.greaterThan(10000)) Pd = Pd.dividedBy(1000);
            // Now Pd is kW; convert to W
            const P_W = Pd.times(1000);
            const Q = telemetry.francis_data?.flowRate ?? telemetry.flow ?? telemetry.Q_m3s ?? 0;
            const H = telemetry.francis_data?.head ?? telemetry.H_m ?? telemetry.head ?? 0;
            const Qd = new Decimal(Q || 0);
            const Hd = new Decimal(H || 0);
            if (Qd.lte(0) || Hd.lte(0)) return new Decimal(0);
            const denom = RHO.times(G).times(Qd).times(Hd);
            const eta = P_W.dividedBy(denom);
            if (!eta.isFinite() || eta.lte(0)) return new Decimal(0);
            return Decimal.min(eta, new Decimal(1));
        } catch (e) {
            console.error('Eta compute error', e);
            return new Decimal(0);
        }
    };

    const eta = computeEta(latestTelemetry);

    // Guidance for specific hotspots
    const HOTSPOT_GUIDANCE: Record<string, string> = {
        shaft: 'Main mechanical linkage between the runner and generator. Monitor vibration spectral analysis for 1x frequency peaks in telemetry_logs. Excessive vibration accelerates fatigue—keep levels within expert_knowledge limits for 50+ year asset life.',
        wicket_gates: 'Vanes regulating flow and direction. Asymmetric gate positioning or mechanical play causes turbulence and runner cavitation. Operating outside optimal expert_efficiency_curves triggers the Aging Meter and reduces long-term efficiency η.'
    };

    const interpolateOptimalEta = (curve: any, q: number) => {
        try {
            if (!curve || !Array.isArray(curve.points) || curve.points.length === 0) return null;
            const pts = curve.points.slice().sort((a: any,b: any)=>a.q-b.q);
            if (q <= pts[0].q) return pts[0].eta;
            for (let i=0;i<pts.length-1;i++){
                const a = pts[i], b = pts[i+1];
                if (q >= a.q && q <= b.q) {
                    const t = (q - a.q) / (b.q - a.q);
                    return a.eta + t * (b.eta - a.eta);
                }
            }
            return pts[pts.length-1].eta;
        } catch (e) { return null; }
    };

    // Diagnostic advisory logic
    const advisory = (() => {
        if (!latestTelemetry) return null;
        const vib = Number(latestTelemetry.vibration ?? latestTelemetry.francis_data?.stay_ring_vibration ?? 0);
        const temp = Number(latestTelemetry.temperature ?? latestTelemetry.francis_data?.temperature ?? 0);
        const q = Number(latestTelemetry.francis_data?.flowRate ?? latestTelemetry.flow ?? 0);
        const opt = expertCurveState ? interpolateOptimalEta(expertCurveState, q) : null;
        const optimalEtaVal = opt ?? (design?.calculations?.design_eta ?? 1);
        const etaVal = eta.toNumber();
        const dev = optimalEtaVal - etaVal; // fraction
        const vibThresh = thresholds?.vibration_mm_s ?? 4.5;
        const tempThresh = thresholds?.temperature_c ?? 105;
        const effThresh = thresholds?.efficiency_deviation_pct ?? 0.015;
        const exceeds = (vib > vibThresh) || (temp > tempThresh) || (dev > effThresh);
        if (!exceeds) return null;
        const parts: string[] = [];
        if (vib > vibThresh) parts.push(`Vibration ${vib.toFixed(2)} mm/s (threshold ${vibThresh})`);
        if (temp > tempThresh) parts.push(`Temperature ${temp.toFixed(1)}°C (threshold ${tempThresh})`);
        if (dev > effThresh) parts.push(`Efficiency Δ ${(dev*100).toFixed(2)}% (threshold ${(effThresh*100).toFixed(2)}%)`);
        return { message: parts.join(' • ') };
    })();

    return (
        <div className="p-6 bg-[#071017] rounded border border-slate-800">
            <h2 className="text-xl font-bold mb-3">Francis — Horizontal &lt;5MW</h2>
            {loading && <div className="text-sm text-slate-400">Loading design...</div>}
            {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <h3 className="font-semibold mb-2">Hotspots</h3>
                        {Object.keys(hotspots).length === 0 && <div className="text-sm text-slate-500">No hotspot_map defined for this asset.</div>}
                        <ul className="space-y-2">
                            {Object.entries(hotspots).map(([key, val]) => (
                                <li key={key}>
                                    <button
                                        onClick={() => setSelectedHotspot(key)}
                                        className={`w-full text-left px-3 py-2 rounded border ${selectedHotspot === key ? 'border-cyan-500 bg-black/5' : 'border-transparent hover:border-white/10'}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm">{key}</div>
                                            <div className="text-xs text-slate-400">{String(val)}</div>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="md:col-span-2">
                        <h3 className="font-semibold mb-2">Telemetry Snapshot</h3>
                        <div className="bg-black/5 p-4 rounded border border-slate-800">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs text-slate-400">Instantaneous Efficiency (η)</div>
                                    <div className="text-2xl font-mono text-green-400">{eta.times(100).toFixed(2)}%</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-400">Efficiency Formula</div>
                                    <div className="text-sm text-slate-200 font-mono">η = P / (ρ · g · Q · H)</div>
                                    <div className="text-xs text-slate-400 mt-1">ρ=1000 kg/m³, g=9.80665 m/s²</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-400">Latest Timestamp</div>
                                    <div className="text-sm">{latestTelemetry?.timestamp ? new Date(latestTelemetry.timestamp).toLocaleString() : '—'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-400">Output Power (kW)</div>
                                    <div className="text-sm">{(latestTelemetry?.output_power ? String(latestTelemetry.output_power) : '—')}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-400">Flow (m³/s)</div>
                                    <div className="text-sm">{(latestTelemetry?.francis_data?.flowRate ?? '—')}</div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="text-xs text-slate-400">Aging Meter</div>
                                <div className="mt-2 w-full bg-slate-900 rounded h-3 overflow-hidden">
                                    {/* Simple aging heuristic: lower eta => higher aging */}
                                    <div className={`h-3 bg-gradient-to-r ${eta.greaterThan(0.85) ? 'from-emerald-500 to-green-400' : eta.greaterThan(0.7) ? 'from-yellow-500 to-yellow-400' : 'from-red-600 to-red-400'}`} style={{ width: `${100 - eta.times(100).toNumber()}%` }} />
                                </div>
                                <div className="text-xs text-slate-400 mt-2">Lower value indicates higher cumulative aging pressure.</div>
                            </div>

                            <div className="mt-4 text-sm text-slate-200">
                                {selectedHotspot ? (
                                    <>
                                                {/* Part-specific guidance */}
                                                {HOTSPOT_GUIDANCE[selectedHotspot] && (
                                                    <div className="mt-2 p-3 bg-slate-900/30 rounded border border-slate-800 text-sm text-slate-200">
                                                        <div className="font-semibold">Engineering Guidance</div>
                                                        <div className="mt-1 text-xs">{HOTSPOT_GUIDANCE[selectedHotspot]}</div>
                                                    </div>
                                                )}

                                                {/* Hydrology + optimal eta comparison */}
                                                <div className="mt-3 p-3 bg-black/10 rounded border border-slate-800 text-sm text-slate-300">
                                                    <div className="text-xs text-slate-400">Hydrology</div>
                                                    <div className="text-xs text-slate-300">Head: {hydrologyContext?.gross_head_m ?? design?.specs?.gross_head_m ?? '—'} m</div>
                                                    <div className="text-xs text-slate-300">Design Flow: {hydrologyContext?.design_flow_cms ?? design?.specs?.design_flow_cms ?? '—'} m³/s</div>
                                                    <div className="mt-2 text-xs text-slate-400">Optimal η (expert curve)</div>
                                                    <div className="font-mono text-sm text-white">
                                                        {(() => {
                                                            const q = Number(latestTelemetry?.francis_data?.flowRate ?? latestTelemetry?.flow ?? 0);
                                                            const opt = expertCurveState ? interpolateOptimalEta(expertCurveState, q) : null;
                                                            const optStr = opt == null ? '—' : `${(opt*100).toFixed(2)}%`;
                                                            const dev = (opt != null && eta) ? ((eta.toNumber() - opt) * 100).toFixed(2) + '%' : '—';
                                                            return `${optStr} (Δ ${dev})`;
                                                        })()}
                                                    </div>
                                                </div>
                                        <div className="font-semibold">Selected: {selectedHotspot}</div>
                                        <div className="text-slate-400 text-xs mt-1">Linked DB id: {String(hotspots[selectedHotspot])}</div>
                                        <div className="mt-3 flex items-center gap-2">
                                            <button onClick={fetchLatestTelemetry} className="px-3 py-1 bg-slate-700 rounded">Refresh Telemetry</button>
                                            {hotspotAging && (
                                                <div className="text-sm ml-2">
                                                    <div className="text-xs text-slate-400">Aging Warning</div>
                                                    <div className={`font-black ${hotspotAging.warningLevel === 'CRITICAL' ? 'text-red-400' : hotspotAging.warningLevel === 'WARNING' ? 'text-amber-400' : 'text-emerald-400'}`}>{hotspotAging.warningLevel}</div>
                                                </div>
                                            )}
                                        </div>

                                        {hotspotAging && (
                                            <div className="mt-3 text-xs text-slate-300">
                                                <div className="font-semibold">Summary</div>
                                                <div className="mt-1">{hotspotAging.explanation}</div>
                                            </div>
                                        )}

                                        {hotspotLogs && hotspotLogs.length > 0 && (
                                            <div className="mt-3">
                                                <div className="text-xs text-slate-400 font-semibold mb-1">Recent Events</div>
                                                <ul className="text-xs text-slate-300 space-y-1 max-h-36 overflow-auto">
                                                    {hotspotLogs.map((l: any) => (
                                                        <li key={l.id} className="border-b border-white/5 py-1">
                                                            <div className="text-xs text-slate-400">{new Date(l.created_at).toLocaleString()} — {l.severity}</div>
                                                            <div className="text-[11px] text-slate-200">{JSON.stringify(l.details)}</div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-slate-400">Select a hotspot to view part mapping and guidance.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {advisory && <DiagnosticAdvisory title="Diagnostic Advisory" message={advisory.message} />}
        </div>
    );
};

export default FrancisHorizontal5MW;
