import { z } from 'zod';

// --- GLOBAL VIEW TYPES ---
export type AppView =
  | 'home' // Alias za hub
  | 'hub'
  | 'login' // Dodano za Auth
  | 'intro' // Alias za digitalIntroduction
  | 'onboarding'
  | 'profile'
  | 'globalMap'
  | 'riskAssessment'
  | 'questionnaireSummary'
  | 'riskReport'
  | 'installationGuarantee'
  | 'installation' // Alias
  | 'hppBuilder'
  | 'investorBriefing'
  | 'investor' // Alias
  | 'contractManagement'
  | 'contracts' // Alias
  | 'digitalIntegrity'
  | 'integrity' // Alias
  | 'revitalizationStrategy'
  | 'library'
  | 'hppImprovements'
  | 'improvements' // Alias
  | 'phaseGuide'
  | 'phases' // Alias
  | 'standardOfExcellence'
  | 'standard' // Alias
  | 'riverWildlife'
  | 'wildlife' // Alias
  | 'genderEquity'
  | 'gender' // Alias
  | 'digitalIntroduction'
  | 'turbineDetail'
  | 'maintenanceDashboard'
  | 'adminApproval';

// --- SHARED DATA TYPES ---
export type Answers = Record<string, string>;

// --- ASSET MANAGEMENT ---
export interface Asset {
  id: string;
  name: string;
  type: 'HPP' | 'Solar' | 'Wind';
  location: string;
  coordinates: [number, number];
  capacity: number; // MW
  status: 'Operational' | 'Maintenance' | 'Planned' | 'Critical' | 'Warning';
  imageUrl?: string;
  turbine_type?: string;
  totalOperatingHours?: number;
  hoursSinceLastOverhaul?: number;
  startStopCount?: number;
  specs?: Record<string, any>; // Flexible storage for turbine-specific data (e.g. FrancisHorizontalSpecs)
  assetPassport?: AssetPassport;
  turbineProfile?: TurbineProfile; // NEW: Dynamic Asset Profiling
}

export interface TurbineProfile {
  type: 'francis' | 'kaplan' | 'pelton';
  configuration: 'horizontal' | 'vertical';
  rpmNominal: number; // For ISO thresholds
  specificParams: {
    // Francis
    labyrinthType?: 'stepped' | 'smooth' | 'grooved';
    guideVaneCount?: number;
    runnerDiameter?: number;

    // Kaplan
    bladeCount?: number;
    pitchMechanism?: 'hydraulic' | 'mechanical';
    hubDiameter?: number;

    // Pelton
    needleCount?: number;
    nozzleType?: 'single' | 'multi';
    bucketCount?: number;
    needleGap?: number; // Nominal gap
  };
}

export interface AssetContextType {
  assets: Asset[];
  selectedAsset: Asset | null;
  activeProfile: AssetProfile | null;
  selectAsset: (id: string) => void;
  loading: boolean;
  addAsset: (newAsset: Omit<Asset, 'id'>) => Promise<void>;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  logActivity: (assetId: string, category: 'MAINTENANCE' | 'DESIGN' | 'SYSTEM', message: string, changes?: { oldVal: any, newVal: any }) => void;
  assetLogs: AssetHistoryEntry[];
  // --- NEW: Golden Thread additions ---
  isAssetSelected: boolean;
  clearSelection: () => void;
}

export interface AssetHistoryEntry {
  id: string;
  assetId: string;
  date: string;
  category: 'MAINTENANCE' | 'DESIGN' | 'SYSTEM';
  message: string;
  author: string;
  changes?: { oldVal: any, newVal: any };
  previousHash?: string; // <--- NEW: Crypto Chain
  hash?: string; // <--- NEW: SHA-256 Signature
}

// --- RISK & QUESTIONNAIRE ---
export interface Question {
  id: string;
  text: string;
  options: string[];
  critical?: string;
}

export interface OperationalData {
  commissioningYear: string;
  maintenanceCycle: string;
  powerOutput: number | string;
  turbineType: string;
  head: number | string;
  flow: number | string;
  pressure?: number | string;
  output?: number | string;
  [key: string]: string | number | undefined;
}

export interface QuestionnaireContextType {
  answers: Answers;
  setAnswer: (questionId: string, value: string) => void;
  operationalData: OperationalData;
  setOperationalData: (key: keyof OperationalData, value: string | number) => void;
  description: string;
  setDescription: (text: string) => void;
  resetQuestionnaire: () => void;
}

// --- RISK CONTEXT UPDATE ---
export interface RiskState { // <--- NOVO: Struktura stanja rizika
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  criticalFlags: number;
  isAssessmentComplete: boolean;
}

export interface RiskContextType {
  riskState: RiskState; // <--- NOVO: Umjesto samo disciplineRiskScore
  disciplineRiskScore: number; // Zadržavamo radi kompatibilnosti ako treba
  updateDisciplineRiskScore: (points: number, action: 'add' | 'set' | 'reset') => void;
  calculateAndSetQuestionnaireRisk: (answers: Answers) => void;
}

// --- TOASTS ---
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

// --- TURBINE DATA ---
export interface TurbineType {
  id: string;
  name: string;
  description: string;
}

export interface TurbineCategory {
  name: string;
  description?: string;
  types?: TurbineType[];
}

