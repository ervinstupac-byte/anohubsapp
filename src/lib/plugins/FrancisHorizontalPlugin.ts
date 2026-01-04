import { AssetProfile } from '../../types';
import { COMMON_HYDRO_PATTERNS } from './CommonHydroPatterns';

export const FrancisHorizontalPlugin: AssetProfile = {
    type: 'Francis',
    subType: 'Horizontal < 5MW',
    metadata: {
        nominalPowerMW: 4.5,
        manufacturer: 'AnoHUB NC-4.2 Systems',
        commissioningDate: '2024-05-15'
    },
    math: {
        coefficients: {
            revenuePerMWh: 85.0,
            maintenanceBaseCost: 150000,
            inefficiencyTaxThreshold: 0.88
        },
        formulas: {
            calculateAxialThrust: (state: any, constants: any) => {
                const pSpiral = (state.specializedState?.sensors?.spiral_case_pressure || 0) * 1e5;
                const pDraft = (state.specializedState?.sensors?.draft_tube_pressure || 0) * 1e5;
                const runnerDiameter = constants?.runnerDiameter || 1.0;
                const area = Math.PI * Math.pow(runnerDiameter / 2, 2);
                return (area * (pSpiral - pDraft)) / 1000; // Returns in kN
            },
            calculateVolumetricLoss: (state: any) => {
                const passport = state.assetPassport;
                if (!passport) return 0;
                const runnerLoss = Math.max(0, (passport.mechanical.runnerGap - 0.5) * 4.5);
                const labLoss = Math.max(0, (passport.mechanical.labyrinthGap - 0.3) * 6.2);
                return parseFloat((runnerLoss + labLoss).toFixed(2));
            }
        },
        constants: {
            runnerDiameter: 1.0,
            safetyFactor: 1.5
        }
    },
    diagnostics: {
        patterns: [
            ...COMMON_HYDRO_PATTERNS,
            {
                id: 'cavitation-complex',
                name: 'Cavitation Precursor (Level 4)',
                description: 'Multi-variate correlation indicating implosion damage.',
                baseSeverity: 'CRITICAL',
                slogan: 'Cavitation: Rapid implosion of vapor bubbles causing erosive damage.',
                physicsNarrative: 'Flow turbulence detected: Differential pressure in Draft Tube suggests vortex rope formation, transferring destructive energy to the Runner linkage.',
                conditions: [
                    { variableId: 'vibration', operator: 'TREND_MATCH', targetTrend: 'RISING', weight: 0.35 },
                    { variableId: 'draftTubePressure', operator: 'VARIANCE_MATCH', threshold: 1.0, weight: 0.35 },
                    { variableId: 'guideVane', operator: 'LESS', threshold: 40, weight: 0.3 }
                ],
                actions: [
                    { type: 'FOCUS_3D', label: 'Inspect Draft Tube', targetId: 'Mesh_DraftTube_Liner', icon: 'Box' },
                    { type: 'OPEN_SOP', label: 'Drainage Protocol', targetId: 'Francis_SOP_Drainage_Pumps', icon: 'FileText' }
                ]
            },
            {
                id: 'bearing-thermal-instability',
                name: 'Bearing Thermal Instability',
                description: 'Rapid thermal rise under high load.',
                baseSeverity: 'HIGH',
                slogan: 'Thermal Runaway: Friction coefficient escalation exceeding cooling capacity.',
                physicsNarrative: (probability: number) => `Anomaly detected: Kinetic energy at the Runner is disippating as friction-induced Heat in Bearing #2. Efficiency loss projected at ${(probability * 3.5).toFixed(1)}%.`,
                conditions: [
                    { variableId: 'bearingTemp', operator: 'DYNAMIC_THRESHOLD', baselineId: 'bearingTemp_Loaded', sigmaMultiplier: 2.5, weight: 0.4 },
                    { variableId: 'rpm', operator: 'GREATER', threshold: 300, weight: 0.2 },
                    { variableId: 'bearingTemp', operator: 'SLOPE_GREATER', threshold: 2.0, weight: 0.4 }
                ],
                actions: [
                    { type: 'FOCUS_3D', label: 'Focus Guide Bearing', targetId: 'Mesh_GuideBearing_Pad3', icon: 'Box' },
                    { type: 'OPEN_SOP', label: 'Active Cooling Reset', targetId: 'Francis_SOP_Cooling', icon: 'FileText' }
                ]
            },
            {
                id: 'shaft-misalignment',
                name: 'Shaft Misalignment (Delta)',
                description: 'Thermal asymmetry between T-Side and G-Side bearings.',
                baseSeverity: 'HIGH',
                slogan: 'Mechanical Drift: Shaft centerline deviation detected via thermal delta.',
                physicsNarrative: 'Differential thermal expansion detected (ΔT > 5°C). Asymmetric friction suggests shaft centerline deviation, risking coupling fatigue and seal degradation.',
                conditions: [
                    { variableId: 'bearingTemp', operator: 'DELTA_GREATER', compareVariableId: 'generatorTemp', threshold: 5.0, weight: 0.6 },
                    { variableId: 'vibration', operator: 'TREND_MATCH', targetTrend: 'RISING', weight: 0.4 }
                ],
                actions: [
                    { type: 'FOCUS_3D', label: 'Inspect Coupling', targetId: 'Mesh_Shaft_Coupling', icon: 'Box' },
                    { type: 'OPEN_SOP', label: 'Alignment Protocol', targetId: 'Francis_SOP_Alignment', icon: 'FileText' }
                ]
            },
            {
                id: 'low-load-vortex',
                name: 'Low-Load Vortex Rope',
                description: 'Vortex formation in the draft tube at low guide vane openings.',
                baseSeverity: 'HIGH',
                slogan: 'Vortex Resonance: Hydrodynamic instability causing frequency-coupled vibration.',
                physicsNarrative: (probability: number) => `Low-Load Vortex Rope detected. Operation at ${(probability * 20).toPrecision(2)}% guide vane opening is creating a hollow core vortex in the draft tube, inducing structural vibration.`,
                conditions: [
                    { variableId: 'guideVane', operator: 'LESS', threshold: 20, weight: 0.6 },
                    { variableId: 'vibration', operator: 'GREATER', threshold: 0.05, weight: 0.4 }
                ],
                actions: [
                    { type: 'FOCUS_3D', label: 'Inspect Draft Tube', targetId: 'Mesh_DraftTube_Flow', icon: 'Box' },
                    { type: 'OPEN_SOP', label: 'Vortex Control Protocol', targetId: 'Francis_SOP_Vortex_Control', icon: 'FileText' }
                ]
            },
            {
                id: 'axial-thrust-overload',
                name: 'Axial Thrust Overload',
                description: 'Thrust exceeding bearing design limits.',
                baseSeverity: 'CRITICAL',
                slogan: 'Mechanical Stress: Axial thrust signature exceeds 250 kN limit.',
                physicsNarrative: 'Excessive axial pressure detected. Risk of thrust bearing wiping and structural deformation of the turbine cover.',
                conditions: [
                    { variableId: 'axialThrustKN', operator: 'GREATER', threshold: 250, weight: 1.0 }
                ]
            }
        ]
    },
    ui_manifest: {
        passport_sections: [
            {
                id: 'mechanical',
                title: 'francis:passport.sections.mechanical',
                fields: [
                    { id: 'runout', label: 'francis:passport.mechanical.runout', type: 'number', unit: 'mm', step: '0.001' },
                    { id: 'bearingClearance', label: 'francis:passport.mechanical.bearingClearance', type: 'number', unit: 'mm', step: '0.01' },
                    { id: 'axialPlay', label: 'francis:passport.mechanical.axialPlay', type: 'number', unit: 'mm', step: '0.01' },
                    { id: 'governorDeadband', label: 'francis:passport.mechanical.governorDeadband', type: 'number', unit: '%', step: '0.1' },
                    { id: 'runnerGap', label: 'francis:passport.mechanical.runnerGap', type: 'number', unit: 'mm', step: '0.01' },
                    { id: 'labyrinthGap', label: 'francis:passport.mechanical.labyrinthGap', type: 'number', unit: 'mm', step: '0.01' }
                ]
            },
            {
                id: 'electrical',
                title: 'francis:passport.sections.electrical',
                fields: [
                    { id: 'statorInsulation', label: 'francis:passport.electrical.statorInsulation', type: 'number', unit: 'MΩ' },
                    { id: 'rotorInsulation', label: 'francis:passport.electrical.rotorInsulation', type: 'number', unit: 'MΩ' },
                    { id: 'polarizationIndex', label: 'francis:passport.electrical.polarizationIndex', type: 'number', step: '0.01' },
                    { id: 'dcBatteryVoltage', label: 'francis:passport.electrical.dcBatteryVoltage', type: 'number', unit: 'V' }
                ]
            },
            {
                id: 'auxiliary',
                title: 'francis:passport.sections.auxiliary',
                fields: [
                    { id: 'sealLeakageRate', label: 'francis:passport.auxiliary.sealLeakageRate', type: 'number', unit: 'ml/min' },
                    { id: 'oilViscosity', label: 'francis:passport.auxiliary.oilViscosity', type: 'number', unit: 'cSt' },
                    { id: 'oilAge', label: 'francis:passport.auxiliary.oilAge', type: 'number', unit: 'Hours' },
                    {
                        id: 'acousticObservation', label: 'francis:passport.auxiliary.acousticObservation', type: 'select', options: [
                            { label: 'francis:options.acoustic.nominal', value: 'Nominal' },
                            { label: 'francis:options.acoustic.metallic', value: 'Metallic Knocking' },
                            { label: 'francis:options.acoustic.squeal', value: 'High-pitch Squeal' },
                            { label: 'francis:options.acoustic.thumping', value: 'Low-frequency Thumping' }
                        ]
                    }
                ]
            },
            {
                id: 'pressureProfile',
                title: 'francis:passport.sections.pressureProfile',
                fields: [
                    { id: 'penstock', label: 'francis:passport.pressure.penstock', type: 'number' },
                    { id: 'spiralCasing', label: 'francis:passport.pressure.spiralCasing', type: 'number' },
                    { id: 'labyrinthFront', label: 'francis:passport.pressure.labyrinthFront', type: 'number' },
                    { id: 'labyrinthRear', label: 'francis:passport.pressure.labyrinthRear', type: 'number' },
                    { id: 'draftTube', label: 'francis:passport.pressure.draftTube', type: 'number' }
                ]
            },
            {
                id: 'kinematics',
                title: 'francis:passport.sections.kinematics',
                fields: [
                    { id: 'mivOpeningTime', label: 'francis:passport.kinematics.mivOpening', type: 'number', unit: 's' },
                    { id: 'mivClosingTime', label: 'francis:passport.kinematics.mivClosing', type: 'number', unit: 's' },
                    { id: 'distributorCylinderStrokeTime', label: 'francis:passport.kinematics.distributorStroke', type: 'number', unit: 's' }
                ]
            },
            {
                id: 'maintenance',
                title: 'francis:passport.sections.maintenance',
                fields: [
                    { id: 'lastOilChange', label: 'francis:passport.maintenance.lastOilChange', type: 'date' },
                    { id: 'lastAlignmentCheck', label: 'francis:passport.maintenance.lastAlignmentCheck', type: 'date' },
                    { id: 'lastRelayTest', label: 'francis:passport.maintenance.lastRelayTest', type: 'date' }
                ]
            }
        ]
    }
};
