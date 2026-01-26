/**
 * SPECIALIST'S NOTEBOOK
 * Expert knowledge system for diagnosing cavitation vs erosion damage
 */

// ========================================
// DAMAGE TYPES & CHARACTERISTICS
// ========================================

export enum DamageType {
    CAVITATION = 'CAVITATION',
    EROSION_SAND = 'EROSION_SAND',
    EROSION_SILT = 'EROSION_SILT',
    CORROSION = 'CORROSION',
    FATIGUE_CRACK = 'FATIGUE_CRACK',
    UNKNOWN = 'UNKNOWN'
}

export interface DamageCharacteristics {
    appearance: string;
    location: string;
    texture: string;
    pattern: string;
    color: string;
    depth: string;
    edges: string;
}

/**
 * The Expert Knowledge Base
 * Based on real-world field experience and technical articles
 */
export const DAMAGE_IDENTIFICATION_GUIDE: Record<DamageType, {
    name: string;
    description: string;
    visualCharacteristics: DamageCharacteristics;
    typicalLocations: string[];
    operatingConditions: string[];
    howToDiagnose: string[];
    repairStrategy: RepairStrategy;
}> = {
    [DamageType.CAVITATION]: {
        name: 'Cavitation Damage',
        description: 'Caused by vapor bubbles collapsing on metal surface, creating tiny shock waves that erode material',

        visualCharacteristics: {
            appearance: 'Sponge-like or honeycomb pattern',
            location: 'Low pressure zones - runner outlet, blade suction side',
            texture: 'Rough, pitted surface',
            pattern: 'Clustered pits forming irregular patterns',
            color: 'Shiny metallic at fresh pits, darker in old damaged areas',
            depth: 'Deep craters, can penetrate several millimeters',
            edges: 'Sharp, jagged edges around pits'
        },

        typicalLocations: [
            'Runner blade outlet (low pressure side)',
            'Runner crown near outlet',
            'Runner band trailing edge',
            'Guide vane trailing edge'
        ],

        operatingConditions: [
            'Operating below Best Efficiency Point (BEP)',
            'Low sigma (σ < 0.10)',
            'High head, low flow conditions',
            'Variable load operation',
            'Tailwater level too low'
        ],

        howToDiagnose: [
            '1. Check operating point - is unit running at <70% flow?',
            '2. Calculate sigma - is σ < 0.10?',
            '3. Look for sponge-like pattern with deep pits',
            '4. Check location - is damage on suction side/outlet?',
            '5. Listen for crackling/popping sounds during operation'
        ],

        repairStrategy: {
            immediate: [
                'Reduce load to operate closer to BEP',
                'Increase tailwater level if possible',
                'Monitor vibration trends'
            ],
            shortTerm: [
                'Weld cavitation-resistant stainless steel overlay',
                'Grind and polish damaged areas',
                'Apply epoxy filler for minor pitting'
            ],
            longTerm: [
                'Runner replacement with cavitation-resistant alloy',
                'Hydraulic redesign to improve σ',
                'Install air admission system',
                'Modify operating regime to avoid low-sigma zones'
            ],
            preventive: [
                'Maintain operation within ±15% of BEP flow',
                'Monitor sigma continuously',
                'Regular visual inspections every 6 months',
                'Keep tailwater level optimized'
            ]
        }
    },

    [DamageType.EROSION_SAND]: {
        name: 'Sand Erosion',
        description: 'Caused by hard particles (sand, silt) impacting blade surface at high velocity, gradually wearing away material',

        visualCharacteristics: {
            appearance: 'Smooth, polished wear grooves',
            location: 'High velocity zones - blade pressure side, leading edge',
            texture: 'Mirror-smooth polished surface',
            pattern: 'Streamlined grooves following flow direction',
            color: 'Bright metallic shine (polished by particles)',
            depth: 'Gradual thinning, can reduce blade thickness by 50%+',
            edges: 'Smooth, rounded edges'
        },

        typicalLocations: [
            'Runner blade leading edge (pressure side)',
            'Runner blade pressure surface',
            'Guide vane leading edge',
            'Stay ring facing',
            'Spiral casing tongue'
        ],

        operatingConditions: [
            'River with high sediment load (>500 ppm)',
            'Rainy season / monsoon operation',
            'Operating above 80% flow (high velocity)',
            'Prolonged operation at high load',
            'After upstream flooding/landslides'
        ],

        howToDiagnose: [
            '1. Check water quality - is sediment >200 ppm?',
            '2. Look for smooth, polished grooves',
            '3. Check if damage follows streamlines',
            '4. Inspect leading edges - are they sharp or rounded?',
            '5. Compare to seasonal patterns - worse after monsoon?'
        ],

        repairStrategy: {
            immediate: [
                'Reduce operating hours during high sediment periods',
                'Install/improve sand excluder upstream',
                'Monitor water quality continuously'
            ],
            shortTerm: [
                'Build up worn areas with hard-facing weld overlay',
                'Apply tungsten carbide coating on leading edges',
                'Profile grinding to restore original geometry'
            ],
            longTerm: [
                'Runner replacement with erosion-resistant alloy (13Cr4Ni)',
                'Install upstream settling basin',
                'Upgrade to ceramic-coated blades',
                'Implement seasonal shutdown during monsoon'
            ],
            preventive: [
                'Install automated sand monitoring system',
                'Regular blade thickness measurements',
                'Apply protective coatings annually',
                'Operate at reduced load during high sediment periods'
            ]
        }
    },

    [DamageType.EROSION_SILT]: {
        name: 'Silt Erosion',
        description: 'Similar to sand erosion but caused by finer particles, creates widespread uniform thinning',

        visualCharacteristics: {
            appearance: 'Uniform material loss across large areas',
            location: 'All flow surfaces, especially high-velocity zones',
            texture: 'Matte finish, slightly rough',
            pattern: 'Uniform thinning without distinct grooves',
            color: 'Dull gray finish',
            depth: 'Gradual, uniform thickness reduction',
            edges: 'Rounded, blended edges'
        },

        typicalLocations: [
            'Entire runner blade surfaces',
            'Guide vane surfaces',
            'Labyrinth seal rings',
            'Shaft sleeve'
        ],

        operatingConditions: [
            'Continuous operation in silty water',
            'Glacier-fed rivers (glacial flour)',
            'Year-round high turbidity',
            'Fine particles <0.1mm'
        ],

        howToDiagnose: [
            '1. Check for widespread uniform wear',
            '2. Measure blade thickness - compare to original drawings',
            '3. Examine for dull gray matte finish',
            '4. Check water source - glacial melt or reservoir?',
            '5. Review turbidity records'
        ],

        repairStrategy: {
            immediate: [
                'Accept increased clearances temporarily',
                'Monitor efficiency drop',
                'Inspect every 3 months instead of 6'
            ],
            shortTerm: [
                'Restore blade profile with weld build-up',
                'Apply erosion-resistant coating',
                'Replace severely thinned blades'
            ],
            longTerm: [
                'Complete runner replacement',
                'Upgrade to ceramic matrix composite blades',
                'Install upstream filtration system',
                'Consider alternate turbine design (Pelton less affected)'
            ],
            preventive: [
                'Quarterly blade thickness ultrasonic testing',
                'Annual protective coating renewal',
                'Operate at design point to minimize velocities',
                'Implement water treatment if economically viable'
            ]
        }
    },
    [DamageType.UNKNOWN]: {
        name: 'Unknown Damage',
        description: 'Damage pattern does not match known categories',
        visualCharacteristics: {
            appearance: 'Unclassified',
            location: 'Various',
            texture: 'Variable',
            pattern: 'Irregular',
            color: 'Variable',
            depth: 'Variable',
            edges: 'Variable'
        },
        typicalLocations: [],
        operatingConditions: [],
        howToDiagnose: ['Consult senior expert'],
        repairStrategy: {
            immediate: ['Document thoroughly', 'Take photos'],
            shortTerm: ['Monitor progression'],
            longTerm: ['Expert analysis required'],
            preventive: []
        }
    },
    [DamageType.CORROSION]: {
        name: 'Corrosion',
        description: 'Chemical degradation',
        visualCharacteristics: { appearance: 'Rust', location: 'Any', texture: 'Rough', pattern: 'Uniform', color: 'Red/Brown', depth: 'Surface', edges: 'Soft' },
        typicalLocations: [], operatingConditions: [], howToDiagnose: [],
        repairStrategy: { immediate: [], shortTerm: [], longTerm: [], preventive: [] }
    },
    [DamageType.FATIGUE_CRACK]: {
        name: 'Fatigue Crack',
        description: 'Cyclic stress failure',
        visualCharacteristics: { appearance: 'Crack', location: 'Stress concentrations', texture: 'Smooth', pattern: 'Linear', color: 'Dark', depth: 'Deep', edges: 'Sharp' },
        typicalLocations: [], operatingConditions: [], howToDiagnose: [],
        repairStrategy: { immediate: [], shortTerm: [], longTerm: [], preventive: [] }
    }
};

