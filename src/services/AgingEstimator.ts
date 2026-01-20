import Decimal from 'decimal.js';
import { supabase } from './supabaseClient';

export type AgingResult = {
    agingScore: number; // 0-100 heuristic
    warningLevel: 'OK' | 'NOTICE' | 'WARNING' | 'CRITICAL';
    explanation: string;
    professionalReasons?: string[];
    fiftyYearGuidance?: string;
};

// Helper: compute eta from a telemetry sample using the canonical invariant
export function computeEtaFromSample(s: any): Decimal {
    try {
        if (!s) return new Decimal(0);
        const P = s.output_power ?? s.power ?? (s.francis_data && s.francis_data.output_power) ?? 0;
        let Pd = new Decimal(P || 0);
        if (Pd.greaterThan(10000)) Pd = Pd.dividedBy(1000);
        const P_W = Pd.times(1000);
        const Q = (s.francis_data && (s.francis_data.flow || s.francis_data.flowRate)) ?? s.flow ?? s.Q ?? 0;
        const H = (s.francis_data && (s.francis_data.head || s.francis_data.GrossHead)) ?? s.H ?? s.head ?? 0;
        const Qd = new Decimal(Q || 0);
        const Hd = new Decimal(H || 0);
        if (Qd.lte(0) || Hd.lte(0)) return new Decimal(0);
        const rho = new Decimal(1000);
        const g = new Decimal(9.80665);
        const eta = P_W.dividedBy(rho.times(g).times(Qd).times(Hd));
        if (!eta.isFinite() || eta.lte(0)) return new Decimal(0);
        return Decimal.min(eta, new Decimal(1));
    } catch (e) {
        return new Decimal(0);
    }
}

// Fetch canonical efficiency curve for an asset (by variant/family)
export async function fetchExpertCurve(assetId: number, family?: string, variant?: string) {
    try {
        if (variant) {
            const { data: vdata } = await supabase.from('expert_efficiency_curves').select('id, curve_json, created_at').eq('turbine_variant', variant).order('created_at', { ascending: false }).limit(1).single();
            if (vdata) return vdata.curve_json || null;
        }
        if (family) {
            const { data: fdata } = await supabase.from('expert_efficiency_curves').select('id, curve_json, created_at').eq('asset_family', family).order('created_at', { ascending: false }).limit(1).single();
            if (fdata) return fdata.curve_json || null;
        }
        return null;
    } catch (e) {
        console.error('fetchExpertCurve error', e);
        return null;
    }
}

function linearInterpolate(x0: number, y0: number, x1: number, y1: number, x: number) {
    if (x1 === x0) return y0;
    return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
}

export function matchOptimalEta(telemetryWindow: any[], expertCurve: { points: Array<{ q: number; eta: number }> } | null) {
    if (!expertCurve || !Array.isArray(expertCurve.points) || expertCurve.points.length === 0) return { meanDevPct: null, rmsDevPct: null, mappingCount: 0 };
    const points = expertCurve.points.slice().sort((a, b) => a.q - b.q);
    const deviations: number[] = [];
    for (const s of telemetryWindow) {
        const q = Number((s.francis_data && (s.francis_data.flow || s.francis_data.flowRate)) ?? s.flow ?? s.Q ?? 0);
        const observedEta = Number(s.eta ?? s.efficiency ?? computeEtaFromSample(s).toNumber());
        if (!q || !observedEta) continue;
        let p0 = points[0];
        let p1 = points[points.length - 1];
        for (let i = 0; i < points.length - 1; i++) {
            if (q >= points[i].q && q <= points[i + 1].q) {
                p0 = points[i];
                p1 = points[i + 1];
                break;
            }
        }
        const expectedEta = q <= points[0].q ? points[0].eta : q >= points[points.length - 1].q ? points[points.length - 1].eta : linearInterpolate(p0.q, p0.eta, p1.q, p1.eta, q);
        if (!expectedEta || expectedEta <= 0) continue;
        const devPct = (expectedEta - observedEta) / expectedEta * 100;
        deviations.push(devPct);
    }
    if (deviations.length === 0) return { meanDevPct: null, rmsDevPct: null, mappingCount: 0 };
    const mean = deviations.reduce((a, b) => a + b, 0) / deviations.length;
    const rms = Math.sqrt(deviations.reduce((a, b) => a + b * b, 0) / deviations.length);
    return { meanDevPct: mean, rmsDevPct: rms, mappingCount: deviations.length };
}

