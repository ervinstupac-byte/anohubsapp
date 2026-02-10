import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { useDiagnostic } from '../../contexts/DiagnosticContext';
import { useAssetContext } from '../../contexts/AssetContext';
// FinancialImpactEngine is heavy (Decimal.js) — import dynamically inside compute to avoid bundling into initial chunks
import { fetchForecastForAsset } from '../../services/DashboardDataService';
import { useInventory } from '../../contexts/InventoryContext';

// CenturyROIChart: Interactive 100-year ROI simulation with price slider and sigma overlay
export const CenturyROIChart: React.FC = () => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const { physics, hydraulic, identity } = useTelemetryStore();
    const { processInstabilitySummary } = useDiagnostic();
    const { selectedAsset } = useAssetContext();

    // slider values in EUR/kWh
    const PRICE_OPTIONS = [0.08, 0.10, 0.15];
    const [price, setPrice] = useState<number>(PRICE_OPTIONS[1]);

    const numericAssetId = selectedAsset ? Number(selectedAsset.id) : null;
    const instability = numericAssetId !== null ? processInstabilitySummary(numericAssetId) : null;
    const sigma = instability ? instability.sigma : 0;
    const [pf, setPf] = useState<number | null>(null);
    const [impactOverride, setImpactOverride] = useState<any | null>(null);

    // compute Pf from telemetry cache using centralized service
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                if (!selectedAsset) return;
                const res = await fetchForecastForAsset(selectedAsset as any);
                if (!mounted) return;
                if (res?.pf !== undefined && res?.pf !== null) setPf(res.pf);
            } catch (e) {
                // ignore
            }
        })();
        return () => { mounted = false; };
    }, [selectedAsset]);

    const { getTotalInventoryValue } = useInventory();

    // Attempt to dynamically load heavier FinancialImpactEngine and compute an impactOverride
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const mod = await import('../../services/core/FinancialImpactEngine');
                if (!mounted) return;
                if (mod && typeof mod.FinancialImpactEngine !== 'undefined') {
                    const fakeState: any = {
                        identity: identity,
                        hydraulic: { ...hydraulic },
                        physics: { ...physics },
                        site: {},
                        demoMode: { active: false },
                        riskScore: 0,
                        structural: { extendedLifeYears: 0 }
                    };
                    const inventoryValue = getTotalInventoryValue();
                    const impact = mod.FinancialImpactEngine.calculateImpact(fakeState, physics as any, { pricePerMWh: price * 1000, sigma, inventoryValue });
                    setImpactOverride(impact);
                }
            } catch (err) {
                // leave override null — fallback used
            }
        })();
        return () => { mounted = false; };
    }, [price, physics, hydraulic, identity, sigma, getTotalInventoryValue]);

    // Build a simulated 100 year cumulative profit series and NPV
    const series = useMemo(() => {
        const years = 100;
        // Prepare a minimal state object expected by the engine
        const fakeState: any = {
            identity: identity,
            hydraulic: { ...hydraulic },
            physics: { ...physics },
            site: {},
            demoMode: { active: false },
            riskScore: 0,
            // ensure defaults expected by engine
            structural: { extendedLifeYears: 0 }
        };

        // engine expects pricePerMWh if override; convert EUR/kWh -> EUR/MWh
        const pricePerMWh = price * 1000;

        // call engine with override and provide diagnostics + inventory for probabilistic model
        const inventoryValue = getTotalInventoryValue();
        const impact: any = impactOverride || { lostRevenueEuro: 0, leakageCostYearly: 0, maintenanceBufferEuro: 0, maintenanceSavingsEuro: 0, expectedMaintenanceCost: 0, lifeExtensionSavings: 0 };

        // Adjust impact using Probability of Failure (pf) if provided: scale expected maintenance cost impact
        const pfFactor = (pf && typeof pf === 'number') ? (pf / 100) : 0;

        // baseline revenue approximation
        const baselinePowerMW = (fakeState.hydraulic?.baselineOutputMW && Number((fakeState.hydraulic as any).baselineOutputMW)) || 5; // fallback
        const baselineAnnualRevenue = baselinePowerMW * 1000 * 24 * 365 * price; // EUR/year

        // annual net is baselineRevenue minus impacts (simplified)
        const annualCosts = (impact.lostRevenueEuro || 0) + (impact.leakageCostYearly || 0) + (impact.maintenanceBufferEuro || 0) - (impact.maintenanceSavingsEuro || 0) + ((impact.expectedMaintenanceCost || 0) * pfFactor);
        const annualNet = baselineAnnualRevenue - annualCosts;

        // distributed life extension savings across first 10 years for simulation
        const lifeExt = impact.lifeExtensionSavings || 0;
        const distributedLifeExt = lifeExt / 10;

        // Discount rate for NPV (use 5% default)
        const discountRate = 0.05;

        const arr: { year: number; cum: number; annual: number; cumNpv: number }[] = [];
        let cum = 0 + lifeExt; // seed with life extension as immediate uplift
        let cumNpv = lifeExt; // year 0 seed (no discount)
        for (let y = 1; y <= years; y++) {
            const ann = annualNet + (y <= 10 ? distributedLifeExt : 0);
            cum += ann;
            // discount the annual cashflow to present value
            const pv = ann / Math.pow(1 + discountRate, y);
            cumNpv += pv;
            arr.push({ year: y, cum, annual: ann, cumNpv });
        }
        return arr;
    }, [price, physics, hydraulic, identity]);

    useEffect(() => {
        if (!containerRef.current) return;

        const w = containerRef.current.clientWidth || 900;
        const h = 360;
        const margin = { top: 20, right: 20, bottom: 30, left: 64 };

        // remove prior svg
        d3.select(containerRef.current).selectAll('svg').remove();

        const svg = d3.select(containerRef.current)
            .append('svg')
            .attr('width', w)
            .attr('height', h)
            .attr('viewBox', `0 0 ${w} ${h}`)
            .style('overflow', 'visible');

        const innerW = w - margin.left - margin.right;
        const innerH = h - margin.top - margin.bottom;

        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scaleLinear().domain([1, 100]).range([0, innerW]);
        const y = d3.scaleLinear().domain(d3.extent(series, d => d.cum) as [number, number]).nice().range([innerH, 0]);

        // Area for instability overlay
        if (sigma > 0.05) {
            g.append('rect')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', innerW)
                .attr('height', innerH)
                .attr('fill', 'rgba(255,200,0,0.06)')
                .attr('class', 'instability-overlay');

            g.append('text')
                .attr('x', innerW - 10)
                .attr('y', 18)
                .attr('text-anchor', 'end')
                .attr('fill', '#b45309')
                .attr('font-size', 12)
                .attr('font-weight', 700)
                .text('Process Instability ⚠︎');
        }

        // axes
        const xAxis = d3.axisBottom(x).ticks(10).tickFormat(d => `${d}`);
        const yAxis = d3.axisLeft(y).ticks(6).tickFormat(d => `${d3.format(',.0f')(d as number)}€`);

        g.append('g').attr('transform', `translate(0,${innerH})`).call(xAxis).append('text');
        g.append('g').call(yAxis);

        // cumulative line
        const line = d3.line<{ year: number; cum: number }>()
            .x(d => x(d.year))
            .y(d => y(d.cum))
            .curve(d3.curveMonotoneX as any);

        g.append('path')
            .datum(series)
            .attr('fill', 'none')
            .attr('stroke', '#06b6d4')
            .attr('stroke-width', 2.5)
            .attr('d', line as any)
            .attr('class', 'cum-line');

        // points
        g.selectAll('.dot')
            .data(series.filter((d, i) => i % 5 === 0))
            .enter()
            .append('circle')
            .attr('cx', d => x(d.year))
            .attr('cy', d => y(d.cum))
            .attr('r', 3)
            .attr('fill', '#06b6d4')
            .attr('opacity', 0.9);

        // Break-even line: first year where cum >= 0
        const breakeven = series.find(d => d.cum >= 0);
        if (breakeven) {
            const bx = x(breakeven.year);
            g.append('line')
                .attr('x1', bx)
                .attr('x2', bx)
                .attr('y1', 0)
                .attr('y2', innerH)
                .attr('stroke', '#10b981')
                .attr('stroke-dasharray', '4 6')
                .attr('stroke-width', 1.5);

            g.append('text')
                .attr('x', bx + 6)
                .attr('y', 14)
                .attr('fill', '#10b981')
                .attr('font-size', 12)
                .text(`Break-even: Year ${breakeven.year}`);
        }

        // footer label
        svg.append('text')
            .attr('x', margin.left)
            .attr('y', h - 6)
            .attr('fill', '#94a3b8')
            .attr('font-size', 11)
            .text(`Price: ${price.toFixed(2)} €/kWh — Projection: 100 years`);

        // responsive resize
        const resize = () => {
            const nw = containerRef.current?.clientWidth || w;
            svg.attr('width', nw);
        };
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, [series, sigma, price]);

    return (
        <div className="p-4 bg-slate-900 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black text-white">Century ROI</h3>
                <div className="flex items-center gap-3">
                    <label className="text-xs text-slate-400">Price (€/kWh)</label>
                    <input
                        type="range"
                        min={PRICE_OPTIONS[0]}
                        max={PRICE_OPTIONS[2]}
                        step={0.01}
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="w-44"
                    />
                    <div className="text-xs text-white font-mono">{price.toFixed(2)} €/kWh</div>
                </div>
            </div>

            <div ref={containerRef} style={{ width: '100%', minHeight: 360 }} />

            {sigma > 0.05 && (
                <div className="mt-3 p-3 rounded bg-amber-500/8 border border-amber-500/20 text-amber-300 text-sm">
                    Process Instability detected (σ={sigma.toFixed(3)}). ROI projections may be unreliable.
                </div>
            )}
        </div>
    );
};

export default CenturyROIChart;
