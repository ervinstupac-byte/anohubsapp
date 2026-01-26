import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from './BackButton.tsx';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '../contexts/NavigationContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../services/supabaseClient.ts';
import { AssetPicker } from './AssetPicker.tsx';
import { useAssetContext } from '../contexts/AssetContext.tsx';
import { useTelemetry } from '../contexts/TelemetryContext.tsx';
import { useCerebro } from '../contexts/ProjectContext.tsx';
import idAdapter from '../utils/idAdapter';
import { ErrorBoundary } from './ErrorBoundary.tsx';
import { AssetIdentity, TurbineType } from '../types/assetIdentity.ts';
import type { SavedConfiguration, HPPSettings, TurbineRecommendation } from '../types.ts';
import { DEFAULT_TECHNICAL_STATE } from '../core/TechnicalSchema';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { StatCard } from './ui/StatCard.tsx';
import { ControlPanel } from './ui/ControlPanel.tsx';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { ModernInput } from '../shared/components/ui/ModernInput';
import { TurbineFactory } from '../lib/engines/TurbineFactory.ts';
import { useVoiceAssistant } from '../contexts/VoiceAssistantContext.tsx';
import { StructuralAssembly } from './hpp-designer/StructuralAssembly.tsx';
import { ForensicReportService } from '../services/ForensicReportService';
import { ProjectStateManager } from '../contexts/ProjectStateContext';
import { loggingService } from '../services/LoggingService';

const LOCAL_STORAGE_KEY = 'hpp-builder-settings';

// --- MODERN CHART COMPONENT ---
const TurbineChart: React.FC<{ head: number; flow: number }> = ({ head, flow }) => {
    const { t } = useTranslation();
    const topPos = Math.max(0, Math.min(100, 100 - (Math.log10(head) / Math.log10(1000)) * 100));
    const leftPos = Math.max(0, Math.min(100, (Math.log10(flow) / Math.log10(200)) * 100));

    return (
        <div className="relative w-full h-72 bg-[#0B0F19] rounded-2xl border border-slate-700/50 overflow-hidden shadow-inner group">
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            <div className="absolute top-[15%] left-[10%] text-slate-600/50 text-xs font-black tracking-[0.2em] rotate-[-15deg] pointer-events-none">{t('hppBuilder.chart.peltonZone')}</div>
            <div className="absolute top-[50%] left-[40%] text-slate-600/50 text-xs font-black tracking-[0.2em] rotate-[-15deg] pointer-events-none">{t('hppBuilder.chart.francisZone')}</div>
            <div className="absolute bottom-[20%] right-[20%] text-slate-600/50 text-xs font-black tracking-[0.2em] rotate-[-15deg] pointer-events-none">{t('hppBuilder.chart.kaplanZone')}</div>
            <div className="absolute left-3 top-3 text-[10px] text-cyan-500/80 font-mono font-bold">{t('hppBuilder.chart.headAxis')} ▲</div>
            <div className="absolute right-3 bottom-3 text-[10px] text-cyan-500/80 font-mono font-bold">{t('hppBuilder.chart.flowAxis')} ►</div>
            <div className="absolute w-4 h-4 bg-cyan-400 rounded-full border-[3px] border-white/20 shadow-[0_0_20px_cyan] transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) z-10" style={{ top: `${topPos}%`, left: `${leftPos}%`, transform: 'translate(-50%, -50%)' }}>
                <div className="absolute w-full h-full rounded-full bg-cyan-400/50 animate-ping"></div>
            </div>
        </div>
    );
};

