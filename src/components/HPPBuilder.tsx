import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from './BackButton.tsx';
import { useNavigation } from '../contexts/NavigationContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../services/supabaseClient.ts';
import { reportGenerator } from '../services/ReportGenerator.ts';
import { TURBINE_CATEGORIES } from '../constants.ts';
// ISPRAVKA 1: Uvezi AssetPicker kao komponentu
import { AssetPicker } from './AssetPicker.tsx';
// ISPRAVKA 2: Uvezi hook izravno iz konteksta (Ispravlja TS2459)
import { useAssetContext } from '../contexts/AssetContext.tsx';
import { useTelemetry } from '../contexts/TelemetryContext.tsx';
import type { SavedConfiguration, HPPSettings, TurbineRecommendation } from '../types.ts';
import { GlassCard } from './ui/GlassCard.tsx';
import { StatCard } from './ui/StatCard.tsx';
import { ControlPanel } from './ui/ControlPanel.tsx';
import { ModernButton } from './ui/ModernButton.tsx';
import { ModernInput } from './ui/ModernInput.tsx';
import { HPPSettingsSchema } from '../schemas/engineering.ts';
import { useHPPDesign } from '../contexts/HPPDesignContext.tsx';
import { useHPPData } from '../contexts/useHPPData.ts';
import { Tooltip } from './ui/Tooltip.tsx';
import { TurbineFactory } from '../lib/engines/TurbineFactory.ts';
import { EngineeringError } from '../lib/engines/types.ts';
import { useVoiceAssistant } from '../contexts/VoiceAssistantContext.tsx';

const LOCAL_STORAGE_KEY = 'hpp-builder-settings';

