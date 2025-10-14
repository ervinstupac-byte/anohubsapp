import React, { useState, useMemo } from 'react';
import { BackButton } from './BackButton';
import type { TurbineCategories, TurbineType } from '../types';

interface HPPBuilderProps {
  turbineCategories: TurbineCategories;
  onBack: () => void;
}

const HPPBuilder: React.FC<HPPBuilderProps> = ({ turbineCategories, onBack }) => {
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(null);
  const [selectedTurbine, setSelectedTurbine] = useState<TurbineType | null>(null);
  const [head, setHead] = useState(50); // Initial head in meters
  const [flow, setFlow] = useState(10); // Initial flow in m³/s

  const handleCategorySelect = (key: string) => {
    setSelectedCategoryKey(key);
    setSelectedTurbine(null);
  };

  const calculatedPower = useMemo(() => {
    // Power (kW) = η * ρ * g * Q * H
    // η (efficiency) ~0.9, ρ (density of water) ~1000 kg/m³, g (gravity) ~9.81 m/s²
    const efficiency = 0.9;
    const powerKw = efficiency * 9.81 * flow * head;
    return (powerKw / 1000).toFixed(2); // Power in MW
  }, [head, flow]);

  const getRecommendations = useMemo(() => {
    const recommendations: string[] = [];
    if (!selectedTurbine) return recommendations;

    // General Recommendations
    const power = parseFloat(calculatedPower);
    if (power > 50) {
        recommendations.push("Zahtijeva robusnu prijenosnu infrastrukturu i veliku rasklopnu opremu.");
    }
    if (head > 300) {
        recommendations.push("Potreban je visokotlačni cjevovod (penstock) s pažljivom analizom vodenog udara (water hammer).");
    }
     if (flow > 50) {
        recommendations.push("Potreban je MIV (Glavni dovodni zatvarač) velikog promjera, vjerojatno leptirastog ili kuglastog tipa.");
        recommendations.push("Opsežni građevinski radovi na ulaznoj građevini za upravljanje velikim protokom.");
    }

    // Turbine-specific recommendations
    if (selectedTurbine.id.includes('pelton')) {
      recommendations.push("Preporučuje se kućište otporno na eroziju zbog velike brzine mlaza.");
      recommendations.push("Potrebna je precizna kontrola mlaznica za optimalnu efikasnost.");
    }
    if (selectedTurbine.id.includes('francis')) {
        recommendations.push("Ključna je analiza kavitacije, posebno ako će raditi izvan optimalnog režima.");
        recommendations.push("Preporučuje se rotor od nehrđajućeg čelika otpornog na eroziju (npr. 13Cr4Ni).");
    }
    if (selectedTurbine.id.includes('kaplan')) {
        recommendations.push("Sustav za zakretanje lopatica zahtijeva pouzdan hidraulički agregat.");
        if(selectedTurbine.id.includes('bulb')){
             recommendations.push("Kritično je dvostruko ili trostruko brtvljenje osovine radi zaštite potopljenog generatora.");
        }
    }
    
    if (recommendations.length === 0) {
        recommendations.push("Standardna konfiguracija za odabrane parametre. Potrebna je detaljna analiza projekta.")
    }

    return recommendations;
  }, [selectedTurbine, head, flow, calculatedPower]);


  if (!selectedTurbine) {
    return (
      <div className="space-y-8 animate-fade-in">
        <BackButton onClick={onBack} text="Natrag na HUB" />
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-slate-200">Korak 1: Odaberite Kategoriju Turbine</h2>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {Object.entries(turbineCategories).map(([key, category]) => (
              <button key={key} type="button" onClick={() => handleCategorySelect(key)} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${selectedCategoryKey === key ? 'bg-cyan-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}>
                {category.name}
              </button>
            ))}
          </div>
        </div>
        {selectedCategoryKey && (
          <div className="animate-fade-in text-center">
            <h2 className="text-2xl font-bold mb-6 text-slate-200">Korak 2: Odaberite Specifičan Tip</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {turbineCategories[selectedCategoryKey].types.map(turbine => (
                <div key={turbine.id} onClick={() => setSelectedTurbine(turbine)} className="p-4 border-2 rounded-lg cursor-pointer transition-all border-slate-600 hover:border-cyan-500 hover:bg-cyan-900/50 bg-slate-700/50">
                  <h3 className="text-lg font-bold text-slate-100">{turbine.name}</h3>
                  <p className="text-sm text-slate-400">{turbine.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
       <BackButton onClick={() => setSelectedTurbine(null)} text="Promijeni Turbinu" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Controls */}
        <div className="bg-slate-700/50 p-6 rounded-xl border border-slate-700">
            <h3 className="text-2xl font-bold text-cyan-400 mb-6 text-center">Podesite Parametre</h3>
            <div className="space-y-6">
                {/* Head Slider */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label htmlFor="head-slider" className="font-semibold text-slate-300">Pad Vode (m)</label>
                        <span className="px-3 py-1 text-lg font-bold bg-slate-900 text-white rounded-md">{head} m</span>
                    </div>
                    <input
                        id="head-slider"
                        type="range"
                        min="10"
                        max="1000"
                        step="10"
                        value={head}
                        onChange={e => setHead(Number(e.target.value))}
                        className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer range-thumb"
                    />
                </div>
                {/* Flow Slider */}
                 <div>
                    <div className="flex justify-between items-center mb-2">
                        <label htmlFor="flow-slider" className="font-semibold text-slate-300">Protok (m³/s)</label>
                        <span className="px-3 py-1 text-lg font-bold bg-slate-900 text-white rounded-md">{flow} m³/s</span>
                    </div>
                    <input
                        id="flow-slider"
                        type="range"
                        min="1"
                        max="200"
                        step="1"
                        value={flow}
                        onChange={e => setFlow(Number(e.target.value))}
                        className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            </div>
        </div>

        {/* Results */}
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
             <h3 className="text-2xl font-bold text-white mb-4 text-center">Rezultati Konfiguracije</h3>
             <div className="text-center mb-6">
                <p className="text-slate-400 text-lg">Procijenjena Snaga</p>
                <p className="text-5xl font-bold text-cyan-400">{calculatedPower} <span className="text-3xl text-slate-300">MW</span></p>
             </div>
             
             <div>
                <h4 className="text-lg font-semibold text-slate-200 mb-3">Ključne Preporuke</h4>
                <ul className="list-disc list-inside space-y-2 text-slate-300">
                    {getRecommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                    ))}
                </ul>
             </div>
        </div>
      </div>
      <style>{`
        input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            background: #0891b2; /* cyan-600 */
            cursor: pointer;
            border-radius: 50%;
        }
        input[type=range]::-moz-range-thumb {
            width: 20px;
            height: 20px;
            background: #0891b2; /* cyan-600 */
            cursor: pointer;
            border-radius: 50%;
        }
      `}</style>
    </div>
  );
};

export default HPPBuilder;
