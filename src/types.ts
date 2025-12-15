// --- GLOBAL VIEW TYPES ---
export type AppView = 
  | 'hub' | 'risk' | 'install' | 'design' | 'map' 
  | 'investor' | 'contract' | 'integrity' | 'revital' | 'library'
  | 'improvements' | 'guide' | 'standards' | 'wildlife' | 'gender' | 'digital'
  | 'profile' | 'questionnaireSummary' | 'riskReport' | 'turbineDetail'
  | 'riskAssessment' | 'installationGuarantee' | 'hppBuilder' | 'globalMap'
  | 'investorBriefing' | 'standardOfExcellence' | 'digitalIntroduction'
  | 'hppImprovements' | 'genderEquity' | 'phaseGuide' | 'riverWildlife'
  | 'revitalizationStrategy' | 'digitalIntegrity' | 'contractManagement'
  | 'ino' | 'excellence' | 'suggestion' | 'suggestionBox';

// --- SHARED DATA TYPES ---
export type Answers = Record<string, string>;

export interface HubTool {
  id: string;
  title: string;
  description: string;
  icon: string;
  view: AppView;
  isCritical?: boolean;
}

// --- ASSET MANAGEMENT ---
export interface Asset {
  id: string;
  name: string;
  type: 'HPP' | 'Solar' | 'Wind';
  location: string;
  coordinates: [number, number]; // [lat, lng]
  capacity: number; // MW (ovo zamjenjuje power_output)
  status: 'Operational' | 'Maintenance' | 'Planned' | 'Critical' | 'Warning'; // Dodani statusi za mapu
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
  powerOutput: number | string; // Fleksibilno za input
  turbineType: string;
  head: number | string;
  flow: number | string;
  pressure?: number | string;
  output?: number | string;
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
  calculateAndSetQuestionnaireRisk: (answers: Answers) => void;
}

// --- TOASTS ---
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
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
  revenue?: number;
  capex?: number;
  lcoe?: number;
  roi?: number;
  recommendedTurbine?: string;
  n_sq: string;
  annualGWh: string; // String radi prikaza
}

export interface SavedConfiguration {
  id: string;
  name: string;
  asset_id?: string;
  timestamp: number;
  parameters: HPPSettings;
  results: CalculationResult;
}

// --- PDF GENERATOR ---
export interface ProtocolSection {
  title: string;
  content: string;
}

export interface VerificationData {
  technician: string;
  date: string;
  location: string;
  notes: string;
}

// --- NAVIGATION ---
export interface NavigationContextType {
  currentView: AppView;
  navigateTo: (view: AppView) => void;
  navigateBack: () => void;
  navigateToHub: () => void;
  navigateToTurbineDetail: (turbineKey: string) => void;
  showFeedbackModal: () => void;
  showOnboarding: boolean;
  completeOnboarding: () => void;
}