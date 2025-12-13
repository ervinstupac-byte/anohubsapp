import React, { useState, useMemo, useEffect } from 'react';
import { BackButton } from './BackButton.tsx';
import { useNavigation } from '../contexts/NavigationContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx'; // <--- NOVO: Toast
// Putanja: Izlazimo iz 'components', ulazimo u 'src/utils'
import { generateCalculationReport } from '../utils/pdfGenerator.ts'; // <--- NOVO: PDF
import { TURBINE_CATEGORIES } from '../constants.ts';
import type { HPPSettings, TurbineRecommendation, SavedConfiguration } from '../types.ts';

const LOCAL_STORAGE_KEY = 'hpp-builder-settings';
const SAVED_CONFIGS_KEY = 'hpp-builder-saved-configs';

// --- CHART COMPONENT (CSS Grid - Professional) ---
const TurbineChart: React.FC<{ head: number; flow: number }> = ({ head, flow }) => {
    // Logaritamska skala: Head (Y) max 1000m, Flow (X) max 200 m3/s
    const topPos = Math.max(0, Math.min(100, 100 - (Math.log10(head) / Math.log10(1000)) * 100)); 
    const leftPos = Math.max(0, Math.min(100, (Math.log10(flow) / Math.log10(200)) * 100));

    return (
        <div className="relative w-full h-64 bg-slate-900 rounded-xl border border-slate-600 overflow-hidden mb-6 shadow-inner">
            {/* Grid Background */}
            <div className="absolute inset-0" style={{ 
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', 
                backgroundSize: '40px 40px' 
            }}></div>
            <div className="absolute inset-0" style={{ 
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', 
                backgroundSize: '10px 10px' 
            }}></div>
            
            {/* Zone Labels */}
            <div className="absolute top-[15%] left-[10%] text-slate-700 text-xs font-black tracking-widest rotate-[-15deg]">PELTON ZONE</div>
            <div className="absolute top-[50%] left-[40%] text-slate-700 text-xs font-black tracking-widest rotate-[-15deg]">FRANCIS ZONE</div>
            <div className="absolute bottom-[20%] right-[20%] text-slate-700 text-xs font-black tracking-widest rotate-[-15deg]">KAPLAN ZONE</div>

            {/* Axis Labels */}
            <div className="absolute left-2 top-2 text-[10px] text-cyan-500 font-bold">Head (m) ▲</div>
            <div className="absolute right-2 bottom-2 text-[10px] text-cyan-500 font-bold">Flow (m³/s) ►</div>

            {/* The Dot */}
            <div 
                className="absolute w-4 h-4 bg-cyan-400 rounded-full border-2 border-white shadow-[0_0_15px_cyan] transition-all duration-500 z-10"
                style={{ top: `${topPos}%`, left: `${leftPos}%`, transform: 'translate(-50%, -50%)' }}
            >
                <div className="absolute -top-8 -left-8 w-24 bg-slate-900/90 text-[10px] text-center text-white rounded p-1 border border-slate-600 pointer-events-none shadow-lg">
                    Operating Point
                </div>
            </div>
        </div>
    );
};

