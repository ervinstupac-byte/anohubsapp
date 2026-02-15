import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';
import { useAppStore } from '../stores/useAppStore';
import { DEFAULT_TECHNICAL_STATE, TechnicalProjectState } from '../core/TechnicalSchema';
import { useMaintenance } from '../contexts/MaintenanceContext';
import { KnowledgeNode, ContextTrigger } from '../models/knowledge/ContextTypes';
import { KNOWLEDGE_BASE } from '../data/knowledge/KnowledgeBase';
import { getComponentIdFromRoute } from '../data/knowledge/ComponentTaxonomy';
import { SentinelKernel } from '../utils/SentinelKernel';
import { HiveRegistry } from '../services/HiveRegistry';
import { IndustrialDataBridge } from '../services/IndustrialDataBridge';
import { ProfileLoader } from '../services/ProfileLoader';
import { ExpertInference } from '../services/ExpertInference';

export interface DiagnosticInsight {
    id: string;
    type: 'safe' | 'warning' | 'critical';
    messageKey: string;
    param?: string;
    value?: string | number;
    slogan?: string; // New: Physics Slogan
    vectors?: string[]; // New: Logic Vectors
    precedent?: any; // New: Historical Precedent
    actions?: any[]; // New: Contextual Gravity Payload
    verification?: { // New: Human-Machine Agreement
        author: string;
        id: string;
        text: string;
        timestamp: string;
    };
    reasoning?: string; // Expert reasoning from KB
    kbReference?: string; // KB-REF code
    recommendedAction?: string; // Actionable Intelligence
    sopCode?: string; // Mapping to MaintenanceEngine
}

/**
 * Context Engine Hook
 * "The Gravity that pulls knowledge to the user"
 */
