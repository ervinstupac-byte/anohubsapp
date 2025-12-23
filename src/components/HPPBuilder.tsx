import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from './BackButton.tsx';
import { useNavigation } from '../contexts/NavigationContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../services/supabaseClient.ts';
import { reportGenerator } from '../services/ReportGenerator.ts';
import { AssetPicker } from './AssetPicker.tsx';
import { useAssetContext } from '../contexts/AssetContext.tsx';
import { useTelemetry } from '../contexts/TelemetryContext.tsx';
import { useProjectEngine } from '../contexts/ProjectContext.tsx';
import { ErrorBoundary } from './ErrorBoundary.tsx';
import { AssetIdentity, TurbineType } from '../types/assetIdentity.ts';
import type { SavedConfiguration, HPPSettings, TurbineRecommendation } from '../types.ts';
import { DEFAULT_TECHNICAL_STATE } from '../models/TechnicalSchema';
import { GlassCard } from './ui/GlassCard.tsx';
import { StatCard } from './ui/StatCard.tsx';
import { ControlPanel } from './ui/ControlPanel.tsx';
import { ModernButton } from './ui/ModernButton.tsx';
import { ModernInput } from './ui/ModernInput.tsx';
import { useHPPDesign } from '../contexts/HPPDesignContext.tsx';
import { useHPPData } from '../contexts/useHPPData.ts';
import { TurbineFactory } from '../lib/engines/TurbineFactory.ts';
import { useVoiceAssistant } from '../contexts/VoiceAssistantContext.tsx';

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
    useHPPData();
    const { navigateToTurbineDetail } = useNavigation();
    const { showToast } = useToast();
    const { user } = useAuth();
    const { selectedAsset } = useAssetContext();
    const { telemetry } = useTelemetry();
    const { t } = useTranslation();
    const { setDesign } = useHPPDesign();
    const { updateSiteConditions, setAssetIdentity } = useProjectEngine();
    const { triggerVoiceAlert } = useVoiceAssistant();
    const lastAlertTime = useRef<number>(0);

    // --- STEPPER STATE ---
    const [step, setStep] = useState(1);
    const steps = ['Hydrology Setup', 'Turbine Selection', 'Financial & Export'];

    // --- DATA STATE ---
    const [settings, setSettings] = useState<HPPSettings>(() => {
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            const parsed = saved ? JSON.parse(saved) : {};
            return {
                head: Number(parsed.head) || DEFAULT_TECHNICAL_STATE.site.grossHead,
                flow: Number(parsed.flow) || DEFAULT_TECHNICAL_STATE.site.designFlow,
                efficiency: Number(parsed.efficiency) || 92, // Keep as-is for now (not in schema)
                powerFactor: Number(parsed.powerFactor) || 0.8, // Keep as-is for now (not in schema)
                waterQuality: parsed.waterQuality || DEFAULT_TECHNICAL_STATE.site.waterQuality,
                flowVariation: parsed.flowVariation || 'stable' // Keep as-is for now (not in schema)
            };
        } catch { return {
            head: DEFAULT_TECHNICAL_STATE.site.grossHead,
            flow: DEFAULT_TECHNICAL_STATE.site.designFlow,
            efficiency: 92, // Keep as-is for now (not in schema)
            powerFactor: 0.8, // Keep as-is for now (not in schema)
            waterQuality: DEFAULT_TECHNICAL_STATE.site.waterQuality,
            flowVariation: 'stable' // Keep as-is for now (not in schema)
        }; }
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

    const { technicalState } = useProjectEngine();

    // --- PHYSICS CALCULATIONS WITH ERROR BOUNDARIES - CRASH FIXES ---
    const calculations = useMemo(() => {
        try {
            // SAFE FALLBACKS FROM TECHNICAL SCHEMA - SINGLE SOURCE OF TRUTH
            const turbineType = selectedAsset?.turbine_type ?? 'kaplan';
            const headVal = settings?.head ?? technicalState?.site?.grossHead ?? DEFAULT_TECHNICAL_STATE.site.grossHead;
            const flowVal = settings?.flow ?? technicalState?.site?.designFlow ?? DEFAULT_TECHNICAL_STATE.site.designFlow;
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

            // SAFE DESIGN UPDATE WITH OPTIONAL CHAINING
            try {
                setDesign?.({
                    design_name: configName || 'Active Design',
                    recommended_turbine: turbineType?.toUpperCase?.() ?? 'KAPLAN',
                    parameters: {
                        head: headVal,
                        flow: flowVal,
                        efficiency: effVal,
                        powerFactor: settings?.powerFactor ?? 0.8,
                        waterQuality: settings?.waterQuality ?? DEFAULT_TECHNICAL_STATE.site.waterQuality,
                        flowVariation: settings?.flowVariation ?? 'stable'
                    },
                    calculations: results,
                    asset_id: selectedAsset?.id
                });
            } catch (designError) {
                console.warn('Design update failed:', designError);
            }

            return results;
        } catch (calcError) {
            console.error('Physics calculation error:', calcError);

            // CRASH-PROOF FALLBACK VALUES WITH VALIDATION
            const fallbackResults = {
                powerMW: 0,
                energyGWh: 0,
                annualGWh: '0.00',
                n_sq: '0'
            };

            try {
                setDesign?.({
                    design_name: configName || 'Error Recovery Design',
                    recommended_turbine: 'KAPLAN',
                    parameters: {
                        head: DEFAULT_TECHNICAL_STATE.site.grossHead,
                        flow: DEFAULT_TECHNICAL_STATE.site.designFlow,
                        efficiency: 92,
                        powerFactor: 0.8,
                        waterQuality: DEFAULT_TECHNICAL_STATE.site.waterQuality,
                        flowVariation: 'stable'
                    },
                    calculations: fallbackResults,
                    asset_id: selectedAsset?.id
                });
            } catch (fallbackError) {
                console.error('Fallback design update failed:', fallbackError);
            }

            return fallbackResults;
        }
    }, [settings, selectedAsset, configName, setDesign, technicalState]);

    // --- RECOMMENDATIONS WITH ERROR BOUNDARIES ---
    const recommendations = useMemo((): TurbineRecommendation[] => {
        try {
            const engines = TurbineFactory.getAllEngines();
            const safeHead = settings?.head ?? DEFAULT_TECHNICAL_STATE.site.grossHead;
            const safeFlow = settings?.flow ?? DEFAULT_TECHNICAL_STATE.site.designFlow;
            const safeFlowVariation = settings?.flowVariation ?? 'stable';
            const safeWaterQuality = settings?.waterQuality ?? 'clean';

            const recs = engines.map(engine => {
                try {
                    const { score, reasons } = engine.getRecommendationScore(safeHead, safeFlow, safeFlowVariation, safeWaterQuality);
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
            if (key === 'head') updateSiteConditions({ grossHead: Number(value) || DEFAULT_TECHNICAL_STATE.site.grossHead });
            if (key === 'flow') updateSiteConditions({ designFlow: Number(value) || DEFAULT_TECHNICAL_STATE.site.designFlow });
            return newSettings;
        });
    };

    const handleGeneratePDF = () => {
        const best = recommendations.find(r => r.isBest);
        const blob = reportGenerator.generateTechnicalReport({
            assetName: selectedAsset?.name || 'Concept Design',
            parameters: settings,
            calculations: calculations,
            recommendedTurbine: best?.key || 'Unknown'
        });
        reportGenerator.downloadReport(blob, `AnoHUB_Technical_Report_${selectedAsset?.name || 'Draft'}.pdf`);
        showToast(t('hppBuilder.toasts.pdfGenerated'), 'success');
    };

    const handleSaveConfiguration = async () => {
        if (!configName) return showToast(t('hppBuilder.toasts.enterName'), 'warning');
        if (!selectedAsset) return showToast(t('hppBuilder.toasts.selectAsset'), 'error');
        setIsLoading(true);
        try {
            const bestTurbine = recommendations.find(r => r.isBest)?.key || 'Unknown';
            const payload = {
                engineer_id: user?.email || 'Anonymous',
                user_id: user?.id,
                design_name: configName,
                parameters: settings,
                calculations: calculations,
                recommended_turbine: bestTurbine,
                asset_id: selectedAsset.id
            };
            const { error } = await supabase.from('turbine_designs').insert([payload]);
            if (error) throw error;
            showToast('Design saved successfully!', 'success');
            setSaveModalOpen(false);
            setConfigName('');
            fetchCloudConfigs();
        } catch (error: any) {
            showToast(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCloudConfigs = async () => {
        if (!user) return;
        setIsLoading(true);
        let query = supabase.from('turbine_designs').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (selectedAsset) query = query.eq('asset_id', selectedAsset.id);
        const { data } = await query;
        if (data) setSavedConfigs(data.map((d: any) => ({
            id: d.id.toString(), name: d.design_name, asset_id: d.asset_id, timestamp: new Date(d.created_at).getTime(),
            parameters: d.parameters, results: d.calculations
        })));
        setIsLoading(false);
    };

    const autoLoadLatestConfig = async () => {
        if (!user || !selectedAsset) return;
        const { data } = await supabase.from('turbine_designs').select('*').eq('user_id', user.id).eq('asset_id', selectedAsset.id).order('created_at', { ascending: false }).limit(1).single();
        if (data) setSettings(data.parameters);
    };

    const handleTurbineSelect = (type: string) => {
        const turbineType = type as TurbineType;
        const generatedPowerMW = calculations.powerMW || 10;
        const newIdentity: AssetIdentity = {
            assetId: crypto.randomUUID(),
            assetName: `${turbineType} Design ${new Date().toLocaleDateString()}`,
            turbineType: turbineType as any,
            manufacturer: 'AnoHUB GenK',
            commissioningYear: new Date().getFullYear(),
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
            newIdentity.francisAdvanced = {
                frontRunnerClearanceMM: 0.35, backRunnerClearanceMM: 0.35, spiralClearanceMM: 1.2,
                labyrinthGaps: { upperLabyrinthMM: 0.40, lowerLabyrinthMM: 0.40, sealType: 'METALLIC' },
                draftTubePressure: { nominalBar: 1.2, minBar: 0.8, maxBar: 1.8, sensorInstalled: true },
                backRunnerPressure: { nominalBar: 2.0, minBar: 1.5, maxBar: 2.5, sensorInstalled: true },
                axialThrustBalanced: true, pressureDifferenceBar: 0.1
            };
        }
        setAssetIdentity(newIdentity);
        showToast(`Initialized Wizard for ${turbineType}`, 'success');
        navigateToTurbineDetail(type);
    };

    return (
        <ErrorBoundary fallback={<div className="p-8 text-center text-red-500">HPP Builder encountered an error. Please refresh the page.</div>}>
            <div className="animate-fade-in max-w-7xl mx-auto space-y-8 pb-24">
            {/* HEADER */}
            <div className="flex justify-between items-center pt-6 px-4">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter">HPP <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">BUILDER STUDIO</span></h2>
                    <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mt-1">Advanced Engineering Wizard v2.0</p>
                </div>
                <div className="flex items-center gap-4">
                    <AssetPicker />
                    <BackButton text="Exit Studio" />
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
                    <ControlPanel title="Site Conditions" icon={<span>🌊</span>}>
                        <div className="space-y-8 p-4">
                            <div>
                                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase mb-2">
                                    <span>Gross Head</span>
                                    <span className="text-cyan-400 font-mono bg-cyan-950/20 px-2 py-0.5 rounded border border-cyan-500/20">{settings.head} m</span>
                                </div>
                                <input type="range" min="2" max="1000" step="1" value={settings.head} onChange={(e) => updateSettings('head', parseInt(e.target.value))} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase mb-2">
                                    <span>Flow Rate</span>
                                    <span className="text-cyan-400 font-mono bg-cyan-950/20 px-2 py-0.5 rounded border border-cyan-500/20">{settings.flow} m³/s</span>
                                </div>
                                <input type="range" min="0.1" max="200" step="0.1" value={settings.flow} onChange={(e) => updateSettings('flow', parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <ModernInput label="Water Type" as="select" value={settings.waterQuality} onChange={(e: any) => updateSettings('waterQuality', e.target.value)}>
                                    <option value="clean">Clean</option>
                                    <option value="suspended">Suspended Solids</option>
                                    <option value="abrasive">Glacial Silt (Abrasive)</option>
                                </ModernInput>
                                <ModernInput label="Flow Profile" as="select" value={settings.flowVariation} onChange={(e: any) => updateSettings('flowVariation', e.target.value)}>
                                    <option value="stable">Stable (Run-of-River)</option>
                                    <option value="seasonal">Seasonal Storage</option>
                                </ModernInput>
                            </div>
                        </div>
                    </ControlPanel>
                    <div className="flex flex-col gap-6">
                        <TurbineChart head={settings.head} flow={settings.flow} />
                        <div className="grid grid-cols-2 gap-4">
                            <StatCard label="Specific Speed (Nq)" value={calculations.n_sq} subtitle="Topology Index" />
                            <StatCard label="Potential Power" value={calculations.powerMW.toFixed(1)} unit="MW" subtitle="Calculated Capacity" />
                        </div>
                        <ModernButton onClick={() => setStep(2)} variant="primary" fullWidth className="mt-auto h-12">CONTINUE TO SELECTION →</ModernButton>
                    </div>
                </div>
            )}

            {/* STEP 2: TURBINE SELECTION */}
            {step === 2 && (
                <div className="animate-fade-in space-y-6">
                    <h3 className="text-xl font-bold text-white text-center">Recommended Engineering Matches</h3>
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
                                    {rec.isBest && <span className="bg-emerald-500 text-black text-[10px] font-black px-2 py-1 rounded uppercase">Best Match</span>}
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
                                    <span className="text-xs text-slate-500 font-mono">Match Score</span>
                                    <span className={`text-xl font-black ${rec.isBest ? 'text-white' : 'text-slate-500'}`}>{rec.score}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between pt-8">
                        <ModernButton onClick={() => setStep(1)} variant="ghost">← Back</ModernButton>
                        <ModernButton onClick={() => setStep(3)} variant="secondary">Skip to Export →</ModernButton>
                    </div>
                </div>
            )}

            {/* STEP 3: FINANCIAL & EXPORT */}
            {step === 3 && (
                <div className="animate-fade-in max-w-2xl mx-auto space-y-8">
                    <GlassCard title="Project Export">
                        <div className="space-y-6">
                            <div className="bg-slate-950/50 p-6 rounded-lg border border-white/5">
                                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Configuration Name</p>
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        value={configName}
                                        onChange={(e) => setConfigName(e.target.value)}
                                        placeholder="e.g. Iron Gorge - Francis V1"
                                        className="flex-1 bg-transparent border-b border-white/20 text-xl font-bold text-white focus:outline-none focus:border-cyan-500 pb-2 placeholder:text-slate-700"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <ModernButton onClick={handleSaveConfiguration} variant="primary" icon={<span>cloud_upload</span>} fullWidth isLoading={isLoading}>Save to Cloud</ModernButton>
                                <ModernButton onClick={handleGeneratePDF} variant="secondary" icon={<span>picture_as_pdf</span>} fullWidth>Generate Report</ModernButton>
                            </div>
                        </div>
                    </GlassCard>
                    <div className="flex justify-start">
                        <ModernButton onClick={() => setStep(2)} variant="ghost">← Back to Selection</ModernButton>
                    </div>
                </div>
            )}


        </div>
        </ErrorBoundary>
    );
};
