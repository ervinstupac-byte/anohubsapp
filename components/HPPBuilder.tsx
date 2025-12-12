import React, { useState, useMemo } from 'react';
import { BackButton } from './BackButton.tsx';
import { useNavigation } from '../contexts/NavigationContext.tsx';
import { TURBINE_CATEGORIES } from '../constants.ts';
import type { HPPSettings, TurbineRecommendation } from '../types.ts';

// --- CHART COMPONENT (Vizualizacija radne točke) ---
const TurbineChart: React.FC<{ head: number; flow: number }> = ({ head, flow }) => {
    // Jednostavna vizualizacija točke na logaritamskoj skali (simulacija dijagrama)
    // Head (Y) vs Flow (X)
    const topPos = Math.max(0, Math.min(100, 100 - (Math.log10(head) / Math.log10(1000)) * 100)); 
    const leftPos = Math.max(0, Math.min(100, (Math.log10(flow) / Math.log10(200)) * 100));

    return (
        <div className="relative w-full h-48 bg-slate-800 rounded-lg border border-slate-600 overflow-hidden mb-4">
            {/* Background Grid/Zones */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.researchgate.net/profile/P-K-Talukdar/publication/236894060/figure/fig1/AS:669055364161546@1536526830571/Application-ranges-of-various-turbine-types-3.png')] bg-cover bg-center grayscale mix-blend-overlay"></div>
            
            {/* Axis Labels */}
            <div className="absolute left-2 top-2 text-[10px] text-slate-400">Head (m)</div>
            <div className="absolute right-2 bottom-2 text-[10px] text-slate-400">Flow (m³/s)</div>

            {/* The Dot */}
            <div 
                className="absolute w-4 h-4 bg-cyan-500 rounded-full border-2 border-white shadow-[0_0_10px_cyan] transition-all duration-500 z-10"
                style={{ top: `${topPos}%`, left: `${leftPos}%`, transform: 'translate(-50%, -50%)' }}
            ></div>
            <div className="absolute top-2 right-2 bg-slate-900/80 px-2 py-1 rounded text-xs font-mono text-cyan-400 border border-cyan-500/30">
                Operating Point
            </div>
        </div>
    );
};

const HPPBuilder: React.FC = () => {
    const { navigateToTurbineDetail } = useNavigation();
    
    // --- STATE ---
    const [settings, setSettings] = useState<HPPSettings>({
        head: 50,
        flow: 10,
        efficiency: 0.92, 
        powerFactor: 0.8,
        waterQuality: 'clean',
        flowVariation: 'stable'
    });

    // --- PHYSICS CALCULATIONS ---
    const calculations = useMemo(() => {
        // 1. Power Output (MW)
        const powerMW = (9.81 * settings.head * settings.flow * settings.efficiency) / 1000;
        
        // 2. Rotational Speed Estimation (n) - Empirical formula for standard generators
        // n approx = 2500 / sqrt(P_kw per pole pair)... simplified for estimation:
        // We use a reference specific speed logic instead.
        
        // 3. Specific Speed (n_sq) Calculation
        // n_sq = n * sqrt(Q) / H^0.75
        // Since we don't know 'n' yet, we reverse engineer 'n' based on optimal n_sq ranges for Head:
        // Pelton optimal n_sq ~ 15-20 | Francis ~ 100-300 | Kaplan ~ 400+
        // This is a complex iterative process in real engineering. 
        // For this tool, we calculate a "Diagnostic Specific Speed Index" based on Head/Flow ratio.
        
        const hydraulicEnergy = settings.head * settings.flow; // Rough proxy
        const specificSpeedIndex = (Math.sqrt(settings.flow) * 1000) / Math.pow(settings.head, 0.75); 

        return {
            powerMW: powerMW.toFixed(2),
            annualGWh: (powerMW * 8760 * (settings.flowVariation === 'stable' ? 0.8 : 0.55) / 1000).toFixed(2),
            n_sq: specificSpeedIndex.toFixed(0) // This is our "Type Determinant"
        };
    }, [settings.head, settings.flow, settings.efficiency, settings.flowVariation]);

    // --- RECOMMENDATION ENGINE (Physics Based) ---
    const recommendations = useMemo((): TurbineRecommendation[] => {
        const { head, flow, flowVariation, waterQuality } = settings;
        const n_sq = parseFloat(calculations.n_sq);
        const recs: TurbineRecommendation[] = [];

        // --- 1. PELTON LOGIC (High Head, Low N_sq) ---
        let peltonScore = 0;
        let peltonReasons = [];
        
        // N_sq Logic
        if (n_sq < 30) { peltonScore += 20; peltonReasons.push(`Ideal Specific Speed (n_sq: ${n_sq})`); }
        else if (n_sq < 60) { peltonScore += 10; peltonReasons.push(`Multi-jet range (n_sq: ${n_sq})`); }
        else { peltonScore -= 20; } // Physics mismatch

        // Head Logic
        if (head > 150) { peltonScore += 10; peltonReasons.push('Optimal Head range (>150m)'); }
        else if (head < 50) { peltonScore -= 100; peltonReasons.push('Head too low for Impulse physics'); }

        // Water Quality
        if (waterQuality === 'abrasive') { peltonScore += 5; peltonReasons.push('Resistant to erosion (no seal gaps)'); }

        recs.push({ key: 'pelton', score: peltonScore, reasons: peltonReasons, isBest: false });

        // --- 2. FRANCIS LOGIC (Medium Head, Medium N_sq) ---
        let francisScore = 0;
        let francisReasons = [];

        // N_sq Logic
        if (n_sq >= 60 && n_sq <= 350) { francisScore += 20; francisReasons.push(`Ideal Reaction Zone (n_sq: ${n_sq})`); }
        
        // Head Logic
        if (head >= 40 && head <= 400) { francisScore += 10; francisReasons.push('Standard Francis domain'); }
        
        // Efficiency Penalty
        if (flowVariation === 'variable') { francisScore -= 5; francisReasons.push('Peaky efficiency curve'); }
        if (waterQuality === 'abrasive') { francisScore -= 10; francisReasons.push('High erosion risk on guide vanes'); }

        recs.push({ key: 'francis', score: francisScore, reasons: francisReasons, isBest: false });

        // --- 3. KAPLAN LOGIC (Low Head, High N_sq) ---
        let kaplanScore = 0;
        let kaplanReasons = [];

        // N_sq Logic
        if (n_sq > 350) { kaplanScore += 20; kaplanReasons.push(`High Specific Speed domain (n_sq: ${n_sq})`); }
        
        // Head Logic
        if (head < 40) { kaplanScore += 10; kaplanReasons.push('Low head specialist'); }
        if (head > 70) { kaplanScore -= 50; kaplanReasons.push('Head too high (Cavitation risk)'); }

        // Variable Flow
        if (flowVariation === 'variable') { kaplanScore += 15; kaplanReasons.push('Double-regulated (Curve Flatness)'); }

        recs.push({ key: 'kaplan', score: kaplanScore, reasons: kaplanReasons, isBest: false });

        // --- 4. CROSSFLOW (Special Case) ---
        let crossScore = 0;
        let crossReasons = [];
        if (head < 100 && flow < 5) { crossScore += 15; crossReasons.push('Economic Efficiency'); }
        if (waterQuality === 'abrasive') { crossScore += 15; crossReasons.push('Self-cleaning capability'); }
        
        recs.push({ key: 'crossflow', score: crossScore, reasons: crossReasons, isBest: false });

        // Determine Winner
        const maxScore = Math.max(...recs.map(r => r.score));
        return recs.map(r => ({ ...r, isBest: r.score === maxScore && r.score > 0 })).sort((a, b) => b.score - a.score);

    }, [settings, calculations.n_sq]);

    return (
        <div className="animate-fade-in space-y-8 pb-12 max-w-7xl mx-auto">
            <BackButton text="Back to HUB" />
            
            <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-white">Advanced Power Optimizer</h2>
                <p className="text-slate-400">Physics-based selection using Specific Speed ($n_s$) topology.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT: INPUTS */}
                <div className="glass-panel p-6 rounded-2xl border-l-4 border-cyan-500 space-y-8 h-fit">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🎛️</span>
                        <h3 className="text-xl font-bold text-white">Input Vectors</h3>
                    </div>
                    
                    {/* SLIDERS */}
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-300 font-bold">Net Head (H)</span>
                            <span className="text-cyan-400 font-mono font-bold bg-cyan-900/30 px-2 rounded">{settings.head} m</span>
                        </div>
                        <input type="range" min="2" max="500" step="1" value={settings.head} onChange={(e) => setSettings({...settings, head: parseInt(e.target.value)})} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                    </div>

                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-300 font-bold">Flow Rate (Q)</span>
                            <span className="text-cyan-400 font-mono font-bold bg-cyan-900/30 px-2 rounded">{settings.flow} m³/s</span>
                        </div>
                        <input type="range" min="0.1" max="50" step="0.1" value={settings.flow} onChange={(e) => setSettings({...settings, flow: parseFloat(e.target.value)})} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                    </div>

                    {/* SELECTS */}
                    <div className="grid grid-cols-1 gap-4 pt-2">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Hydrology Type</label>
                            <select value={settings.flowVariation} onChange={(e) => setSettings({...settings, flowVariation: e.target.value as any})} className="w-full bg-slate-900/80 border border-slate-600 rounded-lg p-3 text-sm text-white outline-none">
                                <option value="stable">Stable Base Load</option>
                                <option value="seasonal">Seasonal Peak/Off-Peak</option>
                                <option value="variable">Highly Variable (Flashy)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Water Condition</label>
                            <select value={settings.waterQuality} onChange={(e) => setSettings({...settings, waterQuality: e.target.value as any})} className="w-full bg-slate-900/80 border border-slate-600 rounded-lg p-3 text-sm text-white outline-none">
                                <option value="clean">Clear Water</option>
                                <option value="suspended">Silt Load (Glacial)</option>
                                <option value="abrasive">Hard Sediment (Quartz)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* MIDDLE: PHYSICS ENGINE */}
                <div className="glass-panel p-0 rounded-2xl overflow-hidden flex flex-col h-fit">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6">
                        <TurbineChart head={settings.head} flow={settings.flow} />
                        
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="text-center p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Specific Speed Index</p>
                                <div className="text-2xl font-mono text-yellow-400 font-bold">{calculations.n_sq}</div>
                                <p className="text-[9px] text-slate-500">n_sq = f(Q, H^0.75)</p>
                            </div>
                            <div className="text-center p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Annual Energy</p>
                                <div className="text-2xl font-mono text-green-400 font-bold">{calculations.annualGWh}</div>
                                <p className="text-[9px] text-slate-500">GWh / year</p>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-slate-400 text-xs uppercase tracking-[0.2em] mb-2">Installed Capacity</p>
                            <h3 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                                {calculations.powerMW} <span className="text-xl text-slate-500">MW</span>
                            </h3>
                        </div>
                    </div>
                </div>

                {/* RIGHT: RECOMMENDATIONS */}
                <div className="glass-panel p-6 rounded-2xl border-r-4 border-purple-500 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                    <div className="flex items-center gap-3 mb-4">
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
                                onClick={() => navigateToTurbineDetail(rec.key)}
                                className={`
                                    group p-4 rounded-xl border cursor-pointer transition-all duration-300 relative overflow-hidden
                                    ${rec.isBest 
                                        ? 'bg-gradient-to-r from-green-900/20 to-slate-900 border-green-500 shadow-lg transform scale-100' 
                                        : 'bg-slate-800/40 border-slate-700 hover:border-slate-500 opacity-60 hover:opacity-100'}
                                `}
                            >
                                {rec.isBest && <div className="absolute top-0 right-0 bg-green-500 text-slate-900 text-[10px] font-bold px-3 py-1 rounded-bl-lg">OPTIMAL MATCH</div>}

                                <div className="flex justify-between items-center mb-3">
                                    <h4 className={`font-bold text-lg ${rec.isBest ? 'text-green-400' : 'text-slate-200'}`}>{turbineName}</h4>
                                </div>
                                <ul className="space-y-1.5 mb-4">
                                    {rec.reasons.map((reason, i) => (
                                        <li key={i} className="text-xs text-slate-300 flex items-start">
                                            <span className={`mr-2 mt-0.5 ${rec.isBest ? 'text-green-500' : 'text-slate-500'}`}>{rec.isBest ? '✓' : '•'}</span>
                                            {reason}
                                        </li>
                                    ))}
                                </ul>
                                <div className="pt-3 border-t border-slate-700/50 flex justify-end">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">View Specs →</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
};

export default HPPBuilder;