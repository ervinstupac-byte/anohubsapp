import { RunnerMaterial } from '../../models/TurbineSpecifics';

export type MilestoneStatus = 'LOCKED' | 'PENDING' | 'PASS' | 'FAIL';

export interface MilestoneResult {
    success: boolean;
    message: string;
    werkmeisterTip?: string;
}

export interface CommissioningState {
    alignment: {
        plumbnessDeviation: number; // mm/m
        reshimmed: boolean;
    };
    bearings: {
        clearanceTop: number;
        clearanceBottom: number;
        clearanceLeft: number;
        clearanceRight: number;
        asperityDetected: boolean;
    };
    metallurgy: {
        runnerMaterial: RunnerMaterial;
        ceramicCoatingApplied: boolean;
        coatingThicknessMicrons?: number;
    };
    hydraulic: {
        guideVaneGapTopAvg: number; // mm
        guideVaneGapBottomAvg: number; // mm
        qualityViolation?: boolean; // NC-160: The Mark of Shame
    };
    electrical: {
        insulationResistance: number; // MOhm
        stabilizationTimeSeconds: number;
    };
}

export class WizardService {

    // --- GATEKEEPER 1: ALIGNMENT (The Laser Gate) ---
    static validateAlignment(data: CommissioningState['alignment']): MilestoneResult {
        if (data.plumbnessDeviation > 0.05) {
            return {
                success: false,
                message: `Deviation ${data.plumbnessDeviation}mm exceeds Architect's Standard (0.05mm).`,
                werkmeisterTip: "Re-shim the thrust bracket. Do not rely on thermal growth to 'fix' this."
            };
        }
        return {
            success: true,
            message: "Alignment within Tolerance. Laser verification accepted.",
            werkmeisterTip: "Torque anchor bolts in star pattern to maintain this precision."
        };
    }

    // --- GATEKEEPER 2: BEARINGS (The Feeler Gauge Gate) ---
    static validateBearings(data: CommissioningState['bearings']): MilestoneResult {
        if (data.asperityDetected) {
            return {
                success: false,
                message: "Babbitt Asperity Detected.",
                werkmeisterTip: "Do not scrape. Inspect for transport damage or debris. Resurfacing required."
            };
        }

        // Check for variation > 0.05mm usually indicates ovality or offset
        const values = [data.clearanceTop, data.clearanceBottom, data.clearanceLeft, data.clearanceRight];
        const min = Math.min(...values);
        const max = Math.max(...values);

        if ((max - min) > 0.05) {
            return {
                success: false,
                message: "Clearance Asymmetry > 0.05mm.",
                werkmeisterTip: "Check centering of the shaft in the seal housing before locking the bearing."
            };
        }

        return {
            success: true,
            message: "Bearing clearances symmetric and clean.",
            werkmeisterTip: "Ensure oil level covers the probe before rotation."
        };
    }

    // --- GATEKEEPER 3: METALLURGY (The Ceramic Gate) ---
    static validateMetallurgy(data: CommissioningState['metallurgy']): MilestoneResult {
        const isSoft = data.runnerMaterial === 'Cast Steel' || data.runnerMaterial === 'Bronze';

        if (isSoft && !data.ceramicCoatingApplied) {
            return {
                success: false,
                message: "Carbon/Soft Steel Runner requires Protection.",
                werkmeisterTip: "Without ceramic coating, this runner will pit within 18 months. Schedule application."
            };
        }

        if (data.ceramicCoatingApplied && (data.coatingThicknessMicrons || 0) < 300) {
            return {
                success: false,
                message: "Insufficient Coating Thickness.",
                werkmeisterTip: "Target 300-500 microns for HVOF coating."
            };
        }

        return {
            success: true,
            message: "Metallurgical Protection Verified.",
            werkmeisterTip: "Log the coating batch number in the maintenance log."
        };
    }

    // --- GATEKEEPER 4: ELECTRICAL (The Megger Gate) ---
    static validateElectrical(data: CommissioningState['electrical']): MilestoneResult {
        if (data.insulationResistance < 100) { // 100 MOhm
            return {
                success: false,
                message: "Insulation Resistance too low (<100 MΩ).",
                werkmeisterTip: "Check for moisture in the heater terminal box."
            };
        }

        if (data.stabilizationTimeSeconds < 60) {
            return {
                success: false,
                message: "Stabilization check incomplete.",
                werkmeisterTip: "Hold voltage for full 60 seconds to discharge capacitance."
            };
        }

        return {
            success: true,
            message: "Insulation Integrity Confirmed.",
            werkmeisterTip: "Disconnect Megger before touching terminals."
        };
    }

    // --- GATEKEEPER 5: HYDRAULIC TIGHTNESS (The Trap Question) ---
    static validateHydraulic(data: CommissioningState['hydraulic']): MilestoneResult {
        const asymmetry = Math.abs(data.guideVaneGapTopAvg - data.guideVaneGapBottomAvg);

        if (asymmetry > 0.05) {
            return {
                success: false,
                message: `Hydraulic Asymmetry Detected (${asymmetry.toFixed(2)}mm).`,
                werkmeisterTip: "This gap difference will leak revenue forever. Re-adjust the link rods now."
            };
        }

        return {
            success: true,
            message: "Hydraulic System Tight and Symmetric.",
            werkmeisterTip: "Verify servomotor stroke matches the scale."
        };
    }

    static generateCertificate(state: CommissioningState): string {
        const qualityFlag = state.hydraulic.qualityViolation ? "** QUALITY VIOLATION LOGGED **" : "BORN PERFECT";

        return `
SOVEREIGN SYSTEMS // COMMISSIONING CERTIFICATE
------------------------------------------------
UNIT STATUS: ${qualityFlag}
TIMESTAMP: ${new Date().toISOString()}

1. ALIGNMENT
   - Plumbness: ${state.alignment.plumbnessDeviation} mm (PASS)
   
2. BEARINGS
   - Avg Clearance: ${((state.bearings.clearanceTop + state.bearings.clearanceBottom) / 2).toFixed(3)} mm
   - Asperity: NONE

3. METALLURGY
   - Material: ${state.metallurgy.runnerMaterial}
   - Protection: ${state.metallurgy.ceramicCoatingApplied ? 'CERAMIC ARMORED' : 'STANDARD'}

4. ELECTRICAL
   - IR: ${state.electrical.insulationResistance} MΩ
   - Stability: ${state.electrical.stabilizationTimeSeconds}s Verified

5. HYDRAULIC
   - Top Gap: ${state.hydraulic.guideVaneGapTopAvg} mm
   - Bottom Gap: ${state.hydraulic.guideVaneGapBottomAvg} mm
   ${state.hydraulic.qualityViolation ? '- WARNING: Asymmetric Drift Accepted (FORCED)' : '- Symmetry: PERFECT'}

SIGNED: MONOLIT ARCHITECT // NC-150-160
------------------------------------------------
        `.trim();
    }
}
