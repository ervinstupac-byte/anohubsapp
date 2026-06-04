/**
 * routes/paths.ts
 *
 * SINGLE SOURCE OF TRUTH for all application routes.
 * Every route in App.tsx must reference constants from this file.
 *
 * Consumed by:
 *   - App.tsx (route definitions)
 *   - navigateTo() in AppLayout
 *   - CommandPalette (searchable route index)
 *   - Sidebar navigation links
 *   - Breadcrumbs
 */

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',

  // ─── Fleet & Dashboard ──────────────────────────────────────────────────────
  FLEET: 'fleet',
  MASTER: 'master',
  EXECUTIVE: 'executive',
  EXECUTIVE_FINANCE: 'executive/finance',
  ALERTS: 'alerts',
  DIAGNOSTIC_TWIN: 'diagnostic-twin',

  // ─── Maintenance ────────────────────────────────────────────────────────────
  MAINTENANCE: {
    ROOT: 'maintenance',
    DASHBOARD: 'dashboard',
    LOGBOOK: 'logbook',
    HYDRAULIC: 'hydraulic',
    BOLT_TORQUE: 'bolt-torque',
    SHADOW_ENGINEER: 'shadow-engineer',
    INTUITION_LOG: 'intuition-log',
    AR_GUIDE: 'ar-guide',
    EXECUTIVE: 'executive',
    ASSET_PASSPORT: 'asset-passport',
    MOUNTER_CARD: 'mounter-card',
    DAMAGE_CARD: 'damage-card',
    ASSET_PASSPORT_CARD: 'asset-passport-card',
    AUTOSTART: 'autostart',
    INTELLIGENT_DIAGNOSTICS: 'intelligent-diagnostics',
    ALIGNMENT: 'alignment',
  },

  // ─── Francis Turbine ────────────────────────────────────────────────────────
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
    },
  },

  // ─── Infrastructure ─────────────────────────────────────────────────────────
  INFRASTRUCTURE: {
    ROOT: 'infrastructure',
    PLANT_MASTER: 'plant-master',
    BID_EVALUATOR: 'bid-evaluator',
    HYDROLOGY: 'hydrology-lab',
  },

  // ─── Analysis & Tools ───────────────────────────────────────────────────────
  MAP: 'map',
  PROFILE: 'profile',
  RISK_ASSESSMENT: 'risk-assessment',
  RISK_REPORT: 'risk-report',
  QUESTIONNAIRE_SUMMARY: 'questionnaire-summary',
  HPP_BUILDER: 'hpp-builder',
  HPP_IMPROVEMENTS: 'hpp-improvements',
  STRUCTURAL_INTEGRITY: 'structural-integrity',
  INSTALLATION_GUARANTEE: 'installation-guarantee',
  LEARNING_LAB: 'learning-lab',
  PRECISION_AUDIT: 'precision-audit',

  // ─── Forensics ──────────────────────────────────────────────────────────────
  FORENSIC_HUB: 'forensic-hub',
  FORENSICS: 'forensics',
  FORENSICS_DEEP_DIVE: 'forensics/deep-dive',

  // ─── Content & Strategy ─────────────────────────────────────────────────────
  DIGITAL_INTRODUCTION: 'digital-introduction',
  DIGITAL_INTEGRITY: 'digital-integrity',
  STANDARD_OF_EXCELLENCE: 'standard-of-excellence',
  CONTRACT_MANAGEMENT: 'contract-management',
  REVITALIZATION_STRATEGY: 'revitalization-strategy',
  INVESTOR_BRIEFING: 'investor-briefing',
  RIVER_WILDLIFE: 'river-wildlife',
  GENDER_EQUITY: 'gender-equity',
  PHASE_GUIDE: 'phase-guide',
  LIBRARY: 'library',

  // ─── Admin & System ─────────────────────────────────────────────────────────
  ADMIN_APPROVAL: 'admin-approval',
  ADMIN_HEALTH: 'admin/health',
  AUDIT: 'audit',
  STRESS_TEST: 'stress-test',
  ACCESS_DENIED: '/access-denied',

  // ─── Multi-tier Entry Points ────────────────────────────────────────────────
  ENGINEER: 'engineer',
  OWNER: 'owner',
  HYDROSCHOOL: 'hydroschool',

  // ─── Special ────────────────────────────────────────────────────────────────
  GENESIS: '/genesis',
  KNOWLEDGE_CAPTURE: '/knowledge/capture',
  KNOWLEDGE_HEALTH: 'knowledge/health-monitor',
  GOVERNANCE_LEDGER: '/governance/ledger',
  ASSET_ONBOARDING: '/asset-onboarding',
  SANDBOX: '/sandbox',
  DOCS_CONSTITUTION: '/docs/constitution',
  VISION: 'vision',
} as const;

