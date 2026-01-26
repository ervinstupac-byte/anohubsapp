import React, { useState, useEffect, useRef } from 'react';
import Decimal from 'decimal.js';
import { supabase } from '../../services/supabaseClient';
import { useAssetContext } from '../../contexts/AssetContext';
import { subscribeLatestSensor } from '../../hooks/useTelemetrySubscription';
import { evaluateAging } from '../../services/AgingEstimator';

const RHO = new Decimal(1000); // kg/m^3
const G = new Decimal(9.80665); // m/s^2

export interface SimulatorInputs {
    P_kw?: number; // power in kW
    Q_m3s?: number; // flow in m^3/s
    H_m?: number; // head in m
}

const HydroschoolSimulator: React.FC = () => {
    const { selectedAsset } = useAssetContext();
    const assetId = selectedAsset?.id;

    const [P_kw, setP_kw] = useState<number>(1000); // kW (manual override)
    const [Q, setQ] = useState<number>(10); // m3/s
    const [H, setH] = useState<number>(15); // m
    const [designEta, setDesignEta] = useState<number | null>(null);
    const [telemetryWindow, setTelemetryWindow] = useState<any[]>([]);
    const telemetryRef = useRef<any[]>([]);
    const [agingResult, setAgingResult] = useState<any>(null);
    const [hydroContext, setHydroContext] = useState<any>(null);

    // Load hydrology_context and designEta from DB when asset changes
    useEffect(() => {
        if (!assetId) return;
        let mounted = true;
        (async () => {
            try {
                const plantId = (selectedAsset as any)?.specs?.plant_id || (selectedAsset as any)?.plantId || (selectedAsset as any)?.plant_id;
                if (plantId) {
                    const { data: hc } = await supabase.from('hydrology_context').select('*').eq('plant_id', plantId).single();
                    if (mounted) setHydroContext(hc || null);
                }

                const { data: design } = await supabase
                    .from('turbine_designs')
                    .select("parameters->>family as family, parameters->>variant as variant, parameters->'design_points' as design_points")
                    .eq('asset_id', assetId)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();
                if (mounted && design) {
                    let dp = (design as any).design_points;
                    try {
                        if (typeof dp === 'string') dp = JSON.parse(dp);
                    } catch (err) { dp = dp; }
                    if (dp?.design_eta) setDesignEta(Number(dp.design_eta));
                }
            } catch (e) {
                console.error('Hydroschool load error', e);
            }
        })();
        return () => { mounted = false; };
    }, [assetId, selectedAsset]);

    // helper: fetch last N telemetry samples from dynamic_sensor_data and telemetry_logs
    const fetchLatestTelemetry = async () => {
        if (!assetId) return;
        try {
            // pull dynamic sensor data
            const { data: sensorData } = await supabase
                .from('dynamic_sensor_data')
                .select('*')
                .eq('asset_id', assetId)
                .order('timestamp', { ascending: false })
                .limit(60);

            // also pull recent telemetry_logs and map `details` JSONB into telemetry-like samples
            const { data: logRows } = await supabase
                .from('telemetry_logs')
                .select('*')
                .eq('asset_id', assetId)
                .order('created_at', { ascending: false })
                .limit(60);

            const sensorSamples = (sensorData || []).map((s: any) => ({ timestamp: s.timestamp, output_power: s.output_power, francis_data: s.francis_data, efficiency: s.efficiency }));
            const logSamples = (logRows || []).map((r: any) => {
                const d = r.details || {};
                return {
                    timestamp: r.created_at,
                    output_power: d.output_power ?? d.power ?? undefined,
                    francis_data: d.francis_data ?? d,
                    efficiency: d.efficiency ?? undefined
                };
            });

            // merge lists preferring sensorSamples first then logSamples, truncate to 60
            const merged = sensorSamples.concat(logSamples).slice(0, 60);
            telemetryRef.current = merged;
            setTelemetryWindow([...telemetryRef.current]);

            const result = evaluateAging(telemetryRef.current.map(s => ({ eta: s.efficiency ?? undefined, output_power: s.output_power, francis_data: s.francis_data })), designEta ?? undefined, hydroContext ?? undefined);
            setAgingResult(result);
        } catch (e) {
            console.error('Failed to fetch telemetry for hydroschool', e);
        }
    };

    // Subscribe to realtime telemetry and update aging
    useEffect(() => {
        if (!assetId) return;
        const unsubscribe = subscribeLatestSensor(assetId, (payload) => {
            const sample = {
                timestamp: payload.timestamp || new Date().toISOString(),
                output_power: payload.output_power ?? payload.output ?? payload.francis_data?.output_power,
                francis_data: payload.francis_data || payload.specialized || {},
                efficiency: payload.efficiency ?? payload.efficiency
            };
            telemetryRef.current = [sample].concat(telemetryRef.current).slice(0, 60);
            setTelemetryWindow([...telemetryRef.current]);
            const result = evaluateAging(telemetryRef.current.map(s => ({ eta: s.efficiency ?? undefined, output_power: s.output_power, francis_data: s.francis_data })), designEta ?? undefined, hydroContext ?? undefined);
            setAgingResult(result);
        });
        fetchLatestTelemetry();
        return () => unsubscribe();
    }, [assetId, designEta]);

    const computeEta = (Pk?: number, Qm?: number, Hm?: number) => {
        try {
            const P_W = new Decimal((Pk ?? P_kw)).times(1000); // kW -> W
            const Qd = new Decimal((Qm ?? Q));
            const Hd = new Decimal((Hm ?? H));
            if (Qd.lte(0) || Hd.lte(0)) return new Decimal(0);
            const denom = RHO.times(G).times(Qd).times(Hd);
            const eta = P_W.dividedBy(denom);
            // Clamp to [0,1]
            if (!eta.isFinite() || eta.lte(0)) return new Decimal(0);
            return Decimal.min(eta, new Decimal(1));
        } catch (e) {
            return new Decimal(0);
        }
    };

    const eta = computeEta();

    // Derived diagnostics for UI explanations
    const computeDiagnostics = () => {
        try {
            const flows = telemetryWindow.map(s => ((s.francis_data && (s.francis_data.flow || s.francis_data.flowRate)) ?? s.flow ?? s.Q) || 0).filter(n => n > 0);
            const heads = telemetryWindow.map(s => ((s.francis_data && (s.francis_data.head || s.francis_data.GrossHead)) ?? s.H ?? s.head) || 0).filter(n => n > 0);
            const vibs = telemetryWindow.map(s => ((s.francis_data && (s.francis_data.stay_ring_vibration || s.francis_data.vibration)) ?? s.vibration) || 0).filter(n => n > 0);

            const meanFlow = flows.length ? flows.reduce((a,b) => a + b, 0) / flows.length : null;
            const meanHead = heads.length ? heads.reduce((a,b) => a + b, 0) / heads.length : null;
            const meanVib = vibs.length ? vibs.reduce((a,b) => a + Number(b), 0) / vibs.length : null;

            const items: string[] = [];
            if (meanFlow !== null && hydroContext?.design_flow_cms) {
                const ratio = meanFlow / hydroContext.design_flow_cms;
                if (ratio < 0.6) items.push('Part-load operation — mean flow < 60% of design. Runner sees off-design loading; cavitation and runner wear accelerate.');
                else if (ratio < 0.9) items.push('Below-design flow — turbine operates off-optimum, reducing efficiency.');
                else items.push('Flow near design — loading is appropriate.');
            }

            if (meanHead !== null && hydroContext?.gross_head_m) {
                const ratioH = meanHead / hydroContext.gross_head_m;
                if (ratioH < 0.8) items.push('Head mismatch — actual head below design, shifting operating point and reducing η.');
            }

            if (meanVib !== null) {
                if (meanVib > 4.0) items.push('Elevated vibration — mechanical fatigue risk increases; fatigue shortens operational lifetime.');
                else if (meanVib > 1.5) items.push('Mild vibration observed — monitor for trend.');
            }

            return items;
        } catch (e) {
            return [];
        }
    };

    const diagItems = computeDiagnostics();

    return (
        <div className="bg-[#07101a] p-6 rounded border border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <label className="flex flex-col">
                    <span className="text-slate-300 text-sm">Power (kW)</span>
                    <input type="number" value={P_kw} onChange={e => setP_kw(Number(e.target.value))} className="mt-1 p-2 bg-[#02111a] border border-slate-700 rounded text-slate-100" />
                </label>
                <label className="flex flex-col">
                    <span className="text-slate-300 text-sm">Flow Q (m³/s)</span>
                    <input type="number" value={Q} onChange={e => setQ(Number(e.target.value))} className="mt-1 p-2 bg-[#02111a] border border-slate-700 rounded text-slate-100" />
                </label>
                <label className="flex flex-col">
                    <span className="text-slate-300 text-sm">Head H (m)</span>
                    <input type="number" value={H} onChange={e => setH(Number(e.target.value))} className="mt-1 p-2 bg-[#02111a] border border-slate-700 rounded text-slate-100" />
                </label>

                <div className="col-span-1 md:col-span-1">
                    <div className="text-slate-300">Instantaneous Efficiency (η)</div>
                    <div className="text-3xl font-mono text-green-400">{eta.times(100).toFixed(2)}%</div>
                    <div className="text-slate-400 text-sm mt-1">Formula: η = P / (ρ·g·Q·H) — using ρ=1000 kg/m³, g=9.80665 m/s²</div>
                    <div className="mt-2 text-sm text-slate-300">
                        <div>Calculation (live):</div>
                        <div className="font-mono text-xs text-slate-200 mt-1">P = {P_kw} kW ({new Decimal(P_kw).times(1000).toFixed(0)} W)</div>
                        <div className="font-mono text-xs text-slate-200">Q = {Q} m³/s · H = {H} m</div>
                        <div className="font-mono text-xs text-slate-200">η = {`P / (ρ·g·Q·H)`} = {eta.toFixed(4)}</div>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-slate-300 text-sm">50-year preservation note</div>
                    <div className="mt-2 text-slate-200 max-w-sm">Persistent operation outside the optimal efficiency band accelerates wear. Hydroschool can connect to live telemetry and compute aging pressure.</div>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-2">
                    <div className="text-slate-300 text-sm mb-2">Hydrology Context</div>
                    <div className="p-4 bg-black/5 rounded border border-slate-800 text-sm text-slate-300">
                        {hydroContext ? (
                            <div>
                                <div>Gross head: {hydroContext.gross_head_m} m</div>
                                <div>Design flow: {hydroContext.design_flow_cms} m³/s</div>
                            </div>
                        ) : (
                            <div>No hydrology context loaded for this plant.</div>
                        )}
                    </div>
                </div>
                <div className="col-span-1">
                    <div className="text-slate-300 text-sm mb-2">Aging Meter</div>
                    <div className="p-4 bg-black/5 rounded border border-slate-800">
                        <div className="text-xs text-slate-400">Status</div>
                        <div className="text-2xl font-mono text-white mt-2">{agingResult ? agingResult.warningLevel : '—'}</div>
                        <div className="text-xs text-slate-400 mt-2">{agingResult ? agingResult.explanation : 'No telemetry yet'}</div>
                        {diagItems.length > 0 && (
                            <div className="mt-3 text-sm text-slate-200">
                                <div className="text-xs text-amber-200 font-bold">Why this matters for 50-year preservation:</div>
                                <ul className="list-disc list-inside mt-2 text-slate-200">
                                    {diagItems.map((it, i) => <li key={i}>{it}</li>)}
                                </ul>
                            </div>
                        )}
                        {agingResult && (
                            <div className="mt-3 text-xs text-slate-300">
                                <strong>50-year vision:</strong> These indicators determine whether the machine can meet a 50+ year service life — sustained off-design operation, cavitation, or elevated vibration materially reduce remaining life.
                            </div>
                        )}
                        <div className="mt-3 w-full bg-slate-900 rounded h-3 overflow-hidden">
                            <div className="h-3 bg-gradient-to-r from-red-600 to-yellow-400" style={{ width: `${agingResult ? Math.min(100, agingResult.agingScore) : 0}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 text-slate-400 text-sm">Note: DB-driven mode requires Supabase credentials. Live mode connects to `dynamic_sensor_data` for this asset.</div>
        </div>
    );
};

export default HydroschoolSimulator;
