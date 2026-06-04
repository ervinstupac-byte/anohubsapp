import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Answers } from '../types.ts';
import { useAppStore } from './useAppStore';

// --- RISK CONFIGURATION ---
const riskKeywords: Record<string, { high: string[]; medium: string[] }> = {
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

interface RiskStore {
  disciplineRiskScore: number;
  updateDisciplineRiskScore: (points: number, action: 'add' | 'set' | 'reset') => void;
  calculateAndSetQuestionnaireRisk: (answers: Answers) => void;

  // Neural Link State
  riskState: {
    isAssessmentComplete: boolean;
    riskScore: number;
    criticalFlags: number;
    lastAssessmentDate: number | null;
    thresholds: Record<string, { high: string[]; medium: string[] }>;
  };
  engineeringHealthState: {
    isAuditComplete: boolean;
    status: 'PENDING' | 'PASSED' | 'FAILED';
    criticalDeviations: number;
  };
  updateRiskState: (score: number, criticalCount: number) => void;
  updateEngineeringHealth: (status: 'PENDING' | 'PASSED' | 'FAILED', deviations: number) => void;
  updateThresholds: (thresholds: Record<string, { high: string[]; medium: string[] }>) => void;
  resetRiskState: () => void;
  checkCoolingHealth: (deltaT: number) => boolean;
}

export const useRiskStore = create<RiskStore>()(
  persist(
    (set, get) => {
      return {
        disciplineRiskScore: 0,
        updateDisciplineRiskScore: (points: number, action: 'add' | 'set' | 'reset') => {
          if (action === 'reset') set({ disciplineRiskScore: 0 });
          else if (action === 'set') set({ disciplineRiskScore: points });
          else set(state => ({ disciplineRiskScore: state.disciplineRiskScore + points }));
        },
        calculateAndSetQuestionnaireRisk: (answers: Answers) => {
          let score = 0;
          Object.keys(answers).forEach(qId => {
            const answer = answers[qId]?.toLowerCase();
            const riskDef = riskKeywords[qId];
            if (!answer || !riskDef) return;
            if (riskDef.high.some(k => answer.includes(k))) score += 15;
            else if (riskDef.medium.some(k => answer.includes(k))) score += 5;
          });
          get().updateDisciplineRiskScore(score, 'set');
        },

        riskState: {
          isAssessmentComplete: false,
          riskScore: 0,
          criticalFlags: 0,
          lastAssessmentDate: null,
          thresholds: riskKeywords,
        },
        engineeringHealthState: {
          isAuditComplete: false,
          status: 'PENDING' as 'PENDING' | 'PASSED' | 'FAILED',
          criticalDeviations: 0,
        },

        updateRiskState: (score: number, criticalCount: number) => {
          set(state => ({
            riskState: {
              ...state.riskState,
              isAssessmentComplete: true,
              riskScore: score,
              criticalFlags: criticalCount + state.engineeringHealthState.criticalDeviations,
              lastAssessmentDate: Date.now(),
            },
          }));
        },
        updateEngineeringHealth: (status: 'PENDING' | 'PASSED' | 'FAILED', deviations: number) => {
          set(state => {
            const newState = {
              engineeringHealthState: {
                isAuditComplete: true,
                status,
                criticalDeviations: deviations,
              },
            };
            // Sync back to riskState if assessment was already done
            if (state.riskState.isAssessmentComplete) {
              return {
                ...newState,
                riskState: {
                  ...state.riskState,
                  criticalFlags:
                    state.riskState.criticalFlags -
                    state.engineeringHealthState.criticalDeviations +
                    deviations,
                },
              };
            }
            return newState;
          });
        },
        updateThresholds: (newThresholds: Record<string, { high: string[]; medium: string[] }>) => {
          set(state => ({
            riskState: {
              ...state.riskState,
              thresholds: { ...state.riskState.thresholds, ...newThresholds },
            },
          }));
        },
        resetRiskState: () => {
          set({
            riskState: {
              isAssessmentComplete: false,
              riskScore: 0,
              criticalFlags: 0,
              lastAssessmentDate: null,
              thresholds: riskKeywords,
            },
          });
        },
        checkCoolingHealth: (deltaT: number) => {
          if (deltaT > 15) {
            const { showToast } = useAppStore.getState();
            showToast(
              'PREDICTIVE ALARM: Delta T excessive - Scaling detected in Cooling Unit.',
              'error'
            );
            return false;
          }
          return true;
        },
      };
    },
    {
      name: 'discipline-risk-index',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({ disciplineRiskScore: state.disciplineRiskScore }),
    }
  )
);
