import { DigitalProtocol, FRANCIS_PROTOCOLS } from './francis_horizontal_protocols';

/**
 * SYNTHETIC MAINTENANCE PROTOCOLS
 * Based on standard industry practices (IEC 60308, IEEE 1248)
 */

export const PELTON_PROTOCOLS: DigitalProtocol[] = [
    {
        id: 'PEL-001',
        title: 'Needle & Nozzle Inspection',
        reference: 'SOP-PEL-HYD-01',
        frequency: 'Monthly',
        steps: [
            {
                id: 'p1',
                action: 'Measure Erosion',
                detail: 'Check needle tip and nozzle seat for cavitation/erosion. Limit: <2mm depth.',
                critical: true
            },
            {
                id: 'p2',
                action: 'Check Alignment',
                detail: 'Verify jet strikes center of bucket splitter (observe witness marks).'
            }
        ]
    },
    {
        id: 'PEL-002',
        title: 'Runner Bucket Integrity (MPI)',
        reference: 'SOP-PEL-MECH-04',
        frequency: 'Annually',
        steps: [
            {
                id: 'p3',
                action: 'Clean Buckets',
                detail: 'Wire brush bucket roots to remove scale.'
            },
            {
                id: 'p4',
                action: 'Magnetic Particle Inspection',
                detail: 'Perform MPI on bucket roots to detect fatigue cracks. Zero tolerance for root cracks.',
                critical: true
            }
        ]
    }
];

export const KAPLAN_PROTOCOLS: DigitalProtocol[] = [
    {
        id: 'KAP-001',
        title: 'Hub Oil & Blade Seal Audit',
        reference: 'SOP-KAP-OIL-02',
        frequency: 'Weekly',
        steps: [
            {
                id: 'k1',
                action: 'Check Header Tank Level',
                detail: 'Verify gravity tank oil level. Drop indicates seal leakage.',
                critical: true
            },
            {
                id: 'k2',
                action: 'Water-in-Oil Analysis',
                detail: 'Sample hub oil. Water content must be <300ppm.'
            }
        ]
    },
    {
        id: 'KAP-002',
        title: 'Gap Cavitation Check',
        reference: 'SOP-KAP-CAV-05',
        frequency: 'Monthly',
        steps: [
            {
                id: 'k3',
                action: 'Blade Tip Inspection',
                detail: 'Inspect runner chamber liner for erosion at blade periphery (gap cavitation).'
            }
        ]
    }
];

export const BULB_PROTOCOLS: DigitalProtocol[] = [
    {
        id: 'BULB-001',
        title: 'Housing Watertightness Audit',
        reference: 'SOP-BLB-STR-01',
        frequency: 'Daily',
        steps: [
            {
                id: 'b1',
                action: 'Check Bilge Pumps',
                detail: 'Verify run-time of leakage pumps. Frequent cycling > leak.',
                critical: true
            },
            {
                id: 'b2',
                action: 'Inspect Hatch Seals',
                detail: 'Visual check of manhole access seals for dampness.'
            }
        ]
    },
    {
        id: 'BULB-002',
        title: 'Generator Cooling Air Flow',
        reference: 'SOP-BLB-COOL-03',
        frequency: 'Weekly',
        steps: [
            {
                id: 'b3',
                action: 'Check Nose Cone Pressure',
                detail: 'Verify positive pressure in bulb nose (forced ventilation).'
            },
            {
                id: 'b4',
                action: 'Inspect Air-Water Heat Exchangers',
                detail: 'Check for condensation or leaks in cooler bundles.'
            }
        ]
    }
];

export const getProtocolsForType = (type: string | undefined): DigitalProtocol[] => {
    if (!type) return [];

    // Normalize type string
    const normalized = type.toLowerCase();

    if (normalized.includes('francis')) return FRANCIS_PROTOCOLS;
    if (normalized.includes('pelton')) return PELTON_PROTOCOLS;
    if (normalized.includes('kaplan')) return KAPLAN_PROTOCOLS;
    if (normalized.includes('bulb')) return BULB_PROTOCOLS;

    return []; // Return empty or generic if unknown
};
