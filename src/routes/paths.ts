export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    MAINTENANCE: {
        ROOT: 'maintenance',
        DASHBOARD: 'maintenance/dashboard',
        LOGBOOK: 'maintenance/logbook',
        HYDRAULIC: 'maintenance/hydraulic',
        BOLT_TORQUE: 'maintenance/bolt-torque',
        SHADOW_ENGINEER: 'maintenance/shadow-engineer', // SOPManager
        INTUITION_LOG: 'maintenance/intuition-log', // ShiftLog
        AR_GUIDE: 'maintenance/ar-guide', // ARManager
        EXECUTIVE: 'maintenance/executive',
    },
    FRANCIS: {
        ROOT: 'francis',
        HUB: 'francis/hub',
        COMMAND_CENTER: 'francis/command-center',
        DIAGNOSTICS: {
            ROOT: 'diagnostics',
            MAIN: 'francis/diagnostics',
            HEATMAP: 'francis/diagnostics/heatmap',
            FORENSICS: 'francis/diagnostics/forensics',
        },
        MISSION_CONTROL: 'francis/mission-control',
        EMERGENCY: 'francis/emergency-protocols',
        LOGIC_LOAD_REJECTION: 'francis/logic-load-rejection',
        FLOWCHART_STARTUP: 'francis/flowchart-startup',
        SOP: {
            WATER_HAMMER: 'sop-water-hammer',
            BEARINGS: 'sop-bearings',
            ALIGNMENT: 'sop-shaft-alignment',
            THRUST_BALANCE: 'sop-thrust-balance',
            VORTEX_CONTROL: 'sop-vortex-control',
            MIV_DISTRIBUTOR: 'sop-miv-distributor',
            REGULATING_RING: 'sop-regulating-ring',
            LINKAGE: 'sop-linkage',
            COUPLING: 'sop-coupling',
            BRAKING_SYSTEM: 'sop-braking-system',
            SEAL_RECOVERY: 'sop-recovery',
            OIL_HEALTH: 'sop-oil-health',
            COOLING_WATER: 'sop-cooling-water',
            DRAINAGE_PUMPS: 'sop-drainage-pumps',
            LUBRICATION: 'sop-lubrication',
            HPU: 'sop-hpu',
            GENERATOR: 'sop-generator-integrity',
            ELECTRICAL_HEALTH: 'sop-electrical-health',
            GOVERNOR_PID: 'sop-governor-pid',
            GRID_SYNC: 'sop-grid-sync',
            DISTRIBUTOR_SYNC: 'sop-distributor-sync',
            DC_SYSTEMS: 'sop-dc-systems',
            EXCITATION: 'sop-excitation',
            TRANSFORMER: 'sop-transformer',
            PENSTOCK: 'sop-penstock',
            INTAKE: 'sop-intake',
            CATHODIC: 'sop-cathodic',
            AUXILIARY: 'sop-auxiliary',
        }
    },
    MAP: 'map',
    PROFILE: 'profile',
    RISK_ASSESSMENT: 'risk-assessment',
    HPP_BUILDER: 'hpp-builder',
    STRUCTURAL_INTEGRITY: 'structural-integrity',
    INSTALLATION_GUARANTEE: 'installation-guarantee',
    LEARNING_LAB: 'learning-lab',
} as const;

// Helper to build full Francis paths
export const getFrancisPath = (subPath: string) => `/${ROUTES.FRANCIS.ROOT}/${subPath}`;

// Commonly used full paths
export const FRANCIS_PATHS = {
    HUB: getFrancisPath(ROUTES.FRANCIS.HUB),
    COMMAND_CENTER: getFrancisPath(ROUTES.FRANCIS.COMMAND_CENTER),
    DIAGNOSTICS: getFrancisPath(ROUTES.FRANCIS.DIAGNOSTICS.ROOT),
    HEATMAP: getFrancisPath(ROUTES.FRANCIS.DIAGNOSTICS.HEATMAP),
    FORENSICS: getFrancisPath(ROUTES.FRANCIS.DIAGNOSTICS.FORENSICS),
    MISSION_CONTROL: getFrancisPath(ROUTES.FRANCIS.MISSION_CONTROL),
} as const;
