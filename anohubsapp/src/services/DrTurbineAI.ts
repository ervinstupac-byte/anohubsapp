import { ExpertDiagnosisEngine } from './ExpertDiagnosisEngine';
import { AssetIdentity } from '../types/assetIdentity';
import { DiagnosticResults } from '../types/diagnostics';

export interface ActionCard {
    id: string;
    title: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    message: string;
    actionLabel: string;
    actionFunction: string; // Identifier for the function to call
}

export class DrTurbineAI {
    /**
     * The Master Diagnostic Method
     * Wraps the ExpertEngine and converts technical flags into Action Cards
     */
    static consult(
        asset: AssetIdentity,
        flow: number,
        head: number,
        gridFrequency: number
    ): {
        cards: ActionCard[];
        healthScore: number;
        voiceMessage: string;
    } {
        const cards: ActionCard[] = [];

        // 1. Run the Base Engine
        // Note: Rotor weight and other static params are defaulted for the AI interface if not present
        const diagnostics: DiagnosticResults = ExpertDiagnosisEngine.runDiagnostics(
            asset,
            25, // Ambient Temp (default)
            'OIL',
            50, // Rotor weight
            flow,
            head,
            gridFrequency
        );

        // 2. Parse Specific Rules into Action Cards

        // RULE: Grid Desync
        if (diagnostics.gridRisk?.severity === 'CRITICAL') {
            cards.push({
                id: 'grid-desync',
                title: 'GRID DESYNCHRONIZATION',
                severity: 'CRITICAL',
                message: diagnostics.gridRisk.message,
                actionLabel: 'INITIATE EMERGENCY SHUTDOWN',
                actionFunction: 'emergency_shutdown'
            });
        }

        // RULE: Cavitation (User Specific: Flow 42.5 / Head 152.0)
        // The ExpertEngine now checks this, we just need to surface it UI-wise
        if (diagnostics.cavitationRisk?.severity === 'CRITICAL') {
            cards.push({
                id: 'cavitation-risk',
                title: 'Active Cavitation Detected',
                severity: 'CRITICAL',
                message: diagnostics.cavitationRisk.message,
                actionLabel: 'Generate Work Order: Inspection',
                actionFunction: 'create_work_order_runner'
            });
        }

        // RULE: Thermal
        if (diagnostics.thermalRisk.severity === 'CRITICAL' || diagnostics.thermalRisk.severity === 'HIGH') {
            cards.push({
                id: 'thermal-runaway',
                title: 'Bearing Thermal Runaway',
                severity: diagnostics.thermalRisk.severity,
                message: diagnostics.thermalRisk.description,
                actionLabel: 'Increase Cooling Flow',
                actionFunction: 'adjust_cooling'
            });
        }

        // 3. Calculate Health Score
        const health = ExpertDiagnosisEngine.calculateHealthScore(diagnostics);

        // 4. Generate Voice Message
        let voiceMessage = `System Status: ${health.overall}%. `;
        if (cards.length > 0) {
            voiceMessage += `Alert: ${cards[0].message}`;
        } else {
            voiceMessage += "All nominal.";
        }

        return {
            cards,
            healthScore: health.overall,
            voiceMessage
        };
    }
}