// --- MODERN CHART COMPONENT ---
const TurbineChart: React.FC<{ head: number; flow: number }> = ({ head, flow }) => {
    const { t } = useTranslation();
    const topPos = Math.max(0, Math.min(100, 100 - (Math.log10(head) / Math.log10(1000)) * 100));
    const leftPos = Math.max(0, Math.min(100, (Math.log10(flow) / Math.log10(200)) * 100));

    return (
        <div className="relative w-full h-72 bg-[#0B0F19] rounded-2xl border border-slate-700/50 overflow-hidden shadow-inner group">
            {/* Grid Lines */}
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            {/* Zone Labels */}
            <div className="absolute top-[15%] left-[10%] text-slate-600/50 text-xs font-black tracking-[0.2em] rotate-[-15deg] pointer-events-none">{t('hppBuilder.chart.peltonZone')}</div>
            <div className="absolute top-[50%] left-[40%] text-slate-600/50 text-xs font-black tracking-[0.2em] rotate-[-15deg] pointer-events-none">{t('hppBuilder.chart.francisZone')}</div>
            <div className="absolute bottom-[20%] right-[20%] text-slate-600/50 text-xs font-black tracking-[0.2em] rotate-[-15deg] pointer-events-none">{t('hppBuilder.chart.kaplanZone')}</div>

            {/* Axes Labels */}
            <div className="absolute left-3 top-3 text-[10px] text-cyan-500/80 font-mono font-bold">{t('hppBuilder.chart.headAxis')} ▲</div>
            <div className="absolute right-3 bottom-3 text-[10px] text-cyan-500/80 font-mono font-bold">{t('hppBuilder.chart.flowAxis')} ►</div>

            {/* Active Point */}
            <div
                className="absolute w-4 h-4 bg-cyan-400 rounded-full border-[3px] border-white/20 shadow-[0_0_20px_cyan] transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) z-10"
                style={{ top: `${topPos}%`, left: `${leftPos}%`, transform: 'translate(-50%, -50%)' }}
            >
                <div className="absolute w-full h-full rounded-full bg-cyan-400/50 animate-ping"></div>

                {/* Tooltip */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900/90 text-[10px] whitespace-nowrap text-white px-3 py-1.5 rounded-lg border border-cyan-500/30 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none backdrop-blur-md">
                    <span className="text-cyan-400 font-bold">H:</span> {head}m <span className="text-slate-600 mx-1">|</span> <span className="text-cyan-400 font-bold">Q:</span> {flow}m³/s
                </div>
            </div>
        </div>
    );
};

export const HPPBuilder: React.FC = () => {
    useHPPData(); // Enable cross-module synchronization
    const { navigateToTurbineDetail } = useNavigation();
    const { showToast } = useToast();
    const { user } = useAuth();
    const { selectedAsset } = useAssetContext();
    const { telemetry } = useTelemetry();
    const { t } = useTranslation();
    const { setDesign } = useHPPDesign();
    const { triggerVoiceAlert } = useVoiceAssistant();
    const lastAlertTime = useRef<number>(0);

    // --- STATE ---
    const [settings, setSettings] = useState<HPPSettings>(() => {
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            return saved ? JSON.parse(saved) : {
                head: 50, flow: 10, efficiency: 92, powerFactor: 0.8, waterQuality: 'clean', flowVariation: 'stable'
            };
        } catch { return { head: 50, flow: 10, efficiency: 92, powerFactor: 0.8, waterQuality: 'clean', flowVariation: 'stable' }; }
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

    // --- PHYSICS CALCULATIONS ---
    const calculations = useMemo(() => {
        try {
            // Re-fetch correct engine type from factory based on selected asset
            const turbineType = selectedAsset?.turbine_type || 'kaplan';
            const engine = TurbineFactory.getEngine(turbineType);

            const powerMW = engine.calculatePower(settings.head, settings.flow, settings.efficiency);
            const annualGWh = engine.calculateEnergy(powerMW, settings.flowVariation);
            const specificSpeedIndex = engine.calculateSpecificSpeed(settings.head, settings.flow);

            const results = {
                powerMW: powerMW,
                energyGWh: annualGWh,
                annualGWh: annualGWh.toFixed(2),
                n_sq: specificSpeedIndex.toString()
            };

            // Sync with Global Design Context for cross-module integration
            setDesign({
                design_name: configName || 'Active Design',
                recommended_turbine: 'Calculating...',
                parameters: settings,
                calculations: results,
                asset_id: selectedAsset?.id
            });

            return results;
        } catch (error) {
            if (error instanceof EngineeringError) {
                showToast(`ENGINE_ERROR: ${error.message}`, 'error');
            }
            return { powerMW: 0, energyGWh: 0, annualGWh: '0.00', n_sq: '0' };
        }
    }, [settings, selectedAsset, configName, setDesign]);

    // --- NPSH & CAVITATION MONITORING ---
    const npshAvailable = useMemo(() => {
        if (!selectedAsset) return 10;
        const tele = telemetry[selectedAsset.id];
        if (!tele) return 10;

        // Simplified NPSH Calculation: Atmospheric P (10.3m) - Vapor P (0.3m) + (Tailwater - Inlet Elevation)
        // For simulation, we assume Inlet Elevation is 100m.
        return (10.3 - 0.3) + (tele.tailwaterLevel - 100);
    }, [telemetry, selectedAsset]);

    useEffect(() => {
        if (!selectedAsset) return;
        const tele = telemetry[selectedAsset.id];
        if (!tele) return;

        // Forbidden Zone: Wicket Gate > 85% AND NPSH < 4m
        const inForbiddenZone = tele.wicketGatePosition > 85 && npshAvailable < 6.5;

        if (inForbiddenZone) {
            const now = Date.now();
            if (now - lastAlertTime.current > 15000) { // Throttling alerts
                triggerVoiceAlert("Ulazite u kavitacionu zonu. Preporučeno smanjenje opterećenja za 5 MW.");
                lastAlertTime.current = now;
                showToast("CAVITATION ALERT: Dangerous Operation Zone", "warning");
            }
        }
    }, [telemetry, npshAvailable, selectedAsset, triggerVoiceAlert, showToast]);

    // --- RECOMMENDATIONS ---
    const recommendations = useMemo((): TurbineRecommendation[] => {
        const { head, flow, flowVariation, waterQuality } = settings;
        const engines = TurbineFactory.getAllEngines();

        const recs: TurbineRecommendation[] = engines.map(engine => {
            const { score, reasons } = engine.getRecommendationScore(head, flow, flowVariation, waterQuality);
            return {
                key: engine.type,
                score,
                reasons: reasons.map(r => r.startsWith('+') || r.startsWith('-') ? r : `+ ${r}`), // Normalize reasons format
                isBest: false
            };
        });

        const maxScore = Math.max(...recs.map(r => r.score));
        return recs
            .map(r => ({ ...r, isBest: r.score === maxScore && r.score > 0 }))
            .sort((a, b) => b.score - a.score);
    }, [settings]);

    // --- SAVE TO CONTEXT WHENEVER CALCULATIONS CHANGE ---
    useEffect(() => {
        if (calculations && recommendations.length > 0) {
            const bestTurbine = recommendations.find(r => r.isBest);
            setDesign({
                design_name: `Draft-${new Date().toISOString().slice(0, 10)}`,
                recommended_turbine: bestTurbine?.key || 'Unknown',
                parameters: settings,
                calculations: calculations,
                asset_id: selectedAsset?.id
            });
        }
    }, [calculations, recommendations, settings, selectedAsset, setDesign]);

    // --- AUDIT TRAIL HELPER ---
    const logParameterChange = useCallback(async (field: string, newValue: any, oldValue: any) => {
        if (!selectedAsset) return;

        try {
            const { data: prevBlocks } = await supabase
                .from('digital_integrity_ledger')
                .select('hash, block_index')
                .order('block_index', { ascending: false })
                .limit(1);

            const prevBlock = prevBlocks?.[0] || { hash: '0', block_index: -1 };
            const dataString = `CHANGE|${selectedAsset.id}|${field}|${oldValue}->${newValue}|${user?.email || 'System'}`;
            const rawContent = prevBlock.hash + dataString + new Date().toISOString();

            const msgBuffer = new TextEncoder().encode(rawContent);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const newHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            await supabase.from('digital_integrity_ledger').insert([{
                block_index: prevBlock.block_index + 1,
                timestamp: new Date().toISOString(),
                data: dataString,
                hash: newHash,
                prev_hash: prevBlock.hash,
                status: 'Verified',
                engineer_id: user?.email || 'System',
                asset_id: selectedAsset.id.toString()
            }]);
        } catch (err) {
            console.error('Audit Trail Logging Failed:', err);
        }
    }, [selectedAsset, user]);

    const updateSettings = (key: keyof HPPSettings, value: any) => {
        const oldValue = settings[key];
        setSettings(prev => ({ ...prev, [key]: value }));

        if (oldValue !== value && selectedAsset) {
            logParameterChange(key, value, oldValue);
        }
    };

    // --- CLOUD ACTIONS ---
    const fetchCloudConfigs = async () => {
        if (!user) return;
        setIsLoading(true);
        let query = supabase.from('turbine_designs').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (selectedAsset) query = query.eq('asset_id', selectedAsset.id);

        const { data, error } = await query;
        if (!error && data) {
            const mapped: SavedConfiguration[] = data.map((d: any) => ({
                id: d.id.toString(),
                name: d.design_name,
                asset_id: d.asset_id,
                timestamp: new Date(d.created_at).getTime(),
                parameters: d.parameters,
                results: d.calculations
            }));
            setSavedConfigs(mapped);
        }
        setIsLoading(false);
    };

    const autoLoadLatestConfig = async () => {
        if (!user || !selectedAsset) return;

        const { data, error } = await supabase
            .from('turbine_designs')
            .select('*')
            .eq('user_id', user.id)
            .eq('asset_id', selectedAsset.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (!error && data) {
            setSettings(data.parameters);
            showToast(t('hppBuilder.toasts.autoLoaded', { name: selectedAsset.name, defaultValue: `Loaded latest config for ${selectedAsset.name}` }), 'info');
        }
    };

    const handleSaveConfiguration = async () => {
        if (!configName) { showToast(t('hppBuilder.toasts.enterName'), 'warning'); return; }
        if (!selectedAsset) { showToast(t('hppBuilder.toasts.selectAsset'), 'error'); return; }

        // Zod Guardrail
        const validation = HPPSettingsSchema.safeParse(settings);
        if (!validation.success) {
            showToast(`VALIDATION_ERROR: ${validation.error.issues[0].message}`, 'error');
            return;
        }

        setIsLoading(true);
        try {
            const bestTurbine = recommendations.find(r => r.isBest)?.key || 'Unknown';
            const payload = {
                engineer_id: user?.email || t('common.anonymous', 'Anonymous'),
                user_id: user?.id,
                design_name: configName,
                parameters: settings,
                calculations: calculations,
                recommended_turbine: bestTurbine,
                asset_id: selectedAsset.id
            };

            const { error } = await supabase.from('turbine_designs').insert([payload]);
            if (error) throw error;

            showToast(t('hppBuilder.toasts.designLinked', { name: selectedAsset.name }), 'success');
            setSaveModalOpen(false);
            setConfigName('');
            fetchCloudConfigs();
        } catch (error: any) {
            console.error('Save error:', error);
            showToast(t('hppBuilder.toasts.saveFailed', { error: error.message }), 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const loadConfiguration = (config: SavedConfiguration) => {
        setSettings(config.parameters);
        showToast(t('hppBuilder.toasts.loaded', { name: config.name }), 'info');
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

    const isCritical = selectedAsset ? telemetry[selectedAsset.id]?.status === 'CRITICAL' : false;

    return (
        <div className="animate-fade-in space-y-8 pb-12 max-w-7xl mx-auto relative">
            {/* EMERGENCY OVERLAY */}
            {isCritical && (
                <div className="absolute inset-x-0 top-0 z-[100] h-full bg-red-950/40 backdrop-blur-[2px] rounded-2xl flex items-center justify-center p-8 border border-red-500/30">
                    <div className="bg-slate-900 border-2 border-red-500 p-8 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.3)] text-center max-w-md animate-pulse">
                        <span className="text-6xl mb-4 block">🚫</span>
                        <h2 className="text-2xl font-black text-red-500 uppercase tracking-tighter mb-2">SYSTEM LOCKED</h2>
                        <p className="text-slate-200 font-bold mb-4 uppercase text-xs tracking-widest">Critical Deviation Detected</p>
                        <p className="text-slate-400 text-xs leading-relaxed italic">
                            All engineering calculations have been suspended for safety. Please resolve the active project emergency via Risk Assessment protocols.
                        </p>
                    </div>
                </div>
            )}

            {/* HERO HEADER */}
            <div className="text-center space-y-4 pt-6">
                <div className="flex justify-between items-center absolute top-0 w-full max-w-7xl px-4">
                    <BackButton text={t('actions.back', 'Back to Hub')} />
                </div>

                <div>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
                        {t('hppBuilder.title', 'HPP Design Studio').split(' ')[0]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{t('hppBuilder.title', 'HPP Design Studio').split(' ').slice(1).join(' ')}</span>
                    </h2>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400 text-xs font-mono">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        {t('hppBuilder.connected', 'Physics Engine Online')}
                    </div>
                </div>

                <div className="max-w-md mx-auto">
                    <AssetPicker />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT: PARAMETERS */}
                <ControlPanel
                    title={t('hppBuilder.parameters')}
                    icon={<span>🎛️</span>}
                    action={
                        <Tooltip content={t('hppBuilder.saveTooltip', 'Save current configuration to cloud')}>
                            <button onClick={() => setSaveModalOpen(true)} className="text-[10px] bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 px-2 py-1 rounded hover:bg-cyan-600 hover:text-white transition-all flex items-center gap-1 uppercase font-bold">
                                <span>💾</span> {t('hppBuilder.save')}
                            </button>
                        </Tooltip>
                    }
                >
                    <div className="space-y-8">
                        {/* Sliders */}
                        <div>
                            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase mb-2">
                                <Tooltip content={t('hppBuilder.netHeadDesc', 'Vertical distance water falls')}>
                                    <span>{t('hppBuilder.netHead')}</span>
                                </Tooltip>
                                <span className="text-cyan-400 font-mono bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/20">{settings.head} m</span>
                            </div>
                            <input type="range" min="2" max="1000" step="1" value={settings.head} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSettings('head', parseInt(e.target.value))} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition-all" />
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase mb-2">
                                <Tooltip content={t('hppBuilder.flowRateDesc', 'Volume of water passing through')}>
                                    <span>{t('hppBuilder.flowRate')}</span>
                                </Tooltip>
                                <span className="text-cyan-400 font-mono bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/20">{settings.flow} m³/s</span>
                            </div>
                            <input type="range" min="0.1" max="200" step="0.1" value={settings.flow} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSettings('flow', parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition-all" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 pt-6 mt-6 border-t border-white/5">
                        <ModernInput
                            label={t('hppBuilder.hydrologyType')}
                            as="select"
                            value={settings.flowVariation}
                            onChange={(e: any) => updateSettings('flowVariation', e.target.value)}
                        >
                            <option value="stable">{t('hppBuilder.hydrology.stable')}</option>
                            <option value="seasonal">{t('hppBuilder.hydrology.seasonal')}</option>
                            <option value="variable">{t('hppBuilder.hydrology.variable')}</option>
                        </ModernInput>

                        <ModernInput
                            label={t('hppBuilder.waterCondition')}
                            as="select"
                            value={settings.waterQuality}
                            onChange={(e: any) => updateSettings('waterQuality', e.target.value)}
                        >
                            <option value="clean">{t('hppBuilder.water.clean')}</option>
                            <option value="suspended">{t('hppBuilder.water.suspended')}</option>
                            <option value="abrasive">{t('hppBuilder.water.abrasive')}</option>
                        </ModernInput>
                    </div>

                    {/* TEAM DESIGNS */}
                    <div className="border-t border-white/5 pt-4 mt-6">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{t('hppBuilder.teamDesigns')}</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                            {isLoading && <p className="text-xs text-slate-500 animate-pulse">{t('hppBuilder.syncing')}</p>}
                            {!isLoading && savedConfigs.length === 0 && <p className="text-xs text-slate-600 italic text-center py-2">{t('hppBuilder.noDesigns')}</p>}
                            {savedConfigs.map(c => (
                                <div key={c.id} className="flex items-center justify-between bg-slate-900/40 p-2 rounded border border-white/5 hover:border-white/10 transition-colors group cursor-pointer" onClick={() => loadConfiguration(c)}>
                                    <div className="truncate w-32">
                                        <span className="text-slate-300 font-bold text-xs block group-hover:text-white transition-colors">{c.name}</span>
                                        {c.asset_id && <span className="text-[9px] text-slate-500 flex items-center gap-1"><span className="w-1 h-1 bg-emerald-500 rounded-full"></span>Linked</span>}
                                    </div>
                                    <span className="text-slate-600 group-hover:text-cyan-400 text-[10px] uppercase font-bold transition-colors">Load</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </ControlPanel>

                {/* MIDDLE: PHYSICS ENGINE */}
                <div className="relative flex flex-col gap-6">
                    <div className="absolute inset-0 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none"></div>

                    <ControlPanel title="Simulator" icon={<span>⚙️</span>} className="flex-grow flex flex-col">
                        <TurbineChart head={settings.head} flow={settings.flow} />

                        <div className="grid grid-cols-2 gap-4">
                            <StatCard
                                label={t('hppBuilder.topologyIndex')}
                                value={calculations.n_sq}
                                subtitle={t('hppBuilder.physicsDeterminant')}
                            />
                            <StatCard
                                label={t('hppBuilder.estGeneration')}
                                value={calculations.energyGWh}
                                unit="GWh"
                                subtitle={t('hppBuilder.units.gwhYear')}
                            />
                        </div>

                        <div className="text-center py-6">
                            <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-bold mb-2">{t('hppBuilder.calcPower')}</p>
                            <h3 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 tracking-tighter drop-shadow-sm">
                                {calculations.powerMW}<span className="text-2xl text-slate-600 ml-1">MW</span>
                            </h3>
                        </div>

                        {/* NPSH INDICATOR */}
                        <div className="px-6 py-4 bg-slate-900/60 rounded-2xl border border-white/5 mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">NPSH Available</span>
                                <span className={`text-[10px] font-black ${npshAvailable < 6.5 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>
                                    {npshAvailable < 6.5 ? 'CAVITATION RISK' : 'STABLE SUCTION'}
                                </span>
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-black text-white">{npshAvailable.toFixed(2)}</span>
                                <span className="text-[10px] text-slate-600 mb-1 font-bold">m (Head)</span>
                            </div>
                            <div className="mt-3 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${npshAvailable < 6.5 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-emerald-500'}`}
                                    style={{ width: `${Math.min(100, (npshAvailable / 15) * 100)}%` }}
                                />
                            </div>
                        </div>

                        <ModernButton onClick={handleGeneratePDF} variant="primary" className="shadow-cyan-500/20 mt-auto" icon={<span>📄</span>} fullWidth>
                            {t('hppBuilder.downloadReport')}
                        </ModernButton>
                    </ControlPanel>
                </div>

                {/* RIGHT: RECOMMENDATIONS */}
                <ControlPanel
                    title={t('hppBuilder.engineeringSelection')}
                    icon={<span>🏆</span>}
                    subtitle={t('hppBuilder.rankedBy')}
                    className="max-h-[800px] overflow-hidden flex flex-col"
                >
                    <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1 flex-grow">
                        {recommendations.map((rec) => {
                            const turbineName = TURBINE_CATEGORIES[rec.key]?.name || rec.key.toUpperCase();
                            return (
                                <div
                                    key={rec.key}
                                    onClick={() => rec.score > 0 && navigateToTurbineDetail(rec.key)}
                                    className={`
                                        group relative p-5 rounded-xl border transition-all duration-300
                                        ${rec.isBest
                                            ? 'bg-gradient-to-r from-emerald-900/30 to-slate-900 border-emerald-500/50 shadow-lg cursor-pointer hover:border-emerald-400'
                                            : rec.score > 0
                                                ? 'bg-slate-900/40 border-white/5 hover:bg-slate-800 hover:border-white/10 cursor-pointer'
                                                : 'bg-slate-950/30 border-transparent opacity-40 cursor-not-allowed grayscale'}
                                    `}
                                >
                                    {rec.isBest && (
                                        <div className="absolute top-0 right-0 bg-emerald-500 text-[#020617] text-[9px] font-black uppercase px-2 py-1 rounded-bl-lg shadow-sm tracking-wide">
                                            {t('hppBuilder.optimalMatch')}
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className={`font-black text-lg tracking-tight ${rec.isBest ? 'text-emerald-400' : 'text-slate-300 group-hover:text-white'}`}>
                                            {turbineName}
                                        </h4>
                                    </div>

                                    <ul className="space-y-2 mb-3">
                                        {rec.reasons.map((reason, i) => (
                                            <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                                                <span className={`mt-0.5 text-[10px] ${reason.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {reason.startsWith('+') ? '▲' : '▼'}
                                                </span>
                                                <span className={reason.startsWith('+') ? 'text-slate-300' : 'text-slate-500'}>{reason.substring(2)}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {rec.score > 0 && (
                                        <div className="pt-3 border-t border-white/5 flex justify-end">
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-cyan-400 transition-colors flex items-center gap-1">
                                                {t('hppBuilder.specs')} <span className="text-lg leading-none">→</span>
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </ControlPanel>
            </div>

            {/* SAVE MODAL (Minimalist) */}
            {isSaveModalOpen && (
                <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
                    <GlassCard className="w-full max-w-sm shadow-2xl border-slate-600">
                        <h3 className="text-lg font-bold mb-4 text-white">{t('hppBuilder.saveModalTitle')}</h3>

                        {!selectedAsset && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                                <span className="text-red-500 text-lg">⚠️</span>
                                <p className="text-red-200 text-xs leading-relaxed">{t('hppBuilder.selectAssetWarning')}</p>
                            </div>
                        )}

                        <ModernInput
                            value={configName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setConfigName(e.target.value)}
                            placeholder={t('hppBuilder.designNamePlaceholder', 'e.g. Run-of-River Concept V1')}
                            autoFocus
                        />

                        <div className="flex justify-end gap-3 mt-6">
                            <ModernButton onClick={() => setSaveModalOpen(false)} variant="ghost" className="text-xs">{t('hppBuilder.cancel', 'Cancel')}</ModernButton>
                            <ModernButton
                                onClick={handleSaveConfiguration}
                                disabled={isLoading || !selectedAsset}
                                variant="primary"
                                isLoading={isLoading}
                                className="text-xs px-6"
                            >
                                {t('hppBuilder.uploadDesign')}
                            </ModernButton>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};
