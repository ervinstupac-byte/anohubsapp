import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { TURBINE_CATEGORIES } from '../constants';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label, AreaChart, Area } from 'recharts';
import { useNavigation } from '../contexts/NavigationContext';
import { useQuestionnaire } from '../contexts/QuestionnaireContext';
import type { TurbineRecommendation, HPPSettings, WaterQuality, FlowVariation, SavedConfiguration } from '../types';

const LOCAL_STORAGE_KEY = 'hpp-builder-settings';
const SAVED_CONFIGS_KEY = 'hpp-builder-saved-configs';

// --- ICONS ---
const TurbineIcon: React.FC<{ type: string, className?: string }> = ({ type, className }) => {
    const icons: Record<string, React.ReactNode> = {
        kaplan: <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zM12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5V7zm5 5c0 1.94-1.12 3.6-2.75 4.45L12 12l2.25-4.45C15.88 8.4 17 10.06 17 12z"/></svg>,
        francis: <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v5.45l3.84 2.22-1 1.73-4.84-2.8V7z"/></svg>,
        pelton: <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm-3.5-9.5L6 12l2.5 1.5V15L6 13.5 3.5 15V9l2.5 1.5L6 9v1.5zm5 0L13 12l2.5 1.5V15l-2.5-1.5L10.5 15V9l2.5 1.5L13 9v1.5zm5 0L18 12l2.5 1.5V15l-2.5-1.5L15.5 15V9l2.5 1.5L18 9v1.5z"/></svg>,
        crossflow: <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M22 12c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2s10 4.48 10 10zm-2 0c0-4.42-3.58-8-8-8s-8 3.58-8 8 3.58 8 8 8 8-3.58 8-8zM8 11h8v2H8v-2z"/></svg>,
        flow_through: <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M4 18h16v-2H4v2zm0-5h16v-2H4v2zm0-5h16V6H4v2z"/></svg>,
    };
    return <>{icons[type]}</> || null;
};

// --- CUSTOM RANGE SLIDER ---
const RangeControl: React.FC<{ label: string, value: number, min: number, max: number, step: number, unit: string, onChange: (val: number) => void }> = ({ label, value, min, max, step, unit, onChange }) => (
    <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/50">
        <div className="flex justify-between items-end mb-2">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</span>
            <span className="text-cyan-400 font-mono font-bold text-lg">{value} <span className="text-xs text-slate-500">{unit}</span></span>
        </div>
        <input 
            type="range" min={min} max={max} step={step} value={value} 
            onChange={e => onChange(Number(e.target.value))} 
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400" 
        />
        <div className="flex justify-between text-[10px] text-slate-600 mt-1 font-mono">
            <span>{min}</span>
            <span>{max}</span>
        </div>
    </div>
);

