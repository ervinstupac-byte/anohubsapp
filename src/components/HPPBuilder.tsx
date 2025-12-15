import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // <--- IMPORT
import { BackButton } from './BackButton.tsx';
import { useNavigation } from '../contexts/NavigationContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx'; 
import { useAuth } from '../contexts/AuthContext.tsx'; 
import { supabase } from '../services/supabaseClient.ts'; 
import { generateCalculationReport } from '../utils/pdfGenerator.ts'; 
import { TURBINE_CATEGORIES } from '../constants.ts';
import { AssetPicker, useAssetContext } from './AssetPicker.tsx'; 
import type { SavedConfiguration, HPPSettings, TurbineRecommendation } from '../types.ts';

const LOCAL_STORAGE_KEY = 'hpp-builder-settings';

// --- CHART COMPONENT ---
const TurbineChart: React.FC<{ head: number; flow: number }> = ({ head, flow }) => {
    const topPos = Math.max(0, Math.min(100, 100 - (Math.log10(head) / Math.log10(1000)) * 100)); 
    const leftPos = Math.max(0, Math.min(100, (Math.log10(flow) / Math.log10(200)) * 100));

    return (
        <div className="relative w-full h-64 bg-slate-900 rounded-xl border border-slate-600 overflow-hidden mb-6 shadow-inner group">
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
            
            <div className="absolute top-[15%] left-[10%] text-slate-700 text-xs font-black tracking-widest rotate-[-15deg]">PELTON ZONE</div>
            <div className="absolute top-[50%] left-[40%] text-slate-700 text-xs font-black tracking-widest rotate-[-15deg]">FRANCIS ZONE</div>
            <div className="absolute bottom-[20%] right-[20%] text-slate-700 text-xs font-black tracking-widest rotate-[-15deg]">KAPLAN ZONE</div>
            
            <div className="absolute left-2 top-2 text-[10px] text-cyan-500 font-bold">Head (m) ▲</div>
            <div className="absolute right-2 bottom-2 text-[10px] text-cyan-500 font-bold">Flow (m³/s) ►</div>
            
            <div 
                className="absolute w-4 h-4 bg-cyan-400 rounded-full border-2 border-white shadow-[0_0_15px_cyan] transition-all duration-500 z-10" 
                style={{ top: `${topPos}%`, left: `${leftPos}%`, transform: 'translate(-50%, -50%)' }}
            >
                <div className="absolute -top-10 -left-12 w-28 bg-slate-900/90 text-[10px] text-center text-white rounded p-1 border border-cyan-500/50 pointer-events-none shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    H: {head}m | Q: {flow}m³/s
                </div>
            </div>
        </div>
    );
};