// ─── Path builders ──────────────────────────────────────────────────────────
export const getMaintenancePath = (subPath: string) => `/${ROUTES.MAINTENANCE.ROOT}/${subPath}`;
export const getFrancisPath = (subPath: string) => `/${ROUTES.FRANCIS.ROOT}/${subPath}`;

// ─── Commonly used full paths ───────────────────────────────────────────────
export const FRANCIS_PATHS = {
  HUB: getFrancisPath(ROUTES.FRANCIS.HUB),
  COMMAND_CENTER: getFrancisPath(ROUTES.FRANCIS.COMMAND_CENTER),
  DIAGNOSTICS: getFrancisPath(ROUTES.FRANCIS.DIAGNOSTICS.ROOT),
  HEATMAP: getFrancisPath(
    `${ROUTES.FRANCIS.DIAGNOSTICS.ROOT}/${ROUTES.FRANCIS.DIAGNOSTICS.HEATMAP}`
  ),
  FORENSICS: getFrancisPath(
    `${ROUTES.FRANCIS.DIAGNOSTICS.ROOT}/${ROUTES.FRANCIS.DIAGNOSTICS.FORENSICS}`
  ),
  MISSION_CONTROL: getFrancisPath(ROUTES.FRANCIS.MISSION_CONTROL),
  MANIFESTO: getFrancisPath(ROUTES.FRANCIS.MANIFESTO),
} as const;

export const MAINTENANCE_PATHS = {
  DASHBOARD: getMaintenancePath(ROUTES.MAINTENANCE.DASHBOARD),
  BOLT_TORQUE: getMaintenancePath(ROUTES.MAINTENANCE.BOLT_TORQUE),
  HYDRAULIC: getMaintenancePath(ROUTES.MAINTENANCE.HYDRAULIC),
  SHADOW_ENGINEER: getMaintenancePath(ROUTES.MAINTENANCE.SHADOW_ENGINEER),
  ASSET_PASSPORT: getMaintenancePath(ROUTES.MAINTENANCE.ASSET_PASSPORT),
  ALIGNMENT: getMaintenancePath(ROUTES.MAINTENANCE.ALIGNMENT),
} as const;

// ─── Searchable Route Index (for CommandPalette) ────────────────────────────
export interface RouteEntry {
  path: string;
  label: string;
  description: string;
  category: 'fleet' | 'maintenance' | 'francis' | 'analysis' | 'forensics' | 'admin' | 'content';
  keywords: string[];
}

