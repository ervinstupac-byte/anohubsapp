
export interface CalculationResult {
    powerKW: number;
    powerMW: number;
    specificSpeed: number; // nq (metric)
    recommendedType: 'PELTON' | 'FRANCIS' | 'KAPLAN';
    suitabilityScore: number; // 0-100%
    warnings: string[];
}

export const PhysicsGuardrailService = {
    // Constants
    GRAVITY: 9.81,
    DENSITY: 1000, // kg/m3

    /**
     * Calculate Hydraulic Power
     * P = rho * g * Q * H * eta
     * @param flow Flow in m3/s
     * @param head Net Head in meters
     * @param efficiency Decimal (e.g. 0.90)
     * @returns Power in kW
     */
    calculatePower: (flow: number, head: number, efficiency: number = 0.90): number => {
        return 1000 * 9.81 * flow * head * efficiency / 1000; // Result in kW
    },

    /**
     * Calculate Specific Speed (Metric)
     * nq = n * sqrt(P) / H^1.25
     * @param rpm Rotational Speed
     * @param powerKW Power in kW
     * @param head Head in meters
     */
    calculateSpecificSpeed: (rpm: number, powerKW: number, head: number): number => {
        if (head <= 0) return 0;
        return (rpm * Math.sqrt(powerKW)) / Math.pow(head, 1.25);
    },

    /**
     * Recommend Turbine Type based on nq and Head
     * @param nq Specific Speed
     * @param head Head in meters
     */
    recommendTurbine: (nq: number, head: number): CalculationResult['recommendedType'] => {
        if (nq < 50) return 'PELTON'; // Low nq, High Head
        if (nq > 250) return 'KAPLAN'; // High nq, Low Head
        return 'FRANCIS'; // The versatile middle ground
    },

    /**
     * Full Analysis
     */
    analyze: (flow: number, head: number, rpm: number): CalculationResult => {
        const powerKW = PhysicsGuardrailService.calculatePower(flow, head);
        const nq = PhysicsGuardrailService.calculateSpecificSpeed(rpm, powerKW, head);

        let recommendedType: 'PELTON' | 'FRANCIS' | 'KAPLAN' = 'FRANCIS';
        const warnings: string[] = [];

        // Logic refined by "The Guide to Hydropower" (ESHA/USBR)
        if (head > 400 && nq < 50) recommendedType = 'PELTON';
        else if (head > 50 && head <= 400) {
            if (nq < 70) recommendedType = 'PELTON'; // Crossover zone
            else recommendedType = 'FRANCIS';
        }
        else if (head <= 50) {
            if (nq > 250) recommendedType = 'KAPLAN';
            else recommendedType = 'FRANCIS';
        }

        // Refined bounds for simple nq check
        // Can override above based on nq dominance if needed, but Head is critical constraint
        // Let's stick to the nq-primary logic for consistency with user request
        if (nq < 20) warnings.push("Speed too low for standard runners (Risk: Huge Runner Diameter)");
        if (nq > 1000) warnings.push("Specific speed excessive (Risk: Cavitation)");

        return {
            powerKW,
            powerMW: powerKW / 1000,
            specificSpeed: nq,
            recommendedType,
            suitabilityScore: 100, // Placeholder for more complex logic
            warnings
        };
    }
};