export function evaluateAging(telemetryWindow: any[], designEta?: number, context?: { design_flow_cms?: number; gross_head_m?: number }, expertCurve?: { points: Array<{ q: number; eta: number }> } | null) : AgingResult {
    if (!telemetryWindow || telemetryWindow.length === 0) {
        return { agingScore: 0, warningLevel: 'OK', explanation: 'No telemetry available' };
    }

    const etas: Decimal[] = telemetryWindow.map(s => {
        if (s.eta) return new Decimal(s.eta);
        if (s.efficiency) return new Decimal(s.efficiency);
        return computeEtaFromSample(s);
    });

    const valid = etas.filter(e => e.isFinite() && e.greaterThan(0));
    if (valid.length === 0) return { agingScore: 0, warningLevel: 'OK', explanation: 'Insufficient valid efficiency samples' };

    const meanEta = valid.reduce((acc, v) => acc.plus(v), new Decimal(0)).dividedBy(valid.length);
    const meanEtaPercent = meanEta.times(100).toNumber();

    let dev = 0;
    let curveInfo: any = null;
    if (expertCurve) {
        const match = matchOptimalEta(telemetryWindow, expertCurve);
        if (match.mappingCount && match.meanDevPct != null) {
            dev = Math.max(0, match.meanDevPct);
            curveInfo = match;
        }
    }

    if (!curveInfo) {
        if (designEta) {
            try {
                const design = new Decimal(designEta);
                dev = Math.max(0, design.minus(meanEta).times(100).toNumber());
            } catch (e) {
                dev = Math.max(0, 92 - meanEtaPercent);
            }
        } else {
            dev = Math.max(0, 92 - meanEtaPercent);
        }
    }

    const reasons: string[] = [];

    try {
        const flows = telemetryWindow.map(s => {
            const f = (s.francis_data && (s.francis_data.flow || s.francis_data.flowRate)) ?? s.flow ?? s.Q ?? 0;
            return Number(f) || 0;
        }).filter(n => n > 0);
        if (flows.length > 0 && context?.design_flow_cms) {
            const meanFlow = flows.reduce((a,b) => a + b, 0) / flows.length;
            const ratio = meanFlow / (context.design_flow_cms || 1);
            if (ratio < 0.6) reasons.push('Operating at part-load (flow < 60% of design) — efficiency and cavitation risk increase.');
            else if (ratio < 0.9) reasons.push('Operating below design flow (partial loading) — efficiency reduced.');
            else reasons.push('Flow near design — loading is appropriate.');
        }
    } catch (e) {}

    try {
        const heads = telemetryWindow.map(s => {
            const h = (s.francis_data && (s.francis_data.head || s.francis_data.GrossHead)) ?? s.H ?? s.head ?? 0;
            return Number(h) || 0;
        }).filter(n => n > 0);
        if (heads.length > 0 && context?.gross_head_m) {
            const meanHead = heads.reduce((a,b) => a + b, 0) / heads.length;
            const ratioH = meanHead / (context.gross_head_m || 1);
            if (ratioH < 0.8) reasons.push('Head mismatch — actual head below design, shifting operating point and reducing η.');
        }
    } catch (e) {}

    try {
        const vibSamples = telemetryWindow.map(s => (s.francis_data && (s.francis_data.stay_ring_vibration || s.francis_data.vibration)) ?? s.vibration ?? 0).filter(n => Number(n) > 0);
        if (vibSamples.length > 0) {
            const meanVib = vibSamples.reduce((a,b) => a + Number(b), 0) / vibSamples.length;
            if (meanVib > 4.0) reasons.push('Elevated vibration — mechanical fatigue risk increases; fatigue shortens operational lifetime.');
            else if (meanVib > 1.5) reasons.push('Mild vibration observed — monitor for trend.');
        }
    } catch (e) {}

    const agingScore = Math.min(100, Math.round(dev * 1.5));
    let warningLevel: AgingResult['warningLevel'] = 'OK';
    if (agingScore >= 60) warningLevel = 'CRITICAL';
    else if (agingScore >= 30) warningLevel = 'WARNING';
    else if (agingScore >= 10) warningLevel = 'NOTICE';

    const explanationParts: string[] = [];
    explanationParts.push(`Mean η = ${meanEta.times(100).toFixed(2)}%. Deviation: ${dev.toFixed(2)}%.`);
    if (curveInfo) explanationParts.push(`Deviation computed against expert curve (n=${curveInfo.mappingCount}).`);
    if (reasons.length) explanationParts.push(...reasons);
    if (agingScore >= 60) explanationParts.push('Action: Consider load redistribution or planned outage to inspect for cavitation and runner damage.');
    else if (agingScore >= 30) explanationParts.push('Action: Monitor closely and schedule inspection if trend continues.');

    const explanation = explanationParts.join(' ');
    const fiftyYearGuidance = 'Sustained off-design operation, cavitation, and elevated vibration materially reduce remaining life; corrective action and inspections extend life toward 50+ years.';

    return { agingScore, warningLevel, explanation, professionalReasons: reasons, fiftyYearGuidance };
}

