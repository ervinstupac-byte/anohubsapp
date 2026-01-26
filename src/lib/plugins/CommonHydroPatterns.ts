export const COMMON_HYDRO_PATTERNS = [
    {
        id: 'water-hammer-event',
        name: 'Transient Water Hammer',
        description: 'Rapid pressure surge due to flow stoppage.',
        baseSeverity: 'CRITICAL',
        slogan: 'Hydraulic Shock: Wave reflection causing excessive hoop stress.',
        physicsNarrative: (probability: number) => `CRITICAL: Massive pressure surge detected (${(probability * 150).toFixed(0)} Bar). Kinetic energy is reflecting back through the Penstock, risking structural breach of MIV seals.`,
        conditions: [
            { variableId: 'surgePressureBar', operator: 'GREATER', threshold: 100, weight: 0.7 },
            { variableId: 'pressure', operator: 'TREND_MATCH', targetTrend: 'RISING', weight: 0.3 }
        ],
        actions: [
            { type: 'FOCUS_3D', label: 'Focus MIV', targetId: 'Mesh_MIV_Valve', icon: 'Box' },
            { type: 'OPEN_SOP', label: 'Water Hammer Protocol', targetId: 'Francis_SOP_Water_Hammer', icon: 'FileText' }
        ]
    },
    {
        id: 'grid-loss-transient',
        name: 'Load Rejection Spike',
        description: 'RPM overshoot following grid separation.',
        baseSeverity: 'CRITICAL',
        slogan: 'Kinetic Overshoot: Rotational energy spike without electrical damping.',
        physicsNarrative: (probability: number) => `Grid Separation detected. RPM spiking due to load rejection (${(probability * 25).toFixed(1)}% overspeed). Braking sequence should be verified for immediate engagement.`,
        conditions: [
            { variableId: 'rpm', operator: 'GREATER', threshold: 600, weight: 0.6 },
            { variableId: 'rpm', operator: 'SLOPE_GREATER', threshold: 50, weight: 0.4 }
        ],
        actions: [
            { type: 'FOCUS_3D', label: 'Focus Guide Vanes', targetId: 'Mesh_GuideVanes', icon: 'Box' },
            { type: 'OPEN_SOP', label: 'Braking Protocol', targetId: 'Francis_SOP_Braking_System', icon: 'FileText' }
        ]
    }
];
