// --- GLOBAL VIEW TYPES ---
// Ovo su svi ekrani koje tvoja aplikacija može prikazati
export type AppView = 
  | 'hub' 
  | 'onboarding'
  | 'profile'
  | 'globalMap'               // Global Map
  | 'riskAssessment'          // Questionnaire
  | 'questionnaireSummary'    // Summary & Gauge
  | 'riskReport'              // PDF Dossier
  | 'installationGuarantee'   // Audit Form
  | 'hppBuilder'              // Physics Engine
  | 'investorBriefing'        // Financials
  | 'contractManagement'      // Smart Contracts
  | 'digitalIntegrity'        // Blockchain Ledger
  | 'revitalizationStrategy'  // Life Extension
  | 'library'                 // Component Library
  | 'hppImprovements'         // Ino-Hub
  | 'phaseGuide'              // Project Guide
  | 'standardOfExcellence'    // Standards
  | 'riverWildlife'           // Ecology
  | 'genderEquity'            // HR Strategy
  | 'digitalIntroduction'     // Manifesto
  | 'turbineDetail';          // Specific Turbine View

// --- SHARED DATA TYPES ---
export type Answers = Record<string, string>;

// --- ASSET MANAGEMENT ---
export interface Asset {
  id: string;
  name: string;
  type: 'HPP' | 'Solar' | 'Wind';
  location: string;
  coordinates: [number, number]; // [lat, lng] za Mapu
  capacity: number; // MW
  status: 'Operational' | 'Maintenance' | 'Planned' | 'Critical' | 'Warning';
  imageUrl?: string;
}

export interface AssetContextType {
  assets: Asset[];
  selectedAsset: Asset | null;
  selectAsset: (id: string) => void;
  loading: boolean;
}

// --- RISK & QUESTIONNAIRE ---
export interface Question {
  id: string;
  text: string;
  options: string[];
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
  [key: string]: string | number | undefined; // Index signature za fleksibilnost
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

export interface RiskContextType {
  disciplineRiskScore: number;
  updateDisciplineRiskScore: (points: number, action: 'add' | 'set' | 'reset') => void; // <--- OVO JE NEDOSTAJALO
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
  annualGWh: string; // String radi prikaza u UI i PDF-u
  n_sq: string;      // Specific speed index
  revenue?: number;
  capex?: number;
  lcoe?: number;
  roi?: number;
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
export interface NavigationContextType {
  currentView: AppView;
  showOnboarding: boolean;
  completeOnboarding: () => void;
  navigateTo: (view: AppView) => void;
  navigateBack: () => void;
  navigateToHub: () => void;
  navigateToTurbineDetail: (turbineKey: string) => void;
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