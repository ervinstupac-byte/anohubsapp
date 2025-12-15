import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Answers, } from '../types.ts'; // Preimenujemo import da ne bude sukoba

// --- RISK CONFIGURATION ---
const riskKeywords: Record<string, { high: string[], medium: string[] }> = {
    q1: { high: ['no'], medium: ['not documented'] }, 
    q2: { high: ['no'], medium: ['partially'] },
    q4: { high: ['no'], medium: ['sometimes'] }, 
    q5: { high: ['frequently'], medium: ['occasionally'] },
    q6: { high: ['not maintained'], medium: ['partially filled'] },
    q7: { high: ['often we only fix the symptom'], medium: ['sometimes we only fix the symptom'] },
    q8: { high: ['no'], medium: ['in testing phase'] }, 
    q9: { high: ['no'], medium: ['limited access'] },
    q10: { high: ['not monitored'], medium: ['monitored periodically'] },
    q11: { high: ['no', 'do not measure'], medium: [] }, 
    q12: { high: ['only replacement', 'no, only replacement is offered'], medium: ['sometimes'] },
    q13: { high: ['no'], medium: ['periodically'] }, 
    q14: { high: ['not installed/functional'], medium: ['some require checking'] },
    q15: { high: ['no'], medium: ['outdated'] }, 
    q16: { high: ['manual'], medium: ['semi-automatic'] },
    q17: { high: ['major service needed'], medium: ['requires minor maintenance'] },
};

const LOCAL_STORAGE_KEY_RISK = 'discipline-risk-index';

// Prošireni tip za Context koji uključuje "Neural Link" stanje
interface ExtendedRiskContextType {
    disciplineRiskScore: number;
    updateDisciplineRiskScore: (points: number, action: 'add' | 'set' | 'reset') => void;
    calculateAndSetQuestionnaireRisk: (answers: Answers) => void;
    
    // NOVO: Neural Link State
    riskState: {
        isAssessmentComplete: boolean;
        riskScore: number;
        criticalFlags: number;
        lastAssessmentDate: number | null;
    };
    updateRiskState: (score: number, criticalCount: number) => void;
    resetRiskState: () => void;
}

const RiskContext = createContext<ExtendedRiskContextType | undefined>(undefined);

export const RiskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // --- 1. POSTOJEĆA LOGIKA (Discipline Score) ---
    const [disciplineRiskScore, setDisciplineRiskScore] = useState<number>(() => {
        try {
            const savedRisk = localStorage.getItem(LOCAL_STORAGE_KEY_RISK);
            return savedRisk ? parseInt(savedRisk, 10) : 0;
        } catch { return 0; }
    });

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY_RISK, disciplineRiskScore.toString());
    }, [disciplineRiskScore]);

    const updateDisciplineRiskScore = useCallback((points: number, action: 'add' | 'set' | 'reset') => {
        if (action === 'reset') setDisciplineRiskScore(0);
        else if (action === 'set') setDisciplineRiskScore(points);
        else setDisciplineRiskScore(prev => prev + points);
    }, []);

    const calculateAndSetQuestionnaireRisk = useCallback((answers: Answers) => {
        let score = 0;
        Object.keys(answers).forEach(qId => {
            const answer = answers[qId]?.toLowerCase();
            const riskDef = riskKeywords[qId];
            if (!answer || !riskDef) return;
            if (riskDef.high.some(k => answer.includes(k))) score += 15;
            else if (riskDef.medium.some(k => answer.includes(k))) score += 5;
        });
        updateDisciplineRiskScore(score, 'set');
    }, [updateDisciplineRiskScore]);

    // --- 2. NOVA LOGIKA (Neural Link) ---
    const [riskState, setRiskState] = useState({
        isAssessmentComplete: false,
        riskScore: 0,
        criticalFlags: 0,
        lastAssessmentDate: null as number | null
    });

    const updateRiskState = (score: number, criticalCount: number) => {
        setRiskState({
            isAssessmentComplete: true,
            riskScore: score,
            criticalFlags: criticalCount,
            lastAssessmentDate: Date.now()
        });
    };

    const resetRiskState = () => {
        setRiskState({
            isAssessmentComplete: false,
            riskScore: 0,
            criticalFlags: 0,
            lastAssessmentDate: null
        });
    };

    return (
        <RiskContext.Provider value={{ 
            disciplineRiskScore, 
            updateDisciplineRiskScore, 
            calculateAndSetQuestionnaireRisk,
            riskState, 
            updateRiskState, 
            resetRiskState 
        }}>
            {children}
        </RiskContext.Provider>
    );
};

export const useRisk = () => {
    const context = useContext(RiskContext);
    if (context === undefined) {
        throw new Error('useRisk must be used within a RiskProvider');
    }
    return context;
};