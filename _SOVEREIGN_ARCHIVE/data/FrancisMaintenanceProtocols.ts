/**
 * FRANCIS HORIZONTAL MAINTENANCE PROTOCOLS
 * 
 * Specific maintenance logic for horizontal shaft Francis units.
 * Focus: Cavitation in draft tube, linkage lubrication, and bearing temps.
 */

export interface MaintenanceProtocol {
    id: string;
    title: string;
    frequency: string;
    criticality: 'High' | 'Medium' | 'Low';
    procedure: string[];
}

export const FRANCIS_HORIZONTAL_PROTOCOLS: MaintenanceProtocol[] = [
    {
        id: 'FH-001',
        title: 'Guide Vane Linkage Lubrication',
        frequency: 'Monthly',
        criticality: 'High',
        procedure: [
            'Inspect all shear pins for fatigue.',
            'Apply lithium-complex grease to linkage pivot points.',
            'Verify synchronization of guide vanes (0-100% stroke test).',
            'Check for excessive play in bushing housings.'
        ]
    },
    {
        id: 'FH-002',
        title: 'Draft Tube Cavitation Inspection',
        frequency: 'Quarterly',
        criticality: 'High',
        procedure: [
            'Listen for "crackling" sound in draft tube elbow (indicative of cavitation).',
            'Inspect vacuum breaker valve functionality.',
            'Measure draft tube manhole seal integrity.',
            'Review SCADA for historic vacuum pressure spikes.'
        ]
    },
    {
        id: 'FH-003',
        title: 'Shaft Seal Cooling Flow',
        frequency: 'Weekly',
        criticality: 'Medium',
        procedure: [
            'Verify cooling water flow rate > 15 L/min.',
            'Check inlet/outlet temperature delta (Max 5°C).',
            'Inspect packing/seal face for leakage (> 10 drops/min is warning).',
            'Clean cyclone filter in cooling loop.'
        ]
    },
    {
        id: 'FH-004',
        title: 'Horizontal Bearing Oil Level',
        frequency: 'Daily',
        criticality: 'High',
        procedure: [
            'Check sight glass on Drive End (DE) and Non-Drive End (NDE) bearings.',
            'Verify oil ring rotation (if applicable).',
            'Monitor housing vibration (< 2.5 mm/s RMS).',
            'Inspect oil color for water ingress (emulsification).'
        ]
    }
];

export const getFrancisSuggestions = (specs: any) => {
    // Logic to refine suggestions based on specific specs
    const suggestions = [...FRANCIS_HORIZONTAL_PROTOCOLS];

    if (specs?.bearingType === 'Roller') {
        // Add specific roller bearing checks if needed, or filter out slide bearing checks
    }

    return suggestions;
};
