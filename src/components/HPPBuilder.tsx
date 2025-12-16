import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from './BackButton.tsx';
import { useNavigation } from '../contexts/NavigationContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../services/supabaseClient.ts';
import { createCalculationReportBlob, openAndDownloadBlob } from '../utils/pdfGenerator.ts';
import { TURBINE_CATEGORIES } from '../constants.ts';
// ISPRAVKA 1: Uvezi AssetPicker kao komponentu
import { AssetPicker } from './AssetPicker.tsx';
// ISPRAVKA 2: Uvezi hook izravno iz konteksta (Ispravlja TS2459)
import { useAssetContext } from '../contexts/AssetContext.tsx';
import type { SavedConfiguration, HPPSettings, TurbineRecommendation } from '../types.ts';
import { GlassCard } from './ui/GlassCard.tsx';
import { ModernButton } from './ui/ModernButton.tsx';
import { ModernInput } from './ui/ModernInput.tsx';

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
    const { navigateToTurbineDetail } = useNavigation();
    const { showToast } = useToast();
    const { user } = useAuth();
    const { selectedAsset } = useAssetContext();
    const { t } = useTranslation();

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

    useEffect(() => { fetchCloudConfigs(); }, [selectedAsset, user]); // Dodan user u dependency
    useEffect(() => { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings)); }, [settings]);

    // --- PHYSICS CALCULATIONS ---
    const calculations = useMemo(() => {
        // g = 9.81 m/s²
        const powerMW = (9.81 * settings.head * settings.flow * (settings.efficiency / 100)) / 1000;
        const hours = 8760;
        const capacityFactor = settings.flowVariation === 'stable' ? 0.85 : settings.flowVariation === 'seasonal' ? 0.6 : 0.45;
        const annualGWh = (powerMW * hours * capacityFactor) / 1000;
        // Specifična brzina: Ns = N * sqrt(Q) / H^(3/4)
        // Pretpostavljamo tipičnu brzinu N=1000, pa koristimo pojednostavljeni indeks.
        const specificSpeedIndex = (1000 * Math.sqrt(settings.flow)) / Math.pow(settings.head, 0.75);

        return {
            powerMW: parseFloat(powerMW.toFixed(2)),
            energyGWh: parseFloat(annualGWh.toFixed(2)),
            annualGWh: annualGWh.toFixed(2),
            n_sq: specificSpeedIndex.toFixed(0)
        };
    }, [settings]);

    // --- RECOMMENDATIONS ---
    const recommendations = useMemo((): TurbineRecommendation[] => {
        const { head, flow, flowVariation, waterQuality } = settings;
        const n_sq = parseFloat(calculations.n_sq);
        const recs: TurbineRecommendation[] = [];

        // Pelton
        let peltonScore = 0; let peltonReasons = [];
        if (n_sq < 30) { peltonScore += 30; peltonReasons.push(`+ ${t('hppBuilder.reasons.pelton.idealSpeed', { n: n_sq })}`); }
        else if (n_sq < 70) { peltonScore += 15; peltonReasons.push(`+ ${t('hppBuilder.reasons.pelton.multiJet')}`); } else { peltonScore -= 20; }
        if (head > 200) { peltonScore += 15; peltonReasons.push(`+ ${t('hppBuilder.reasons.pelton.optimalHead')}`); } else if (head < 50) { peltonScore -= 100; peltonReasons.push(`- ${t('hppBuilder.reasons.pelton.lowHead')}`); }
        if (waterQuality === 'abrasive') { peltonScore += 10; peltonReasons.push(`+ ${t('hppBuilder.reasons.pelton.erosion')}`); }
        recs.push({ key: 'pelton', score: peltonScore, reasons: peltonReasons, isBest: false });

        // Francis
        let francisScore = 0; let francisReasons = [];
        if (n_sq >= 70 && n_sq <= 350) { francisScore += 30; francisReasons.push(`+ ${t('hppBuilder.reasons.francis.idealZone', { n: n_sq })}`); }
        if (head >= 40 && head <= 400) { francisScore += 10; francisReasons.push(`+ ${t('hppBuilder.reasons.francis.standard')}`); }
        if (flowVariation === 'variable') { francisScore -= 10; francisReasons.push(`- ${t('hppBuilder.reasons.francis.variableFlow')}`); }
        if (waterQuality === 'abrasive') { francisScore -= 15; francisReasons.push(`- ${t('hppBuilder.reasons.francis.erosion')}`); }
        recs.push({ key: 'francis', score: francisScore, reasons: francisReasons, isBest: false });

        // Kaplan
        let kaplanScore = 0; let kaplanReasons = [];
        if (n_sq > 350) { kaplanScore += 30; kaplanReasons.push(`+ ${t('hppBuilder.reasons.kaplan.highSpeed')}`); }
        if (head < 40) { kaplanScore += 15; kaplanReasons.push(`+ ${t('hppBuilder.reasons.kaplan.lowHead')}`); }
        if (head > 70) { kaplanScore -= 50; kaplanReasons.push(`- ${t('hppBuilder.reasons.kaplan.highHead')}`); }
        if (flowVariation === 'variable') { kaplanScore += 20; kaplanReasons.push(`+ ${t('hppBuilder.reasons.kaplan.doubleReg')}`); }
        recs.push({ key: 'kaplan', score: kaplanScore, reasons: kaplanReasons, isBest: false });

        // Crossflow
        let crossScore = 0; let crossReasons = [];
        if (head < 100 && flow < 5) { crossScore += 20; crossReasons.push(`+ ${t('hppBuilder.reasons.crossflow.efficiency')}`); }
        if (waterQuality === 'abrasive') { crossScore += 20; crossReasons.push(`+ ${t('hppBuilder.reasons.crossflow.selfCleaning')}`); }
        recs.push({ key: 'crossflow', score: crossScore, reasons: crossReasons, isBest: false });

        const maxScore = Math.max(...recs.map(r => r.score));
        return recs.map(r => ({ ...r, isBest: r.score === maxScore && r.score > 0 })).sort((a, b) => b.score - a.score);
    }, [settings, calculations.n_sq, t]);

    const updateSettings = (key: keyof HPPSettings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
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

    const handleSaveConfiguration = async () => {
        if (!configName) { showToast(t('hppBuilder.toasts.enterName'), 'warning'); return; }
        if (!selectedAsset) { showToast(t('hppBuilder.toasts.selectAsset'), 'error'); return; }

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
        const blob = createCalculationReportBlob(settings, calculations, recommendations, selectedAsset?.name);
        openAndDownloadBlob(blob, 'hpp_design_report.pdf');
        showToast(t('hppBuilder.toasts.pdfGenerated'), 'success');
    };

    return (
        <div className="animate-fade-in space-y-8 pb-12 max-w-7xl mx-auto">

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
                <GlassCard className="h-fit">
                    <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                        <span className="text-2xl">🎛️</span>
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider">{t('hppBuilder.parameters')}</h3>
                    </div>

                    <div className="space-y-8">
                        {/* Sliders */}
                        <div>
                            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase mb-2">
                                <span>{t('hppBuilder.netHead')}</span>
                                <span className="text-cyan-400 font-mono bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/20">{settings.head} m</span>
                            </div>
                            {/* TypeScript Range fix */}
                            <input type="range" min="2" max="1000" step="1" value={settings.head} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSettings('head', parseInt(e.target.value))} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition-all" />
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase mb-2">
                                <span>{t('hppBuilder.flowRate')}</span>
                                <span className="text-cyan-400 font-mono bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/20">{settings.flow} m³/s</span>
                            </div>
                            {/* TypeScript Range fix */}
                            <input type="range" min="0.1" max="200" step="0.1" value={settings.flow} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSettings('flow', parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition-all" />
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase mb-2">
                                <span>{t('hppBuilder.efficiency')}</span>
                                <span className="text-emerald-400 font-mono bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/20">{settings.efficiency}%</span>
                            </div>
                            {/* TypeScript Range fix */}
                            <input type="range" min="70" max="98" step="1" value={settings.efficiency} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSettings('efficiency', parseInt(e.target.value))} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-all" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 pt-6 mt-6 border-t border-white/5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('hppBuilder.hydrologyType')}</label>
                            {/* TypeScript Select fix */}
                            <select value={settings.flowVariation} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateSettings('flowVariation', e.target.value as HPPSettings['flowVariation'])} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white outline-none focus:border-cyan-500 transition-colors cursor-pointer">
                                <option value="stable">{t('hppBuilder.hydrology.stable')}</option>
                                <option value="seasonal">{t('hppBuilder.hydrology.seasonal')}</option>
                                <option value="variable">{t('hppBuilder.hydrology.variable')}</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('hppBuilder.waterCondition')}</label>
                            {/* TypeScript Select fix */}
                            <select value={settings.waterQuality} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateSettings('waterQuality', e.target.value as HPPSettings['waterQuality'])} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white outline-none focus:border-cyan-500 transition-colors cursor-pointer">
                                <option value="clean">{t('hppBuilder.water.clean')}</option>
                                <option value="suspended">{t('hppBuilder.water.suspended')}</option>
                                <option value="abrasive">{t('hppBuilder.water.abrasive')}</option>
                            </select>
                        </div>
                    </div>

                    {/* CLOUD CONFIGS */}
                    <div className="border-t border-white/5 pt-4 mt-6">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('hppBuilder.teamDesigns')}</h4>
                            <button onClick={() => setSaveModalOpen(true)} className="text-[10px] bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 px-2 py-1 rounded hover:bg-cyan-600 hover:text-white transition-all flex items-center gap-1 uppercase font-bold">
                                <span>💾</span> {t('hppBuilder.save')}
                            </button>
                        </div>
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
                </GlassCard>

                {/* MIDDLE: PHYSICS ENGINE */}
                <div className="relative">
                    <div className="absolute inset-0 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none"></div>
                    <GlassCard className="p-0 border-cyan-500/30 shadow-2xl shadow-cyan-900/20 relative z-10 h-full flex flex-col">
                        <div className="p-6 pb-0 flex-grow">
                            <TurbineChart head={settings.head} flow={settings.flow} />

                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div className="text-center p-4 bg-slate-900/50 rounded-xl border border-white/5">
                                    <p className="text-[9px] text-slate-500 uppercase tracking-[0.1em] font-bold mb-1">{t('hppBuilder.topologyIndex')} ($n_s$)</p>
                                    <div className="text-3xl font-mono text-white font-black tracking-tighter">{calculations.n_sq}</div>
                                    <p className="text-[9px] text-slate-600 mt-1">{t('hppBuilder.physicsDeterminant')}</p>
                                </div>
                                <div className="text-center p-4 bg-slate-900/50 rounded-xl border border-white/5">
                                    <p className="text-[9px] text-slate-500 uppercase tracking-[0.1em] font-bold mb-1">{t('hppBuilder.estGeneration')}</p>
                                    <div className="text-3xl font-mono text-emerald-400 font-black tracking-tighter">{calculations.energyGWh}</div>
                                    <p className="text-[9px] text-emerald-500/50 mt-1">{t('hppBuilder.units.gwhYear')}</p>
                                </div>
                            </div>

                            <div className="mt-8 text-center">
                                <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-bold mb-2">{t('hppBuilder.calcPower')}</p>
                                <h3 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 tracking-tighter drop-shadow-sm">
                                    {calculations.powerMW}<span className="text-2xl text-slate-600 ml-1">MW</span>
                                </h3>
                            </div>
                        </div>

                        <div className="p-6 mt-auto">
                            <ModernButton onClick={handleGeneratePDF} variant="primary" className="shadow-cyan-500/20" icon={<span>📄</span>} fullWidth>
                                {t('hppBuilder.downloadReport')}
                            </ModernButton>
                        </div>
                    </GlassCard>
                </div>

                {/* RIGHT: RECOMMENDATIONS */}
                <GlassCard className="h-fit max-h-[800px] overflow-hidden flex flex-col">
                    <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                        <span className="text-2xl">🏆</span>
                        <div>
                            <h3 className="text-lg font-bold text-white uppercase tracking-wider">{t('hppBuilder.engineeringSelection')}</h3>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">{t('hppBuilder.rankedBy')}</p>
                        </div>
                    </div>

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
                                            {t('hppBuilder.optimalMatch', 'Optimal Match')}
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
                                                {t('hppBuilder.specs', 'Specs')} <span className="text-lg leading-none">→</span>
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </GlassCard>
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
                            // ISPRAVKA: Dodan eksplicitni tip za rješavanje TS7006
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfigName(e.target.value)}
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