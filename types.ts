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
    id: string;
    title: string;
    description: string;
    category: 'Mechanical' | 'Digital' | 'Ecological' | 'Systemic';
}

export interface ProtocolStep {
    id: string;
    title: string;
    details: string[];
    critical?: boolean;
}

export interface ProtocolSection {
    id: string;
    title: string;
    steps: ProtocolStep[];
}

export type AppView = 'hub' | 'riskAssessment' | 'investorBriefing' | 'standardOfExcellence' | 'digitalIntroduction' | 'hppImprovements' | 'installationGuarantee' | 'genderEquity' | 'hppBuilder' | 'turbineDetail' | 'phaseGuide' | 'suggestionBox';