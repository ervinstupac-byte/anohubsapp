
import { TechnicalProjectState } from '../models/TechnicalSchema';

export const PhysicsEngine = {
    recalculateProjectPhysics: (state: TechnicalProjectState): TechnicalProjectState => {
        // 1. Calculate Power: P = ρ * g * H * Q * η
        // Note: ρ (density) is assumed 1000 kg/m^3, result in Watts, usually needed in MW so / 1e6
        // The user provided formula: P = 9.81 * H * Q * efficiency. 
        // Assuming efficiency is 0-1 or 0-100? Context usually implies 0-1 for math, but let's check input.
        // If efficiency is like '90', then /100. If '0.9', then keep. 
        // User's previous code in KaplanEngine returned '94', so likely 0-100.
        // However, the strict prompt snippet provided:
        // const power = 9.81 * state.hydraulic.head * state.hydraulic.flow * state.hydraulic.efficiency;
        // We will stick exactly to the User's snippet logic for now. 

        const power = 9.81 * state.hydraulic.head * state.hydraulic.flow * state.hydraulic.efficiency;

        // 2. Determine Risk based on 0.05 mm/m alignment standard
        let risk = 0;
        if (state.mechanical.alignment > 0.05) risk += 30;
        if (state.mechanical.vibration > 5.0) risk += 20;

        return {
            ...state,
            riskScore: Math.min(risk, 100),
            lastRecalculation: new Date().toISOString(),
        };
    },

    calculateSpecificSpeed: (n: number, P: number, H: number): number => {
        // Formula: Ns = (n * sqrt(P)) / (H ^ 1.25)
        return (n * Math.sqrt(P)) / Math.pow(H, 1.25);
    }
};