const HPPBuilder: React.FC = () => {
    const { navigateToTurbineDetail } = useNavigation();
    const { showToast } = useToast();
    const { user } = useAuth();
    const { selectedAsset } = useAssetContext(); 
    const { t } = useTranslation(); // <--- HOOK
    
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

    // Load configs from CLOUD on mount
    useEffect(() => {
        fetchCloudConfigs();
    }, [selectedAsset]); 

    // Save current settings locally
    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

    // --- PHYSICS CALCULATIONS ---
    const calculations = useMemo(() => {
        const powerMW = (9.81 * settings.head * settings.flow * (settings.efficiency / 100)) / 1000;
        const hours = 8760;
        const capacityFactor = settings.flowVariation === 'stable' ? 0.85 : settings.flowVariation === 'seasonal' ? 0.6 : 0.45;
        const annualGWh = (powerMW * hours * capacityFactor) / 1000;
        const specificSpeedIndex = (1000 * Math.sqrt(settings.flow)) / Math.pow(settings.head, 0.75); 

        return {
            powerMW: parseFloat(powerMW.toFixed(2)),
            energyGWh: parseFloat(annualGWh.toFixed(2)), // Number za tip CalculationResult
            annualGWh: annualGWh.toFixed(2), // String za prikaz (ako zatreba)
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
        if (n_sq < 30) { peltonScore += 30; peltonReasons.push(`+ Ideal Specific Speed (Index: ${n_sq})`); }
        else if (n_sq < 70) { peltonScore += 15; peltonReasons.push(`+ Multi-jet application range`); } else { peltonScore -= 20; } 
        if (head > 200) { peltonScore += 15; peltonReasons.push('+ Optimal Head range (>200m)'); } else if (head < 50) { peltonScore -= 100; peltonReasons.push('- Head too low for Impulse physics'); }
        if (waterQuality === 'abrasive') { peltonScore += 10; peltonReasons.push('+ Resistant to erosion (no seal gaps)'); }
        recs.push({ key: 'pelton', score: peltonScore, reasons: peltonReasons, isBest: false });

        // Francis
        let francisScore = 0; let francisReasons = [];
        if (n_sq >= 70 && n_sq <= 350) { francisScore += 30; francisReasons.push(`+ Ideal Reaction Zone (Index: ${n_sq})`); }
        if (head >= 40 && head <= 400) { francisScore += 10; francisReasons.push('+ Standard Francis domain'); }
        if (flowVariation === 'variable') { francisScore -= 10; francisReasons.push('- Efficiency drops at part load'); }
        if (waterQuality === 'abrasive') { francisScore -= 15; francisReasons.push('- High erosion risk on guide vanes'); }
        recs.push({ key: 'francis', score: francisScore, reasons: francisReasons, isBest: false });

        // Kaplan
        let kaplanScore = 0; let kaplanReasons = [];
        if (n_sq > 350) { kaplanScore += 30; kaplanReasons.push(`+ High Specific Speed domain`); }
        if (head < 40) { kaplanScore += 15; kaplanReasons.push('+ Low head specialist'); }
        if (head > 70) { kaplanScore -= 50; kaplanReasons.push('- Head too high (Cavitation risk)'); }
        if (flowVariation === 'variable') { kaplanScore += 20; kaplanReasons.push('+ Double-regulated (Excellent part-load)'); }
        recs.push({ key: 'kaplan', score: kaplanScore, reasons: kaplanReasons, isBest: false });

        // Crossflow
        let crossScore = 0; let crossReasons = [];
        if (head < 100 && flow < 5) { crossScore += 20; crossReasons.push('+ Economic Efficiency for small scale'); }
        if (waterQuality === 'abrasive') { crossScore += 20; crossReasons.push('+ Self-cleaning capability'); }
        recs.push({ key: 'crossflow', score: crossScore, reasons: crossReasons, isBest: false });

        const maxScore = Math.max(...recs.map(r => r.score));
        return recs.map(r => ({ ...r, isBest: r.score === maxScore && r.score > 0 })).sort((a, b) => b.score - a.score);
    }, [settings, calculations.n_sq]);

    const updateSettings = (key: keyof HPPSettings, value: any) => {
        setSettings(prev => ({...prev, [key]: value}));
    };

    // --- CLOUD ACTIONS ---
    const fetchCloudConfigs = async () => {
        if (!user) return;
        setIsLoading(true);
        
        let query = supabase.from('turbine_designs').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        
        if (selectedAsset) {
            query = query.eq('asset_id', selectedAsset.id);
        }

        const { data, error } = await query;
        
        if (!error && data) {
            const mapped: SavedConfiguration[] = data.map((d: any) => ({
                id: d.id.toString(),
                name: d.design_name,
                asset_id: d.asset_id,
                timestamp: new Date(d.created_at).getTime(),
                parameters: d.parameters,
                results: d.calculations // Mapiranje na results (CalculationResult)
            }));
            setSavedConfigs(mapped);
        }
        setIsLoading(false);
    };

    const handleSaveConfiguration = async () => {
        if (!configName) { showToast('Enter a name.', 'warning'); return; }
        if (!selectedAsset) { showToast('Select an Asset to attach this design to.', 'error'); return; } 
        
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

            showToast(`Design linked to ${selectedAsset.name} & saved.`, 'success');
            setSaveModalOpen(false);
            setConfigName('');
            fetchCloudConfigs(); 
        } catch (error: any) {
            console.error('Save error:', error);
            showToast(`Save failed: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const loadConfiguration = (config: SavedConfiguration) => {
        setSettings(config.parameters);
        showToast(`Loaded: ${config.name}`, 'info');
    };

    const handleGeneratePDF = () => {
        generateCalculationReport(settings, calculations, recommendations, selectedAsset?.name);
        showToast('Design Report PDF Generated.', 'success');
    };

    return (
        <div className="animate-fade-in space-y-8 pb-12 max-w-7xl mx-auto">
            <BackButton text={t('actions.back', 'Back to Hub')} />
            <AssetPicker />
            
            <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-white">{t('hppBuilder.title').split(' ')[0]} {t('hppBuilder.title').split(' ')[1]} <span className="text-cyan-400">{t('hppBuilder.title').split(' ')[2]}</span></h2>
                <div className="flex justify-center items-center gap-2 text-sm text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span>{t('hppBuilder.connected')}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT: INPUTS */}
                <div className="glass-panel p-6 rounded-2xl bg-slate-800/50 border border-slate-700 space-y-6 h-fit">
                    <div className="flex items-center gap-3 mb-2 border-b border-slate-700 pb-4">
                        <span className="text-2xl">🎛️</span>
                        <h3 className="text-xl font-bold text-white">{t('hppBuilder.parameters')}</h3>
                    </div>
                    
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-2"><span className="text-slate-300 font-bold">{t('hppBuilder.netHead')}</span><span className="text-cyan-400 font-mono font-bold bg-cyan-900/30 px-2 rounded">{settings.head} m</span></div>
                            <input type="range" min="2" max="1000" step="1" value={settings.head} onChange={(e) => updateSettings('head', parseInt(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2"><span className="text-slate-300 font-bold">{t('hppBuilder.flowRate')}</span><span className="text-cyan-400 font-mono font-bold bg-cyan-900/30 px-2 rounded">{settings.flow} m³/s</span></div>
                            <input type="range" min="0.1" max="200" step="0.1" value={settings.flow} onChange={(e) => updateSettings('flow', parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                        </div>
                         <div>
                            <div className="flex justify-between text-sm mb-2"><span className="text-slate-300 font-bold">{t('hppBuilder.efficiency')}</span><span className="text-cyan-400 font-mono font-bold bg-cyan-900/30 px-2 rounded">{settings.efficiency}%</span></div>
                            <input type="range" min="70" max="98" step="1" value={settings.efficiency} onChange={(e) => updateSettings('efficiency', parseInt(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 pt-4 border-t border-slate-700">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('hppBuilder.hydrologyType')}</label>
                            <select value={settings.flowVariation} onChange={(e) => updateSettings('flowVariation', e.target.value)} className="w-full bg-slate-900/80 border border-slate-600 rounded-lg p-3 text-sm text-white outline-none focus:border-cyan-500">
                                <option value="stable">Stable Base Load</option>
                                <option value="seasonal">Seasonal Peak/Off-Peak</option>
                                <option value="variable">Highly Variable (Flashy)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t('hppBuilder.waterCondition')}</label>
                            <select value={settings.waterQuality} onChange={(e) => updateSettings('waterQuality', e.target.value)} className="w-full bg-slate-900/80 border border-slate-600 rounded-lg p-3 text-sm text-white outline-none focus:border-cyan-500">
                                <option value="clean">Clear Water</option>
                                <option value="suspended">Silt Load (Glacial)</option>
                                <option value="abrasive">Hard Sediment (Quartz)</option>
                            </select>
                        </div>
                    </div>

                    {/* CLOUD CONFIG MANAGER */}
                    <div className="border-t border-slate-700 pt-4">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-bold text-white">{t('hppBuilder.teamDesigns')}</h4>
                            <button onClick={() => setSaveModalOpen(true)} className="text-xs bg-cyan-600 px-2 py-1 rounded text-white hover:bg-cyan-500 flex items-center gap-1">
                                <span>☁️</span> {t('hppBuilder.save')}
                            </button>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                           {isLoading && <p className="text-xs text-slate-500 animate-pulse">{t('hppBuilder.syncing')}</p>}
                           {!isLoading && savedConfigs.length === 0 && <p className="text-xs text-slate-500 italic">{t('hppBuilder.noDesigns')}</p>}
                           {savedConfigs.map(c => (
                            <div key={c.id} className="flex items-center justify-between bg-slate-700/50 p-2 rounded text-xs group hover:bg-slate-700 transition-colors">
                              <div className="truncate w-32">
                                <span className="text-slate-300 font-bold block">{c.name}</span>
                                {c.asset_id && <span className="text-[9px] text-slate-500">Linked</span>}
                              </div>
                              <button onClick={() => loadConfiguration(c)} className="text-cyan-400 hover:text-cyan-300 uppercase font-bold text-[10px]">{t('hppBuilder.load')}</button>
                            </div>
                          ))}
                        </div>
                     </div>
                </div>

                {/* MIDDLE: PHYSICS ENGINE */}
                <div className="glass-panel p-0 rounded-2xl overflow-hidden flex flex-col h-fit bg-slate-800/80 border border-slate-700 shadow-2xl">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6">
                        <TurbineChart head={settings.head} flow={settings.flow} />
                        
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="text-center p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">{t('hppBuilder.topologyIndex')} ($n_s$)</p>
                                <div className="text-2xl font-mono text-yellow-400 font-bold">{calculations.n_sq}</div>
                                <p className="text-[9px] text-slate-500">{t('hppBuilder.physicsDeterminant')}</p>
                            </div>
                            <div className="text-center p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">{t('hppBuilder.estGeneration')}</p>
                                <div className="text-2xl font-mono text-green-400 font-bold">{calculations.energyGWh}</div>
                                <p className="text-[9px] text-slate-500">GWh / year</p>
                            </div>
                        </div>

                        <div className="mt-8 text-center border-t border-slate-700/50 pt-6">
                            <p className="text-slate-400 text-xs uppercase tracking-[0.2em] mb-2">{t('hppBuilder.calcPower')}</p>
                            <h3 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-lg">
                                {calculations.powerMW} <span className="text-xl text-slate-500">MW</span>
                            </h3>
                        </div>

                        <div className="mt-6 text-center">
                             <button onClick={handleGeneratePDF} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-full transition-all flex items-center gap-2 mx-auto border border-slate-500 shadow-lg hover:shadow-cyan-500/20 transform hover:-translate-y-1">
                                <span className="text-lg">📄</span> {t('hppBuilder.downloadReport')}
                             </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT: RECOMMENDATIONS */}
                <div className="glass-panel p-6 rounded-2xl bg-slate-800/50 border border-slate-700 space-y-4 h-fit max-h-[700px] overflow-y-auto custom-scrollbar">
                    <div className="flex items-center gap-3 mb-4 border-b border-slate-700 pb-4">
                        <span className="text-2xl">🧠</span>
                        <div>
                            <h3 className="text-lg font-bold text-white">{t('hppBuilder.engineeringSelection')}</h3>
                            <p className="text-xs text-slate-400">{t('hppBuilder.rankedBy')}</p>
                        </div>
                    </div>
                    {recommendations.map((rec) => {
                        const turbineName = TURBINE_CATEGORIES[rec.key]?.name || rec.key.toUpperCase();
                        return (
                            <div key={rec.key} onClick={() => rec.score > 0 && navigateToTurbineDetail(rec.key)} className={`group p-4 rounded-xl border transition-all duration-300 relative overflow-hidden ${rec.isBest ? 'bg-gradient-to-r from-green-900/20 to-slate-900 border-green-500 shadow-lg transform scale-100 cursor-pointer' : rec.score > 0 ? 'bg-slate-800/40 border-slate-700 hover:border-slate-500 hover:bg-slate-800 cursor-pointer' : 'bg-slate-900/30 border-slate-800 opacity-50 cursor-not-allowed'}`}>
                                {rec.isBest && <div className="absolute top-0 right-0 bg-green-500 text-slate-900 text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-md">{t('hppBuilder.optimalMatch')}</div>}
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className={`font-bold text-lg ${rec.isBest ? 'text-green-400' : 'text-slate-200'}`}>{turbineName}</h4>
                                </div>
                                <ul className="space-y-1.5 mb-4">
                                    {rec.reasons.map((reason, i) => (
                                        <li key={i} className="text-xs text-slate-300 flex items-start">
                                            <span className={`mr-2 mt-0.5 ${reason.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{reason.startsWith('+') ? '✓' : '✗'}</span>
                                            {reason.substring(2)}
                                        </li>
                                    ))}
                                </ul>
                                {rec.score > 0 && <div className="pt-3 border-t border-slate-700/50 flex justify-end"><span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 group-hover:text-cyan-300 transition-colors">{t('hppBuilder.viewSpecs')} →</span></div>}
                            </div>
                        );
                    })}
                </div>
            </div>

             {/* SAVE MODAL */}
             {isSaveModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-4 text-white">{t('hppBuilder.saveModalTitle')}</h3>
                        
                        {!selectedAsset && (
                            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-xs">
                                ⚠️ {t('hppBuilder.selectAssetWarning')}
                            </div>
                        )}

                        <input type="text" value={configName} onChange={e => setConfigName(e.target.value)} placeholder={t('hppBuilder.designNamePlaceholder')} className="w-full bg-slate-900 border border-slate-600 p-2 rounded mb-4 text-white" autoFocus />
                        
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setSaveModalOpen(false)} className="px-4 py-2 bg-slate-700 text-slate-300 rounded hover:bg-slate-600">{t('hppBuilder.cancel')}</button>
                            <button onClick={handleSaveConfiguration} disabled={isLoading || !selectedAsset} className={`px-4 py-2 text-white rounded flex items-center gap-2 ${isLoading || !selectedAsset ? 'bg-slate-600 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500'}`}>
                                {isLoading ? t('hppBuilder.saving') : <><span>☁️</span> {t('hppBuilder.uploadDesign')}</>}
                            </button>
                        </div>
                    </div>
                </div>
             )}
        </div>
    );
};

export default HPPBuilder;