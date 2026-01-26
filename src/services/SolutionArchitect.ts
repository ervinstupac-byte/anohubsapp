import { TechnicalProjectState } from '../core/TechnicalSchema';
import { RecoveryAction, RecoveryPath, RevitalizationPlan } from '../models/RepairContext';
import { LifeExtensionEngine } from './LifeExtensionEngine';
import { MITIGATION_LIBRARY } from '../data/mitigationLibrary';
import masterKnowledge from '../knowledge/MasterKnowledgeMap.json';

// Local interface until we centralize MasterKnowledge type
interface MasterKnowledgeMap {
    standardThresholds: {
        goldenStandards: {
            alignment: { ideal: number; failure: number };
            axialPlay: { max: number };
            insulation: { min: number };
            maintenanceCycleHours: number;
        };
        oilChemistry: {
            waterContent: { warning: number };
            tan: { warning: number }
        };
    };
}

// Strictly typed knowledge
const KNOWLEDGE = masterKnowledge as unknown as MasterKnowledgeMap;

export class SolutionArchitect {

    static getRecoveryPath(conclusion: string, state: TechnicalProjectState): RecoveryPath {
        const actions = MITIGATION_LIBRARY[conclusion] || [];

        // Mock remaining life calculation for now
        const Lrem = state.structural.remainingLife / 5; // 100% = 20 years approx
        const sigma_limit = 235; // MPa for S235
        const sigma_current = state.physics.hoopStressMPa || 150;

        let totalReduction = 0;
        actions.forEach(a => {
            totalReduction = Math.max(totalReduction, a.stressReductionFactor);
        });

        const extension = LifeExtensionEngine.calculateLifeExtension(Lrem, sigma_limit, sigma_current, totalReduction);

        return {
            conclusion,
            actions,
            estimatedLifeExtension: extension
        };
    }

    static calculateTotalExtendedLife(state: TechnicalProjectState): number {
        return LifeExtensionEngine.calculateTotalExtendedLife(state);
    }

    static getRevitalizationPlan(state: TechnicalProjectState): RevitalizationPlan[] {
        const roadmap: RevitalizationPlan[] = [];
        const golden = KNOWLEDGE.standardThresholds.goldenStandards;

        // 1. Alignment (THE PRECISION CORE)
        if (state.mechanical.alignment > golden.alignment.ideal) {
            roadmap.push({
                priority: 'HIGH',
                category: 'Mechanical',
                action: 'Re-alignment to 0.05 mm/m',
                impact: 'Eliminates eccentric wear vectors; restores bearing fatigue headroom based on cubic wear law.',
                roiRatio: 22.5,
                isSmallGapHighImpact: true,
                heritageTips: [
                    "Check for Soft Foot (mekani oslonac) before final tightening.",
                    "Use stainless steel shims only; avoid plastic or rusted spacers.",
                    "Verify thermal growth (toplotno širenje) compensation for horizontal Francis units."
                ]
            });
        }

        // 2. Dynamic Balancing
        if (state.mechanical.vibration > 1.1) {
            roadmap.push({
                priority: 'HIGH',
                category: 'Mechanical',
                action: 'In-situ Dynamic Balancing',
                impact: 'Eliminates impulse vibration at source; prevents mechanical stress accumulation.',
                roiRatio: 15.0,
                isSmallGapHighImpact: true
            });
        }

        // 3. Labyrinth / Axial Play Restoration
        if ((state.mechanical.axialPlay || 0) > golden.axialPlay.max) {
            roadmap.push({
                priority: 'HIGH',
                category: 'Mechanical',
                action: 'Labyrinth Clearance Restoration',
                impact: 'Restores volumetric efficiency; reduces parasitic thrust by 15%.',
                roiRatio: 18.0,
                isSmallGapHighImpact: true
            });
        }

        // 4. Stator Cleaning & Megger Audit
        if ((state.mechanical.insulationResistance || 0) < golden.insulation.min) {
            roadmap.push({
                priority: 'HIGH',
                category: 'Electrical',
                action: 'Stator Dry-Out & Cryogenic Cleaning',
                impact: 'Restores insulation to 100 MOhm baseline; prevents electrical flashover.',
                roiRatio: 45.0,
                isSmallGapHighImpact: false
            });
        }

        // 5. Babbitt Bearing Restoration (Heritage Tribology)
        const water = state.identity.fluidIntelligence.oilSystem.waterContentPPM || 0;
        const tan = state.identity.fluidIntelligence.oilSystem.tan || 0;
        if (water > 500 || tan > 0.5) {
            roadmap.push({
                priority: 'CRITICAL',
                category: 'Mechanical',
                action: 'Babbitt Surface Reclamation (Scraping & Blueing)',
                impact: 'Restores 80% bearing contact area; eliminates chemical erosion pits.',
                roiRatio: 35.0,
                isSmallGapHighImpact: true,
                heritageTips: [
                    "Scraping & Blueing: Use Prussian Blue to identify high spots.",
                    "Aim for minimum 15-20 spots per square inch (80% contact).",
                    "Mirror-finish journals to reduce starting friction (dry-friction bypass)."
                ]
            });
        }

        return roadmap.sort((a, b) => b.roiRatio - a.roiRatio);
    }
}
