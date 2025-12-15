import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Answers, RiskContextType } from '../types.ts';

const RiskContext = createContext<RiskContextType | undefined>(undefined);
const LOCAL_STORAGE_KEY_RISK = 'discipline-risk-index';

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

export const RiskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [disciplineRiskScore, setDisciplineRiskScore] = useState<number>(() => {
        try {
            const savedRisk = localStorage.getItem(LOCAL_STORAGE_KEY_RISK);
            return savedRisk ? parseInt(savedRisk, 10) : 0;
        } catch (error) {
            console.error("Failed to load risk score from localStorage", error);
            return 0;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY_RISK, disciplineRiskScore.toString());
        } catch (error) {
            console.error("Failed to save risk score to localStorage", error);
        }
    }, [disciplineRiskScore]);

    const updateDisciplineRiskScore = useCallback((points: number, action: 'add' | 'set' | 'reset') => {
        if (action === 'reset') {
             setDisciplineRiskScore(0);
        } else if (action === 'set') {
            setDisciplineRiskScore(points);
        } else {
            setDisciplineRiskScore(prev => prev + points);
        }
    }, []);

    const calculateAndSetQuestionnaireRisk = useCallback((answers: Answers) => {
        let score = 0;
        Object.keys(answers).forEach(qId => {
            const answer = answers[qId]?.toLowerCase();
            const riskDef = riskKeywords[qId];
            
            if (!answer || !riskDef) return;

            if (riskDef.high.some(keyword => answer.includes(keyword))) {
                score += 15;
            } else if (riskDef.medium.some(keyword => answer.includes(keyword))) {
                score += 5;
            }
        });
        updateDisciplineRiskScore(score, 'set');
    }, [updateDisciplineRiskScore]);

    const value = {
        disciplineRiskScore,
        updateDisciplineRiskScore,
        calculateAndSetQuestionnaireRisk,
    };

    return (
        <RiskContext.Provider value={value}>
            {children}
        </RiskContext.Provider>
    );
};

export const useRisk = (): RiskContextType => {
    const context = useContext(RiskContext);
    if (context === undefined) {
        throw new Error('useRisk must be used within a RiskProvider');
    }
    return context;
};