const HPPBuilder: React.FC = () => {
    const { navigateToTurbineDetail } = useNavigation();
    const { operationalData, isQuestionnaireDataFresh, setIsQuestionnaireDataFresh } = useQuestionnaire();

    const getInitialState = (): HPPSettings => {
        try {
            const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedSettings) return JSON.parse(savedSettings);
        } catch (error) { console.error("Error loading settings:", error); }
        return { head: 100, flow: 10, efficiency: 90, powerFactor: 0.95, waterQuality: 'clean', flowVariation: 'stable' };
    };

    const [settings, setSettings] = useState<HPPSettings>(getInitialState);
    const [savedConfigs, setSavedConfigs] = useState<SavedConfiguration[]>([]);
    const [isSaveModalOpen, setSaveModalOpen] = useState(false);
    const [configName, setConfigName] = useState('');

    useEffect(() => {
        try {
            const configs = localStorage.getItem(SAVED_CONFIGS_KEY);
            if (configs) setSavedConfigs(JSON.parse(configs));
        } catch (error) { console.error("Error loading saved configs:", error); }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
        } catch (error) { console.error("Error saving settings:", error); }
    }, [settings]);

    const updateSettings = <K extends keyof HPPSettings>(key: K, value: HPPSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveConfiguration = () => {
        if (!configName) return;
        const newConfig: SavedConfiguration = { ...settings, name: configName, id: new Date().toISOString() };
        const updatedConfigs = [...savedConfigs, newConfig];
        setSavedConfigs(updatedConfigs);
        localStorage.setItem(SAVED_CONFIGS_KEY, JSON.stringify(updatedConfigs));
        setSaveModalOpen(false);
        setConfigName('');
    };
    
    const loadConfiguration = (config: HPPSettings) => {
        setSettings(config);
    };

    const deleteConfiguration = (id: string) => {
        if(window.confirm('Are you sure you want to delete this configuration?')) {
            const updatedConfigs = savedConfigs.filter(c => c.id !== id);
            setSavedConfigs(updatedConfigs);
            localStorage.setItem(SAVED_CONFIGS_KEY, JSON.stringify(updatedConfigs));
        }
    };
    
    const loadDataFromQuestionnaire = () => {
        const headNum = parseFloat(operationalData.head);
        const flowNum = parseFloat(operationalData.flow);
        if(!isNaN(headNum) && !isNaN(flowNum)) {
            setSettings(prev => ({...prev, head: headNum, flow: flowNum }));
        }
        setIsQuestionnaireDataFresh(false);
    };

    const calculateRecommendations = useCallback((
        currentHead: number,
        currentWaterQuality: WaterQuality,
        currentFlowVariation: FlowVariation
    ): TurbineRecommendation[] => {
        const results: { [key: string]: { score: number; reasons: string[] } } = {
            kaplan: { score: 0, reasons: [] }, francis: { score: 0, reasons: [] }, pelton: { score: 0, reasons: [] },
            crossflow: { score: 0, reasons: [] }, flow_through: { score: 0, reasons: [] },
        };

        // Head Ranges
        if (currentHead >= 10 && currentHead <= 70) { results.kaplan.score += 5; results.kaplan.reasons.push('+ Strong contender in its ideal low-head range.'); }
        if (currentHead >= 2 && currentHead <= 40) { results.flow_through.score += 5; results.flow_through.reasons.push('+ Optimal for very low-head, run-of-river scenarios.'); }
        if (currentHead >= 40 && currentHead <= 600) { results.francis.score += 5; results.francis.reasons.push('+ Operates efficiently in the broad medium-head range.'); }
        if (currentHead >= 250 && currentHead <= 1500) { results.pelton.score += 5; results.pelton.reasons.push('+ Excels in the high-head range where others cannot operate.'); }
        if (currentHead >= 2 && currentHead <= 200) { results.crossflow.score += 4; results.crossflow.reasons.push('+ Suitable for its wide, low-to-medium head range.'); }

        // Flow Variation
        if (currentFlowVariation === 'variable' || currentFlowVariation === 'seasonal') {
            results.kaplan.score += 3; results.kaplan.reasons.push('+ Excellent efficiency with variable flows due to adjustable blades.');
            results.pelton.score += 3; results.pelton.reasons.push('+ Maintains high efficiency at partial loads.');
            results.crossflow.score += 3; results.crossflow.reasons.push('+ Very good performance across a wide range of flows.');
            results.francis.score -= 4; results.francis.reasons.push('- Efficiency drops significantly at partial loads.');
        } else {
            results.francis.score += 2; results.francis.reasons.push('+ Prefers stable flow conditions for peak performance.');
        }

        // Water Quality
        if (currentWaterQuality === 'abrasive' || currentWaterQuality === 'both') {
            results.pelton.score += 5; results.pelton.reasons.push('+ Highly resistant to abrasive sediment wear.');
            results.crossflow.score += 4; results.crossflow.reasons.push('+ Robust design is very resistant to sediments.');
            results.francis.score -= 6; results.francis.reasons.push('- Highly sensitive to abrasive wear on runner and guide vanes.');
            results.kaplan.score -= 6; results.kaplan.reasons.push('- Blade mechanisms are vulnerable to abrasive particles.');
        }
        if (currentWaterQuality === 'suspended') {
            results.francis.score -= 2; results.francis.reasons.push('- Fine sediment can cause wear over time.');
            results.kaplan.score -= 2; results.kaplan.reasons.push('- Suspended solids can affect blade seals.');
        }
        
        const sorted = Object.entries(results).map(([key, value]) => ({ key, ...value })).filter(item => item.score > 3).sort((a, b) => b.score - a.score);
        return sorted.map((item, index) => ({ ...item, isBest: index === 0 }));
    }, []);

    const { head, flow, efficiency, powerFactor, waterQuality, flowVariation } = settings;
    const recommendedTurbines = useMemo(() => calculateRecommendations(head, waterQuality, flowVariation), [head, waterQuality, flowVariation, calculateRecommendations]);
    const { realPower } = useMemo(() => {
        return { realPower: (9.81 * flow * head * (efficiency / 100)) / 1000 };
    }, [head, flow, efficiency]);

    const generateChartData = useCallback((param: 'head' | 'efficiency', currentVal: number, range: number) => {
        const data = [];
        const step = Math.ceil(range / 20) || 1;
        const start = Math.max(0, currentVal - range/2);
        const end = currentVal + range/2;
        for (let i = start; i <= end; i += step) {
            const p = 9.81 * flow * (param === 'head' ? i : head) * ((param === 'efficiency' ? i : efficiency) / 100) / 1000;
            data.push({ name: i, value: p.toFixed(2) });
        }
        return data;
    }, [head, flow, efficiency]);

    const headChartData = useMemo(() => generateChartData('head', head, 200), [head, generateChartData]);
    const efficiencyChartData = useMemo(() => generateChartData('efficiency', efficiency, 20), [efficiency, generateChartData]);

    return (
        <div className="animate-fade-in space-y-8 pb-8 max-w-7xl mx-auto">
            
            {/* HEADER */}
            <div className="text-center space-y-4 animate-fade-in-up">
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    HPP Power Calculator & <span className="text-cyan-400">Optimizer</span>
                </h2>
                <p className="text-slate-400 text-lg max-w-3xl mx-auto leading-relaxed">
                    Configure your plant parameters to model power output and receive AI-driven turbine recommendations.
                </p>
            </div>
            
            {isQuestionnaireDataFresh && (
                 <div className="glass-panel p-4 border-cyan-500 rounded-lg flex items-center justify-between gap-4 animate-pulse">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">📥</span>
                        <p className="text-cyan-200 font-medium">New operational data imported from Risk Assessment.</p>
                    </div>
                    <button onClick={loadDataFromQuestionnaire} className="px-6 py-2 bg-cyan-600 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-500 transition-colors">Load Data</button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                
                {/* LEFT COLUMN: CONTROL PANEL */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-panel rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                            <span className="w-2 h-6 bg-cyan-500 rounded-full mr-3"></span>
                            Operational Parameters
                        </h3>
                        
                        <div className="space-y-6">
                            <RangeControl label="Water Head" value={head} min={1} max={1500} step={1} unit="m" onChange={v => updateSettings('head', v)} />
                            <RangeControl label="Flow Rate" value={flow} min={1} max={300} step={1} unit="m³/s" onChange={v => updateSettings('flow', v)} />
                            <RangeControl label="Expected Efficiency" value={efficiency} min={70} max={98} step={1} unit="%" onChange={v => updateSettings('efficiency', v)} />
                        </div>
                    </div>

                    <div className="glass-panel rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                            <span className="w-2 h-6 bg-purple-500 rounded-full mr-3"></span>
                            Environmental Factors
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Water Quality</label>
                                <select value={waterQuality} onChange={e => updateSettings('waterQuality', e.target.value as WaterQuality)} className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none">
                                    <option value="clean">Clean Water</option>
                                    <option value="suspended">Suspended Silt/Clay</option>
                                    <option value="abrasive">Abrasive Sand/Quartz</option>
                                    <option value="both">Both Suspended & Abrasive</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Flow Variation</label>
                                <select value={flowVariation} onChange={e => updateSettings('flowVariation', e.target.value as FlowVariation)} className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none">
                                    <option value="stable">Stable Flow</option>
                                    <option value="seasonal">Seasonally Variable</option>
                                    <option value="variable">Highly Variable Flow</option>
                                </select>
                            </div>
                        </div>
                    </div>

                     {/* Saved Configs Mini-Console */}
                     <div className="glass-panel rounded-2xl p-6 bg-slate-800/80">
                         <div className="flex justify-between items-center mb-4">
                             <h3 className="text-sm font-bold text-slate-400 uppercase">Saved Configurations</h3>
                             <button onClick={() => setSaveModalOpen(true)} className="text-xs bg-cyan-900 text-cyan-400 px-3 py-1 rounded hover:bg-cyan-800 transition">Save Current</button>
                         </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                          {savedConfigs.length === 0 && <p className="text-xs text-slate-600 text-center py-4">No saved configurations.</p>}
                          {savedConfigs.map(c => (
                            <div key={c.id} className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 hover:border-slate-500 transition">
                              <span className="font-semibold text-slate-300 text-sm truncate pr-2">{c.name}</span>
                              <div className="flex gap-2">
                                <button onClick={() => loadConfiguration(c)} className="text-cyan-400 hover:text-white text-xs font-bold">LOAD</button>
                                <button onClick={() => deleteConfiguration(c.id)} className="text-red-400 hover:text-white text-xs font-bold">X</button>
                              </div>
                            </div>
                          ))}
                        </div>
                     </div>
                </div>

                {/* RIGHT COLUMN: VISUALIZATION */}
                <div className="lg:col-span-3 space-y-6">
                    {/* POWER OUTPUT DISPLAY */}
                    <div className="relative glass-panel rounded-2xl p-8 text-center overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 text-cyan-500">
                             <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                        </div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Estimated Power Output</h3>
                        <div className="flex items-baseline justify-center">
                            <span className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                                {realPower.toFixed(2)}
                            </span>
                            <span className="ml-4 text-2xl font-bold text-slate-500">MW</span>
                        </div>
                    </div>

                    {/* CHARTS */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <div className="glass-panel rounded-2xl p-4 h-80">
                             <p className="text-xs font-bold text-slate-400 text-center mb-4">Power vs. Head Curve</p>
                             <ResponsiveContainer width="100%" height="90%">
                                <AreaChart data={headChartData} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
                                    <defs>
                                        <linearGradient id="colorHead" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }}><Label value="Head (m)" offset={-15} position="insideBottom" fill="#64748b" fontSize={10}/></XAxis>
                                    <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }} itemStyle={{ color: '#22d3ee' }} />
                                    <Area type="monotone" dataKey="value" stroke="#22d3ee" fillOpacity={1} fill="url(#colorHead)" />
                                    <ReferenceLine x={head} stroke="#f43f5e" strokeDasharray="3 3" />
                                </AreaChart>
                             </ResponsiveContainer>
                        </div>
                        <div className="glass-panel rounded-2xl p-4 h-80">
                             <p className="text-xs font-bold text-slate-400 text-center mb-4">Power vs. Efficiency Curve</p>
                             <ResponsiveContainer width="100%" height="90%">
                                <LineChart data={efficiencyChartData} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }}><Label value="Efficiency (%)" offset={-15} position="insideBottom" fill="#64748b" fontSize={10}/></XAxis>
                                    <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} domain={['dataMin', 'dataMax']} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }} />
                                    <Line type="monotone" dataKey="value" stroke="#a78bfa" strokeWidth={2} dot={false} />
                                    <ReferenceLine x={efficiency} stroke="#f43f5e" strokeDasharray="3 3" />
                                </LineChart>
                             </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* RECOMMENDATIONS SECTION */}
            <div className="mt-12 animate-fade-in-up">
                <div className="p-6 bg-slate-900/50 border-l-4 border-cyan-400 rounded-r-xl mb-8 flex items-start gap-4">
                    <div className="text-3xl">🤖</div>
                    <div>
                        <h4 className="text-lg font-bold text-cyan-300">Hydro-Prijatelj's Analysis</h4>
                        <p className="text-slate-300 mt-1 text-sm leading-relaxed">
                            These recommendations are filtered through the non-negotiable postulates of <strong className="text-white">Life Cycle Cost (LCC) Optimization</strong>. 
                            We prioritize turbines that minimize the Execution Gap in your specific operating environment.
                        </p>
                    </div>
                </div>

                <h3 className="text-2xl font-bold text-center mb-8 text-white">Recommended Configuration Matrix</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {TURBINE_CATEGORIES && Object.keys(TURBINE_CATEGORIES).map(key => {
                        const rec = recommendedTurbines.find(r => r.key === key);
                        const category = TURBINE_CATEGORIES[key];
                        if (!category) return null;

                        const isRecommended = !!rec;
                        const isBest = rec?.isBest ?? false;
                        
                        return (
                            <div 
                                key={key} 
                                onClick={() => isRecommended && navigateToTurbineDetail(key)} 
                                className={`
                                    relative flex flex-col p-6 rounded-2xl border transition-all duration-500 overflow-hidden group
                                    ${isRecommended ? 'cursor-pointer hover:-translate-y-2' : 'opacity-40 grayscale'}
                                    ${isBest 
                                        ? 'bg-slate-900/80 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.2)]' 
                                        : isRecommended 
                                            ? 'bg-slate-800/60 border-cyan-500/30 hover:border-cyan-400 hover:shadow-xl' 
                                            : 'bg-slate-900/40 border-slate-800'}
                                `}
                            >
                                {/* Glow Effect for Best Match */}
                                {isBest && <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/30 rounded-full blur-2xl animate-pulse"></div>}

                                {isBest && (
                                    <div className="absolute top-0 right-0 bg-gradient-to-l from-cyan-500 to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-lg">
                                        BEST MATCH
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-4 mb-4 relative z-10">
                                    <div className={`p-3 rounded-lg ${isBest ? 'bg-cyan-900/30 text-cyan-300' : 'bg-slate-700/30 text-slate-400'}`}>
                                        <TurbineIcon type={key} className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h4 className={`text-xl font-bold ${isBest ? 'text-white' : 'text-slate-200'}`}>{category.name}</h4>
                                        <p className="text-xs text-slate-500">{category.types.map(t => t.name).join(', ')}</p>
                                    </div>
                                </div>
                                
                                {rec && (
                                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                                        <ul className="space-y-2">
                                            {rec.reasons.map((reason, i) => (
                                                <li key={i} className={`flex items-start text-xs ${reason.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                                                    <span className="mr-2 font-bold">{reason.startsWith('+') ? '✓' : '✗'}</span>
                                                    <span className="text-slate-300">{reason.substring(2)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {isRecommended && (
                                    <div className="mt-auto pt-4 text-cyan-400 text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                                        View Technical Specs <span className="ml-2">→</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {/* SAVE MODAL (GLASS STYLE) */}
            {isSaveModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="glass-panel p-8 rounded-2xl border border-slate-600 w-full max-w-md shadow-2xl transform scale-100">
                        <h3 className="text-xl font-bold text-white mb-2">Save Configuration</h3>
                        <p className="text-slate-400 text-sm mb-6">Give this setup a name to load it later.</p>
                        <input 
                            type="text" 
                            value={configName} 
                            onChange={e => setConfigName(e.target.value)} 
                            placeholder="e.g. Project Alpha - High Head" 
                            className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none mb-6"
                            autoFocus 
                        />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setSaveModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
                            <button onClick={handleSaveConfiguration} disabled={!configName} className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HPPBuilder;