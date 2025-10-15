import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { BackButton } from './BackButton';
import { TURBINE_CATEGORIES } from '../constants';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Label } from 'recharts';

interface HPPBuilderProps {
  onBack: () => void;
  onSelectTurbineType: (turbineKey: string) => void;
}

type WaterQuality = 'clean' | 'moderate_sediment' | 'high_sediment';
type FlowVariation = 'stable' | 'seasonal' | 'variable';

interface HPPSettings {
    head: number;
    flow: number;
    efficiency: number;
    powerFactor: number;
    waterQuality: WaterQuality;
    flowVariation: FlowVariation;
}

const LOCAL_STORAGE_KEY = 'hpp-builder-settings';

const HPPBuilder: React.FC<HPPBuilderProps> = ({ onBack, onSelectTurbineType }) => {
    const getInitialState = (): HPPSettings => {
        try {
            const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedSettings) {
                return JSON.parse(savedSettings);
            }
        } catch (error) {
            console.error("Failed to load settings from localStorage", error);
        }
        return {
            head: 100,
            flow: 10,
            efficiency: 90,
            powerFactor: 0.95,
            waterQuality: 'clean',
            flowVariation: 'stable',
        };
    };

  const [settings, setSettings] = useState<HPPSettings>(getInitialState);
  const { head, flow, efficiency, powerFactor, waterQuality, flowVariation } = settings;
  const [hoveredTurbine, setHoveredTurbine] = useState<string | null>(null);

  useEffect(() => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error("Failed to save settings to localStorage", error);
    }
  }, [settings]);

  const updateSettings = <K extends keyof HPPSettings>(key: K, value: HPPSettings[K]) => {
      setSettings(prev => ({...prev, [key]: value}));
  };
  
  const loadSavedSettings = () => {
      setSettings(getInitialState());
  };

  const getRecommendedTurbines = useCallback((
    currentHead: number, 
    currentFlow: number, 
    currentWaterQuality: WaterQuality, 
    currentFlowVariation: FlowVariation
  ): string[] => {
    const scores: Record<string, number> = {
      kaplan: 0,
      francis: 0,
      pelton: 0,
      crossflow: 0,
      flow_through: 0,
    };

    // 1. Head and Flow Ranges (Primary Filter)
    if (currentHead >= 10 && currentHead <= 70) scores.kaplan += 5;
    if (currentHead >= 2 && currentHead <= 40) scores.flow_through += 5;
    if (currentHead >= 40 && currentHead <= 600) scores.francis += 5;
    if (currentHead >= 250 && currentHead <= 1500) scores.pelton += 5;
    if (currentHead >= 2 && currentHead <= 200) scores.crossflow += 4; // Wide but less efficient

    // 2. Flow Variation (Secondary Filter)
    if (currentFlowVariation === 'variable' || currentFlowVariation === 'seasonal') {
      scores.kaplan += 2; // Excellent partial load efficiency
      scores.pelton += 2; // Excellent partial load efficiency
      scores.crossflow += 3; // Very good wide range efficiency
      scores.francis -= 3; // Poor partial load efficiency
    } else {
        scores.francis += 2; // Prefers stable conditions
    }

    // 3. Water Quality (Secondary Filter)
    if (currentWaterQuality === 'high_sediment') {
      scores.pelton += 3; // Most resistant
      scores.crossflow += 2; // Very resistant
      scores.francis -= 3; // Very sensitive
      scores.kaplan -= 3; // Very sensitive
    } else if (currentWaterQuality === 'moderate_sediment') {
      scores.pelton += 2;
      scores.crossflow += 1;
      scores.francis -= 2;
      scores.kaplan -= 2;
    }

    return Object.entries(scores)
      .filter(([, score]) => score > 3)
      .sort((a, b) => b[1] - a[1])
      .map(([key]) => key);

  }, []);
  
  const recommendedTurbines = useMemo(() => getRecommendedTurbines(head, flow, waterQuality, flowVariation), [head, flow, waterQuality, flowVariation, getRecommendedTurbines]);

  const { realPower, apparentPower } = useMemo(() => {
    const powerKW = (9.81 * flow * head * (efficiency / 100));
    const realPowerMW = powerKW / 1000;
    const apparentPowerMVA = realPowerMW / powerFactor;
    return { realPower: realPowerMW, apparentPower: apparentPowerMVA };
  }, [head, flow, efficiency, powerFactor]);

  const generateChartData = (param: 'head' | 'flow', currentVal: number) => {
    const data = [];
    const step = Math.ceil(currentVal / 10) || 1;
    for (let i = 0; i <= currentVal * 2; i += step) {
      const p = 9.81 * (param === 'flow' ? i : flow) * (param === 'head' ? i : head) * (efficiency / 100) / 1000;
      data.push({ name: i, value: p });
    }
    return data;
  };

  const headChartData = useMemo(() => generateChartData('head', head), [head, flow, efficiency]);
  const flowChartData = useMemo(() => generateChartData('flow', flow), [head, flow, efficiency]);

  const powerChartData = [{ name: 'Snaga', MW: realPower, MVA: apparentPower }];
  
  const turbineDescriptions: Record<string, string> = {
      kaplan: "Idealna za niske padove i velike, promjenjive protoke. Visoka efikasnost u širokom rasponu rada zahvaljujući podesivim lopaticama rotora i privodnog kola.",
      francis: "Najčešći tip, za srednje padove i protoke. Vrlo visoka vršna efikasnost, ali osjetljiva na rad izvan optimalne točke.",
      pelton: "Za vrlo visoke padove i male protoke. Impulsna turbina koja nudi visoku efikasnost pri djelomičnom opterećenju i otpornost na abraziju.",
      crossflow: "Robusna i jednostavna turbina za male hidroelektrane s niskim do srednjim padovima i vrlo promjenjivim protocima. Otporna na sedimente.",
      flow_through: "Optimizirana za riječne tokove s vrlo malim padom (run-of-river). Često potopljena (Bulb ili Pit izvedba) za maksimalnu hidrauličku efikasnost.",
  };

  return (
    <div className="animate-fade-in space-y-8">
      <BackButton onClick={onBack} text="Natrag" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Controls */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-6">
          <h3 className="text-xl font-bold text-white text-center">Ulazni Parametri</h3>
          
          {/* Sliders */}
          <div>
            <label htmlFor="head" className="flex justify-between text-sm font-medium text-slate-300 mb-1"><span>Pad Vode (m)</span> <span className="font-bold text-cyan-400">{head} m</span></label>
            <input type="range" id="head" min="1" max="1500" step="1" value={head} onChange={e => updateSettings('head', Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
          </div>
          <div>
            <label htmlFor="flow" className="flex justify-between text-sm font-medium text-slate-300 mb-1"><span>Protok (m³/s)</span> <span className="font-bold text-cyan-400">{flow} m³/s</span></label>
            <input type="range" id="flow" min="1" max="300" step="1" value={flow} onChange={e => updateSettings('flow', Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
          </div>
          <div>
            <label htmlFor="efficiency" className="flex justify-between text-sm font-medium text-slate-300 mb-1"><span>Efikasnost Turbine (%)</span> <span className="font-bold text-cyan-400">{efficiency}%</span></label>
            <input type="range" id="efficiency" min="70" max="98" step="1" value={efficiency} onChange={e => updateSettings('efficiency', Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
          </div>
           <div>
            <label htmlFor="powerFactor" className="flex justify-between text-sm font-medium text-slate-300 mb-1"><span>Faktor Snage (cos φ)</span> <span className="font-bold text-cyan-400">{powerFactor.toFixed(2)}</span></label>
            <input type="range" id="powerFactor" min="0.7" max="1.0" step="0.01" value={powerFactor} onChange={e => updateSettings('powerFactor', Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
          </div>
          
           {/* Additional Parameters */}
          <div className="border-t border-slate-700 pt-6 space-y-4">
             <div>
                <label htmlFor="water-quality" className="block text-sm font-medium text-slate-300 mb-1">Kvaliteta Vode</label>
                <select id="water-quality" value={waterQuality} onChange={e => updateSettings('waterQuality', e.target.value as WaterQuality)} className="w-full bg-slate-700/50 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-cyan-500 focus:border-cyan-500">
                  <option value="clean">Čista Voda</option>
                  <option value="moderate_sediment">Umjeren Sediment</option>
                  <option value="high_sediment">Visok Udio Abrazivnih Čestica</option>
                </select>
            </div>
             <div>
                <label htmlFor="flow-variation" className="block text-sm font-medium text-slate-300 mb-1">Varijacija Protoka</label>
                <select id="flow-variation" value={flowVariation} onChange={e => updateSettings('flowVariation', e.target.value as FlowVariation)} className="w-full bg-slate-700/50 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-cyan-500 focus:border-cyan-500">
                  <option value="stable">Stabilan Protok</option>
                  <option value="seasonal">Sezonski Promjenjiv</option>
                  <option value="variable">Vrlo Varijabilan Protok</option>
                </select>
            </div>
            <div className="pt-2">
                <button
                    onClick={loadSavedSettings}
                    className="w-full px-4 py-2 bg-slate-600/50 text-slate-300 font-semibold rounded-md hover:bg-slate-600 transition-colors flex items-center justify-center space-x-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 9a9 9 0 0114.12-5.12M20 15a9 9 0 01-14.12 5.12" /></svg>
                    <span>Učitaj Spremljene Postavke</span>
                </button>
            </div>
          </div>
        </div>

        {/* Right Column: Results & Charts */}
        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Procijenjena Snaga</h3>
            <div className="flex justify-around items-center">
              <div>
                <p className="text-slate-400">Realna Snaga</p>
                <p className="text-4xl font-bold text-cyan-400">{realPower.toFixed(2)}</p>
                <p className="text-slate-500">MW</p>
              </div>
              <div>
                <p className="text-slate-400">Prividna Snaga</p>
                <p className="text-4xl font-bold text-cyan-400">{apparentPower.toFixed(2)}</p>
                <p className="text-slate-500">MVA</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={headChartData} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }}>
                   <Label value="Pad Vode (m)" offset={-15} position="insideBottom" fill="#94a3b8" />
                </XAxis>
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} >
                  <Label value="Snaga (MW)" angle={-90} position="insideLeft" fill="#94a3b8" style={{ textAnchor: 'middle' }} />
                </YAxis>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} labelStyle={{ color: '#cbd5e1' }} formatter={(value: number) => [`${value.toFixed(2)} MW`, "Snaga"]} />
                <Line type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={2} dot={false} />
                <ReferenceLine x={head} stroke="#f43f5e" strokeDasharray="4 4">
                  <Label value="Trenutni Pad" position="insideTop" fill="#f43f5e" fontSize={12} />
                </ReferenceLine>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Recommendations Section */}
      <div className="mt-8">
        <h3 className="text-2xl font-bold text-center mb-2 text-slate-200">Preporuke na Temelju Parametara</h3>
         {hoveredTurbine && (
             <div className="text-center bg-slate-800/50 p-4 rounded-lg mb-6 border border-slate-700 animate-fade-in">
                <h4 className="font-bold text-lg text-cyan-400">{TURBINE_CATEGORIES[hoveredTurbine]?.name}</h4>
                <p className="text-slate-300 max-w-2xl mx-auto">{turbineDescriptions[hoveredTurbine]}</p>
            </div>
        )}
        {recommendedTurbines.length > 0 && !hoveredTurbine &&
          <p className="text-slate-400 text-center mb-6">Na temelju unesenih parametara, ovo su najprikladniji tipovi turbina. Zadržite miš iznad imena za detalje.</p>
        }
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(TURBINE_CATEGORIES).map(([key, category], index) => {
              const isRecommended = recommendedTurbines.includes(key);
              const isBest = recommendedTurbines[0] === key;
              let recommendationText = '';
              if (isBest) recommendationText = 'Najbolja Opcija';
              else if (isRecommended) recommendationText = 'Preporučeno';

              return (
                 <div 
                    key={key}
                    onClick={() => onSelectTurbineType(key)}
                    onMouseEnter={() => setHoveredTurbine(key)}
                    onMouseLeave={() => setHoveredTurbine(null)}
                    className={`relative group flex flex-col justify-between p-6 bg-slate-700/50 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg ${isRecommended ? 'border-cyan-500 hover:shadow-cyan-500/20' : 'border-slate-700 hover:border-slate-500'}`}
                >
                    {isRecommended && (
                       <span className={`absolute top-0 -right-0.5 -mt-2.5 px-3 py-1 text-xs font-bold text-white rounded-full ${isBest ? 'bg-cyan-600' : 'bg-cyan-800'}`}>{recommendationText}</span>
                    )}
                    <div>
                        <h4 className={`text-xl font-bold ${isRecommended ? 'text-cyan-400' : 'text-slate-100'} group-hover:text-cyan-400 transition-colors`}>{category.name}</h4>
                        <p className="text-sm text-slate-400 mt-1">{category.types.map(t => t.name).join(', ')}</p>
                    </div>
                    <div className="text-right mt-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        Detalji &rarr;
                    </div>
                </div>
              )
          })}
        </div>
      </div>

       {/* Additional Planning Parameters Section */}
        <div className="mt-12">
            <h3 className="text-2xl font-bold text-center mb-6 text-slate-200">Dodatni Ključni Parametri za Planiranje Projekta</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <h4 className="font-bold text-cyan-400 mb-2">Geotehnički i Građevinski Faktori</h4>
                    <p className="text-slate-300">Stabilnost tla za temelje, dostupnost materijala, seizmička aktivnost i logistika pristupa lokaciji ključni su za troškove i izvedivost građevinskih radova.</p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <h4 className="font-bold text-cyan-400 mb-2">Hidrološka Analiza</h4>
                    <p className="text-slate-300">Dugoročna analiza povijesnih podataka o protoku, uključujući procjenu rizika od poplava i suša, ključna je za pouzdanost i profitabilnost postrojenja.</p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <h4 className="font-bold text-cyan-400 mb-2">Ekološki Utjecaji i Dozvole</h4>
                    <p className="text-slate-300">Studija utjecaja na okoliš, osiguravanje minimalnog biološkog protoka (e-flow) i ishođenje svih dozvola su dugotrajni procesi koji mogu značajno utjecati na raspored projekta.</p>
                </div>
                 <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 md:col-span-2 lg:col-span-1">
                    <h4 className="font-bold text-cyan-400 mb-2">Priključenje na Mrežu</h4>
                    <p className="text-slate-300">Udaljenost do najbliže točke priključenja, kapacitet postojeće mreže i troškovi izgradnje dalekovoda su kritični faktori koji se često podcjenjuju.</p>
                </div>
                 <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 lg:col-span-2">
                    <h4 className="font-bold text-cyan-400 mb-2">Ekonomska Isplativost (LCOE)</h4>
                    <p className="text-slate-300">Ukupni nivelirani trošak energije (Levelized Cost of Energy) mora uzeti u obzir sve troškove (CAPEX, OPEX, financiranje, dekomisija) i očekivanu godišnju proizvodnju kako bi se procijenila dugoročna profitabilnost projekta u usporedbi s drugim izvorima energije.</p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default HPPBuilder;