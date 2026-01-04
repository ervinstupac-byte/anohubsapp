import { RecoveryAction } from '../models/RepairContext';

export const MITIGATION_LIBRARY: Record<string, RecoveryAction[]> = {
    'VIBRATION_CRITICAL': [
        {
            id: 'VIB_MIT_01',
            title: 'Limit Operation Zone',
            description: 'Restriktivan rad: Zabraniti rad u zoni kavitacije (65-75% opterećenja). Provjeriti vijke spojnice.',
            mitigationImpact: 'Reduces peak vibration by 40%',
            requiredTools: ['AnoHUB Vibration Pen', 'Torque Wrench for M16 bolts', 'Laser Alignment Kit'],
            stressReductionFactor: 0.4
        }
    ],
    'CAVITATION_INFERRED': [
        {
            id: 'CAV_MIT_01',
            title: 'Aeration Valve Optimization',
            description: 'Open Air Admission Valve to 25% + Limit Wicket Gate to 70%.',
            mitigationImpact: 'Collapses vortex rope and reduces cavitation impacts',
            requiredTools: ['Wrench Set', 'Pressure Gauge', 'AnoHUB Acoustic Probe'],
            stressReductionFactor: 0.25
        }
    ],
    'STRUCTURAL_RISK': [
        {
            id: 'STR_MIT_01',
            title: 'Load Shedding',
            description: 'Reduce plant output by 15% to lower internal casing pressure and hoop stress.',
            mitigationImpact: 'Reduces hoop stress by 20%',
            requiredTools: ['Pressure Gauge', 'Ultrasonic Thickness Gauge'],
            stressReductionFactor: 0.2
        }
    ],
    'BEARING_TEMP_CRITICAL': [
        {
            id: 'TEMP_MIT_01',
            title: 'Cooling Flow Increase',
            description: 'Increase cooling water flow by 15% via bypass valve. Check lubrication oil level.',
            mitigationImpact: 'Lowers bearing temperature by 8°C',
            requiredTools: ['Infrared Thermometer', 'Flow Meter', 'Lubrication Oil Quality Kit'],
            stressReductionFactor: 0.1
        }
    ],
    'ALIGNMENT': [
        {
            id: 'PREC_MIT_01',
            title: 'Precision Laser Re-alignment',
            description: 'Target: 0.05 mm/m. Reduces eccentric wear and bearing thermal load.',
            mitigationImpact: 'Reduces dynamic wear rate by 35%',
            requiredTools: ['Precision Laser Kit', 'Shim Stock (0.01 - 0.25mm)', 'Dial Indicators'],
            stressReductionFactor: 0.35
        }
    ],
    'DYNAMIC_BALANCING': [
        {
            id: 'PREC_MIT_02',
            title: 'In-situ Dynamic Balancing',
            description: 'Apply trial weights to runner/shaft to eliminate impulse vibration.',
            mitigationImpact: 'Reduces vibration velocity by up to 50%',
            requiredTools: ['Vib Analyzer (Dual Channel)', 'Calibration Weights', 'Drill/Tap Set'],
            stressReductionFactor: 0.5
        }
    ],
    'THRUST_BALANCE': [
        {
            id: 'PREC_MIT_03',
            title: 'Labyrinth Clearance Restoration',
            description: 'Machining and shimming of labyrinth rings to restore volumetric efficiency.',
            mitigationImpact: 'Reduces leakage by 15% and stabilizes axial thrust',
            requiredTools: ['In-situ Boring Machine', 'Micrometers', 'Labyrinth Shims'],
            stressReductionFactor: 0.15
        }
    ]
};