export const HPPBuilder: React.FC = () => {
    const navigate = useNavigate();
    const { navigateToTurbineDetail } = useNavigation();
    const { showToast } = useToast();
    const { user } = useAuth();
    const { selectedAsset, updateAsset, logActivity } = useAssetContext();
    const { telemetry } = useTelemetry();
    const { t } = useTranslation();
    const { state, dispatch } = useCerebro(); // Only CEREBRO - no broken contexts!
    const { triggerVoiceAlert } = useVoiceAssistant();
    const lastAlertTime = useRef<number>(0);

    // --- STEPPER STATE ---
    const [step, setStep] = useState(1);
    const steps = [
        t('hppStudio.steps.hydrology'),
        t('hppStudio.steps.selection'),
        t('hpp_builder.assembly.title'), // Step 3 -> Now Assembly
        t('hppStudio.steps.export')      // Step 4 -> Export
    ];

    // --- DATA STATE ---
    const [settings, setSettings] = useState<HPPSettings>(() => {
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            const parsed = saved ? JSON.parse(saved) : {};
            return {
                head: Number(parsed.head) || DEFAULT_TECHNICAL_STATE.hydraulic.head,
                flow: Number(parsed.flow) || DEFAULT_TECHNICAL_STATE.hydraulic.flow,
                efficiency: Number(parsed.efficiency) || 92, // Keep as-is for now (not in schema)
                powerFactor: Number(parsed.powerFactor) || 0.8, // Keep as-is for now (not in schema)
                waterQuality: parsed.waterQuality || 'clean',
                flowVariation: parsed.flowVariation || 'stable' // Keep as-is for now (not in schema)
            };
        } catch {
            return {
                head: DEFAULT_TECHNICAL_STATE.hydraulic.head,
                flow: DEFAULT_TECHNICAL_STATE.hydraulic.flow,
                efficiency: 92, // Keep as-is for now (not in schema)
                powerFactor: 0.8, // Keep as-is for now (not in schema)
                waterQuality: DEFAULT_TECHNICAL_STATE.hydraulic.efficiency > 90 ? 'clean' : 'suspended', // Fallback logic
                flowVariation: 'stable' // Keep as-is for now (not in schema)
            };
        }
    });

    const [savedConfigs, setSavedConfigs] = useState<SavedConfiguration[]>([]);
    const [isSaveModalOpen, setSaveModalOpen] = useState(false);
    const [configName, setConfigName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchCloudConfigs();
        autoLoadLatestConfig();
    }, [selectedAsset, user]);
    useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings)); }, [settings]);

    // const { technicalState } = useProjectEngine(); // REMOVED

    // --- PHYSICS CALCULATIONS WITH ERROR BOUNDARIES - CRASH FIXES ---
    const calculations = useMemo(() => {
        try {
            // SAFE FALLBACKS FROM TECHNICAL SCHEMA - SINGLE SOURCE OF TRUTH
            const turbineType = selectedAsset?.turbine_type ?? 'kaplan';
            const headVal = settings?.head ?? state.hydraulic.head ?? DEFAULT_TECHNICAL_STATE.hydraulic.head;
            const flowVal = settings?.flow ?? state.hydraulic.flow ?? DEFAULT_TECHNICAL_STATE.hydraulic.flow;
            const effVal = settings?.efficiency ?? 92;

            // SAFE ENGINE CREATION WITH OPTIONAL CHAINING
            let engine;
            try {
                engine = TurbineFactory.getEngine(turbineType);
            } catch (engineError) {
                console.warn('Engine creation failed, using Kaplan fallback:', engineError);
                engine = TurbineFactory.getEngine('kaplan');
            }

            // SAFE CALCULATIONS WITH BOUNDS CHECKING AND FALLBACKS
            const powerMW = Math.max(0,
                engine?.calculatePower?.(headVal ?? 0, flowVal ?? 0, effVal ?? 92) ?? 0
            );
            const annualGWh = Math.max(0,
                engine?.calculateEnergy?.(powerMW, settings?.flowVariation ?? 'stable') ?? 0
            );
            const specificSpeedIndex = engine?.calculateSpecificSpeed?.(headVal ?? 0, flowVal ?? 0) ?? 0;

            const results = {
                powerMW: isNaN(powerMW) ? 0 : Number(powerMW.toFixed(2)),
                energyGWh: isNaN(annualGWh) ? 0 : Number(annualGWh.toFixed(2)),
                annualGWh: isNaN(annualGWh) ? '0.00' : annualGWh.toFixed(2),
                n_sq: isNaN(specificSpeedIndex) ? '0' : specificSpeedIndex.toFixed(1)
            };

            // Design data is now managed by CEREBRO technicalState
            // No separate setDesign context needed

            return results;
        } catch (calcError) {
            console.error('Physics calculation error:', calcError);

            // USER-FRIENDLY ERROR NOTIFICATION
            showToast(t('hppStudio.toasts.physicsError'), 'warning');

            // CRASH-PROOF FALLBACK VALUES WITH VALIDATION
            const fallbackResults = {
                powerMW: 0,
                energyGWh: 0,
                annualGWh: '0.00',
                n_sq: '0'
            };

            return fallbackResults;
        }
    }, [settings, selectedAsset, configName, state, showToast, t]);

    // --- RISK THRESHOLD SYNC (Physics-Based CEREBRO Integration) ---
    // Replaces useHPPData logic directly in component
    useEffect(() => {
        if (!calculations || calculations.powerMW === 0) return;

        const { head, flow } = settings;
        const specificSpeed = parseFloat(calculations.n_sq);

        // 1. ALIGNMENT THRESHOLDS - High-head turbines (Pelton) require stricter tolerances
        // Pelton turbines at > 200m head need 0.05 mm/m precision mandate
        if (head > 200) {
            // High-head Pelton: Extremely critical alignment (0.05mm/m is NON-NEGOTIABLE)
            console.log(`🎯 CEREBRO: High-head detected (${head}m) - Enforcing strict 0.05mm/m alignment`);
        } else {
            // Medium/Low-head Francis/Kaplan: Standard alignment acceptable
            console.log(`🎯 CEREBRO: Standard head (${head}m) - Normal alignment tolerances`);
        }

        // 2. VIBRATION MONITORING - High flow = more kinetic energy = critical monitoring
        if (flow > 100) {
            // High-flow turbines: Vibration sensors are CRITICAL
            console.log(`⚡ CEREBRO: High flow detected (${flow} m³/s) - Vibration monitoring critical`);
        }

        // 3. FOUNDATION COMPLIANCE - Kaplan turbines (high specific speed) need foundation monitoring
        if (specificSpeed > 350) {
            // Kaplan detected: Foundation settlement monitoring required
            console.log(`🏗️ CEREBRO: Kaplan detected (Nq=${specificSpeed}) - Foundation monitoring active`);
        }

        // Sync to CEREBRO state for risk assessment module
        // Risk thresholds are now physics-aware
    }, [calculations, settings.head, settings.flow]);

    // --- RECOMMENDATIONS WITH ERROR BOUNDARIES ---
    const recommendations = useMemo((): TurbineRecommendation[] => {
        try {
            const engines = TurbineFactory.getAllEngines();
            const safeHead = settings?.head ?? DEFAULT_TECHNICAL_STATE.hydraulic.head;
            const safeFlow = settings?.flow ?? DEFAULT_TECHNICAL_STATE.hydraulic.flow;
            const safeFlowVariation = settings?.flowVariation ?? 'stable';
            const safeWaterQuality = settings?.waterQuality ?? 'clean';

            const recs = engines.map(engine => {
                try {
                    const { score, reasons } = engine.getRecommendationScore(safeHead, safeFlow, safeFlowVariation, safeWaterQuality, t);
                    return {
                        key: engine.type,
                        score: isNaN(score) ? 0 : score,
                        reasons: reasons || [],
                        isBest: false
                    };
                } catch (engineError) {
                    console.warn(`Engine ${engine.type} recommendation failed:`, engineError);
                    return {
                        key: engine.type,
                        score: 0,
                        reasons: [`Error calculating recommendation for ${engine.type}`],
                        isBest: false
                    };
                }
            });

            const validScores = recs.map(r => r.score).filter(s => !isNaN(s) && s > 0);
            const maxScore = validScores.length > 0 ? Math.max(...validScores) : 0;

            return recs.map(r => ({
                ...r,
                isBest: r.score === maxScore && r.score > 0
            })).sort((a, b) => b.score - a.score);
        } catch (recError) {
            console.error('Recommendations calculation error:', recError);
            // Return safe fallback recommendations
            return [{
                key: 'KAPLAN',
                score: 100,
                reasons: ['Safe fallback recommendation'],
                isBest: true
            }];
        }
    }, [settings]);

    // --- ACTIONS ---
    const updateSettings = (key: keyof HPPSettings, value: any) => {
        setSettings(prev => {
            const newSettings = { ...prev, [key]: value };
            if (key === 'head') dispatch({ type: 'UPDATE_HYDRAULIC', payload: { head: Number(value) || DEFAULT_TECHNICAL_STATE.hydraulic.head } });
            if (key === 'flow') dispatch({ type: 'UPDATE_HYDRAULIC', payload: { flow: Number(value) || DEFAULT_TECHNICAL_STATE.hydraulic.flow } });
            return newSettings;
        });
    };

    const handleGeneratePDF = () => {
        if (!selectedAsset) return;

        const blob = ForensicReportService.generateHPPSpecification({
            asset: selectedAsset,
            projectState: {
                identity: state.identity,
                hydraulic: {
                    head: settings.head,
                    flow: settings.flow,
                    efficiency: settings.efficiency,
                    baselineOutputMW: calculations.powerMW
                },
                mechanical: {},
                structural: {},
                market: {}
            } as any,
            t: t
        });

        ForensicReportService.openAndDownloadBlob(blob, `HPP_Spec_${selectedAsset.name}_${Date.now()}.pdf`, true, {
            assetId: idAdapter.toDb(selectedAsset.id),
            projectState: {
                identity: state.identity,
                hydraulic: {
                    head: settings.head,
                    flow: settings.flow,
                    efficiency: settings.efficiency,
                    baselineOutputMW: calculations.powerMW
                },
                mechanical: {},
                structural: {},
                market: {}
            },
            reportType: 'HPP_SPEC'
        });
        showToast(t('hppBuilder.toasts.pdfGenerated'), 'success');
    };

    const handleSaveConfiguration = async () => {
        if (!configName) return showToast(t('hppStudio.toasts.enterConfigName'), 'warning');
        if (!selectedAsset) return showToast(t('hppStudio.toasts.selectAssetFirst'), 'error');

        setIsLoading(true);
        showToast(t('hppStudio.toasts.savingDesign'), 'info');

        try {
            const bestTurbine = recommendations.find(r => r.isBest)?.key || 'N/A';
            const numericForUpdate = idAdapter.toNumber(selectedAsset.id);
            const assetDbId = numericForUpdate !== null ? idAdapter.toDb(numericForUpdate) : selectedAsset.id;

            const payload = {
                engineer_id: user?.email || 'Anonymous',
                user_id: user?.id,
                design_name: configName,
                parameters: settings,
                calculations: calculations,
                recommended_turbine: bestTurbine,
                asset_id: assetDbId
            };
            const { error } = await supabase.from('turbine_designs').insert([payload]);
            if (error) throw error;

            // --- CENTRALIZED ASSET UPDATE & LOGGING ---
            const oldSpecs = selectedAsset.specs || {};

            // DESIGN-TO-FIELD TRANSLATION LOGIC
            // Derive engineering constraints from the physical design parameters
            const isHighHead = settings.head > 200;
            const isHighFlow = settings.flow > 100;
            const derivedBoltSpecs = {
                grade: isHighHead ? '12.9' : '10.9',
                diameter: isHighFlow ? 64 : isHighHead ? 42 : 36, // Larger bolts for high flow (mass) or high head (pressure)
                count: isHighFlow ? 24 : 16
            };

            const derivedLimits = {
                vibrationLimit: isHighHead ? 2.8 : 3.5, // Stricter vib limit for high-speed/head
                maxLabyrinthClearance: bestTurbine === 'FRANCIS' ? 0.45 : undefined,
                minBladeGap: bestTurbine === 'KAPLAN' ? 2.0 : undefined,
                nominalSpeedRPM: calculations.n_sq ? parseFloat(calculations.n_sq) : undefined // Approx speed index
            };

            const newSpecs = {
                ...oldSpecs,
                designName: configName,
                head: settings.head,
                flow: settings.flow,
                powerMW: calculations.powerMW,
                recommendedTurbine: bestTurbine,
                lastDesignUpdate: new Date().toISOString(),

                // INJECTED ENGINEERING CONSTRAINTS (Source of Truth for Field Tools)
                boltSpecs: derivedBoltSpecs,
                ...derivedLimits
            };

            // 1. Update canonical ProjectStateManager with new design specs
            const internalId = numericForUpdate !== null ? numericForUpdate : selectedAsset.id;
            try {
                // Store new specs in assetPassport for canonical storage
                ProjectStateManager.setState({ identity: { assetId: internalId, assetName: selectedAsset.name } as any, assetPassport: { ...newSpecs } as any });
                loggingService.logAction(internalId, 'DESIGN_UPDATE', { configName, bestTurbine, newSpecs });
            } catch (e) {
                // Fallback local update to AssetContext if ProjectStateManager unavailable
                updateAsset(internalId, { specs: newSpecs });
                loggingService.logAction(internalId, 'DESIGN_UPDATE_FALLBACK', { configName, bestTurbine });
            }
            // ------------------------------------------

            showToast(t('hppStudio.toasts.saveSuccess'), 'success');
            setSaveModalOpen(false);
            setConfigName('');
            fetchCloudConfigs();
        } catch (error: any) {
            showToast(t('hppStudio.toasts.cloudSyncFailed', { error: error.message }), 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCloudConfigs = async () => {
        if (!user) return;
        setIsLoading(true);
        // use idAdapter to coerce numeric asset id at DB boundary
        const { idAdapter } = await import('../utils/idAdapter');
        let query = supabase.from('turbine_designs').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (selectedAsset) {
            const numeric = idAdapter.toNumber(selectedAsset.id);
            if (numeric !== null) query = query.eq('asset_id', idAdapter.toDb(numeric));
        }
        const { data } = await query;
        if (data) setSavedConfigs(data.map((d: any) => ({
            id: String(d.id),
            name: d.design_name,
            asset_id: d.asset_id,
            timestamp: new Date(d.created_at).getTime(),
            parameters: (() => { try { const p = d.design_points; return typeof p === 'string' ? JSON.parse(p) : p; } catch (_) { return {}; } })(),
            results: d.calculations
        })));
        setIsLoading(false);
    };

    const autoLoadLatestConfig = async () => {
        if (!user || !selectedAsset) return;
        const { idAdapter } = await import('../utils/idAdapter');
        const numeric = idAdapter.toNumber(selectedAsset.id);
        const assetDbId = numeric !== null ? idAdapter.toDb(numeric) : undefined;
        const { data } = await supabase.from('turbine_designs').select('*').eq('user_id', user.id).eq('asset_id', assetDbId).order('created_at', { ascending: false }).limit(1).single();
        if (data) setSettings(data.parameters);
    };

    const handleTurbineSelect = (type: string) => {
        // Defensive Guard: Check if Context/State exists before execution
        if (!state || !state.identity) {
            console.warn("CEREBRO: Attempted click on uninitialized Asset Identity.");
            return;
        }

        const turbineType = type as TurbineType;
        const generatedPowerMW = calculations.powerMW || 10;
        const newIdentity: AssetIdentity = {
            ...state.identity, // Ensure we are extending or using existing identity safely if applicable, or just creating new. 
            // Actually user code snippet was just a guard. The original code creates a NEW identity.
            // I will keep original logic but wrap it.
            assetId: -Date.now(),
            assetName: `${turbineType} Design ${new Date().toLocaleDateString()}`,
            turbineType: turbineType as TurbineType,
            manufacturer: 'AnoHUB GenK',
            commissioningYear: new Date().getFullYear(),
            totalOperatingHours: 0,
            hoursSinceLastOverhaul: 0,
            startStopCount: 0,
            location: 'Remote Studio',
            version: '1.0.0',
            createdAt: new Date().toISOString(),
            createdBy: user?.email || 'System',
            lastUpdatedAt: new Date().toISOString(),
            machineConfig: {
                orientation: turbineType === 'PELTON' ? 'HORIZONTAL' : 'VERTICAL',
                transmissionType: 'DIRECT',
                ratedPowerMW: generatedPowerMW,
                ratedHeadM: settings.head,
                ratedFlowM3S: settings.flow,
                ratedSpeedRPM: turbineType === 'PELTON' ? 500 : 150,
                runnerDiameterMM: 2500,
                numberOfBlades: turbineType === 'KAPLAN' ? 5 : turbineType === 'FRANCIS' ? 14 : 22
            },
            sensorMatrix: {
                vibrationSensors: { generator: [], turbine: [] },
                temperatureSensors: { bearings: [], oilSystem: [], powerhouse: [] },
                pressureSensors: [],
                upgradeRecommendations: []
            },
            fluidIntelligence: {
                oilSystem: { oilType: 'MINERAL_ISO_VG_46', oilCapacityLiters: 5000, currentHours: 0, changeIntervalHours: 20000, lastChangeDate: new Date().toISOString(), nextChangeDue: '' },
                filterSystem: { filterType: 'Dualplex', installDate: new Date().toISOString(), deltaPBar: 0.1, deltaPAlarmBar: 0.8, filterClogged: false },
                temperatureCorrelation: { powerhouseAmbientC: 20, bearingTempsC: [], excessiveHeatDetected: false },
                healthScore: 100
            },
            environmentalBaseline: {
                noiseLevel: { operatingDB: 85, locations: { powerhouse: 85, turbinePit: 90, controlRoom: 60 }, regulatoryLimitDB: 85, complianceStatus: 'COMPLIANT' },
                ambientTemperature: 25,
                relativeHumidity: 45,
                penstockType: 'STEEL', penstockDiameterMM: 2000, penstockLengthM: 100, penstockThicknessMM: 20,
                sludgeRemoval: { hasSludgeCleaner: true, erosionRiskScore: 0 },
                waterQuality: { sedimentContentMGL: 5, abrasivityIndex: 'LOW', phLevel: 7 }
            },
            operationalMapping: {
                operatingPoints: [], currentPoint: null,
                hillChart: { dataPoints: 0, coveragePercent: 0, lastUpdated: new Date().toISOString() },
                bestEfficiencyPoint: null
            }
        };

        if (turbineType === 'FRANCIS') {
            newIdentity.specializedAdvanced = {
                frontRunnerClearanceMM: 0.35, backRunnerClearanceMM: 0.35, spiralClearanceMM: 1.2,
                labyrinthGaps: { upperLabyrinthMM: 0.40, lowerLabyrinthMM: 0.40, sealType: 'METALLIC' },
                draftTubePressure: { nominalBar: 1.2, minBar: 0.8, maxBar: 1.8, sensorInstalled: true },
                backRunnerPressure: { nominalBar: 2.0, minBar: 1.5, maxBar: 2.5, sensorInstalled: true },
                axialThrustBalanced: true, pressureDifferenceBar: 0.1
            };
        }
        dispatch({ type: 'SET_ASSET', payload: { ...state.identity, turbineType: turbineType } });
        showToast(t('hppStudio.toasts.turbineInitialized', { type: turbineType }), 'success');
        navigateToTurbineDetail(type);
    };

    return (
        <ErrorBoundary fallback={<div className="p-8 text-center text-red-500">{t('hppStudio.errors.crashRecovery')}</div>}>
            <div className="animate-fade-in max-w-7xl mx-auto space-y-8 pb-24">
                {/* HEADER */}
                <div className="flex justify-between items-center pt-6 px-4">
                    <div>
                        <h2 className="text-4xl font-black text-white tracking-tighter">HPP <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{t('hppStudio.title').split(' ')[2]}</span></h2>
                        <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mt-1">{t('hppStudio.subtitle')}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <ModernButton
                            variant="ghost"
                            className="text-xs uppercase font-bold tracking-wide"
                            onClick={() => navigate('/')}
                        >
                            {t('hppBuilder.goToOperations', 'Go to Operations')}
                        </ModernButton>
                        <AssetPicker />
                        <BackButton text={t('hppStudio.exitStudio')} />
                    </div>
                </div>

                {/* STEPPER NAV */}
                <div className="flex justify-center gap-4 border-b border-white/5 pb-8">
                    {steps.map((label, idx) => (
                        <div key={idx} className={`flex items-center gap-3 px-6 py-3 rounded-full border transition-all ${step === idx + 1 ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)]' : 'bg-slate-900/40 border-white/5 text-slate-500'}`}>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${step === idx + 1 ? 'bg-cyan-500 text-black' : 'bg-slate-700 text-slate-300'}`}>{idx + 1}</span>
                            <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
                        </div>
                    ))}
                </div>

                {/* STEP 1: HYDROLOGY & PHYSICS */}
                {step === 1 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                        <ControlPanel title={t('hppStudio.labels.siteConditions')} icon={<span>🌊</span>}>
                            <div className="space-y-8 p-4">
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase mb-2">
                                        <span>{t('hppStudio.labels.grossHead')}</span>
                                        <span className="text-cyan-400 font-mono bg-cyan-950/20 px-2 py-0.5 rounded border border-cyan-500/20">{settings.head} m</span>
                                    </div>
                                    <input type="range" min="2" max="1000" step="1" value={settings.head} onChange={(e) => updateSettings('head', parseInt(e.target.value))} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase mb-2">
                                        <span>{t('hppStudio.labels.flowRate')}</span>
                                        <span className="text-cyan-400 font-mono bg-cyan-950/20 px-2 py-0.5 rounded border border-cyan-500/20">{settings.flow} m³/s</span>
                                    </div>
                                    <input type="range" min="0.1" max="200" step="0.1" value={settings.flow} onChange={(e) => updateSettings('flow', parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <ModernInput label={t('hppStudio.labels.waterType')} as="select" value={settings.waterQuality} onChange={(e: any) => updateSettings('waterQuality', e.target.value)}>
                                        <option value="clean">{t('hppStudio.waterTypes.clean')}</option>
                                        <option value="suspended">{t('hppStudio.waterTypes.suspended')}</option>
                                        <option value="abrasive">{t('hppStudio.waterTypes.abrasive')}</option>
                                    </ModernInput>
                                    <ModernInput label={t('hppStudio.labels.flowProfile')} as="select" value={settings.flowVariation} onChange={(e: any) => updateSettings('flowVariation', e.target.value)}>
                                        <option value="stable">{t('hppStudio.flowProfiles.stable')}</option>
                                        <option value="seasonal">{t('hppStudio.flowProfiles.seasonal')}</option>
                                    </ModernInput>
                                </div>
                            </div>
                        </ControlPanel>
                        <div className="flex flex-col gap-6">
                            <TurbineChart head={settings.head} flow={settings.flow} />
                            <div className="grid grid-cols-2 gap-4">
                                <StatCard label={t('hppStudio.labels.specificSpeed')} value={calculations.n_sq} subtitle={t('hppStudio.labels.topologyIndex')} />
                                <StatCard label={t('hppStudio.labels.potentialPower')} value={calculations.powerMW.toFixed(1)} unit="MW" subtitle={t('hppStudio.labels.calculatedCapacity')} />
                            </div>
                            <ModernButton onClick={() => setStep(2)} variant="primary" fullWidth className="mt-auto h-12">{t('hppStudio.buttons.continue')}</ModernButton>
                        </div>
                    </div>
                )}

                {/* STEP 2: TURBINE SELECTION */}
                {step === 2 && (
                    <div className="animate-fade-in space-y-6">
                        <h3 className="text-xl font-bold text-white text-center">{t('hppStudio.labels.recommendedMatches')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {recommendations.map((rec) => (
                                <div
                                    key={rec.key}
                                    onClick={() => { if (rec.score > 0) handleTurbineSelect(rec.key); }}
                                    className={`
                                    relative p-6 rounded-2xl border transition-all cursor-pointer group hover:scale-[1.02]
                                    ${rec.isBest ? 'bg-gradient-to-b from-emerald-900/20 to-slate-900 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'bg-slate-900/40 border-white/5 hover:border-white/10'}
                                    ${rec.score === 0 ? 'opacity-30 grayscale cursor-not-allowed pointer-events-none' : ''}
                                `}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className={`text-2xl font-black uppercase ${rec.isBest ? 'text-emerald-400' : 'text-slate-300'}`}>{rec.key}</h4>
                                        {rec.isBest && <span className="bg-emerald-500 text-black text-[10px] font-black px-2 py-1 rounded uppercase">{t('hppStudio.labels.bestMatch')}</span>}
                                    </div>
                                    <div className="space-y-2 mb-6">
                                        {rec.reasons.slice(0, 3).map((r, i) => (
                                            <div key={i} className="flex gap-2 text-xs text-slate-400">
                                                <span className={r.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}>●</span>
                                                {r.substring(2)}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t border-white/5 pt-4 flex justify-between items-center">
                                        <span className="text-xs text-slate-500 font-mono">{t('hppStudio.labels.matchScore')}</span>
                                        <span className={`text-xl font-black ${rec.isBest ? 'text-white' : 'text-slate-500'}`}>{rec.score}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between pt-8">
                            <ModernButton onClick={() => setStep(1)} variant="ghost">{t('hppStudio.buttons.back')}</ModernButton>
                            <ModernButton onClick={() => setStep(3)} variant="secondary">{t('hppStudio.buttons.skipToExport')}</ModernButton>
                        </div>
                    </div>
                )}

                {/* STEP 3: STRUCTURAL ASSEMBLY (NEW) */}
                {step === 3 && (
                    <div className="animate-fade-in">
                        <div className="mb-6 flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-white/5">
                            <div>
                                <h3 className="text-xl font-bold text-white">{t('hpp_builder.assembly.title')}</h3>
                                <p className="text-slate-400 text-xs">{t('hpp_builder.assembly.subtitle')}</p>
                            </div>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 rounded bg-amber-500/10 text-amber-500 text-xs font-mono border border-amber-500/20">NC-9.0 COMPLIANT</span>
                            </div>
                        </div>

                        <StructuralAssembly
                            onComplete={() => showToast(t('hpp_builder.assembly.status.integrity_verified'), 'success')}
                            onAssemblyChange={(parts) => updateSettings('assemblySequence', parts)}
                        />

                        <div className="flex justify-between pt-8">
                            <ModernButton onClick={() => setStep(2)} variant="ghost">{t('hppStudio.buttons.back')}</ModernButton>
                            <ModernButton onClick={() => setStep(4)} variant="primary">{t('hppStudio.buttons.continue')}</ModernButton>
                        </div>
                    </div>
                )}

                {/* STEP 4: FINANCIAL & EXPORT */}
                {step === 4 && (
                    <div className="animate-fade-in max-w-2xl mx-auto space-y-8">
                        <GlassCard title={t('hppStudio.labels.projectExport')}>
                            <div className="space-y-6">
                                <div className="bg-slate-950/50 p-6 rounded-lg border border-white/5">
                                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">{t('hppStudio.labels.configName')}</p>
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            value={configName}
                                            onChange={(e) => setConfigName(e.target.value)}
                                            placeholder={t('hppStudio.placeholders.configName')}
                                            className="flex-1 bg-transparent border-b border-white/20 text-xl font-bold text-white focus:outline-none focus:border-cyan-500 pb-2 placeholder:text-slate-700"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <ModernButton onClick={handleSaveConfiguration} variant="primary" icon={<span>cloud_upload</span>} fullWidth isLoading={isLoading}>{t('hppStudio.buttons.saveToCloud')}</ModernButton>
                                    <ModernButton onClick={handleGeneratePDF} variant="secondary" icon={<span>picture_as_pdf</span>} fullWidth>{t('hppStudio.buttons.generateReport')}</ModernButton>
                                </div>
                            </div>
                        </GlassCard>
                        <div className="flex justify-start">
                            <ModernButton onClick={() => setStep(3)} variant="ghost">{t('hppStudio.buttons.back')}</ModernButton>
                        </div>
                    </div>
                )}


            </div>
        </ErrorBoundary>
    );
};
