export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    MAINTENANCE: {
        ROOT: 'maintenance',
        DASHBOARD: 'dashboard',
        LOGBOOK: 'logbook',
        HYDRAULIC: 'hydraulic',
        BOLT_TORQUE: 'bolt-torque',
        SHADOW_ENGINEER: 'shadow-engineer', // SOPManager
        INTUITION_LOG: 'intuition-log', // ShiftLog
        AR_GUIDE: 'ar-guide', // ARManager
        EXECUTIVE: 'executive',
        ASSET_PASSPORT: 'asset-passport',
        MOUNTER_CARD: 'mounter-card',
        DAMAGE_CARD: 'damage-card',
        ASSET_PASSPORT_CARD: 'asset-passport-card',
        AUTOSTART: 'autostart',
        INTELLIGENT_DIAGNOSTICS: 'intelligent-diagnostics',
    },
    FRANCIS: {
        ROOT: 'francis',
        HUB: 'hub',
        DESIGNER: 'designer',
        COMMAND_CENTER: 'command-center',
        DIAGNOSTICS: {
            ROOT: 'diagnostics',
            MAIN: 'main',
            HEATMAP: 'heatmap',
            FORENSICS: 'forensics',
        },
        MISSION_CONTROL: 'mission-control',
        MANIFESTO: 'manifesto',
        EMERGENCY: 'emergency-protocols',
        LOGIC_LOAD_REJECTION: 'logic-load-rejection',
        FLOWCHART_STARTUP: 'flowchart-startup',
        HORIZONTAL_5MW: 'horizontal-5mw',
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
    DIAGNOSTIC_TWIN: 'diagnostic-twin',
    HPP_BUILDER: 'hpp-builder',
    INFRASTRUCTURE: {
        ROOT: 'infrastructure',
        PLANT_MASTER: 'plant-master',
        BID_EVALUATOR: 'bid-evaluator',
        HYDROLOGY: 'hydrology-lab',
    },
    STRUCTURAL_INTEGRITY: 'structural-integrity',
    INSTALLATION_GUARANTEE: 'installation-guarantee',
    LEARNING_LAB: 'learning-lab',
    FORENSIC_HUB: 'forensic-hub',
} as const;

// Helper to build full paths
export const getMaintenancePath = (subPath: string) => `/${ROUTES.MAINTENANCE.ROOT}/${subPath}`;
export const getFrancisPath = (subPath: string) => `/${ROUTES.FRANCIS.ROOT}/${subPath}`;

// Commonly used full paths
export const FRANCIS_PATHS = {
    HUB: getFrancisPath(ROUTES.FRANCIS.HUB),
    COMMAND_CENTER: getFrancisPath(ROUTES.FRANCIS.COMMAND_CENTER),
    DIAGNOSTICS: getFrancisPath(ROUTES.FRANCIS.DIAGNOSTICS.ROOT),
    HEATMAP: getFrancisPath(`${ROUTES.FRANCIS.DIAGNOSTICS.ROOT}/${ROUTES.FRANCIS.DIAGNOSTICS.HEATMAP}`),
    FORENSICS: getFrancisPath(`${ROUTES.FRANCIS.DIAGNOSTICS.ROOT}/${ROUTES.FRANCIS.DIAGNOSTICS.FORENSICS}`),
    MISSION_CONTROL: getFrancisPath(ROUTES.FRANCIS.MISSION_CONTROL),
    MANIFESTO: getFrancisPath(ROUTES.FRANCIS.MANIFESTO),
} as const;

export const MAINTENANCE_PATHS = {
    DASHBOARD: getMaintenancePath(ROUTES.MAINTENANCE.DASHBOARD),
    BOLT_TORQUE: getMaintenancePath(ROUTES.MAINTENANCE.BOLT_TORQUE),
    HYDRAULIC: getMaintenancePath(ROUTES.MAINTENANCE.HYDRAULIC),
    SHADOW_ENGINEER: getMaintenancePath(ROUTES.MAINTENANCE.SHADOW_ENGINEER),
    ASSET_PASSPORT: getMaintenancePath(ROUTES.MAINTENANCE.ASSET_PASSPORT),
} as const;
