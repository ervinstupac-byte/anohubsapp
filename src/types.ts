// src/types.ts

import React from 'react';

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
    | 'riskReport'
    | 'revitalizationStrategy'
    | 'digitalIntegrity'
    | 'contractManagement'
    | 'globalMap'; // Uključeno 'globalMap'

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

// --- TURBINES ---
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

/**
 * AŽURIRANA STRUKTURA OPERATIONAL DATA
 * Sadrži SVA polja koja se koriste u RiskAssessment.tsx (nova)
 * i u Questionnaire.tsx, GeminiService.ts, PDFGenerator.ts (stara).
 * Rješava greške TS2339.
 */
export interface OperationalData {
    // Polja koja se koriste u starim/postojećim komponentama
    head: string; // m (koristi Questionnaire, Gemini, PDF)
    flow: string; // m3/s (koristi Questionnaire, Gemini, PDF)
    pressure: string; // bar (koristi Questionnaire, PDF)
    output: string; // MW (koristi Questionnaire, Gemini, PDF)

    // Polja koja se koriste u RiskAssessment.tsx i QuestionnaireContext.tsx
    commissioningYear: string; 
    maintenanceCycle: string; 
    powerOutput: string; // Duplicira gornji 'output' ali je zadržan za svaki slučaj
    turbineType: 'Francis' | 'Kaplan' | 'Pelton' | ''; 
}

export interface QuestionnaireContextType {
    answers: Answers;
    description: string;
    selectedTurbine: TurbineType | null;
    operationalData: OperationalData;
    isQuestionnaireDataFresh: boolean;
    
    // Ispravan potpis funkcije za rješavanje TS2554 u Questionnaire.tsx
    setAnswer: (questionId: string, answer: string) => void;
    setOperationalData: (key: keyof OperationalData, value: string) => void; 
    
    // Ostale funkcije
    setAnswers: React.Dispatch<React.SetStateAction<Answers>>;
    setDescription: (desc: string) => void;
    setSelectedTurbine: (turbine: TurbineType | null) => void;
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

// --- INSTALLATION GUARANTEE ---
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

// --- INO-HUB ---
export interface HPPImprovement {
    id: string;
    title: string;
    description: string;
    category: 'Mechanical' | 'Digital' | 'Ecological' | 'Systemic';
}

// --- TOAST NOTIFICATIONS ---
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastContextType {
    showToast: (message: string, type: ToastType) => void;
}

// --- ASSET (Global Map) ---
export interface Asset {
    id: number;
    name: string;
    lat: number;
    lng: number;
    status: 'Operational' | 'Warning' | 'Critical' | 'Offline';
    power_output: string;
    type: string;
    country?: string;
}