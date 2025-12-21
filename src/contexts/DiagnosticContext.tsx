import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient.ts';
import { useTelemetry } from './TelemetryContext.tsx';
import { useRisk } from './RiskContext.tsx';
import { useToast } from './ToastContext.tsx';

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
    assetId: string;
    primarySymptom: string;
    query: string;
    options: { label: string; value: string; resultSymptom: string }[];
}

export interface ShiftLogEntry {
    id: string;
    assetId: string;
    workerName: string;
    observation: string;
    timestamp: number;
}

interface DiagnosticContextType {
    activeDiagnoses: CorrelationResult[];
    activeQuery: IntuitionQuery | null;
    shiftLogs: ShiftLogEntry[];
    getTroubleshootingAdvice: (symptomKey: string) => Promise<Diagnosis | null>;
    recordLessonLearned: (lesson: { symptom: string; cause: string; resolution: string }) => Promise<void>;
    submitQueryResponse: (response: string) => void;
    clearQuery: () => void;
    addShiftLog: (entry: Omit<ShiftLogEntry, 'id' | 'timestamp'>) => void;
}

const DiagnosticContext = createContext<DiagnosticContextType | undefined>(undefined);

export const DiagnosticProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeDiagnoses, setActiveDiagnoses] = useState<CorrelationResult[]>([]);
    const [activeQuery, setActiveQuery] = useState<IntuitionQuery | null>(null);
    const [shiftLogs, setShiftLogs] = useState<ShiftLogEntry[]>([]);
    const { telemetry } = useTelemetry();
    const { engineeringHealthState, riskState } = useRisk();
    const { showToast } = useToast();

    // Field Log Correlation Logic
    const correlateLog = (text: string): CorrelationResult | null => {
        const lowerText = text.toLowerCase();

        // Dynamic correlation based on historical patterns (EKB emulation)
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

    const addShiftLog = (entry: Omit<ShiftLogEntry, 'id' | 'timestamp'>) => {
        const newEntry: ShiftLogEntry = {
            ...entry,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now()
        };
        setShiftLogs(prev => [newEntry, ...prev]);

        const correlation = correlateLog(entry.observation);
        if (correlation) {
            setActiveDiagnoses(prev => [...prev, correlation]);
            showToast('Field Intuition Match Found!', 'warning');
        }
    };

    useEffect(() => {
        const analyzeCorrelations = async () => {
            const results: CorrelationResult[] = [];

            // 1. Check for Telemetry Alarms
            Object.entries(telemetry).forEach(([assetId, t]) => {
                if (t.status === 'CRITICAL') {
                    results.push({
                        symptom: 'TELEMETRY_ALARM',
                        source: 'TELEMETRY',
                        message: `Critical alarm detected on ${assetId}: ${t.incidentDetails || ''}`
                    });
                }

                // Field-Incident Safeguard: Metal Scraping check
                const maxMag = Math.max(...t.vibrationSpectrum);
                if (maxMag > 0.7) {
                    results.push({
                        symptom: 'METAL_SCRAPING',
                        source: 'CORRELATED',
                        message: `ACOUSTIC ALERT: High magnitude frequencies detected on ${assetId}. Probable metal contact.`
                    });
                }
            });

            // 2. Risk & Structural (Legacy)
            if (engineeringHealthState.criticalDeviations > 0) {
                results.push({
                    symptom: 'STRUCTURAL_DEV',
                    source: 'RISK',
                    message: `Structural integrity deviation detected.`
                });
            }

            // 3. Resolve Diagnoses from EKB (expert_knowledge_base)
            const finalResults: CorrelationResult[] = [];
            for (const r of results) {
                try {
                    const { data: ekb } = await supabase
                        .from('expert_knowledge_base')
                        .select('*')
                        .eq('symptom_key', r.symptom)
                        .single();

                    finalResults.push({ ...r, diagnosis: ekb || undefined });
                } catch (e) {
                    finalResults.push(r);
                }
            }

            // Keep existing FIELD_LOG diagnoses
            setActiveDiagnoses(prev => {
                const logs = prev.filter(p => p.source === 'FIELD_LOG');
                return [...logs, ...finalResults];
            });
        };

        analyzeCorrelations();
    }, [telemetry, engineeringHealthState, riskState]);

    const submitQueryResponse = (value: string) => {
        if (!activeQuery) return;
        const option = activeQuery.options.find(o => o.value === value);
        if (option) {
            setActiveDiagnoses(prev => [
                ...prev,
                {
                    symptom: option.resultSymptom,
                    source: 'CORRELATED',
                    message: `Intuition Result: ${option.label}`
                }
            ]);
            setActiveQuery(null);
            showToast('EKB Updated', 'success');
        }
    };

    const clearQuery = () => setActiveQuery(null);

    const getTroubleshootingAdvice = async (symptomKey: string) => {
        const { data } = await supabase
            .from('expert_knowledge_base')
            .select('*')
            .eq('symptom_key', symptomKey)
            .single();
        return data as Diagnosis;
    };

    const recordLessonLearned = async (lesson: { symptom: string; cause: string; resolution: string }) => {
        await supabase.from('experience_ledger').insert({
            symptom_observed: lesson.symptom,
            actual_cause: lesson.cause,
            resolution_steps: lesson.resolution
        });
        showToast('Experience Ledger updated', 'success');
    };

    return (
        <DiagnosticContext.Provider value={{
            activeDiagnoses,
            activeQuery,
            shiftLogs,
            getTroubleshootingAdvice,
            recordLessonLearned,
            submitQueryResponse,
            clearQuery,
            addShiftLog
        }}>
            {children}
        </DiagnosticContext.Provider>
    );
};

export const useDiagnostic = () => {
    const context = useContext(DiagnosticContext);
    if (!context) throw new Error('useDiagnostic must be used within DiagnosticProvider');
    return context;
};
