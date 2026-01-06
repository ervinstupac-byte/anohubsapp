import {
    Settings,
    ShieldCheck,
    Zap,
    Droplets,
    Compass,
    Activity,
    Target
} from 'lucide-react';

export interface ComponentDetail {
    id: string;
    name: string;
    func: string;
    precision: string;
    heritage: string;
    path: string;
    icon: any;
    // Spatial anchor for leader line (SVG coordinates)
    anchor: { x: number, y: number };
    // Visual position for label (Percentage)
    labelPos: { top: string, left: string };
}

export const TURBINE_COMPONENTS: ComponentDetail[] = [
    // --- 1. LEFT ZONE (Auxiliaries & Input) ---
    {
        id: 'nav-seal',
        name: 'SHAFT SEALING',
        func: 'Prevents water leakage along the main shaft using carbon rings.',
        precision: 'Leakage < 5 L/min',
        heritage: 'Water lubricated active seal.',
        path: '/francis/mechanism-detail', // Pan-Left
        icon: ShieldCheck,
        anchor: { x: 550, y: 450 }, // Points to shaft entry
        labelPos: { top: '35%', left: '5%' }
    },
    {
        id: 'nav-distributor',
        name: 'DISTRIBUTOR MECHANISM',
        func: 'Controls water flow to the runner via adjustable guide vanes.',
        precision: 'Servo accuracy 0.1%',
        heritage: 'The "gas pedal" of the turbine.',
        path: '/francis/mechanism-detail', // Pan-Left
        icon: Settings,
        anchor: { x: 650, y: 450 }, // Points to inner ring
        labelPos: { top: '60%', left: '5%' }
    },
    // Remapped per Explicit Instruction
    {
        id: 'temp-generator',
        name: 'GENERATOR UNIT',
        func: 'Power generation.',
        precision: 'Voltage stability',
        heritage: 'Far left unit in this view.',
        path: '/electrical/generator-integrity',
        icon: Zap,
        anchor: { x: 250, y: 320 },
        labelPos: { top: '15%', left: '20%' }
    },
    {
        id: 'temp-shaft-coupling',
        name: 'SHAFT & FLYWHEEL',
        func: 'Torque transmission.',
        precision: 'Runout < 0.05 mm',
        heritage: 'Connecting Spiral to Generator.',
        path: '/mechanical/coupling',
        icon: Settings,
        anchor: { x: 480, y: 420 },
        labelPos: { top: '35%', left: '40%' }
    },
    {
        id: 'temp-spiral-case',
        name: 'SPIRAL CASE',
        func: 'Distributes water.',
        precision: 'Surface smoothness',
        heritage: 'Snail shell geometry.',
        path: '/francis/modules/spiral-case',
        icon: Droplets,
        anchor: { x: 720, y: 460 },
        labelPos: { top: '65%', left: '60%' }
    },
    {
        id: 'temp-runner',
        name: 'FRANCIS RUNNER',
        func: 'Energy converter.',
        precision: 'Efficiency 94%',
        heritage: 'Heart of the turbine.',
        path: '/francis/modules/runner',
        icon: Target,
        anchor: { x: 720, y: 460 },
        labelPos: { top: '50%', left: '55%' }
    },
    {
        id: 'temp-miv',
        name: 'MAIN INLET VALVE (MIV)',
        func: 'Isolation Valve.',
        precision: 'Zero Leakage',
        heritage: 'Safety barrier.',
        path: '/francis/modules/miv',
        icon: Settings,
        anchor: { x: 960, y: 400 },
        labelPos: { top: '35%', left: '80%' }
    },
    {
        id: 'temp-penstock',
        name: 'PENSTOCK',
        func: 'Inlet pipe.',
        precision: 'Weld integrity',
        heritage: 'High pressure delivery.',
        path: '/maintenance/bolt-torque',
        icon: ShieldCheck,
        anchor: { x: 1120, y: 430 },
        labelPos: { top: '55%', left: '85%' }
    },
    // Auxiliaries maintained
    {
        id: 'temp-control',
        name: 'CONTROL CABINET',
        func: 'Local control panel.',
        precision: 'Response < 20ms',
        heritage: 'Machine floor brain.',
        path: '/operations/control-center',
        icon: Compass,
        anchor: { x: 100, y: 650 },
        labelPos: { top: '70%', left: '10%' }
    },
    {
        id: 'temp-hpu',
        name: 'HPU',
        func: 'Hydraulic Power Unit.',
        precision: 'Pressure +/- 2 bar',
        heritage: 'Power for servos.',
        path: '/mechanical/hpu',
        icon: Activity,
        anchor: { x: 200, y: 650 },
        labelPos: { top: '75%', left: '18%' }
    },
    {
        id: 'temp-gen-cooling',
        name: 'GENERATOR COOLING',
        func: 'Cooling cabinet/system.',
        precision: 'Delta T < 10C',
        heritage: 'Keeps stator cool.',
        path: '/electrical/cooling',
        icon: Droplets,
        anchor: { x: 250, y: 150 },
        labelPos: { top: '10%', left: '25%' }
    },
    {
        id: 'temp-lubrication',
        name: 'LUBRICATION',
        func: 'Bearing lube.',
        precision: 'Flow rate monitoring',
        heritage: 'Top of shaft.',
        path: '/francis/modules/lubrication',
        icon: ShieldCheck,
        anchor: { x: 720, y: 350 },
        labelPos: { top: '25%', left: '60%' }
    },
    {
        id: 'temp-pressure-eq',
        name: 'PRESSURE EQ',
        func: 'Bypass for pressure balancing.',
        precision: 'Valve calibration',
        heritage: 'Prevents water hammer.',
        path: '/francis/modules/miv',
        icon: Activity,
        anchor: { x: 950, y: 300 },
        labelPos: { top: '25%', left: '75%' }
    }
];