// Compute monetary loss per hour given actual and optimal eta, power (kW), and price (currency per kWh)
export function computeRevenueLoss(actualEta: number | string | Decimal, optimalEta: number | string | Decimal, powerKw: number, pricePerKwh: number) {
    try {
        const a = new Decimal((actualEta as any) ?? 0);
        const o = new Decimal((optimalEta as any) ?? 0);
        const p = new Decimal(powerKw || 0);
        const price = new Decimal(pricePerKwh || 0);
        const delta = Decimal.max(o.minus(a), new Decimal(0));
        const loss = delta.times(p).times(price);
        return loss;
    } catch (e) {
        return new Decimal(0);
    }
}

// Estimate annual degradation rate (fraction per year) from telemetry samples.
export function estimateAnnualDegradationRate(telemetryWindow: any[]) : Decimal {
    try {
        const points: Array<{t:number, y:number}> = [];
        for (const s of telemetryWindow) {
            const eta = (s.eta ?? s.efficiency ?? null);
            const ts = s.ts ?? s.timestamp ?? s.time ?? s.t ?? null;
            if (eta == null) continue;
            let tnum: number | null = null;
            if (typeof ts === 'number') tnum = ts;
            else if (typeof ts === 'string') {
                const d = Date.parse(ts);
                if (!isNaN(d)) tnum = d;
            }
            if (!tnum) continue;
            points.push({ t: tnum, y: Number(eta) });
        }
        if (points.length < 2) return new Decimal(0);
        const n = points.length;
        const meanT = points.reduce((a,b)=>a+b.t,0)/n;
        const meanY = points.reduce((a,b)=>a+b.y,0)/n;
        let num = 0, den = 0;
        for (const p of points) {
            const dt = p.t - meanT;
            num += dt * (p.y - meanY);
            den += dt * dt;
        }
        if (den === 0) return new Decimal(0);
        const slope = num / den; // eta change per millisecond
        const msPerYear = 1000 * 60 * 60 * 24 * 365;
        const annualSlope = slope * msPerYear; // change in eta (fraction) per year
        return new Decimal(annualSlope);
    } catch (e) {
        return new Decimal(0);
    }
}
