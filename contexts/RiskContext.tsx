import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Answers, RiskContextType } from '../types';
import { riskKeywords } from '../components/QuestionnaireSummary';

const RiskContext = createContext<RiskContextType | undefined>(undefined);
const LOCAL_STORAGE_KEY_RISK = 'discipline-risk-index';

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