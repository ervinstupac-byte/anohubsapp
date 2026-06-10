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
    // Spatial anchor for leader line (SVG coordinates in PIXELS for 1184x864 viewBox)
    anchor: { x: number, y: number };
    // Label position in ABSOLUTE PIXELS (must match anchor system)
    labelPos: { x: number, y: number };
}

// NC-4.2 PRECISION TOPOLOGY - ALL COORDINATES IN ABSOLUTE PIXELS
// ViewBox: 1184 x 864
export const TURBINE_COMPONENTS: ComponentDetail[] = [
    // ==============================================
    // CORE TURBINE COMPONENTS (Precise Calibration)
    // ==============================================
    {
        id: 'temp-generator',
        name: 'GENERATOR UNIT',
        func: 'Converts mechanical torque to electrical power via electromagnetic induction.',
        precision: 'Alignment: 0.05 mm/m',
        heritage: 'The electrical heart - far left in the machine hall.',
        path: '/electrical/generator-integrity',
        icon: Zap,
        anchor: { x: 220, y: 380 },      // Center of hitbox (x=100, w=240 → 100+120=220)
        labelPos: { x: 80, y: 150 }       // Above and left of generator
    },
    {
        id: 'temp-shaft-coupling',
        name: 'SHAFT & FLYWHEEL',
        func: 'Transmits torque from turbine to generator with rotational inertia storage.',
        precision: 'Runout < 0.05 mm TIR',
        heritage: 'Kinetic energy buffer for load rejection.',
        path: '/mechanical/coupling',
        icon: Settings,
        anchor: { x: 495, y: 430 },      // Center of hitbox (x=420, w=150 → 420+75=495)
        labelPos: { x: 450, y: 320 }      // Above shaft coupling
    },
    {
        id: 'temp-spiral-case',
        name: 'SPIRAL CASE',
        func: 'Distributes high-pressure water uniformly around the runner circumference.',
        precision: 'Surface: Ra < 6.3 μm',
        heritage: 'The snail shell geometry ensures constant velocity distribution.',
        path: '/francis/modules/spiral-case',
        icon: Droplets,
        anchor: { x: 720, y: 460 },      // Circle center
        labelPos: { x: 850, y: 650 }      // Bottom right of spiral
    },
    {
        id: 'temp-runner',
        name: 'FRANCIS RUNNER',
        func: 'Converts hydraulic energy to mechanical torque through blade channels.',
        precision: 'Blade tolerance: ±0.5 mm',
        heritage: 'The heart of the turbine - where water becomes power.',
        path: '/francis/modules/runner',
        icon: Target,
        anchor: { x: 720, y: 460 },      // Circle center (same as spiral, smaller radius)
        labelPos: { x: 720, y: 280 }      // Directly above runner center
    },
    {
        id: 'temp-miv',
        name: 'MAIN INLET VALVE',
        func: 'Emergency isolation valve for turbine shutdown and maintenance access.',
        precision: 'Zero Leakage Target',
        heritage: 'The safety barrier between penstock pressure and turbine.',
        path: '/francis/modules/miv',
        icon: Settings,
        anchor: { x: 970, y: 430 },      // Center of hitbox (x=900, w=140 → 900+70=970)
        labelPos: { x: 970, y: 200 }      // Above MIV
    },
    {
        id: 'temp-penstock',
        name: 'PENSTOCK',
        func: 'High-pressure conduit delivering water from reservoir to turbine.',
        precision: 'Hoop stress < 150 MPa',
        heritage: 'The artery of the power plant - far right entry point.',
        path: '/maintenance/bolt-torque',
        icon: ShieldCheck,
        anchor: { x: 1117, y: 455 },     // Center of hitbox (x=1050, w=134 → 1050+67=1117)
        labelPos: { x: 1100, y: 300 }     // Above penstock
    },
    // ==============================================
    // NAVIGATION ZONES
    // ==============================================
    {
        id: 'nav-seal',
        name: 'SHAFT SEALING',
        func: 'Prevents water leakage along the main shaft using carbon rings.',
        precision: 'Leakage < 5 L/min',
        heritage: 'Water-lubricated active seal system.',
        path: '/francis/mechanism-detail',
        icon: ShieldCheck,
        anchor: { x: 550, y: 450 },
        labelPos: { x: 50, y: 400 }
    },
    {
        id: 'nav-distributor',
        name: 'DISTRIBUTOR',
        func: 'Controls water flow to the runner via adjustable guide vanes.',
        precision: 'Servo accuracy 0.1%',
        heritage: 'The gas pedal of the turbine.',
        path: '/francis/mechanism-detail',
        icon: Settings,
        anchor: { x: 650, y: 500 },
        labelPos: { x: 50, y: 550 }
    }
];
