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
}

export interface AssetContextType {
  assets: Asset[];
  selectedAsset: Asset | null;
  selectAsset: (id: string) => void;
  loading: boolean;
  addAsset: (newAsset: Omit<Asset, 'id'>) => Promise<void>; // <--- NOVO: Za dodavanje
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