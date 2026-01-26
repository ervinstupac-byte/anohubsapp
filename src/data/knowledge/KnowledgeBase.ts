import { KnowledgeNode } from '../../models/knowledge/ContextTypes';

export const KNOWLEDGE_BASE: KnowledgeNode[] = [
    // ========================================================
    // CIVIL & INFRASTRUCTURE
    // ========================================================
    {
        id: 'ctx_penstock_general',
        type: 'COMPONENT',
        title: 'Penstock System',
        description: 'The main artery of the plant. Integrity is paramount.',
        tags: ['hydraulic', 'safety', 'critical'],
        triggers: [
            { routeMatcher: 'sop-penstock' }
        ],
        insights: [
            "Current hoop stress within design limits (σ < 180 MPa).",
            "Visual inspection scheduled: Q1 2026.",
            "Cathodic protection reading: -920mV (healthy range)."
        ],
        resources: [
            { id: 'doc_60123', title: 'ASME B31.1: Pressure Piping Code', type: 'PDF', url: '/docs/asme-b31.pdf' },
            { id: 'hist_p1', title: '2019: Internal coating renewal', type: 'LOG', url: '/logs/view/2019-p1' }
        ]
    },
    {
        id: 'ctx_intake_general',
        type: 'COMPONENT',
        title: 'Intake & Trash Rack',
        description: 'First line of defense against debris ingress.',
        tags: ['civil', 'efficiency'],
        triggers: [
            { routeMatcher: 'sop-intake' }
        ],
        insights: [
            "Differential head across rack: 0.15m (acceptable).",
            "Automated rake system operational.",
            "Seasonal peak debris: March-May (snowmelt)."
        ],
        resources: [
            { id: 'sop_cleaning', title: 'Rack Cleaning Schedule', type: 'LINK', url: '/francis/sop-intake' }
        ]
    },

    // ========================================================
    // MECHANICAL SYSTEMS
    // ========================================================
    {
        id: 'ctx_bearing_general',
        type: 'COMPONENT',
        title: 'Guide Bearings',
        description: 'Radial support for turbine shaft during operation.',
        tags: ['mechanical', 'critical'],
        triggers: [
            { routeMatcher: 'sop-bearings' }
        ],
        insights: [
            "Oil temperature: 52°C (optimal range 45-60°C).",
            "Vibration amplitude: 0.8 mm/s RMS (good).",
            "Last oil change: 2,400 running hours ago."
        ],
        resources: [
            { id: 'bearing_manual', title: 'SKF Bearing Maintenance Guide', type: 'PDF', url: '/docs/skf-bearings.pdf' }
        ]
    },
    {
        id: 'ctx_phys_bearing_temp',
        type: 'RISK',
        title: 'Bearing Thermal Stress',
        description: 'Excessive heat generation in guide bearings.',
        tags: ['mechanical', 'safety'],
        triggers: [
            { sensorId: 'francis.sensors.bearingTemp', threshold: { min: 65, condition: 'GT' } }
        ],
        insights: [
            "Oil film viscosity degrading—risk of metal contact.",
            "Verify cooling water flow rate (target: 15 L/min).",
            "Check oil filter differential pressure."
        ],
        resources: [
            { id: 'sop_lube', title: 'Lubrication System Troubleshooting', type: 'LINK', url: '/francis/sop-lubrication' }
        ]
    },
    {
        id: 'ctx_shaft_alignment',
        type: 'COMPONENT',
        title: 'Shaft Alignment & Coupling',
        description: 'Precision alignment prevents vibration and bearing damage.',
        tags: ['mechanical', 'precision'],
        triggers: [
            { routeMatcher: 'sop-shaft-alignment' },
            { routeMatcher: 'sop-coupling' }
        ],
        insights: [
            "Last alignment check: 6 months ago.",
            "Offset tolerance: <0.05mm (currently 0.03mm).",
            "Coupling rubber elements replaced 2023."
        ],
        resources: [
            { id: 'alignment_protocol', title: 'Laser Alignment Procedure', type: 'PDF', url: '/docs/alignment.pdf' }
        ]
    },

    // ========================================================
    // HYDRAULIC & FLUID SYSTEMS
    // ========================================================
    {
        id: 'ctx_hpu_general',
        type: 'COMPONENT',
        title: 'Hydraulic Power Unit',
        description: 'Provides high-pressure oil for wicket gate and MIV actuation.',
        tags: ['fluid', 'control', 'critical'],
        triggers: [
            { routeMatcher: 'sop-hpu' }
        ],
        insights: [
            "System pressure: 162 bar (nominal 160 bar).",
            "Accumulator charge: 85% (good).",
            "Filter contamination: ISO 16/14/11 (clean)."
        ],
        resources: [
            { id: 'hpu_manual', title: 'Rexroth HPU Manual', type: 'PDF', url: '/docs/rexroth-hpu.pdf' }
        ]
    },
    {
        id: 'ctx_oil_health',
        type: 'COMPONENT',
        title: 'Oil Health Monitoring',
        description: 'Lubricant condition indicates wear and contamination.',
        tags: ['fluid', 'diagnostics'],
        triggers: [
            { routeMatcher: 'sop-oil-health' }
        ],
        insights: [
            "Viscosity at 40°C: 68 cSt (spec: 68±5 cSt).",
            "Water content: 150 ppm (acceptable <500 ppm).",
            "Particle count trending stable."
        ],
        resources: [
            { id: 'oil_analysis', title: 'Latest Lab Report (Dec 2025)', type: 'PDF', url: '/docs/oil-report-2025-12.pdf' }
        ]
    },
    {
        id: 'ctx_cooling_water',
        type: 'COMPONENT',
        title: 'Cooling Water System',
        description: 'Heat removal for bearings and generator windings.',
        tags: ['fluid', 'thermal'],
        triggers: [
            { routeMatcher: 'sop-cooling-water' }
        ],
        insights: [
            "Flow rate: 22 L/min (nominal 20 L/min).",
            "Temperature rise: 8°C (acceptable <12°C).",
            "Heat exchanger cleaned 3 months ago."
        ],
        resources: [
            { id: 'cooling_schematic', title: 'Cooling System P&ID', type: 'PDF', url: '/docs/cooling-pid.pdf' }
        ]
    },

    // ========================================================
    // ELECTRICAL SYSTEMS
    // ========================================================
    {
        id: 'ctx_generator_general',
        type: 'COMPONENT',
        title: 'Synchronous Generator',
        description: 'Converts mechanical power to electrical energy.',
        tags: ['electrical', 'critical'],
        triggers: [
            { routeMatcher: 'sop-generator' }
        ],
        insights: [
            "Power factor: 0.95 (optimal).",
            "Stator insulation resistance: 12 GΩ (healthy >1 GΩ).",
            "Winding temperature: 68°C (Class F limit: 155°C)."
        ],
        resources: [
            { id: 'gen_manual', title: 'Generator O&M Manual', type: 'PDF', url: '/docs/gen-om.pdf' }
        ]
    },
    {
        id: 'ctx_transformer_general',
        type: 'COMPONENT',
        title: 'Step-Up Transformer',
        description: 'Voltage transformation from 11kV to 110kV.',
        tags: ['electrical', 'critical'],
        triggers: [
            { routeMatcher: 'sop-transformer' }
        ],
        insights: [
            "Oil temperature: 62°C (alarm at 85°C).",
            "Dissolved gas analysis: no fault gases detected.",
            "Buchholz relay: no accumulated gas."
        ],
        resources: [
            { id: 'transformer_manual', title: 'ABB Transformer Manual', type: 'PDF', url: '/docs/abb-transformer.pdf' },
            { id: 'dga_guide', title: 'DGA Interpretation Guide', type: 'PDF', url: '/docs/dga-guide.pdf' }
        ]
    },
    {
        id: 'ctx_transformer_thermal',
        type: 'RISK',
        title: 'Transformer Thermal Overload',
        description: 'Excessive oil temperature indicates overload or cooling failure.',
        tags: ['electrical', 'safety'],
        triggers: [
            { sensorId: 'francis.sensors.transformerOilTemp', threshold: { min: 85, condition: 'GT' } }
        ],
        insights: [
            "Oil degradation accelerates above 85°C.",
            "Check radiator fan operation immediately.",
            "Verify load current is within nameplate rating."
        ],
        resources: [
            { id: 'transformer_cooling', title: 'Cooling System Diagnostics', type: 'LINK', url: '/francis/sop-transformer' }
        ]
    },
    {
        id: 'ctx_excitation_general',
        type: 'COMPONENT',
        title: 'Excitation System (AVR)',
        description: 'Automatic voltage regulation via rotor field control.',
        tags: ['electrical', 'control'],
        triggers: [
            { routeMatcher: 'sop-excitation' }
        ],
        insights: [
            "Field current: 420A (nominal for full load).",
            "AVR response time: <80ms (spec: <100ms).",
            "No forced-cooling alarms."
        ],
        resources: [
            { id: 'avr_manual', title: 'GE Static Exciter Manual', type: 'PDF', url: '/docs/ge-avr.pdf' }
        ]
    },
    {
        id: 'ctx_governor_general',
        type: 'COMPONENT',
        title: 'Governor & PID Control',
        description: 'Frequency regulation via wicket gate modulation.',
        tags: ['electrical', 'control', 'critical'],
        triggers: [
            { routeMatcher: 'sop-governor-pid' }
        ],
        insights: [
            "Frequency control: 50.00 Hz ±0.05 Hz.",
            "PID tuning: Kp=2.5, Ki=0.8, Kd=0.3 (stable).",
            "Governor oil pressure: 158 bar (nominal)."
        ],
        resources: [
            { id: 'governor_manual', title: 'Woodward Governor Manual', type: 'PDF', url: '/docs/woodward-gov.pdf' }
        ]
    },
    {
        id: 'ctx_grid_sync',
        type: 'COMPONENT',
        title: 'Grid Synchronization',
        description: 'Breaker closure synchronization to avoid torque shock.',
        tags: ['electrical', 'safety'],
        triggers: [
            { routeMatcher: 'sop-grid-sync' }
        ],
        insights: [
            "Synchroscope active: phase angle <3° at closure.",
            "Voltage match: ±2% tolerance.",
            "Auto-sync relay operational."
        ],
        resources: [
            { id: 'sync_procedure', title: 'Synchronization Procedure', type: 'PDF', url: '/docs/sync-procedure.pdf' }
        ]
    },

    // ========================================================
    // PHYSICS-BASED TRIGGERS
    // ========================================================
    {
        id: 'ctx_phys_cavitation',
        type: 'PHYSICS',
        title: 'Cavitation Risk',
        description: 'Vapor bubble formation in low-pressure zones.',
        tags: ['hydraulic', 'efficiency', 'critical'],
        triggers: [
            { sensorId: 'francis.sensors.draft_tube_pressure', threshold: { max: -0.7, condition: 'LT' } }
        ],
        insights: [
            "Draft tube pressure critically low—cavitation likely.",
            "Runner erosion risk at blade trailing edge.",
            "Reduce load or increase tailwater level."
        ],
        resources: [
            { id: 'cavitation_guide', title: 'Cavitation Damage Atlas', type: 'PDF', url: '/docs/cavitation-atlas.pdf' }
        ]
    },
    {
        id: 'ctx_phys_vibration',
        type: 'RISK',
        title: 'Excessive Vibration',
        description: 'High vibration indicates mechanical imbalance or resonance.',
        tags: ['mechanical', 'safety'],
        triggers: [
            { sensorId: 'francis.sensors.vibration', threshold: { min: 3.5, condition: 'GT' } }
        ],
        insights: [
            "Vibration amplitude exceeds ISO 10816 Zone B limit.",
            "Possible causes: cavitation, runner imbalance, bearing wear.",
            "Schedule vibration spectrum analysis."
        ],
        resources: [
            { id: 'vibration_standard', title: 'ISO 10816-5: Vibration Limits', type: 'PDF', url: '/docs/iso-10816.pdf' }
        ]
    }
];
