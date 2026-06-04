import { create } from 'zustand';
import { supabase, getSafeClient } from '../services/supabaseClient.ts';
import ExperienceLedgerService from '../services/ExperienceLedgerService';
import { useTelemetry } from '../contexts/TelemetryContext.tsx';
import { useRisk } from '../contexts/RiskContext.tsx';
import { useAppStore } from './useAppStore';
import idAdapter from '../utils/idAdapter';
import { sanitizeEtaInputs } from '../utils/etaSanitizer';
import { GuidedDiagnosisModal } from '../components/GuidedDiagnosisModal';

export interface Diagnosis {
    id: string;
    symptom_key: string;
    diagnosis: string;
    recommended_action: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface CorrelationResult {
    symptom: string;
    source: 'TELEMETRY' | 'RISK' | 'CORRELATED' | 'FIELD_LOG';
    message: string;
    diagnosis?: Diagnosis;
}

export interface IntuitionQuery {
    id: string;
    assetId: number;
    primarySymptom: string;
    query: string;
    options: { label: string; value: string; resultSymptom: string }[];
}

export interface ShiftLogEntry {
    id: string;
    assetId: number;
    workerName: string;
    observation: string;
    timestamp: number;
}

interface DiagnosticStore {
    activeDiagnoses: CorrelationResult[];
    activeQuery: IntuitionQuery | null;
    shiftLogs: ShiftLogEntry[];
    processInstabilitySummary: (assetId: number) => { sigma: number; samples: number[] } | null;
    getTroubleshootingAdvice: (symptomKey: string) => Promise<Diagnosis | null>;
    recordLessonLearned: (lesson: { symptom: string; cause: string; resolution: string }) => Promise<void>;
    submitQueryResponse: (response: string) => void;
    clearQuery: () => void;
    addShiftLog: (entry: Omit<ShiftLogEntry, 'id' | 'timestamp'>) => void;
}

// SPC buffers: map numeric assetId -> array of last N eta samples
const etaBuffersRef: Record<number, number[]> = {};
const SPC_WINDOW = 10;

const pushEtaSample = (assetId: number, sample: number) => {
    const a = Number(assetId);
    if (!etaBuffersRef[a]) etaBuffersRef[a] = [];
    etaBuffersRef[a].push(sample);
    if (etaBuffersRef[a].length > SPC_WINDOW) etaBuffersRef[a].shift();
};

const computeSigma = (arr: number[]) => {
    const n = arr.length;
    if (n < 2) return 0;
    const mean = arr.reduce((s, v) => s + v, 0) / n;
    const variance = arr.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / (n - 1);
    return Math.sqrt(variance);
};

// Field Log Correlation Logic
const correlateLog = (text: string): CorrelationResult | null => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('vibrira') || lowerText.includes('vibracije')) {
        if (lowerText.includes('cijevi') || lowerText.includes('fix')) {
            return {
                symptom: 'SPEC_CHANGE_VAL',
                source: 'FIELD_LOG',
                message: "Sličan simptom zabilježen prije havarije #2024-KM. Preporučena hitna provjera fiksatora cijevi."
            };
        }
    }
    if (lowerText.includes('struganje') || lowerText.includes('metal')) {
        return {
            symptom: 'METAL_SCRAPING',
            source: 'FIELD_LOG',
            message: "KRITIČNO: Izvještaj o struganju metala. Moguće oštećenje ležaja ili zaptivača."
        };
    }
    return null;
};

export const useDiagnosticStore = create<DiagnosticStore>((set, get) => ({
    activeDiagnoses: [],
    activeQuery: null,
    shiftLogs: [],

    processInstabilitySummary: (assetId: number) => {
        const buf = etaBuffersRef[assetId] || [];
        const sigma = computeSigma(buf);
        return buf.length ? { sigma, samples: buf.slice() } : null;
    },

    getTroubleshootingAdvice: async (symptomKey: string) => {
        const { data } = await supabase
            .from('expert_knowledge_base')
            .select('*')
            .eq('symptom_key', symptomKey)
            .single();
        return data as Diagnosis;
    },

    recordLessonLearned: async (lesson: { symptom: string; cause: string; resolution: string }) => {
        const { showToast } = useAppStore.getState();
        try {
            await ExperienceLedgerService.record({
                symptom_observed: lesson.symptom,
                actual_cause: lesson.cause,
                resolution_steps: lesson.resolution
            });
            showToast('Experience Ledger updated', 'success');
        } catch (e) {
            try {
                await supabase.from('experience_ledger').insert({
                    symptom_observed: lesson.symptom,
                    actual_cause: lesson.cause,
                    resolution_steps: lesson.resolution
                });
                showToast('Experience Ledger updated (fallback)', 'success');
            } catch (err) {
                console.warn('Failed to record lesson learned', err);
                showToast('Failed to update Experience Ledger', 'error');
            }
        }
    },

    submitQueryResponse: (value: string) => {
        const { activeQuery, activeDiagnoses } = get();
        const { showToast } = useAppStore.getState();
        if (!activeQuery) return;
        const option = activeQuery.options.find(o => o.value === value);
        if (option) {
            set({
                activeDiagnoses: [
                    ...activeDiagnoses,
                    {
                        symptom: option.resultSymptom,
                        source: 'CORRELATED',
                        message: `Intuition Result: ${option.label}`
                    }
                ],
                activeQuery: null
            });
            showToast('EKB Updated', 'success');
        }
    },

    clearQuery: () => set({ activeQuery: null }),

    addShiftLog: (entry: Omit<ShiftLogEntry, 'id' | 'timestamp'>) => {
        const { shiftLogs, activeDiagnoses } = get();
        const { showToast } = useAppStore.getState();
        const newEntry: ShiftLogEntry = {
            ...entry,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now()
        };
        const correlation = correlateLog(entry.observation);
        set({
            shiftLogs: [newEntry, ...shiftLogs],
            activeDiagnoses: correlation ? [...activeDiagnoses, correlation] : activeDiagnoses
        });
        if (correlation) {
            showToast('Field Intuition Match Found!', 'warning');
        }
    }
}));
