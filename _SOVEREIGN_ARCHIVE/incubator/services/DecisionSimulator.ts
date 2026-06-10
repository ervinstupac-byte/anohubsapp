/**
 * DECISION SIMULATOR
 * The What-If Engine 🔮🏗️
 * Simulates operational choices to weigh Profit vs. Asset Damage.
 */

import { FatigueProfitLink } from './FatigueProfitLink';

export interface SimulationResult {
    scenario: string;
    revenueGain: number;
    fatigueCost: number;
    netProfit: number;
    recommendation: 'PROCEED' | 'CAUTION' | 'ABORT';
    details: string;
}

export class DecisionSimulator {
    private fatigueLink: FatigueProfitLink;

    constructor() {
        this.fatigueLink = new FatigueProfitLink();
    }

    /**
     * SIMULATE SCENARIO
     * Runs the math for a "What-If".
     */
    simulateScenario(type: 'OVERLOAD_110' | 'IGNORE_SAND_WARNING', durationDays: number): SimulationResult {
        let revenue = 0;
        let damagePoints = 0;
        let damageCost = 0;
        let details = '';

        if (type === 'OVERLOAD_110') {
            // Gain: Extra 10% power per day
            // Assume 100MW base -> +10MW. €80/MWh.
            const extraMw = 10;
            const price = 80;
            revenue = extraMw * 24 * durationDays * price;

            // Pain: Fatigue accrues 5x faster due to thermal/stress
            // Normal: 1 pt/day? Overload: 5 pts/day
            damagePoints = 5 * durationDays;
            damageCost = this.fatigueLink.calculateDamageCost(damagePoints);

            // Risk of trip (add probabilistic cost? - Keep simple for now)
            details = `Running at 110% generates extra €${revenue.toLocaleString()}, but ages the machine by ${damagePoints} points (€${damageCost}).`;
        }

        if (type === 'IGNORE_SAND_WARNING') {
            // Gain: Avoid shutdown for 2 days (Assume 50MW lost if stopped)
            revenue = 50 * 24 * durationDays * 80;

            // Pain: Sand Monster eats the runner. 
            // High erosion = Huge refurbishment cost equivalent
            // Let's say it eats 0.5mm -> 10% of life -> 1000 points
            damagePoints = 1000 * durationDays; // Hypothetical massive damage
            damageCost = this.fatigueLink.calculateDamageCost(damagePoints);

            details = `Ignoring Sand Warning keeps €${revenue.toLocaleString()} revenue, but causes severe erosion (€${damageCost} damage).`;
        }

        const net = revenue - damageCost;
        let rec: SimulationResult['recommendation'] = 'PROCEED';
        if (net < 0) rec = 'ABORT';
        else if (damageCost > revenue * 0.5) rec = 'CAUTION'; // High damage ratio

        return {
            scenario: type,
            revenueGain: revenue,
            fatigueCost: damageCost,
            netProfit: net,
            recommendation: rec,
            details
        };
    }
}