// ========================================
// REPAIR STRATEGY STRUCTURE
// ========================================

export interface RepairStrategy {
    immediate: string[];      // Actions for next 24 hours
    shortTerm: string[];      // Actions for next shutdown (weeks)
    longTerm: string[];       // Actions for major overhaul (years)
    preventive: string[];     // Ongoing prevention measures
}

// ========================================
// DAMAGE DIAGNOSIS SERVICE
// ========================================

export interface DamageReport {
    damageType: DamageType;
    confidence: number;          // 0-100%
    matchingCharacteristics: string[];
    repairStrategy: RepairStrategy;
    estimatedSeverity: 'MINOR' | 'MODERATE' | 'SEVERE' | 'CRITICAL';
    estimatedCost: string;
    urgency: 'ROUTINE' | 'SCHEDULED' | 'URGENT' | 'EMERGENCY';
}

export class SpecialistNotebook {
    /**
     * Diagnose damage based on visual description
     */
    static diagnoseDamage(
        description: string,
        location: string,
        operatingConditions?: {
            sigma?: number;
            sedimentPPM?: number;
            flowPercent?: number;
        }
    ): DamageReport {
        const scores: Map<DamageType, number> = new Map();

        // Keyword matching for each damage type
        for (const [type, guide] of Object.entries(DAMAGE_IDENTIFICATION_GUIDE)) {
            let score = 0;
            const matchedChars: string[] = [];

            // Check visual characteristics
            const desc = description.toLowerCase();
            if (desc.includes('sponge') || desc.includes('honeycomb') || desc.includes('pitting')) {
                if (type === DamageType.CAVITATION) {
                    score += 40;
                    matchedChars.push('Sponge-like pattern');
                }
            }

            if (desc.includes('smooth') || desc.includes('polished') || desc.includes('groove')) {
                if (type === DamageType.EROSION_SAND) {
                    score += 40;
                    matchedChars.push('Smooth polished grooves');
                }
            }

            // Check location
            const loc = location.toLowerCase();
            if (guide.typicalLocations.some(l => loc.includes(l.toLowerCase()))) {
                score += 30;
                matchedChars.push(`Typical location for ${guide.name}`);
            }

            // Check operating conditions
            if (operatingConditions) {
                if (operatingConditions.sigma !== undefined && operatingConditions.sigma < 0.10) {
                    if (type === DamageType.CAVITATION) {
                        score += 20;
                        matchedChars.push('Low sigma indicates cavitation risk');
                    }
                }

                if (operatingConditions.sedimentPPM !== undefined && operatingConditions.sedimentPPM > 200) {
                    if (type === DamageType.EROSION_SAND || type === DamageType.EROSION_SILT) {
                        score += 20;
                        matchedChars.push('High sediment content');
                    }
                }
            }

            if (score > 0) {
                scores.set(type as DamageType, score);
            }
        }

        // Find best match
        let bestType = DamageType.UNKNOWN;
        let bestScore = 0;
        let bestMatches: string[] = [];

        for (const [type, score] of scores.entries()) {
            if (score > bestScore) {
                bestScore = score;
                bestType = type;
            }
        }

        // Get repair strategy
        const guide = DAMAGE_IDENTIFICATION_GUIDE[bestType];

        return {
            damageType: bestType,
            confidence: bestScore,
            matchingCharacteristics: bestMatches,
            repairStrategy: guide.repairStrategy,
            estimatedSeverity: this.estimateSeverity(description),
            estimatedCost: this.estimateCost(bestType, this.estimateSeverity(description)),
            urgency: this.determineUrgency(bestType, this.estimateSeverity(description))
        };
    }

