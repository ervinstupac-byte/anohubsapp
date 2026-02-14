import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase, getSafeClient } from '../services/supabaseClient.ts';
import ExperienceLedgerService from '../services/ExperienceLedgerService';
import { useTelemetry } from './TelemetryContext.tsx';
import { useRisk } from './RiskContext.tsx';
import { useToast } from '../stores/useAppStore';
import idAdapter from '../utils/idAdapter';
import { sanitizeEtaInputs } from '../utils/etaSanitizer';

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

interface DiagnosticContextType {
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

const DiagnosticContext = createContext<DiagnosticContextType | undefined>(undefined);

import { GuidedDiagnosisModal } from '../components/GuidedDiagnosisModal';

export const DiagnosticProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeDiagnoses, setActiveDiagnoses] = useState<CorrelationResult[]>([]);
    const [activeQuery, setActiveQuery] = useState<IntuitionQuery | null>(null);
    const [shiftLogs, setShiftLogs] = useState<ShiftLogEntry[]>([]);
    const { telemetry } = useTelemetry();
    const { engineeringHealthState, riskState } = useRisk();
    const { showToast } = useToast();

    // SPC buffers: map numeric assetId -> array of last N eta samples
    const etaBuffersRef = useRef<Record<number, number[]>>({});
    const SPC_WINDOW = 10;

    const pushEtaSample = (assetId: number, sample: number) => {
        const a = Number(assetId);
        if (!etaBuffersRef.current[a]) etaBuffersRef.current[a] = [];
        etaBuffersRef.current[a].push(sample);
        if (etaBuffersRef.current[a].length > SPC_WINDOW) etaBuffersRef.current[a].shift();
    };

    const computeSigma = (arr: number[]) => {
        const n = arr.length;
        if (n < 2) return 0;
        const mean = arr.reduce((s, v) => s + v, 0) / n;
        // unbiased sample standard deviation (N-1)
        const variance = arr.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / (n - 1);
        return Math.sqrt(variance);
    };

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

            // 1. Check for Telemetry Alarms and Vibration Thresholds
            const assetIds = Object.keys(telemetry).map(id => Number(id)).filter(n => !Number.isNaN(n));
            const thresholdsMap: Record<string, number> = {};
            try {
                const { data: tcfgs } = await supabase.from('threshold_configs').select('asset_id, vibration_mm_s').in('asset_id', assetIds);
                (tcfgs || []).forEach((t: any) => { thresholdsMap[String(t.asset_id)] = Number(t.vibration_mm_s || 4.5); });
            } catch (e) {
                // ignore, fall back to defaults
            }

            Object.entries(telemetry).forEach(([assetId, t]) => {
                if (t.status === 'CRITICAL') {
                    results.push({
                        symptom: 'TELEMETRY_ALARM',
                        source: 'TELEMETRY',
                        message: `Critical alarm detected on ${assetId}: ${t.incidentDetails || ''}`
                    });
                }

                // Field-Incident Safeguard: Metal Scraping check
                const maxMag = Math.max(...(t.vibrationSpectrum || [0]));
                if (maxMag > 0.7) {
                    results.push({
                        symptom: 'METAL_SCRAPING',
                        source: 'CORRELATED',
                        message: `ACOUSTIC ALERT: High magnitude frequencies detected on ${assetId}. Probable metal contact.`
                    });
                }

                // Vibration threshold check (mm/s) - default 4.5
                const latestVib = Number((t as any).francis_data?.stay_ring_vibration ?? t.vibration ?? t.rotorHeadVibration ?? 0);
                const thresh = thresholdsMap[String(assetId)] ?? 4.5;
                if (!Number.isNaN(latestVib) && latestVib > thresh) {
                    results.push({
                        symptom: 'ELEVATED_VIBRATION',
                        source: 'TELEMETRY',
                        message: `Vibration ${latestVib.toFixed(2)} mm/s exceeds threshold ${thresh} mm/s for asset ${assetId}`
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

    // SPC: monitor telemetry efficiency / computed eta and flag instability
    useEffect(() => {
        // iterate telemetry entries
        Object.entries(telemetry).forEach(async ([aid, t]) => {
            const numeric = idAdapter.toNumber(aid);
            if (numeric === null) return;

            // prefer P/Q/H if present
            const sanitizedFromPQH = sanitizeEtaInputs({ P: (t as any).P, Q: (t as any).Q, H: (t as any).H });

            let etaVal: number | null = null;
            if (sanitizedFromPQH) {
                etaVal = sanitizedFromPQH.eta;
            } else if ((t as any).efficiency !== undefined && (t as any).efficiency !== null) {
                // telemetry efficiency may be percentage (0-100) or fraction (0-1)
                const raw = Number((t as any).efficiency);
                if (Number.isFinite(raw)) etaVal = raw > 1 ? raw / 100 : raw;
            }

            if (etaVal === null || !Number.isFinite(etaVal)) return;

            // push sample and compute sigma
            pushEtaSample(numeric, etaVal);
            const buf = etaBuffersRef.current[numeric] || [];
            const sigma = computeSigma(buf);

            if (sigma > 0.05) {
                // Flag instability
                setActiveDiagnoses(prev => [
                    ...prev,
                    {
                        symptom: 'PROCESS_INSTABILITY',
                        source: 'TELEMETRY',
                        message: `Process Instability detected (σ=${sigma.toFixed(4)}) for asset ${numeric}`
                    }
                ]);

                showToast(`Process Instability detected for asset ${numeric} (σ=${sigma.toFixed(3)})`, 'warning');

                // Persist event (best-effort) for audit
                try {
                    const client = getSafeClient();
                    const assetDbId = idAdapter.toDb(numeric);
                    await client.from('process_instability_events').insert([{ asset_id: assetDbId, sigma, samples: buf, timestamp: new Date().toISOString() }]);
                } catch (e) {
                    console.warn('SPC event log failed', e);
                }
            }
        });
    }, [telemetry]);

    const processInstabilitySummary = (assetId: number) => {
        const buf = etaBuffersRef.current[assetId] || [];
        const sigma = computeSigma(buf);
        return buf.length ? { sigma, samples: buf.slice() } : null;
    };

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
        try {
            await ExperienceLedgerService.record({
                symptom_observed: lesson.symptom,
                actual_cause: lesson.cause,
                resolution_steps: lesson.resolution
            });
            showToast('Experience Ledger updated', 'success');
        } catch (e) {
            // fallback to direct insert if service fails
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
    };

    return (
        <DiagnosticContext.Provider value={{
            activeDiagnoses,
            activeQuery,
            shiftLogs,
            processInstabilitySummary,
            getTroubleshootingAdvice,
            recordLessonLearned,
            submitQueryResponse,
            clearQuery,
            addShiftLog
        }}>
            {children}
            {activeQuery && <GuidedDiagnosisModal query={activeQuery} />}
        </DiagnosticContext.Provider>
    );
};

export const useDiagnostic = () => {
    const context = useContext(DiagnosticContext);
    if (!context) throw new Error('useDiagnostic must be used within DiagnosticProvider');
    return context;
};
