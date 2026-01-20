import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../../services/supabaseClient';

const START_YEAR = 2025;
const END_YEAR = 2075;

export default function CenturyROIChart({ assetId, pricePerKwh = 0.08 }: { assetId?: string | number, pricePerKwh?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      // Fetch century_plans and asset_financials_with_eta
      try {
        const { data: cp } = await supabase.from('century_plans').select('asset_id, input_json, projections').limit(10);
        const { data: af } = await supabase.from('asset_financials_with_eta').select('*');

        // Try to build year-series from century_plans projections if available
        let yearSeries: any[] = [];
        if (cp && cp.length > 0) {
          // Prefer plan matching assetId
          const plan = assetId ? cp.find((p: any) => String(p.asset_id) === String(assetId)) : cp[0];
          if (plan && plan.projections) {
            // Assume projections is an array of { year, cumulative_profit, asset_book_value, total_investment, net_position }
            yearSeries = (plan.projections && Array.isArray(plan.projections)) ? plan.projections : [];
          }
        }

        // If no century plan projections, fall back to constructing a synthetic series
        if (yearSeries.length === 0) {
          // Use asset_financials_with_eta to seed an initial yearly profit/loss
          const seedLoss = (af && af.length > 0) ? af.reduce((acc: number, r: any) => acc + Number(r.computed_loss_cost || 0), 0) : 0;
          // If computed_loss_cost was calculated for a base price of 0.08, scale to selected price
          const basePrice = 0.08;
          const adjustedSeedLoss = seedLoss * (pricePerKwh / basePrice);
          let cumulative = 0;
          let bookValue = 1000000; // default starting book value
          yearSeries = [];
          for (let y = START_YEAR; y <= END_YEAR; y++) {
            // simple model: annual profit = -adjustedSeedLoss (loss reduces profit), escalate by 1% inflation
            const annual = -adjustedSeedLoss * Math.pow(1.01, y - START_YEAR);
            cumulative += annual;
            // linear depreciation to zero over 50 years
            const years = END_YEAR - START_YEAR + 1;
            const asset_book_value = Math.max(0, bookValue * (1 - (y - START_YEAR) / years));
            yearSeries.push({ year: y, cumulative_profit: cumulative, asset_book_value, total_investment: bookValue, net_position: cumulative - (bookValue - asset_book_value) });
          }
        }

        if (!cancelled) setData(yearSeries);
      } catch (e) {
        console.error('Failed to build century ROI data', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [assetId]);

  useEffect(() => {
    if (!data || data.length === 0) return;
    let cancelled = false;
    (async () => {
      const d3: any = await import('d3');
      if (cancelled) return;
      const element = ref.current;
      if (!element) return;
      element.innerHTML = '';

      const margin = { top: 20, right: 30, bottom: 50, left: 60 };
      const width = 800 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      const svg = d3.select(element)
        .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
        .append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);

      const x = d3.scaleTime()
        .domain(d3.extent(data, (d: any) => new Date(d.year, 0, 1)))
        .range([0, width]);

      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(10));

      const y = d3.scaleLinear()
        .domain([d3.min(data, (d: any) => d.net_position), d3.max(data, (d: any) => d.cumulative_profit) * 1.1])
        .range([height, 0]);

      svg.append('g')
        .call(d3.axisLeft(y).tickFormat((n: any) => d3.format('.2s')(n)));

      const lineProfit = d3.line()
        .x((d: any) => x(new Date(d.year, 0, 1)))
        .y((d: any) => y(d.cumulative_profit))
        .curve(d3.curveMonotoneX);

      svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#10b981')
        .attr('stroke-width', 3)
        .attr('d', lineProfit as any);

      const lineAssetValue = d3.line()
        .x((d: any) => x(new Date(d.year, 0, 1)))
        .y((d: any) => y(d.asset_book_value))
        .curve(d3.curveStepAfter);

      svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('d', lineAssetValue as any);

      const breakEven = data.find((d: any) => d.cumulative_profit >= d.total_investment);
      if (breakEven) {
        svg.append('circle')
          .attr('cx', x(new Date(breakEven.year, 0, 1)))
          .attr('cy', y(breakEven.cumulative_profit))
          .attr('r', 6)
          .attr('fill', '#ef4444');

        svg.append('text')
          .attr('x', x(new Date(breakEven.year, 0, 1)) + 10)
          .attr('y', y(breakEven.cumulative_profit) - 10)
          .text(`ROI: ${breakEven.year}`)
          .style('font-size', '12px');
      }

    })();
    return () => { cancelled = true; };
  }, [data]);

  if (loading) return <div>Loading Century ROI Chart...</div>;
  return (
    <div>
      <h3>Century ROI Chart (2025–2075)</h3>
      <div ref={ref} />
    </div>
  );
}
