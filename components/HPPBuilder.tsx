import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { BackButton } from './BackButton';
import { TURBINE_CATEGORIES } from '../constants';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import { useNavigation } from '../contexts/NavigationContext';
import { useQuestionnaire } from '../contexts/QuestionnaireContext';
import type { TurbineRecommendation, HPPSettings, WaterQuality, FlowVariation, SavedConfiguration } from '../types';

const LOCAL_STORAGE_KEY = 'hpp-builder-settings';
const SAVED_CONFIGS_KEY = 'hpp-builder-saved-configs';

const TurbineIcon: React.FC<{ type: string }> = ({ type }) => {
    const icons: Record<string, React.ReactNode> = {
        kaplan: <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zM12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5V7zm5 5c0 1.94-1.12 3.6-2.75 4.45L12 12l2.25-4.45C15.88 8.4 17 10.06 17 12z"/></svg>,
        francis: <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v5.45l3.84 2.22-1 1.73-4.84-2.8V7z"/></svg>,
        pelton: <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm-3.5-9.5L6 12l2.5 1.5V15L6 13.5 3.5 15V9l2.5 1.5L6 9v1.5zm5 0L13 12l2.5 1.5V15l-2.5-1.5L10.5 15V9l2.5 1.5L13 9v1.5zm5 0L18 12l2.5 1.5V15l-2.5-1.5L15.5 15V9l2.5 1.5L18 9v1.5z"/></svg>,
        crossflow: <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M22 12c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2s10 4.48 10 10zm-2 0c0-4.42-3.58-8-8-8s-8 3.58-8 8 3.58 8 8 8 8-3.58 8-8zM8 11h8v2H8v-2z"/></svg>,
        flow_through: <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M4 18h16v-2H4v2zm0-5h16v-2H4v2zm0-5h16V6H4v2z"/></svg>,
    };
    return icons[type] || null;
};

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
        <div className="animate-fade-in space-y-8">
            <div className="no-print"><BackButton text="Back" /></div>
            
            {isQuestionnaireDataFresh && (
                 <div className="p-4 bg-cyan-900/50 border border-cyan-500 rounded-lg flex items-center justify-between gap-4">
                    <p className="text-cyan-200">New operational data from the Risk Assessment is available.</p>
                    <button onClick={loadDataFromQuestionnaire} className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-500 transition-colors flex-shrink-0">Load Data</button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left Column: Controls */}
                <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-6">
                    <h3 className="text-xl font-bold text-white text-center">Configuration Parameters</h3>
                    <div>
                        <label className="flex justify-between text-sm font-medium text-slate-300 mb-1"><span>Water Head (m)</span> <span className="font-bold text-cyan-400">{head} m</span></label>
                        <input type="range" min="1" max="1500" step="1" value={head} onChange={e => updateSettings('head', Number(e.target.value))} className="w-full" />
                    </div>
                    <div>
                        <label className="flex justify-between text-sm font-medium text-slate-300 mb-1"><span>Flow Rate (m³/s)</span> <span className="font-bold text-cyan-400">{flow} m³/s</span></label>
                        <input type="range" min="1" max="300" step="1" value={flow} onChange={e => updateSettings('flow', Number(e.target.value))} className="w-full" />
                    </div>
                    <div>
                        <label className="flex justify-between text-sm font-medium text-slate-300 mb-1"><span>Turbine Efficiency (%)</span> <span className="font-bold text-cyan-400">{efficiency}%</span></label>
                        <input type="range" min="70" max="98" step="1" value={efficiency} onChange={e => updateSettings('efficiency', Number(e.target.value))} className="w-full" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Water Quality</label>
                        <select value={waterQuality} onChange={e => updateSettings('waterQuality', e.target.value as WaterQuality)} className="w-full bg-slate-700/50 border border-slate-600 rounded-md p-2">
                            <option value="clean">Clean Water</option>
                            <option value="suspended">Suspended Silt/Clay</option>
                            <option value="abrasive">Abrasive Sand/Quartz</option>
                            <option value="both">Both Suspended & Abrasive</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Flow Variation</label>
                        <select value={flowVariation} onChange={e => updateSettings('flowVariation', e.target.value as FlowVariation)} className="w-full bg-slate-700/50 border border-slate-600 rounded-md p-2">
                            <option value="stable">Stable Flow</option>
                            <option value="seasonal">Seasonally Variable</option>
                            <option value="variable">Highly Variable Flow</option>
                        </select>
                    </div>
                     <div className="border-t border-slate-700 pt-4">
                        <h3 className="text-xl font-bold text-white text-center mb-4">Configuration Management</h3>
                        <div className="space-y-2">
                          {savedConfigs.map(c => (
                            <div key={c.id} className="flex items-center justify-between bg-slate-700/50 p-2 rounded">
                              <span className="font-semibold truncate pr-2">{c.name}</span>
                              <div className="flex-shrink-0 flex gap-1">
                                <button onClick={() => loadConfiguration(c)} className="p-1.5 bg-cyan-600 rounded hover:bg-cyan-500 text-xs">Load</button>
                                <button onClick={() => deleteConfiguration(c.id)} className="p-1.5 bg-red-600 rounded hover:bg-red-500 text-xs">Del</button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button onClick={() => setSaveModalOpen(true)} className="w-full mt-4 px-4 py-2 bg-slate-600 font-semibold rounded hover:bg-slate-500">Save Current Configuration</button>
                     </div>
                </div>

                {/* Right Column: Results & Charts */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center">
                        <h3 className="text-xl font-bold text-white mb-2">Estimated Power Output</h3>
                        <p className="text-5xl font-bold text-cyan-400">{realPower.toFixed(2)}</p>
                        <p className="text-slate-500">MW (Real Power)</p>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 h-64">
                             <ResponsiveContainer><LineChart data={headChartData} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }}><Label value="Water Head (m)" offset={-15} position="insideBottom" fill="#94a3b8" /></XAxis><YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} ><Label value="Power (MW)" angle={-90} position="insideLeft" fill="#94a3b8" style={{ textAnchor: 'middle' }} /></YAxis><Tooltip contentStyle={{ backgroundColor: '#1e293b' }} formatter={(v: number) => [`${v} MW`, "Power"]} /><Line type="monotone" dataKey="value" stroke="#22d3ee" dot={false} /><ReferenceLine x={head} stroke="#f43f5e"><Label value="Current" position="top" fill="#f43f5e" fontSize={10} /></ReferenceLine></LineChart></ResponsiveContainer>
                        </div>
                         <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 h-64">
                             <ResponsiveContainer><LineChart data={efficiencyChartData} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }}><Label value="Turbine Efficiency (%)" offset={-15} position="insideBottom" fill="#94a3b8" /></XAxis><YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} domain={['dataMin', 'dataMax']}><Label value="Power (MW)" angle={-90} position="insideLeft" fill="#94a3b8" style={{ textAnchor: 'middle' }} /></YAxis><Tooltip contentStyle={{ backgroundColor: '#1e293b' }} formatter={(v: number) => [`${v} MW`, "Power"]} /><Line type="monotone" dataKey="value" stroke="#a78bfa" dot={false} /><ReferenceLine x={efficiency} stroke="#f43f5e"><Label value="Current" position="top" fill="#f43f5e" fontSize={10} /></ReferenceLine></LineChart></ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <div className="p-4 bg-slate-900/50 border-l-4 border-cyan-400 rounded-r-lg mb-6">
                    <h4 className="text-lg font-bold text-cyan-300">Hydro-Prijatelj's Recommendation Mandate</h4>
                    <p className="text-slate-300 mt-1 text-sm">All turbine suggestions are filtered through the non-negotiable postulates of long-term Life Cycle Cost (LCC) Optimization and resilience to the Execution Gap.</p>
                </div>

                <h3 className="text-2xl font-bold text-center mb-6 text-slate-200">Recommended Turbine Types</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {TURBINE_CATEGORIES && Object.keys(TURBINE_CATEGORIES).map(key => {
                        const rec = recommendedTurbines.find(r => r.key === key);
                        const category = TURBINE_CATEGORIES[key];
                        if (!category) return null;

                        const isRecommended = !!rec;
                        const isBest = rec?.isBest ?? false;
                        
                        return (
                            <div key={key} onClick={() => isRecommended && navigateToTurbineDetail(key)} className={`relative group flex flex-col p-6 bg-slate-800/60 rounded-2xl border-2 transition-all duration-300 ${ isRecommended ? 'cursor-pointer transform hover:-translate-y-2 hover:shadow-2xl' : 'opacity-40'} ${isBest ? 'border-cyan-400 shadow-lg shadow-cyan-500/20' : isRecommended ? 'border-cyan-500/50' : 'border-slate-700'}`}>
                                {isBest && <div className="absolute top-0 right-0 -mt-3 -mr-3 px-3 py-1 text-xs font-bold text-white rounded-full bg-cyan-500 animate-pulse">Best Match</div>}
                                {rec && !isBest && <div className="absolute top-0 right-0 -mt-2 -mr-2 px-2 py-0.5 text-xs font-bold text-white rounded-full bg-cyan-700">Recommended</div>}
                                
                                <div className="flex items-center gap-4 mb-3">
                                  <div className={`flex-shrink-0 ${isBest ? 'text-cyan-300' : 'text-slate-400'}`}><TurbineIcon type={key} /></div>
                                  <div>
                                    <h4 className={`text-xl font-bold ${isBest ? 'text-cyan-300' : 'text-slate-100'}`}>{category.name}</h4>
                                    <p className="text-sm text-slate-400">{category.types.map(t => t.name).join(', ')}</p>
                                  </div>
                                </div>
                                
                                {rec && (
                                    <div className="flex-grow mt-2 pt-2 border-t border-slate-700 text-sm">
                                      <ul className="space-y-1">
                                          {rec.reasons.map((reason, i) => (
                                              <li key={i} className={`flex items-start ${reason.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                                                  <span className="mr-2 mt-1 text-xs">{reason.startsWith('+') ? '✓' : '✗'}</span>
                                                  <span className="text-slate-300">{reason.substring(2)}</span>
                                              </li>
                                          ))}
                                      </ul>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            
             {isSaveModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-4">Save Configuration</h3>
                        <input type="text" value={configName} onChange={e => setConfigName(e.target.value)} placeholder="Enter configuration name..." className="w-full bg-slate-700 p-2 rounded mb-4" />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setSaveModalOpen(false)} className="px-4 py-2 bg-slate-600 rounded">Cancel</button>
                            <button onClick={handleSaveConfiguration} className="px-4 py-2 bg-cyan-600 rounded">Save</button>
                        </div>
                    </div>
                </div>
             )}
        </div>
    );
};

export default HPPBuilder;