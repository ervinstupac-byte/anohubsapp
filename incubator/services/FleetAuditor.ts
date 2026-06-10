/**
 * FleetAuditor.ts
 * 
 * Fleet persona audit service
 * Maps turbine models to assets and identifies coverage gaps
 */

import { TurbineType } from './TurbinePhysicsOptimizer';
import { FleetAsset } from './FleetOrchestrator';

export interface AssetPersona {
    assetId: string;
    name: string;
    turbineType: TurbineType;
    turbineModel: string;
    capacity: number;
    operationalHours: number;
    currentLoad: number;
    healthStatus: 'OPTIMAL' | 'MONITORING' | 'DEGRADED' | 'CRITICAL';
    heff: number;
    hasSpecializedModel: boolean;
    painPoints: PainPoint[];
}

export interface PainPoint {
    issue: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    vetoCount: number;
    rcaCount: number;
    description: string;
    mitigation: string;
}

export interface FleetAuditReport {
    timestamp: number;
    totalUnits: number;
    modelCoverage: {
        covered: number;
        total: number;
        percentage: number;
    };
    assets: AssetPersona[];
    modelGaps: string[];
    recommendations: string[];
}

export class FleetAuditor {

    /**
     * Generate comprehensive fleet status report
     */
    public static generateFleetReport(): FleetAuditReport {
        // In production: Query from database
        // SELECT * FROM fleet_assets JOIN operator_feedback ON ...

        const assets: AssetPersona[] = [
            // UNIT-1: Francis
            {
                assetId: 'UNIT-1',
                name: 'HE Zakučac - Agregat 1',
                turbineType: TurbineType.FRANCIS,
                turbineModel: 'Rade Končar 1985',
                capacity: 50,
                operationalHours: 187420,
                currentLoad: 42,
                healthStatus: 'OPTIMAL',
                heff: 0.93,
                hasSpecializedModel: true,
                painPoints: [
                    {
                        issue: 'Draft tube vortex at part load',
                        severity: 'MEDIUM',
                        vetoCount: 15,
                        rcaCount: 8,
                        description: 'Vortex rope at 45-65% load, Rheingans frequency 1.8-2.2 Hz',
                        mitigation: 'Auto air injection active, operator prefers manual at 55% load'
                    }
                ]
            },

            // UNIT-3: Kaplan with servo issues
            {
                assetId: 'UNIT-3',
                name: 'HE Peruća - Kaplan 1',
                turbineType: TurbineType.KAPLAN,
                turbineModel: 'Voith Hydro 1968',
                capacity: 40,
                operationalHours: 412890,
                currentLoad: 35,
                healthStatus: 'DEGRADED',
                heff: 0.89,
                hasSpecializedModel: true,
                painPoints: [
                    {
                        issue: 'Conjugate curve deviation',
                        severity: 'CRITICAL',
                        vetoCount: 23,
                        rcaCount: 12,
                        description: 'Efficiency gap 1.8% (€280k/year loss), servo backlash 2.1°',
                        mitigation: 'Servo replacement scheduled Q2 2026'
                    }
                ]
            },

            // UNIT-5: Pelton
            {
                assetId: 'UNIT-5',
                name: 'HE Senj - Pelton 1',
                turbineType: TurbineType.PELTON,
                turbineModel: 'Litostroj 1978',
                capacity: 35,
                operationalHours: 358700,
                currentLoad: 30,
                healthStatus: 'MONITORING',
                heff: 0.90,
                hasSpecializedModel: true,
                painPoints: [
                    {
                        issue: 'Nozzle #3 water hammer',
                        severity: 'HIGH',
                        vetoCount: 11,
                        rcaCount: 11,
                        description: 'Pressure surges 32 bar, needle sticking',
                        mitigation: 'Auto-reduced closing rate to 4 mm/s, maintenance Q1 2026'
                    }
                ]
            },

            // UNIT-6: Banki-Michell - NO MODEL
            {
                assetId: 'UNIT-6',
                name: 'HE Lešće - Banki-Michell 1',
                turbineType: TurbineType.UNKNOWN,
                turbineModel: 'Local 1992',
                capacity: 25,
                operationalHours: 201400,
                currentLoad: 18,
                healthStatus: 'CRITICAL',
                heff: 0.85,
                hasSpecializedModel: false,
                painPoints: [
                    {
                        issue: 'No specialized model available',
                        severity: 'CRITICAL',
                        vetoCount: 18,
                        rcaCount: 0,
                        description: 'Banki-Michell turbine not covered by physics optimizers',
                        mitigation: 'Generic monitoring only - develop BankiMichellOptimizer'
                    }
                ]
            }
        ];

        const totalUnits = assets.length;
        const covered = assets.filter(a => a.hasSpecializedModel).length;
        const modelGaps = assets
            .filter(a => !a.hasSpecializedModel)
            .map(a => `${a.name} (${a.turbineType})`);

        const recommendations = this.generateRecommendations(assets);

        return {
            timestamp: Date.now(),
            totalUnits,
            modelCoverage: {
                covered,
                total: totalUnits,
                percentage: (covered / totalUnits) * 100
            },
            assets,
            modelGaps,
            recommendations
        };
    }

    /**
     * Generate actionable recommendations
     */
    private static generateRecommendations(assets: AssetPersona[]): string[] {
        const recommendations: string[] = [];

        // Check for model gaps
        const uncovered = assets.filter(a => !a.hasSpecializedModel);
        if (uncovered.length > 0) {
            recommendations.push(
                `CRITICAL: Develop physics models for ${uncovered.length} uncovered unit(s): ${uncovered.map(u => u.assetId).join(', ')}`
            );
        }

        // Check for critical pain points
        for (const asset of assets) {
            const critical = asset.painPoints.filter(p => p.severity === 'CRITICAL');
            if (critical.length > 0) {
                recommendations.push(
                    `${asset.assetId}: Address ${critical.length} critical issue(s) - ${critical[0].description}`
                );
            }
        }

        // Check for low efficiency
        const lowEfficiency = assets.filter(a => a.heff < 0.90);
        if (lowEfficiency.length > 0) {
            recommendations.push(
                `Efficiency review needed for: ${lowEfficiency.map(a => `${a.assetId} (${(a.heff * 100).toFixed(0)}%)`).join(', ')}`
            );
        }

        return recommendations;
    }

    /**
     * Identify model coverage by turbine type
     */
    public static getModelCoverageByType(): Map<TurbineType, { total: number; covered: number }> {
        const report = this.generateFleetReport();
        const coverage = new Map<TurbineType, { total: number; covered: number }>();

        for (const asset of report.assets) {
            const existing = coverage.get(asset.turbineType) || { total: 0, covered: 0 };
            existing.total++;
            if (asset.hasSpecializedModel) existing.covered++;
            coverage.set(asset.turbineType, existing);
        }

        return coverage;
    }
}