export const ROUTE_INDEX: RouteEntry[] = [
  // Fleet & Dashboard
  {
    path: '/fleet',
    label: 'Fleet Dashboard',
    description: 'Master fleet overview with live telemetry',
    category: 'fleet',
    keywords: ['fleet', 'dashboard', 'overview', 'master'],
  },
  {
    path: '/executive',
    label: 'Executive Dashboard',
    description: 'Real-time analytics and decision support',
    category: 'fleet',
    keywords: ['executive', 'analytics', 'dashboard', 'command'],
  },
  {
    path: '/executive/finance',
    label: 'Financial Dashboard',
    description: 'Revenue, ROI, and financial impact analysis',
    category: 'fleet',
    keywords: ['finance', 'roi', 'revenue', 'money', 'cost'],
  },
  {
    path: '/alerts',
    label: 'SCADA Core',
    description: 'Live alarm management and SCADA interface',
    category: 'fleet',
    keywords: ['scada', 'alarms', 'alerts', 'monitoring', 'hmi'],
  },

  // Maintenance
  {
    path: MAINTENANCE_PATHS.DASHBOARD,
    label: 'Maintenance Dashboard',
    description: 'Work orders, schedules, and maintenance overview',
    category: 'maintenance',
    keywords: ['maintenance', 'work order', 'schedule'],
  },
  {
    path: MAINTENANCE_PATHS.HYDRAULIC,
    label: 'Hydraulic Maintenance',
    description: 'HPU and hydraulic system service',
    category: 'maintenance',
    keywords: ['hydraulic', 'hpu', 'oil', 'servo'],
  },
  {
    path: MAINTENANCE_PATHS.BOLT_TORQUE,
    label: 'Bolt Torque Calculator',
    description: 'Precision bolt torque calculations',
    category: 'maintenance',
    keywords: ['bolt', 'torque', 'flange', 'tightening'],
  },
  {
    path: MAINTENANCE_PATHS.ALIGNMENT,
    label: 'Shaft Alignment Wizard',
    description: 'Step-by-step alignment procedure',
    category: 'maintenance',
    keywords: ['alignment', 'shaft', 'coupling', 'runout'],
  },

  // Francis
  {
    path: FRANCIS_PATHS.HUB,
    label: 'Francis Hub',
    description: 'Francis turbine central command',
    category: 'francis',
    keywords: ['francis', 'turbine', 'hub'],
  },
  {
    path: FRANCIS_PATHS.COMMAND_CENTER,
    label: 'Francis Command Center',
    description: 'Mission control for Francis operations',
    category: 'francis',
    keywords: ['francis', 'command', 'control', 'mission'],
  },
  {
    path: FRANCIS_PATHS.DIAGNOSTICS,
    label: 'Francis Diagnostics',
    description: 'Specialized Francis turbine diagnostics',
    category: 'francis',
    keywords: ['francis', 'diagnostics', 'inspection'],
  },

  // Analysis
  {
    path: '/hpp-builder',
    label: 'HPP Builder',
    description: 'Hydropower plant design studio',
    category: 'analysis',
    keywords: ['builder', 'design', 'hpp', 'hydro', 'plant'],
  },
  {
    path: '/risk-assessment',
    label: 'Risk Assessment',
    description: 'Engineering risk questionnaire',
    category: 'analysis',
    keywords: ['risk', 'assessment', 'questionnaire'],
  },
  {
    path: '/risk-report',
    label: 'Risk Report',
    description: 'Comprehensive risk analysis report',
    category: 'analysis',
    keywords: ['risk', 'report', 'analysis'],
  },
  {
    path: '/structural-integrity',
    label: 'Structural Integrity',
    description: 'Civil and structural health assessment',
    category: 'analysis',
    keywords: ['structural', 'civil', 'integrity', 'dam'],
  },
  {
    path: '/precision-audit',
    label: 'Precision Audit',
    description: 'Engineering precision measurement audit',
    category: 'analysis',
    keywords: ['precision', 'audit', 'measurement', 'tolerance'],
  },
  {
    path: '/learning-lab',
    label: 'Learning Lab',
    description: 'Interactive training and simulation',
    category: 'analysis',
    keywords: ['learning', 'training', 'lab', 'simulation', 'education'],
  },
  {
    path: '/infrastructure',
    label: 'Infrastructure Hub',
    description: 'Plant master, bid evaluator, and hydrology',
    category: 'analysis',
    keywords: ['infrastructure', 'plant', 'hydrology', 'bid'],
  },
  {
    path: '/map',
    label: 'Global Map',
    description: 'Geographic asset overview',
    category: 'analysis',
    keywords: ['map', 'geo', 'location', 'global'],
  },

  // Forensics
  {
    path: '/forensic-hub',
    label: 'Forensic Hub',
    description: 'Deep forensic investigation center',
    category: 'forensics',
    keywords: ['forensic', 'investigation', 'root cause', 'rca'],
  },
  {
    path: '/forensics',
    label: 'Forensic Dashboard',
    description: 'Forensic analysis tools and reports',
    category: 'forensics',
    keywords: ['forensic', 'dashboard', 'analysis'],
  },

  // Admin
  {
    path: '/admin-approval',
    label: 'Admin Approval',
    description: 'Pending approvals and authorizations',
    category: 'admin',
    keywords: ['admin', 'approval', 'authorize'],
  },
  {
    path: '/admin/health',
    label: 'System Health',
    description: 'System health monitoring',
    category: 'admin',
    keywords: ['admin', 'health', 'system', 'status'],
  },
  {
    path: '/audit',
    label: 'Audit Log',
    description: 'System audit trail',
    category: 'admin',
    keywords: ['audit', 'log', 'trail', 'history'],
  },
  {
    path: '/profile',
    label: 'User Profile',
    description: 'Account settings and preferences',
    category: 'admin',
    keywords: ['profile', 'user', 'account', 'settings'],
  },

  // Content
  {
    path: '/digital-introduction',
    label: 'Digital Introduction',
    description: 'System introduction and overview',
    category: 'content',
    keywords: ['intro', 'introduction', 'about'],
  },
  {
    path: '/investor-briefing',
    label: 'Investor Briefing',
    description: 'Investment overview and opportunity analysis',
    category: 'content',
    keywords: ['investor', 'briefing', 'investment'],
  },
  {
    path: '/installation-guarantee',
    label: 'Installation Guarantee',
    description: 'Installation quality assurance standards',
    category: 'content',
    keywords: ['installation', 'guarantee', 'quality'],
  },
  {
    path: '/contract-management',
    label: 'Contract Management',
    description: 'Service contracts and SLA tracking',
    category: 'content',
    keywords: ['contract', 'sla', 'service'],
  },
  {
    path: '/library',
    label: 'Component Library',
    description: 'Engineering component reference library',
    category: 'content',
    keywords: ['library', 'component', 'reference', 'parts'],
  },
];