    private static estimateSeverity(description: string): 'MINOR' | 'MODERATE' | 'SEVERE' | 'CRITICAL' {
        const desc = description.toLowerCase();
        if (desc.includes('through-hole') || desc.includes('cracks')) return 'CRITICAL';
        if (desc.includes('deep') || desc.includes('severe')) return 'SEVERE';
        if (desc.includes('moderate') || desc.includes('widespread')) return 'MODERATE';
        return 'MINOR';
    }

    private static estimateCost(type: DamageType, severity: string): string {
        const costs = {
            MINOR: { CAVITATION: '$2,000-5,000', EROSION_SAND: '$3,000-8,000' },
            MODERATE: { CAVITATION: '$10,000-25,000', EROSION_SAND: '$15,000-35,000' },
            SEVERE: { CAVITATION: '$40,000-80,000', EROSION_SAND: '$50,000-100,000' },
            CRITICAL: { CAVITATION: '$100,000-200,000+', EROSION_SAND: '$120,000-250,000+' }
        };
        return ((costs as any)[severity])?.[type] || 'Contact specialist for estimate';
    }

    private static determineUrgency(type: DamageType, severity: string): DamageReport['urgency'] {
        if (severity === 'CRITICAL') return 'EMERGENCY';
        if (severity === 'SEVERE') return 'URGENT';
        if (severity === 'MODERATE') return 'SCHEDULED';
        return 'ROUTINE';
    }
}
