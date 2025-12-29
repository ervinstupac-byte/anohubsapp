/**
 * FRANCIS HORIZONTAL - DIGITALIZED PROTOCOLS
 * Extracted from legacy HTML documentation (SOP-ROT-001, SOP-HYD-005, et al.)
 */

export interface SOPStep {
    id: string;
    action: string;
    detail: string;
    critical?: boolean;
}

export interface DigitalProtocol {
    id: string;
    title: string;
    reference: string; // e.g. "SOP-ROT-001"
    frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Annually' | 'OnAlarm';
    steps: SOPStep[];
}

export const FRANCIS_PROTOCOLS: DigitalProtocol[] = [
    // Extracted from Francis_SOP_Bearings.html
    {
        id: 'FH-BEARINGS-01',
        title: 'Main Bearings & Cooling Audit',
        reference: 'SOP-ROT-001',
        frequency: 'Daily',
        steps: [
            {
                id: 'b1',
                action: 'Check Sight Glass',
                detail: 'Verify oil is clear. Milky appearance indicates water ingress (Emergency Stop required).',
                critical: true
            },
            {
                id: 'b2',
                action: 'Verify Oil Temperature',
                detail: 'Target range 18°C - 55°C. If >60°C, inspect cooling water flow.'
            },
            {
                id: 'b3',
                action: 'Inspect Intake Filters',
                detail: 'Check mesh filters for river silt blockage. Clean if dP is high.'
            }
        ]
    },
    {
        id: 'FH-BEARINGS-02',
        title: 'Heat Exchanger Backflush',
        reference: 'SOP-ROT-001',
        frequency: 'Weekly',
        steps: [
            {
                id: 'bf1',
                action: 'Reverse Flow',
                detail: 'Reverse cooling water flow direction for 5 minutes.'
            },
            {
                id: 'bf2',
                action: 'Eject Sediment',
                detail: 'Flush out deposited silt acting as insulator.'
            }
        ]
    },
    // Extracted from Francis_SOP_Linkage.html
    {
        id: 'FH-LINKAGE-01',
        title: 'Governor Linkage "Swing Test"',
        reference: 'SOP-MECH-003',
        frequency: 'Annually',
        steps: [
            {
                id: 'sw1',
                action: 'Safety Lockout',
                detail: 'Stop unit. Close MIV. REMOVE Mechanical Safety Pin.',
                critical: true
            },
            {
                id: 'sw2',
                action: 'Detach Servomotor',
                detail: 'Disconnect piston from regulating ring.'
            },
            {
                id: 'sw3',
                action: 'Manual Swing',
                detail: 'Push regulating ring by hand 0% to 100%. Movement must be smooth with no binding.'
            }
        ]
    },
    {
        id: 'FH-LINKAGE-02',
        title: 'Linkage Lubrication Audit',
        reference: 'SOP-MECH-002',
        frequency: 'Monthly',
        steps: [
            {
                id: 'l1',
                action: 'Check Grease Purge',
                detail: 'Inspect all 20 gate shafts. Must see fresh ring of grease purging from seals.'
            },
            {
                id: 'l2',
                action: 'Static Shake Test',
                detail: 'Grab link arms by hand. "Clicking" sound indicates bushing failure (>0.1mm play).'
            }
        ]
    },
    // Extracted from Francis_SOP_DFT.html
    {
        id: 'FH-DFT-01',
        title: 'Snifter Valve Maintenance',
        reference: 'SOP-HYD-005',
        frequency: 'Monthly',
        steps: [
            {
                id: 'sn1',
                action: 'Partial Load Check',
                detail: 'Run unit at 50% load. Verify distinct "hissing" sound (breathing).'
            },
            {
                id: 'sn2',
                action: 'Clean Seat',
                detail: 'Wire-brush the valve seat to remove rust/scale.'
            },
            {
                id: 'sn3',
                action: 'Check Spring',
                detail: 'Wash spring in solvent. Verify piston backs instantly.'
            }
        ]
    }
];
