// Visual Inspection Service
// Simulates Gemini Vision API for analyzing turbine blade surface conditions

export type DamageType = 'CAVITATION' | 'SAND_ABRASION' | 'PITTING' | 'CRACK' | 'NORMAL';

export interface DamageZone {
    id: string;
    type: DamageType;
    severity: number; // 0-1 (1 = Breach)
    rect: { x: number; y: number; w: number; h: number }; // Relative coordinates 0-1
    description: string;
}

export interface InspectionResult {
    imageId: string;
    timestamp: number;
    detectedDamage: DamageZone[];
    estimatedEfficiencyLoss: number; // Percentage points (e.g. 1.2%)
    recommendations: string[];
    aiConfidence: number;
}

export class VisualInspectionService {

    /**
     * Analyze blade image using simulated Gemini Vision
     */
    static async analyzeImage(imageFile: File): Promise<InspectionResult> {
        return new Promise((resolve) => {
            // Simulate API latency
            setTimeout(() => {
                // Simulated logic: generate semi-random results for demo
                // In production, this would `POST` to a backend wrapping Gemini Pro Vision

                const isClean = Math.random() > 0.7;

                const damage: DamageZone[] = [];
                let effLoss = 0;
                const recs = [];

                if (!isClean) {
                    // 1. Cavitation on Trailing Edge
                    // Logic from Intelligence Guard: Porous + Sharp Edges = Cavitation
                    damage.push({
                        id: 'dmg-1',
                        type: 'CAVITATION',
                        severity: 0.85,
                        rect: { x: 0.6, y: 0.4, w: 0.2, h: 0.3 },
                        description: 'Texture Analysis: "Swiss-cheese" (Porous). Action: Check Tailwater Level & Vacuum.'
                    });
                    effLoss += 0.8;
                    recs.push('Inspect runner clearance immediately.');
                    recs.push('Check tailwater level consistency.');

                    // 2. Sand Abrasion on Leading Edge
                    if (Math.random() > 0.5) {
                        // Logic from Intelligence Guard: Smooth/Polished = Erosion
                        damage.push({
                            id: 'dmg-2',
                            type: 'SAND_ABRASION',
                            severity: 0.60,
                            rect: { x: 0.2, y: 0.2, w: 0.15, h: 0.5 },
                            description: 'Texture Analysis: "Polished Surface". Action: Check Desilter/Filters.'
                        });
                        effLoss += 0.5;
                        recs.push('Apply HVOF coating during next overhaul.');
                    }
                }

                resolve({
                    imageId: `img-${Date.now()}`,
                    timestamp: Date.now(),
                    detectedDamage: damage,
                    estimatedEfficiencyLoss: parseFloat(effLoss.toFixed(2)),
                    recommendations: recs.length > 0 ? recs : ['Surface condition excellent. No action required.'],
                    aiConfidence: 0.94
                });

            }, 2500); // 2.5s typical model latency
        });
    }

    /**
     * Calculate roughness equivalent
     * Converts visual severity to estimated hydraulic roughness (k_s)
     */
    static estimateHydraulicRoughness(severity: number, type: DamageType): string {
        if (type === 'NORMAL') return '0.005 mm (Polished)';

        // Roughness increases exponentially with damage severity
        const ks = 0.05 * Math.exp(severity * 4); // Fake physics formula
        return `${ks.toFixed(2)} mm`;
    }
}