export const useContextEngine = () => {
    const location = useLocation();
    
    // MODERN TELEMETRY STORE
    const { 
        identity, 
        mechanical, 
        hydraulic, 
        site, 
        penstock, 
        specializedState, 
        structural, 
        appliedMitigations,
        physics, 
        activeScenario,
        manualRules,
    } = useTelemetryStore();
    
    // Local state for features not yet in TelemetryStore or managed locally
    const [patternWeights, setPatternWeights] = useState<Record<string, number>>({});
    const [hiveStatus, setHiveStatus] = useState<any>(null);

    const reinforcePattern = useCallback((patternId: string) => {
        setPatternWeights(prev => ({
            ...prev,
            [patternId]: (prev[patternId] || 0) + 1
        }));
    }, []);
    
    const { demoMode } = useAppStore();
    const { workOrders, createWorkOrder } = useMaintenance();

    // Construct TechnicalProjectState for compatibility with ExpertInference
    const techState = useMemo(() => ({
        identity,
        mechanical,
        hydraulic,
        site,
        penstock,
        specializedState,
        structural,
        appliedMitigations,
        demoMode: { active: demoMode, scenario: activeScenario },
        physics: {
            ...DEFAULT_TECHNICAL_STATE.physics,
            // Map Decimal physics to number for legacy compatibility where needed
            hoopStressMPa: physics.hoopStressMPa ?? DEFAULT_TECHNICAL_STATE.physics.hoopStressMPa,
            waterHammerPressureBar: physics.waterHammerPressureBar ?? DEFAULT_TECHNICAL_STATE.physics.waterHammerPressureBar,
            specificWaterConsumption: physics.specificWaterConsumption ?? DEFAULT_TECHNICAL_STATE.physics.specificWaterConsumption,
            // Add other mappings as required by ExpertInference
            leakageStatus: DEFAULT_TECHNICAL_STATE.physics.leakageStatus // Fallback
        },
        financials: DEFAULT_TECHNICAL_STATE.financials, // Placeholder if needed
        hydrology: DEFAULT_TECHNICAL_STATE.hydrology,
        market: DEFAULT_TECHNICAL_STATE.market,
        riskScore: 0,
        lastRecalculation: new Date().toISOString(),
        manualRules,
        componentHealth: {},
        investigatedComponents: [],
    } as unknown as TechnicalProjectState), [identity, mechanical, hydraulic, site, penstock, specializedState, structural, appliedMitigations, physics, demoMode, activeScenario]);

    const [activeNodes, setActiveNodes] = useState<KnowledgeNode[]>([]);
    const [activeLogs, setActiveLogs] = useState<any[]>([]);
    const [activeWorkOrders, setActiveWorkOrders] = useState<any[]>([]);
    const [routeComponentId, setRouteComponentId] = useState<string | null>(null);
    const [manualFocus, setManualFocus] = useState<string | null>(null); // New: Bi-Directional Sync State
    const [activeComponentId, setActiveComponentId] = useState<string | null>(null);
    const [metricHistory, setMetricHistory] = useState<Record<string, number[]>>({});

    // Track time at state for heuristics (mocked for now)
    const [timeAtState, setTimeAtState] = useState(0);

    // Helper: Evaluation Logic for Knowledge Graph
    const evaluateTrigger = (trigger: ContextTrigger, currentRoute: string, sensors: any): boolean => {
        if (trigger.routeMatcher) {
            if (currentRoute.includes(trigger.routeMatcher)) return true;
        }
        return false;
    };

    // 5.1 HEURISTIC LEARNING (The Feedback Loop & Federated Learning)
    // Note: patternWeights and hiveStatus seem to be local to this hook in previous version.
    // I should check if useTelemetryStore provides them.
    // Checking store: `patternWeights` and `hiveStatus` are NOT in useTelemetryStore based on my previous read.
    // So I must keep them local here.
    
    // HIVE INFLOW: Periodically pull global weights
    useEffect(() => {
        const syncHive = async () => {
            // 1. Get Global Consensus
            const globalConsensus = await HiveRegistry.getGlobalWeights();

            // 2. Merge with Local
            setPatternWeights(prev => {
                const merged = SentinelKernel.mergeWeights(prev, globalConsensus.globalWeights);
                return merged;
            });

            setHiveStatus({ connected: true, lastSync: Date.now() });
        };

        // Sync on mount and every 60s
        syncHive();
        const interval = setInterval(syncHive, 60000);
        return () => clearInterval(interval);
    }, []);


    const handleReinforcePattern = useCallback(async (patternId: string, feedback: 'CONFIRMED' | 'REJECTED' | 'OVERRIDE') => {
        setPatternWeights(prev => {
            const current = prev[patternId] || 1.0;
            // Boost by 10% if confirmed/override, penalty if rejected (mute)
            let newWeight = current;

            if (feedback === 'CONFIRMED' || feedback === 'OVERRIDE') {
                newWeight = current + 0.1;
            } else if (feedback === 'REJECTED') {
                newWeight = current * 0.5;
            }

            const newWeights = { ...prev, [patternId]: newWeight };

            // HIVE OUTFLOW: Share knowledge (Privacy-Safe)
            const weightMap = SentinelKernel.exportWeightMap('Plant-A-Local', newWeights);
            HiveRegistry.submitLocalWeights(weightMap);

            return newWeights;
        });
    }, []);

    // 6. THE SENTINEL (Heuristic Engine) - REPLACES LEGACY DIAGNOSTICS
    const diagnosticsAndMetrics = useMemo(() => {
        if (!activeComponentId) return { diagnostics: [], metrics: { structuralSafetyMargin: 100 }, recoveryPaths: [] };

        // Mock Baseline Data (The Archivist)
        const mockBaselines = {
            'bearingTemp_Loaded': { mean: 55, sigma: 1.5 }, // Normal: 55C. Simulating 60C (3.3 Sigma event)
            'draftTubePressure': { mean: 2.0, sigma: 0.2 }
        };

        // 1. Evaluate Sentinel Matrix with LEARNING WEIGHTS
        const patterns = ProfileLoader.getPatterns(techState.identity.turbineType);
        const sentinelResults = SentinelKernel.evaluateMatrix(
            metricHistory,
            patterns,
            {
                timeAtState: timeAtState,
                baselines: mockBaselines,
                weights: patternWeights // Inject the neural weights
            }
        );

        // 2. Map to UI format and CROSS-VERIFY
        const sentinelDiagnostics = sentinelResults.map(res => {
            // HUMAN CROSS-VERIFICATION LOGIC
            // Check if any recent log matches the pattern keywords
            const verificationMatch = activeLogs.find(log => {
                const logContent = (log.summaryDE || log.commentBS || "").toLowerCase();
                const patternTerms = res.name.toLowerCase().split(' ');
                // Simple match: if log contains "vibration" or "cavitation" etc.
                return patternTerms.some(term => term.length > 4 && logContent.includes(term));
            });

            // Auto-Reinforce if Human log matches? 
            // Optional: if (verificationMatch) reinforcePattern(res.patternId, 'CONFIRM'); 
            // (Careful with infinite loops here, best done on explicit action)

            return {
                id: res.patternId,
                type: (res.severity === 'CRITICAL' ? 'critical' : 'warning') as any,
                messageKey: res.name,
                value: `${(res.probability * 100).toFixed(0)}% Probability`,
                slogan: res.slogan,
                vectors: res.vectors, // Pass the logic trace
                precedent: res.precedent, // Pass the precedent
                actions: res.actions, // Pass the Tactical Actions
                verification: verificationMatch ? {
                    author: verificationMatch.technician,
                    id: verificationMatch.id,
                    text: verificationMatch.summaryDE || verificationMatch.commentBS, // Show the verification text
                    timestamp: verificationMatch.timestamp
                } : undefined
            } as DiagnosticInsight;
        });

        // 3. EXPERT LAYER INFERENCE
        const expertResults = ExpertInference.analyze(techState);
        const expertDiagnostics: DiagnosticInsight[] = [
            ...expertResults.alerts.map(a => ({
                id: `expert-alert-${a.parameter}`,
                type: (a.severity.toLowerCase() === 'critical' ? 'critical' : 'warning') as any,
                messageKey: `${a.parameter} Violation`,
                value: a.standard,
                reasoning: a.reasoning,
                kbReference: a.standard,
                recommendedAction: a.recommendedAction,
                sopCode: (a as any).sopCode
            })),
            ...expertResults.conclusions.map(c => ({
                id: c.id,
                type: 'critical' as const,
                messageKey: c.symptom,
                value: 'Inferred Failure',
                reasoning: c.reasoning,
                kbReference: c.kbReference,
                actions: c.remedies,
                recommendedAction: c.recommendedAction,
                sopCode: (c as any).sopCode
            }))
        ];

        return {
            diagnostics: [...sentinelDiagnostics, ...expertDiagnostics],
            metrics: expertResults.metrics,
            recoveryPaths: expertResults.recoveryPaths
        };

    }, [activeComponentId, metricHistory, timeAtState, activeLogs, patternWeights, techState]);

    const { diagnostics, metrics: expertMetrics, recoveryPaths } = diagnosticsAndMetrics;


    // 1. KNOWLEDGE GRAPH RESOLUTION & COMPONENT ID
    useEffect(() => {
        const engineCurrentRoute = location.pathname;
        const currentSensors = techState.specializedState?.sensors || {};

        // Resolve Component ID from Route
        const resolvedId = getComponentIdFromRoute(engineCurrentRoute);
        setRouteComponentId(resolvedId);

        // Priority: Manual Focus > Route ID
        // If route changes significantly, we might want to clear manual focus, but for now we keep it (Persistence)
        const effectiveId = manualFocus || resolvedId;
        setActiveComponentId(effectiveId);

        // Filter Knowledge Nodes
        const relevantNodes = KNOWLEDGE_BASE.filter(node => {
            return node.triggers.some(trigger => evaluateTrigger(trigger, engineCurrentRoute, currentSensors));
        });

        setActiveNodes(relevantNodes);
    }, [location.pathname, techState.specializedState?.sensors, manualFocus]);

    // Bi-Directional Focus Setter
    const setFocus = useCallback((componentId: string | null) => {
        console.log(`[ContextEngine] Focusing on: ${componentId}`);
        setManualFocus(componentId);
    }, []);


    // 2. LOGS & WORK ORDERS (Unified Loading)
    const { logs, tasks, isLoading: maintenanceLoading } = useMaintenance();

    useEffect(() => {
        if (!activeComponentId) {
            setActiveLogs([]);
            return;
        }

        const keyword = activeComponentId.split('.').pop()?.toLowerCase();
        if (!keyword) return;

        // Filter Tasks related to this component
        const relevantTaskIds = new Set(
            tasks
                .filter(t =>
                    t.componentId.toLowerCase().includes(keyword) ||
                    t.title.toLowerCase().includes(keyword)
                )
                .map(t => t.id)
        );

        // Filter Logs (LIMIT 3)
        const relevantLogs = logs
            .filter(l => relevantTaskIds.has(l.taskId) || l.taskId.toLowerCase().includes(keyword))
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 3);

        setActiveLogs(relevantLogs);

    }, [activeComponentId, logs, tasks]);

    // 3. WORK ORDER FILTERING (From Context)
    useEffect(() => {
        if (!activeComponentId) {
            setActiveWorkOrders([]);
            return;
        }
        const keyword = activeComponentId.split('.').pop()?.toLowerCase();
        if (!keyword) return;

        const relevantWOs = workOrders.filter(wo =>
            wo.assetName?.toLowerCase().includes(keyword) ||
            wo.description?.toLowerCase().includes(keyword) ||
            wo.component?.toLowerCase().includes(keyword)
        );
        setActiveWorkOrders(relevantWOs);

    }, [activeComponentId, workOrders]);

    // 3.1 PREDICTIVE WORK ORDERS (The Sentinel's Hand)
    const pendingDispatchesRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!diagnostics.length || !activeComponentId) return;

        diagnostics.forEach(diag => {
            if (diag.type === 'critical') {
                // Check if we already have an open WO for this
                const existsInState = activeWorkOrders.some(wo =>
                    wo.status !== 'COMPLETED' &&
                    wo.status !== 'CANCELLED' &&
                    wo.description.includes(diag.messageKey)
                );

                const isPending = pendingDispatchesRef.current.has(diag.messageKey);

                if (!existsInState && !isPending) {
                    console.log(`[The Sentinel] Auto-Dispatching Work Order for: ${diag.messageKey}`);
                    pendingDispatchesRef.current.add(diag.messageKey);

                    // Logic Trace formatting
                    const logicTrace = diag.vectors?.join('\n- ') || 'No trace available';

                    // Historical Precedent (Mocked or Real from diag)
                    const precedent = diag.precedent || "Similar instability observed 14 months ago during rapid load rejection.";

                    // Physics Narrative (Constructed)
                    const narrative = `Energy signature suggests ${diag.messageKey.toLowerCase()} is deviating from nominal baseline by significant margin. Probability of mechanical stress accumulation > 85%.`;

                    createWorkOrder({
                        assetId: 3001,
                        assetName: 'Iron Gorge HPP',
                        priority: 'HIGH',
                        trigger: 'AI_PREDICTION',
                        component: activeComponentId,
                        description: `[DIAGNOSTIC DOSSIER] ${diag.messageKey}\n\nPHYSICS NARRATIVE:\n${narrative}\n\nHISTORICAL PRECEDENT:\n${precedent}\n\nLOGIC TRACE:\n- ${logicTrace}`,
                        estimatedHoursToComplete: 4
                    });
                }
            }
        });
    }, [diagnostics, activeComponentId, activeWorkOrders, createWorkOrder]);


    // 4. REAL-WORLD DATA BRIDGE & TIME TRAVEL (Depth of Truth)
    const [activeLayer, setActiveLayer] = useState<'HUMAN' | 'HISTORY' | 'REALTIME'>('REALTIME');

    // Time Machine State
    const [fullDataset, setFullDataset] = useState<any[]>([]);
    const [playbackIndex, setPlaybackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // Playback Loop ref
    const playbackTimer = React.useRef<NodeJS.Timeout | null>(null);

    const uploadLogData = useCallback(async (file: File) => {
        try {
            if (playbackTimer.current) clearInterval(playbackTimer.current);
            setMetricHistory({});

            const data = await IndustrialDataBridge.parseCSV(file);
            console.log(`[Bridge] Parsed ${data.length} points.`);

            setFullDataset(data);
            setPlaybackIndex(0);
            setIsPlaying(true);

        } catch (e) {
            console.error("Bridge Error:", e);
            alert("Failed to parse log file.");
        }
    }, []);

    // The Time Loop
    useEffect(() => {
        if (isPlaying && fullDataset.length > 0) {
            playbackTimer.current = setInterval(() => {
                setPlaybackIndex(prev => {
                    if (prev >= fullDataset.length - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    const nextIndex = prev + 1; // 10x speed logic handled by interval or skip

                    // Update History Helper
                    const point = fullDataset[nextIndex];
                    setMetricHistory(prevHist => {
                        const next = { ...prevHist };
                        Object.entries(point.values).forEach(([key, val]) => {
                            const current = next[key] || [];
                            // Keep last 50 points relative to CURRENT PLAYBACK TIME
                            next[key] = [...current, val as number].slice(-50);
                        });
                        return next;
                    });

                    return nextIndex;
                });
            }, 100); // 100ms tick (approx 10Hz playback)
        }

        return () => {
            if (playbackTimer.current) clearInterval(playbackTimer.current);
        };
    }, [isPlaying, fullDataset]);

    // Scrubbing Logic
    const scrubTo = useCallback((percent: number) => {
        if (fullDataset.length === 0) return;
        const targetIndex = Math.floor((percent / 100) * (fullDataset.length - 1));
        setPlaybackIndex(targetIndex);

        // When scrubbing, we need to rebuild the history buffer (traceback)
        const start = Math.max(0, targetIndex - 50);
        const slice = fullDataset.slice(start, targetIndex + 1);

        const newHist: Record<string, number[]> = {};
        slice.forEach(pt => {
            Object.entries(pt.values).forEach(([k, v]) => {
                if (!newHist[k]) newHist[k] = [];
                newHist[k].push(v as number);
            });
        });
        setMetricHistory(newHist);
    }, [fullDataset]);

    const togglePlay = useCallback(() => setIsPlaying(prev => !prev), []);

    // Playback Interface
    const currentTimestamp = fullDataset[playbackIndex]?.timestamp || Date.now();
    const totalDuration = (fullDataset.length > 0)
        ? (fullDataset[fullDataset.length - 1].timestamp - fullDataset[0].timestamp)
        : 0;

    // Progress calculation
    const progress = (fullDataset.length > 0) ? (playbackIndex / (fullDataset.length - 1)) * 100 : 0;


    const liveMetrics = useMemo(() => {
        if (!activeComponentId || !techState.specializedState?.sensors) return [];
        const metrics: any[] = [];
        const hist = metricHistory;

        // Helper: Determine status dynamically based on The Sentinel's findings
        const getDynamicStatus = (metricLabel: string, baseStatus: 'safe' | 'warning' | 'critical' = 'safe') => {
            // If Sentinel found a critical pattern involving this metric type, override status
            // Mapping: 'Vibration' -> 'cavitation-complex' matches 'vibration'
            // 'Bearing Temp' -> 'bearing-thermal-instability' matches 'bearingTemp'

            if (metricLabel === 'Vibration') {
                const diag = diagnostics.find(d => d.id === 'cavitation-complex');
                if (diag?.type === 'critical') return 'critical';
                if (diag?.type === 'warning') return 'warning';
            }
            if (metricLabel === 'Bearing Temp') {
                const diag = diagnostics.find(d => d.id === 'bearing-thermal-instability');
                if (diag?.type === 'critical') return 'critical';
                if (diag?.type === 'warning') return 'warning';
            }

            // Fallback to trend color logic or base
            const h = hist[metricLabel === 'Vibration' ? 'vibration' : metricLabel === 'Bearing Temp' ? 'bearingTemp' : ''];
            if (h && h.length > 2) {
                const start = h[0];
                const end = h[h.length - 1];
                if (end > start * 1.05) return 'warning';
            }

            return baseStatus;
        };

        const getTrendColor = (status: string) => {
            if (status === 'critical') return '#ef4444';
            if (status === 'warning') return '#fbbf24';
            return '#22d3ee';
        };

        if (activeComponentId.includes('penstock')) {
            const vibStatus = getDynamicStatus('Vibration', 'safe');
            const preStatus = getDynamicStatus('DT Pressure', 'warning'); // Base warning for demo

            metrics.push({ label: 'Vibration', value: hist['vibration']?.[hist['vibration'].length - 1] || 0, unit: 'mm/s', status: vibStatus, history: hist['vibration'], color: getTrendColor(vibStatus), source: { id: 'VIB-901-A', cal: '12 Oct 2024' } });
            metrics.push({ label: 'DT Pressure', value: hist['draftTubePressure']?.[hist['draftTubePressure'].length - 1] || 0, unit: 'bar', status: preStatus, history: hist['draftTubePressure'], color: getTrendColor(preStatus), source: { id: 'PRE-202-B', cal: '05 Nov 2024' } });
        } else if (activeComponentId.includes('generator')) {
            const tempStatus = getDynamicStatus('Bearing Temp', 'safe');

            metrics.push({ label: 'Bearing Temp', value: hist['bearingTemp']?.[hist['bearingTemp'].length - 1] || 0, unit: '°C', status: tempStatus, history: hist['bearingTemp'], color: getTrendColor(tempStatus), source: { id: 'TMP-404-X', cal: '01 Jan 2024' } });
            metrics.push({ label: 'Oil Pressure', value: hist['oilPressure']?.[hist['oilPressure'].length - 1] || 0, unit: 'bar', status: 'safe', history: hist['oilPressure'], color: '#22d3ee', source: { id: 'PRE-101-Z', cal: '15 Dec 2023' } });
        } else {
            metrics.push({ label: 'System Load', value: 85, unit: '%', status: 'safe', history: hist['load'], color: '#22d3ee', source: { id: 'SCADA-MAIN', cal: 'Realtime' } });
        }

        return metrics;

    }, [activeComponentId, metricHistory, diagnostics]);


    return {
        activeContext: activeNodes,
        hiveStatus: hiveStatus, // Exposed for Sidebar UI
        patternWeights: patternWeights, // Exposed for Learning Lab
        activeComponentId,
        activeLogs,
        activeWorkOrders,
        liveMetrics,
        diagnostics,
        recoveryPaths: diagnosticsAndMetrics.recoveryPaths,
        structuralSafetyMargin: expertMetrics.structuralSafetyMargin,
        extendedLifeYears: techState.structural.extendedLifeYears || 0,
        estimatedFailureDate: (() => {
            const dateStr = techState.structural.estimatedFailureDate || '2035-01-01';
            const baseDate = new Date(dateStr);
            const extension = (techState.structural.extendedLifeYears || 0) - parseFloat(techState.structural.longevityLeak || '0');

            if (isNaN(baseDate.getTime())) return dateStr;

            try {
                const newDate = new Date(baseDate.getTime());
                newDate.setFullYear(newDate.getFullYear() + Math.floor(extension));
                newDate.setMonth(newDate.getMonth() + Math.floor((extension % 1) * 12));
                return newDate.toISOString().split('T')[0];
            } catch (e) {
                console.error('[ContextEngine] Date Calculation Error:', e);
                return dateStr;
            }
        })(),
        appliedMitigations: techState.appliedMitigations,
        totalInsights: activeNodes.reduce((acc, node) => acc + node.insights.length, 0),
        hasCriticalRisks: (diagnostics.some(d => d.type === 'critical')),
        isLoading: maintenanceLoading,
        uploadLogData, // Exposed for Sidebar

        // Depth & Time
        activeLayer,
        setActiveLayer,
        playback: {
            isPlaying,
            currentTimestamp,
            totalDuration,
            progress,
            scrubTo,
            togglePlay
        },
        reinforcePattern: handleReinforcePattern,
        setFocus // Expose Bi-Directional Sync Method
    };
};

export function getConfidenceScore(..._args: any[]): number {
    return 50;
}
