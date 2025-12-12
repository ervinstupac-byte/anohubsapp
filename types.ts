// types.ts

// --- NAVIGACIJA ---
export type AppView = 
  | 'hub'
  | 'riskAssessment'
  | 'investorBriefing'
  | 'standardOfExcellence'
  | 'digitalIntroduction'
  | 'hppImprovements'
  | 'installationGuarantee'
  | 'genderEquity'
  | 'hppBuilder'
  | 'turbineDetail'
  | 'phaseGuide'
  | 'suggestionBox'
  | 'riverWildlife'
  | 'questionnaireSummary'
  | 'riskReport' // Dodano za Risk Report
  | 'revitalizationStrategy'
  | 'digitalIntegrity'
  | 'contractManagement';

export interface NavigationContextType {
  navigateTo: (view: AppView) => void;
  navigateBack: () => void;
  navigateToHub: () => void;
  navigateToTurbineDetail: (turbineKey: string) => void;
  showFeedbackModal: () => void;
}

// --- HUB ---
export interface HubTool {
  id: string;
  view: AppView;
  title: string;
  description: string;
  icon: string;
  isCritical?: boolean;
  delay?: number;
}

// --- TURBINES (Za Investor Briefing i Questionnaire) ---
export interface TurbineType {
    id: string;
    name: string;
    description: string;
}

export interface TurbineCategory {
    name: string;
    description: string;
    types: TurbineType[];
}

export type TurbineCategories = Record<string, TurbineCategory>;

// --- QUESTIONNAIRE & RISK ---
export interface Question {
    id: string;
    text: string;
    options: string[];
}

export type Answers = Record<string, string>;

export interface OperationalData {
    head: string;
    flow: string;
    pressure: string;
    output: string;
}

export interface QuestionnaireContextType {
    answers: Answers;
    description: string;
    selectedTurbine: TurbineType | null;
    operationalData: OperationalData;
    isQuestionnaireDataFresh: boolean;
    setAnswers: React.Dispatch<React.SetStateAction<Answers>>;
    setDescription: (desc: string) => void;
    setSelectedTurbine: (turbine: TurbineType | null) => void;
    setOperationalData: React.Dispatch<React.SetStateAction<OperationalData>>;
    setIsQuestionnaireDataFresh: (isFresh: boolean) => void;
    resetQuestionnaire: () => void;
}

export interface RiskContextType {
    disciplineRiskScore: number;
    updateDisciplineRiskScore: (points: number, action: 'add' | 'set' | 'reset') => void;
    calculateAndSetQuestionnaireRisk: (answers: Answers) => void;
}

// --- HPP BUILDER (Power Calculator) ---
export type WaterQuality = 'clean' | 'suspended' | 'abrasive' | 'both';
export type FlowVariation = 'stable' | 'seasonal' | 'variable';

export interface HPPSettings {
    head: number;
    flow: number;
    efficiency: number;
    powerFactor: number;
    waterQuality: WaterQuality;
    flowVariation: FlowVariation;
}

export interface SavedConfiguration extends HPPSettings {
    id: string;
    name: string;
}

export interface TurbineRecommendation {
    key: string;
    score: number;
    reasons: string[];
    isBest: boolean;
}

// --- INSTALLATION GUARANTEE (Protokoli) ---
export type RiskLevel = 'Standard' | 'High Risk' | 'Critical';
export type VerificationStatus = 'Pending' | 'Verified' | 'Failed' | 'Reworked';

export interface ValidationRule {
    type: 'number';
    condition: 'lessThanOrEqual' | 'greaterThanOrEqual';
    value: number;
}

export interface ProtocolStep {
    id: string;
    title: string;
    risk: RiskLevel;
    details: string[];
    validation?: ValidationRule;
    tooltip?: string;
}

export interface ProtocolSection {
    id: string;
    title: string;
    steps: ProtocolStep[];
}

export interface VerificationData {
    value: string;
    comment: string;
    logbookConfirmed: boolean;
    status: VerificationStatus;
    timestamp: string;
}

// --- INO-HUB (Improvements) ---
export interface HPPImprovement {
    id: string;
    title: string;
    description: string;
    category: 'Mechanical' | 'Digital' | 'Ecological' | 'Systemic';
}