const HPPBuilder: React.FC = () => {
    const { navigateToTurbineDetail } = useNavigation();
    const { showToast } = useToast(); // <--- Toast Hook
    
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

    // Load saved configs
    useEffect(() => {
        try {
            const configs = localStorage.getItem(SAVED_CONFIGS_KEY);
            if (configs) setSavedConfigs(JSON.parse(configs));
        } catch (error) { console.error("Error loading configs:", error); }
    }, []);

    // Save current settings automatically
    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

    // --- PHYSICS CALCULATIONS ---
    const calculations = useMemo(() => {
        const powerMW = (9.81 * settings.head * settings.flow * (settings.efficiency / 100)) / 1000;
        const hours = 8760;
        const capacityFactor = settings.flowVariation === 'stable' ? 0.85 : settings.flowVariation === 'seasonal' ? 0.6 : 0.45;
        const annualGWh = (powerMW * hours * capacityFactor) / 1000;
        
        // Specifična brzina n_sq
        const specificSpeedIndex = (1000 * Math.sqrt(settings.flow)) / Math.pow(settings.head, 0.75); 

        return {
            powerMW: powerMW.toFixed(2),
            annualGWh: annualGWh.toFixed(2),
            n_sq: specificSpeedIndex.toFixed(0)
        };
    }, [settings]);

    // --- RECOMMENDATION ENGINE ---
    const recommendations = useMemo((): TurbineRecommendation[] => {
        const { head, flow, flowVariation, waterQuality } = settings;
        const n_sq = parseFloat(calculations.n_sq);
        const recs: TurbineRecommendation[] = [];

        // Pelton
        let peltonScore = 0;
        let peltonReasons = [];
        if (n_sq < 30) { peltonScore += 30; peltonReasons.push(`+ Ideal Specific Speed (Index: ${n_sq})`); }
        else if (n_sq < 70) { peltonScore += 15; peltonReasons.push(`+ Multi-jet application range`); }
        else { peltonScore -= 20; } 
        if (head > 200) { peltonScore += 15; peltonReasons.push('+ Optimal Head range (>200m)'); }
        else if (head < 50) { peltonScore -= 100; peltonReasons.push('- Head too low for Impulse physics'); }
        if (waterQuality === 'abrasive') { peltonScore += 10; peltonReasons.push('+ Resistant to erosion (no seal gaps)'); }
        recs.push({ key: 'pelton', score: peltonScore, reasons: peltonReasons, isBest: false });

        // Francis
        let francisScore = 0;
        let francisReasons = [];
        if (n_sq >= 70 && n_sq <= 350) { francisScore += 30; francisReasons.push(`+ Ideal Reaction Zone (Index: ${n_sq})`); }
        if (head >= 40 && head <= 400) { francisScore += 10; francisReasons.push('+ Standard Francis domain'); }
        if (flowVariation === 'variable') { francisScore -= 10; francisReasons.push('- Efficiency drops at part load'); }
        if (waterQuality === 'abrasive') { francisScore -= 15; francisReasons.push('- High erosion risk on guide vanes'); }
        recs.push({ key: 'francis', score: francisScore, reasons: francisReasons, isBest: false });

        // Kaplan
        let kaplanScore = 0;
        let kaplanReasons = [];
        if (n_sq > 350) { kaplanScore += 30; kaplanReasons.push(`+ High Specific Speed domain`); }
        if (head < 40) { kaplanScore += 15; kaplanReasons.push('+ Low head specialist'); }
        if (head > 70) { kaplanScore -= 50; kaplanReasons.push('- Head too high (Cavitation risk)'); }
        if (flowVariation === 'variable') { kaplanScore += 20; kaplanReasons.push('+ Double-regulated (Excellent part-load)'); }
        recs.push({ key: 'kaplan', score: kaplanScore, reasons: kaplanReasons, isBest: false });

        // Crossflow
        let crossScore = 0;
        let crossReasons = [];
        if (head < 100 && flow < 5) { crossScore += 20; crossReasons.push('+ Economic Efficiency for small scale'); }
        if (waterQuality === 'abrasive') { crossScore += 20; crossReasons.push('+ Self-cleaning capability'); }
        recs.push({ key: 'crossflow', score: crossScore, reasons: crossReasons, isBest: false });

        const maxScore = Math.max(...recs.map(r => r.score));
        return recs.map(r => ({ ...r, isBest: r.score === maxScore && r.score > 0 })).sort((a, b) => b.score - a.score);

    }, [settings, calculations.n_sq]);

    const updateSettings = (key: keyof HPPSettings, value: any) => {
        setSettings(prev => ({...prev, [key]: value}));
    };

    // --- ACTIONS ---
    const handleSaveConfiguration = () => {
        if (!configName) {
            showToast('Please enter a name for the configuration.', 'warning');
            return;
        }
        const newConfig: SavedConfiguration = { ...settings, name: configName, id: new Date().toISOString() };
        const updatedConfigs = [...savedConfigs, newConfig];
        setSavedConfigs(updatedConfigs);
        localStorage.setItem(SAVED_CONFIGS_KEY, JSON.stringify(updatedConfigs));
        setSaveModalOpen(false);
        setConfigName('');
        showToast('Configuration saved successfully.', 'success');
    };
    
    const loadConfiguration = (config: HPPSettings) => {
        setSettings(config);
        showToast('Configuration loaded.', 'info');
    };

    const deleteConfiguration = (id: string) => {
        if(window.confirm('Delete this configuration?')) {
            const updatedConfigs = savedConfigs.filter(c => c.id !== id);
            setSavedConfigs(updatedConfigs);
            localStorage.setItem(SAVED_CONFIGS_KEY, JSON.stringify(updatedConfigs));
            showToast('Configuration deleted.', 'info');
        }
    };

    // --- GENERATE PDF ---
    const handleGeneratePDF = () => {
        try {
            generateCalculationReport(settings, calculations, recommendations);
            showToast('Design Report PDF Generated.', 'success');
        } catch (error) {
            console.error(error);
            showToast('Failed to generate PDF.', 'error');
        }
    };

    return (
        <div className="animate-fade-in space-y-8 pb-12 max-w-7xl mx-auto">
            <div className="no-print"><BackButton text="Back to HUB" /></div>
            
            <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-white">HPP Power Calculator & Optimizer</h2>
                <p className="text-slate-400">Physics-based selection utilizing specific speed ($n_s$) topology estimation.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT: INPUTS */}
                <div className="glass-panel p-6 rounded-2xl bg-slate-800/50 border border-slate-700 space-y-6 h-fit">
                    <div className="flex items-center gap-3 mb-2 border-b border-slate-700 pb-4">
                        <span className="text-2xl">🎛️</span>
                        <h3 className="text-xl font-bold text-white">Input Parameters</h3>
                    </div>
                    
                    {/* SLIDERS */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-300 font-bold">Net Head (H)</span>
                                <span className="text-cyan-400 font-mono font-bold bg-cyan-900/30 px-2 rounded">{settings.head} m</span>
                            </div>
                            {/* Max 1000m for Pelton */}
                            <input type="range" min="2" max="1000" step="1" value={settings.head} onChange={(e) => updateSettings('head', parseInt(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-300 font-bold">Flow Rate (Q)</span>
                                <span className="text-cyan-400 font-mono font-bold bg-cyan-900/30 px-2 rounded">{settings.flow} m³/s</span>
                            </div>
                            {/* Max 200 for Kaplan */}
                            <input type="range" min="0.1" max="200" step="0.1" value={settings.flow} onChange={(e) => updateSettings('flow', parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                        </div>
                        
                         <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-300 font-bold">Efficiency (%)</span>
                                <span className="text-cyan-400 font-mono font-bold bg-cyan-900/30 px-2 rounded">{settings.efficiency}%</span>
                            </div>
                            <input type="range" min="70" max="98" step="1" value={settings.efficiency} onChange={(e) => updateSettings('efficiency', parseInt(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                        </div>
                    </div>

                    {/* SELECTS */}
                    <div className="grid grid-cols-1 gap-4 pt-4 border-t border-slate-700">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Hydrology Type</label>
                            <select value={settings.flowVariation} onChange={(e) => updateSettings('flowVariation', e.target.value)} className="w-full bg-slate-900/80 border border-slate-600 rounded-lg p-3 text-sm text-white outline-none focus:border-cyan-500">
                                <option value="stable">Stable Base Load</option>
                                <option value="seasonal">Seasonal Peak/Off-Peak</option>
                                <option value="variable">Highly Variable (Flashy)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Water Condition</label>
                            <select value={settings.waterQuality} onChange={(e) => updateSettings('waterQuality', e.target.value)} className="w-full bg-slate-900/80 border border-slate-600 rounded-lg p-3 text-sm text-white outline-none focus:border-cyan-500">
                                <option value="clean">Clear Water</option>
                                <option value="suspended">Silt Load (Glacial)</option>
                                <option value="abrasive">Hard Sediment (Quartz)</option>
                            </select>
                        </div>
                    </div>

                    {/* CONFIG MANAGER */}
                    <div className="border-t border-slate-700 pt-4">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-bold text-white">Saved Configurations</h4>
                            <button onClick={() => setSaveModalOpen(true)} className="text-xs bg-cyan-600 px-2 py-1 rounded text-white hover:bg-cyan-500">Save Current</button>
                        </div>
                        <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                           {savedConfigs.length === 0 && <p className="text-xs text-slate-500 italic">No saved configs.</p>}
                           {savedConfigs.map(c => (
                            <div key={c.id} className="flex items-center justify-between bg-slate-700/50 p-2 rounded text-xs">
                              <span className="text-slate-300 truncate w-24">{c.name}</span>
                              <div className="flex gap-1">
                                <button onClick={() => loadConfiguration(c)} className="text-cyan-400 hover:text-cyan-300">Load</button>
                                <button onClick={() => deleteConfiguration(c.id)} className="text-red-400 hover:text-red-300">×</button>
                              </div>
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
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Topology Index ($n_s$)</p>
                                <div className="text-2xl font-mono text-yellow-400 font-bold">{calculations.n_sq}</div>
                                <p className="text-[9px] text-slate-500">Physics Determinant</p>
                            </div>
                            <div className="text-center p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Est. Generation</p>
                                <div className="text-2xl font-mono text-green-400 font-bold">{calculations.annualGWh}</div>
                                <p className="text-[9px] text-slate-500">GWh / year</p>
                            </div>
                        </div>

                        <div className="mt-8 text-center border-t border-slate-700/50 pt-6">
                            <p className="text-slate-400 text-xs uppercase tracking-[0.2em] mb-2">Calculated Power Output</p>
                            <h3 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-lg">
                                {calculations.powerMW} <span className="text-xl text-slate-500">MW</span>
                            </h3>
                        </div>

                         {/* PDF BUTTON - THE "100K UPGRADE" */}
                        <div className="mt-6 text-center">
                             <button 
                                onClick={handleGeneratePDF}
                                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-full transition-all flex items-center gap-2 mx-auto border border-slate-500 shadow-lg hover:shadow-cyan-500/20 transform hover:-translate-y-1"
                             >
                                <span className="text-lg">📄</span> Download Design Report
                             </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT: RECOMMENDATIONS */}
                <div className="glass-panel p-6 rounded-2xl bg-slate-800/50 border border-slate-700 space-y-4 h-fit max-h-[700px] overflow-y-auto custom-scrollbar">
                    <div className="flex items-center gap-3 mb-4 border-b border-slate-700 pb-4">
                        <span className="text-2xl">🧠</span>
                        <div>
                            <h3 className="text-lg font-bold text-white">Engineering Selection</h3>
                            <p className="text-xs text-slate-400">Ranked by Physics & LCC</p>
                        </div>
                    </div>
                    
                    {recommendations.map((rec) => {
                        const turbineName = TURBINE_CATEGORIES[rec.key]?.name || rec.key.toUpperCase();
                        return (
                            <div 
                                key={rec.key} 
                                onClick={() => rec.score > 0 && navigateToTurbineDetail(rec.key)}
                                className={`
                                    group p-4 rounded-xl border transition-all duration-300 relative overflow-hidden
                                    ${rec.isBest 
                                        ? 'bg-gradient-to-r from-green-900/20 to-slate-900 border-green-500 shadow-lg transform scale-100 cursor-pointer' 
                                        : rec.score > 0 
                                            ? 'bg-slate-800/40 border-slate-700 hover:border-slate-500 hover:bg-slate-800 cursor-pointer' 
                                            : 'bg-slate-900/30 border-slate-800 opacity-50 cursor-not-allowed'}
                                `}
                            >
                                {rec.isBest && <div className="absolute top-0 right-0 bg-green-500 text-slate-900 text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-md">OPTIMAL MATCH</div>}

                                <div className="flex justify-between items-center mb-3">
                                    <h4 className={`font-bold text-lg ${rec.isBest ? 'text-green-400' : 'text-slate-200'}`}>{turbineName}</h4>
                                </div>
                                <ul className="space-y-1.5 mb-4">
                                    {rec.reasons.map((reason, i) => (
                                        <li key={i} className="text-xs text-slate-300 flex items-start">
                                            <span className={`mr-2 mt-0.5 ${reason.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                                {reason.startsWith('+') ? '✓' : '✗'}
                                            </span>
                                            {reason.substring(2)}
                                        </li>
                                    ))}
                                </ul>
                                {rec.score > 0 && (
                                    <div className="pt-3 border-t border-slate-700/50 flex justify-end">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 group-hover:text-cyan-300 transition-colors">View Technical Specs →</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

            </div>

             {/* SAVE MODAL */}
             {isSaveModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-4 text-white">Save Configuration</h3>
                        <input type="text" value={configName} onChange={e => setConfigName(e.target.value)} placeholder="Enter configuration name..." className="w-full bg-slate-900 border border-slate-600 p-2 rounded mb-4 text-white" autoFocus />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setSaveModalOpen(false)} className="px-4 py-2 bg-slate-700 text-slate-300 rounded hover:bg-slate-600">Cancel</button>
                            <button onClick={handleSaveConfiguration} className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-500">Save</button>
                        </div>
                    </div>
                </div>
             )}
        </div>
    );
};

export default HPPBuilder;