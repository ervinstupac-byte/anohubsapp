import { RCAResult } from '../automation/RCAService';

// Types for the Executive Report
export interface ExecutiveMetrics {
    fleetHealthScore: number; // 0-100
    totalAvoidedCost: number; // EUR
    activeAlerts: number;
    efficiencyGain: number; // % vs Industry Avg
}

export interface CEOInsight {
    id: string;
    unitId: string;
    message: string;
    value: number; // EUR saved
    timestamp: string;
}

export class ExecutiveReportService {

    // CONSTANTS: Financial Models for "Avoided Costs"
    private COST_MODELS = {
        'Dynamic Shaft Misalignment': 12500, // Bearing replacement + 2 days downtime
        'Structural Looseness / Anchor Failure': 45000, // Re-grouting + 5 days downtime
        'Hydraulic Cavitation (Gravel Noise)': 28000, // Runner repair (welding)
        'Stray Flux / EDM': 8500, // Bearing insulation kit
        'Efficiency Drift': 150000 // Annualized revenue loss for 1% drift on 100MW
    };

    /**
     * Calculates the overall health of the fleet based on detected faults and efficiency.
     */
    public calculateFleetHealth(fleetData: any[]): number {
        // Mock logic: Start at 100, deduct for every active fault / drift
        let score = 100;

        fleetData.forEach(unit => {
            if (unit.status === 'DRIFT_WARNING') score -= 15;
            if (unit.status === 'ATTENTION') score -= 5;
            // Add more logic here connecting to detections
        });

        return Math.max(0, score);
    }

    /**
     * Estimates the detected value of the Sovereign System.
     * In a real app, this would sum up all "Resolve" actions in the history.
     * Here we simulate it based on current active diagnostics.
     */
    public estimateAvoidedCost(diagnoses: RCAResult[]): number {
        let total = 0;
        diagnoses.forEach(d => {
            const cost = this.COST_MODELS[d.cause as keyof typeof this.COST_MODELS] || 5000;
            total += cost;
        });
        return total;
    }

    /**
     * The AI Copywriter: Writes succinct updates for the C-Suite.
     */
    public generateCEOInsights(fleetData: any[], diagnoses: RCAResult[]): CEOInsight[] {
        const insights: CEOInsight[] = [];

        // 1. Scan for Drift Resolutions (Efficiency Wins)
        const perfectUnits = fleetData.filter(u => u.status === 'BORN_PERFECT' || u.status === 'OPTIMAL');
        if (perfectUnits.length > 3) {
            insights.push({
                id: 'INS-001',
                unitId: 'FLEET',
                message: `Fleet efficiency is tracking 2.1% above industry average due to strict 'Hydraulic Trap' enforcement.`,
                value: 450000, // Mock annualized value
                timestamp: new Date().toISOString()
            });
        }

        // 2. Scan for Specific Interventions
        diagnoses.forEach(d => {
            if (d.severity === 'CRITICAL' || d.severity === 'WARNING') {
                const cost = this.COST_MODELS[d.cause as keyof typeof this.COST_MODELS] || 5000;
                insights.push({
                    id: `INS-${Date.now()}`,
                    unitId: 'UNIT-01', // Mock mapping
                    message: `Early detection of ${d.cause} prevented potential forced outage.`,
                    value: cost,
                    timestamp: new Date().toISOString()
                });
            }
        });

        return insights;
    }
}
