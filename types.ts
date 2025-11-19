import React from 'react';

export interface TurbineType {
  id: string;
  name: string;
  description: string;
}

export interface TurbineCategory {
  name: string;
  types: TurbineType[];
}

export type TurbineCategories = Record<string, TurbineCategory>;

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

export interface HPPImprovement {
    id:string;
    title: string;
    description: string;
    category: 'Mechanical' | 'Digital' | 'Ecological' | 'Systemic';
}

export type VerificationStatus = 'Pending' | 'Verified' | 'Failed' | 'Reworked';

export interface VerificationData {
    value: string;
    comment: string;
    logbookConfirmed: boolean;
    status: VerificationStatus;
    timestamp?: string;
}

export interface ProtocolStep {
    id: string;
    title: string;
    details: string[];
    risk?: 'Critical' | 'High Risk' | 'Standard';
    tooltip?: string;
    validation?: {
        type: 'number';
        condition: 'lessThanOrEqual' | 'greaterThanOrEqual';
        value: number;
    }
}

export interface ProtocolSection {
    id: string;
    title: string;
    steps: ProtocolStep[];
}

export type AppView = 'hub' | 'riskAssessment' | 'investorBriefing' | 'standardOfExcellence' | 'digitalIntroduction' | 'hppImprovements' | 'installationGuarantee' | 'genderEquity' | 'hppBuilder' | 'turbineDetail' | 'phaseGuide' | 'suggestionBox' | 'riverWildlife' | 'questionnaireSummary' | 'revitalizationStrategy' | 'digitalIntegrity' | 'contractManagement';

export interface NavigationContextType {
    navigateTo: (view: AppView) => void;
    navigateBack: () => void;
    navigateToHub: () => void;
    navigateToTurbineDetail: (turbineKey: string) => void;
    showFeedbackModal: () => void;
}

export interface TurbineRecommendation {
    key: string;
    score: number;
    reasons: string[];
    isBest: boolean;
}

export interface QuestionnaireContextType {
  answers: Answers;
  description: string;
  selectedTurbine: TurbineType | null;
  operationalData: OperationalData;
  isQuestionnaireDataFresh: boolean;
  setAnswers: React.Dispatch<React.SetStateAction<Answers>>;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  setSelectedTurbine: React.Dispatch<React.SetStateAction<TurbineType | null>>;
  setOperationalData: React.Dispatch<React.SetStateAction<OperationalData>>;
  setIsQuestionnaireDataFresh: React.Dispatch<React.SetStateAction<boolean>>;
  resetQuestionnaire: () => void;
}

export interface RiskContextType {
  disciplineRiskScore: number;
  updateDisciplineRiskScore: (points: number, action: 'add' | 'set' | 'reset') => void;
  calculateAndSetQuestionnaireRisk: (answers: Answers) => void;
}


// HPP Builder Types
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
    name: string;
    id: string;
}