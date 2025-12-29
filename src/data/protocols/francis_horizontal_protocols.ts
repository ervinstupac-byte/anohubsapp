/**
 * FRANCIS HORIZONTAL - DIGITALIZED PROTOCOLS
 * Mined from legacy HTML documentation (Reference Docs: Francis_H)
 * Updated: 2025-12-29
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
    frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Annually' | 'OnAlarm' | 'PostShutdown';
    steps: SOPStep[];
}

export const FRANCIS_PROTOCOLS: DigitalProtocol[] = [
    // --- 1. ROTATION & BEARINGS (SOP-ROT-001) ---
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
                detail: 'Target range 18°C - 55°C. Warning at 60°C. Trip (Shutdown) at 70°C.'
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

    // --- 2. BRAKING & LIFTING (SOP-MECH-003) ---
    {
        id: 'FH-BRAKES-01',
        title: 'Pneumatic Braking System Check',
        reference: 'SOP-MECH-003',
        frequency: 'OnAlarm',
        steps: [
            {
                id: 'br1',
                action: 'Verify Air Pressure',
                detail: 'Ensure 7.0 Bar (Reservoir Full).',
                critical: true
            },
            {
                id: 'br2',
                action: 'Check Permissive Speed',
                detail: 'Brakes apply ONLY when speed < 20% (85 RPM). Block Air if > 30% (Fire Risk).'
            },
            {
                id: 'br3',
                action: 'Monitor Application',
                detail: 'Confirm Pulsing Logic: 3s ON / 3s OFF cycle.'
            }
        ]
    },
    {
        id: 'FH-BRAKES-02',
        title: 'Dust Extraction & Lifting',
        reference: 'SOP-MECH-003',
        frequency: 'PostShutdown',
        steps: [
            {
                id: 'de1',
                action: 'Dust Extractor Status',
                detail: 'Verify Filter dP < 120 Pa. System must run for +15 mins after stop.',
                critical: true
            },
            {
                id: 'hj1',
                action: 'Hydraulic Jacking (If Idle > 72h)',
                detail: 'Lift 350-ton rotor by 10mm to flood thrust pads with oil before restart.'
            }
        ]
    },

    // --- 3. COOLING WATER (SOP-AUX-001) ---
    {
        id: 'FH-COOLING-01',
        title: 'Cooling Water System Checks',
        reference: 'SOP-AUX-001',
        frequency: 'Daily',
        steps: [
            {
                id: 'cw1',
                action: 'Auto-Strainer Check',
                detail: 'Verify dP < 0.5 Bar. Auto-flush triggers at 0.5 Bar or 12h timer.'
            },
            {
                id: 'cw2',
                action: 'Verify Flow Rates',
                detail: 'Generator Air (1,200 L/min), Thrust Bearing (450 L/min), Guide Bearing (150 L/min).'
            },
            {
                id: 'cw3',
                action: '3-Way Valve Mode',
                detail: 'Winter: Recirculation (<35°C). Summer: Full Cooling (Target 45°C).'
            }
        ]
    },

    // --- 4. EMERGENCY PROTOCOLS (FR-EP-001) ---
    {
        id: 'FH-EMERGENCY-01',
        title: 'Load Rejection & Overspeed Response',
        reference: 'FR-EP-001',
        frequency: 'OnAlarm',
        steps: [
            {
                id: 'ep1-1',
                action: 'Assess Overspeed',
                detail: 'Danger > 120% (~720 RPM). Centrifugal force risk.',
                critical: true
            },
            {
                id: 'ep1-2',
                action: 'Manual Intervention',
                detail: 'Press "EMERGENCY CLOSE". If Guide Vanes fail, trigger MIV closure.'
            },
            {
                id: 'ep1-3',
                action: 'Evacuation',
                detail: 'EVACUATE if speed exceeds 120% and is rising.'
            }
        ]
    },
    {
        id: 'FH-EMERGENCY-02',
        title: 'Silt Flash Flood Response',
        reference: 'FR-EP-001',
        frequency: 'OnAlarm',
        steps: [
            {
                id: 'ep2-1',
                action: 'Monitor PPM Levels',
                detail: 'Warning: 1000-3000 ppm. Critical: 3000-5000 ppm (Reduce Load).'
            },
            {
                id: 'ep2-2',
                action: 'Emergency Shutdown',
                detail: 'If > 5000 ppm: IMMEDIATE SHUTDOWN REQUIRED to prevent runner destruction.',
                critical: true
            }
        ]
    },
    {
        id: 'FH-EMERGENCY-03',
        title: 'HPU Power Loss (Manual Closure)',
        reference: 'FR-EP-001',
        frequency: 'OnAlarm',
        steps: [
            {
                id: 'ep3-1',
                action: 'Gravity Closure (Design A)',
                detail: 'Pull Red Emergency Release Handle. Verify MIV drop (30-60s).'
            },
            {
                id: 'ep3-2',
                action: 'Hand-Wheel Closure (Design B)',
                detail: 'Disengage clutch. Turn hand-wheel clockwise (50-100 rotations). Requires 2 operators.'
            }
        ]
    },
    {
        id: 'FH-EMERGENCY-06',
        title: 'Grid Frequency Anomaly',
        reference: 'FR-EP-001',
        frequency: 'OnAlarm',
        steps: [
            {
                id: 'ep6-1',
                action: 'Verify ESD Limit',
                detail: 'Critical Low Frequency: 98.2 Hz. Auto-Trip should be active.'
            },
            {
                id: 'ep6-2',
                action: 'Confirm Separation',
                detail: 'Severe desync risk. Ensure unit disconnects to prevent mechanical shaft damage.',
                critical: true
            }
        ]
    },

    // --- Legacy Retained Protocols (Linkage & DFT) ---
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
            }
        ]
    }
];