export type TurbineCategories = Record<string, TurbineCategory>;

// --- HPP BUILDER ---
export interface HPPSettings {
  head: number;
  flow: number;
  efficiency: number;
  powerFactor: number;
  waterQuality: string;
  flowVariation: string;
  penstockLength?: number;
  penstockDiameter?: number;
  penstockRoughness?: number;
  assemblySequence?: { partId: string; alignment?: number; timestamp: number; }[];
}

export interface TurbineRecommendation {
  key: string;
  score: number;
  reasons: string[];
  isBest: boolean;
}

export interface CalculationResult {
  powerMW: number;
  energyGWh: number;
  annualGWh: string;
  n_sq: string;
  netHead?: number;
  frictionLoss?: number;
  revenue?: number;
  capex?: number;
}

export interface SavedConfiguration {
  id: string;
  name: string;
  asset_id?: string;
  timestamp: number;
  parameters: HPPSettings;
  results: CalculationResult;
}

// --- NAVIGATION ---
// Ovdje koristimo currentPage da odgovara onome što smo pisali u NavigationContext.tsx
export interface NavigationContextType {
  currentPage: AppView; // <--- Promijenjeno iz currentView u currentPage radi konzistencije
  navigateTo: (view: AppView) => void;
  navigateBack: () => void;
  navigateToHub: () => void;
  navigateToTurbineDetail: (turbineKey: string) => void;
  showOnboarding: boolean;
  completeOnboarding: () => void;
  showFeedbackModal: () => void;
}

// --- HUB TOOL ---
export interface HubTool {
  id: string;
  title: string;
  description: string;
  icon: string;
  view: AppView;
  isCritical?: boolean;
}

// --- ASSET PASSPORT (NC-4.2) ---
export interface AssetPassport {
  mechanical: {
    runout: number;       // mm
    bearingClearance: number; // mm
    axialPlay: number;    // mm
    governorDeadband: number; // %
    runnerGap: number;
    labyrinthGap: number;
    lastAlignmentCheck: string;
  };
  electrical: {
    statorInsulation: number; // MOhm
    rotorInsulation: number;  // MOhm
    polarizationIndex: number;
    dcBatteryVoltage: number;
    lastRelayTest: string;
  };
  auxiliary: {
    sealLeakageRate: number; // ml/min
    oilViscosity: number;    // cSt
    oilAge: number;          // hours
    lastOilChange: string;
    vibrationSensors: boolean;
    frequencySensors: boolean;
    acousticObservation?: 'Metallic Knocking' | 'High-pitch Squeal' | 'Low-frequency Thumping' | 'Nominal';
  };
  pressureProfile: {
    penstock: number;
    labyrinthFront: number;
    labyrinthRear: number;
    spiralCasing: number;
    draftTube: number;
  };
  kinematics: {
    mivOpeningTime: number;
    mivClosingTime: number;
    distributorCylinderStrokeTime: number;
    bypassType: 'Manual' | 'Electric';
  };
  calculations?: {
    volumetricEfficiencyLoss: number;
    shutdownRisk: 'Low' | 'Medium' | 'High';
    soundVerdict?: string;
    insulationAlert?: string;
    bearingLifeImpact?: string;
  };
}

// --- MODULAR FRAMEWORK (NC-4.2) ---
export interface AssetProfile {
  type: string;
  subType?: string;
  metadata: {
    nominalPowerMW: number;
    manufacturer?: string;
    commissioningDate?: string;
  };
  math: {
    formulas: Record<string, (state: any, constants: any) => any>;
    constants?: Record<string, any>;
    coefficients?: {
      revenuePerMWh: number;
      maintenanceBaseCost: number;
      inefficiencyTaxThreshold: number;
    };
  };
  diagnostics: {
    patterns: any[]; // HeuristicPattern[]
    evaluateSpecialized?: (data: any) => string;
  };
  ui_manifest: {
    passport_sections: {
      id: string;
      title: string;
      fields: {
        id: string;
        label: string;
        type: 'number' | 'string' | 'date' | 'select';
        unit?: string;
        step?: string;
        options?: { label: string; value: any }[];
      }[];
    }[];
  };
}

export type BaseAssetProfile = AssetProfile;

// --- BASE ASSET TEMPLATE (Engineering DNA) ---
export const BaseAssetTemplateSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3),
  type: z.enum(['HPP', 'Solar', 'Wind']),
  turbine_type: z.enum(['FRANCIS', 'KAPLAN', 'PELTON']).optional(),
  capacity: z.number().positive(),
  location: z.string(),
  coordinates: z.tuple([z.number(), z.number()]),
  status: z.enum(['Operational', 'Maintenance', 'Planned', 'Critical', 'Warning']),
  specs: z.record(z.any()).optional(),
  assetPassport: z.any().optional() // Can be further specialized per plugin
});

export type BaseAssetTemplate = z.infer<typeof BaseAssetTemplateSchema>;

// --- INSPECTION IMAGE ---
export interface InspectionImage {
  id: string;
  componentId: string;
  description: string; // German Technical Caption
  src: string; // Base64 or Blob URL
  metadata: {
    timestamp: string;
    gps: string;
  };
  aiTags: string[]; // e.g., 'Kavitation'
}
