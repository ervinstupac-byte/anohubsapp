import React, { useState, useMemo } from 'react';
import { BackButton } from './BackButton.tsx';
// Izlazimo iz 'components' u root, pa u 'contexts'
import { useNavigation } from '../contexts/NavigationContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
// Izlazimo iz 'components' u root, pa ulazimo u 'src/utils'
import { generateFinancialReport } from '../src/utils/pdfGenerator.ts';
import type { TurbineCategories, TurbineType } from '../types.ts';

// --- STARI PODACI (TEXT DATA) ---
const briefingContent: Record<string, { conditions: string[]; risks: { text: string; level: 'High' | 'Medium' | 'Low' }[] }> = {
  kaplan_vertical: {
    conditions: ['Low heads (10-70m)', 'Large/variable flow (>300 m³/s)', 'Adjustable runner & guide vanes'],
    risks: [{ text: 'Cavitation on blades at partial load', level: 'High' }, { text: 'Draft tube vortex formation', level: 'Medium' }, { text: 'Leakage at blade adjustment mechanism', level: 'Medium' }],
  },
  kaplan_horizontal: {
    conditions: ['Low heads (10-70m)', 'Specific flow installations', 'Similar to vertical design'],
    risks: [{ text: 'Increased bearing load (gravity)', level: 'Medium' }, { text: 'Complex shaft sealing systems', level: 'High' }],
  },
  kaplan_bulb: {
    conditions: ['Very low heads (< 20m)', 'Run-of-river plants', 'Submerged unit'],
    risks: [{ text: 'High risk of cavitation', level: 'High' }, { text: 'Critical generator sealing (water ingress)', level: 'High' }],
  },
  francis_vertical: {
    conditions: ['Medium-High heads (40-600m)', 'Medium flow', 'Fixed runner blades'],
    risks: [{ text: 'Severe cavitation at off-design', level: 'High' }, { text: 'Runner erosion (RCFA gap)', level: 'High' }],
  },
  francis_horizontal: {
    conditions: ['Lower-Medium heads (< 250m)', 'Smaller output', 'Spiral casing'],
    risks: [{ text: 'Amplified vertical risks', level: 'High' }, { text: 'Higher bearing loads', level: 'Medium' }],
  },
  pelton_vertical: {
    conditions: ['Very high heads (> 300m)', 'Low flow', 'Multiple jets (3-6)'],
    risks: [{ text: 'Bucket fatigue and cracking', level: 'High' }, { text: 'Nozzle/Needle wear', level: 'Medium' }],
  },
  pelton_horizontal: {
    conditions: ['High heads (> 250m)', 'Lower power', '1-2 Jets'],
    risks: [{ text: 'Bearing wear (imbalance)', level: 'Medium' }, { text: 'Bucket fatigue', level: 'High' }],
  },
  crossflow: {
    conditions: ['Low-Medium heads (2-200m)', 'Variable flow', 'Simple construction'],
    risks: [{ text: 'Lower peak efficiency', level: 'Low' }, { text: 'Debris damage', level: 'Medium' }],
  },
};

// --- HELPER COMPONENT: RISK BADGE ---
const RiskBadge: React.FC<{ level: 'High' | 'Medium' | 'Low'; text: string }> = ({ level, text }) => {
    const styles = {
        High: 'bg-red-500/20 text-red-300 border-red-500/50',
        Medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
        Low: 'bg-green-500/20 text-green-300 border-green-500/50',
    };
    return (
        <div className={`flex items-start p-3 rounded-lg border ${styles[level]} transition-all hover:bg-opacity-30`}>
            <span className={`w-2 h-2 mt-1.5 rounded-full mr-3 flex-shrink-0 ${level === 'High' ? 'bg-red-500 animate-pulse' : level === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
            <span className="text-sm font-medium">{text}</span>
        </div>
    );
};

// --- MAIN COMPONENT ---
interface InvestorBriefingProps {
    turbineCategories: TurbineCategories;
}

export const InvestorBriefing: React.FC<InvestorBriefingProps> = ({ turbineCategories }) => {
    const { navigateToTurbineDetail } = useNavigation();
    const { showToast } = useToast();

    // --- 1. FINANCIAL STATE (NOVO) ---
    const [capex, setCapex] = useState(15000000); 
    const [opex, setOpex] = useState(450000);     
    const [energyPrice, setEnergyPrice] = useState(120); 
    const [annualProduction, setAnnualProduction] = useState(45000); 

    // --- 2. TECHNICAL STATE (STARO) ---
    const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>('kaplan');
    const [selectedTurbine, setSelectedTurbine] = useState<TurbineType | null>(null);

    // --- FINANCIAL LOGIC ---
    const financials = useMemo(() => {
        const revenue = (annualProduction * energyPrice);
        const netCashFlow = revenue - opex;
        const payback = capex / netCashFlow;
        const roi = (netCashFlow / capex) * 100; 
        const discountFactor = 12.46;
        const npv = (netCashFlow * discountFactor) - capex;

        return {
            revenue: revenue,
            payback: payback.toFixed(1),
            irr: roi.toFixed(1), 
            npv: (npv / 1000000).toFixed(2)
        };
    }, [capex, opex, energyPrice, annualProduction]);

    const riskFinancials = useMemo(() => {
        const riskOpex = opex * 1.15;
        const riskProd = annualProduction * 0.92;
        const riskRevenue = (riskProd * energyPrice);
        const riskNetCashFlow = riskRevenue - riskOpex;
        const riskPayback = capex / riskNetCashFlow;
        const riskRoi = (riskNetCashFlow / capex) * 100;
        const discountFactor = 12.46;
        const riskNpv = (riskNetCashFlow * discountFactor) - capex;
        const penaltyValue = (parseFloat(financials.npv) * 1000000) - riskNpv;

        return {
            payback: riskPayback.toFixed(1),
            irr: riskRoi.toFixed(1),
            npv: (riskNpv / 1000000).toFixed(2),
            penalty: (penaltyValue / 1000000).toFixed(2)
        };
    }, [financials, capex, opex, energyPrice, annualProduction]);

    // --- PDF GENERATION ---
    const handleGenerateReport = () => {
        try {
            generateFinancialReport(
                { capex, opex, price: energyPrice },
                { irr: financials.irr, npv: financials.npv, payback: financials.payback },
                { irr: riskFinancials.irr, npv: riskFinancials.npv, payback: riskFinancials.payback, penalty: riskFinancials.penalty }
            );
            showToast('Executive Summary Generated.', 'success');
        } catch (error) {
            console.error(error);
            showToast('Failed to generate report.', 'error');
        }
    };

    // --- TECHNICAL SELECTION LOGIC ---
    const handleCategorySelect = (key: string) => {
        setSelectedCategoryKey(key);
        setSelectedTurbine(null);
    };
    const currentCategory = turbineCategories[selectedCategoryKey];
    const activeTurbine = selectedTurbine || currentCategory?.types[0];
    const activeDetails = activeTurbine ? briefingContent[activeTurbine.id] : null;

    return (
        <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-12">
            <BackButton text="Back to Dashboard" />
            
            <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    Investor <span className="text-cyan-400">Info-Center</span>
                </h2>
                <p className="text-slate-400 text-lg max-w-3xl mx-auto">
                    A comprehensive review of Financial KPIs and Technical Risk Factors.
                </p>
            </div>

            {/* --- SECTION 1: FINANCIAL SIMULATOR (NEW) --- */}
            <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white border-b border-slate-700 pb-2">1. Financial Simulation & Risk Impact</h3>
                
                {/* Inputs */}
                <div className="glass-panel p-6 rounded-2xl bg-slate-800/50 border border-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div><label className="block text-xs font-bold text-slate-400 mb-2">CAPEX (€)</label><input type="number" value={capex} onChange={e => setCapex(Number(e.target.value))} className="w-full bg-slate-900 border-slate-600 rounded p-2 text-white" /></div>
                        <div><label className="block text-xs font-bold text-slate-400 mb-2">OPEX (€/yr)</label><input type="number" value={opex} onChange={e => setOpex(Number(e.target.value))} className="w-full bg-slate-900 border-slate-600 rounded p-2 text-white" /></div>
                        <div><label className="block text-xs font-bold text-slate-400 mb-2">Energy Price (€/MWh)</label><input type="number" value={energyPrice} onChange={e => setEnergyPrice(Number(e.target.value))} className="w-full bg-slate-900 border-slate-600 rounded p-2 text-white" /></div>
                        <div><label className="block text-xs font-bold text-slate-400 mb-2">Production (MWh/yr)</label><input type="number" value={annualProduction} onChange={e => setAnnualProduction(Number(e.target.value))} className="w-full bg-slate-900 border-slate-600 rounded p-2 text-white" /></div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Ideal */}
                    <div className="glass-panel p-6 rounded-2xl border-t-4 border-t-green-500 bg-gradient-to-b from-slate-800/80 to-slate-900/80">
                        <h3 className="text-xs font-bold text-green-400 uppercase tracking-widest mb-4">Target Scenario</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between border-b border-slate-700 pb-2"><span className="text-slate-400">IRR</span><span className="text-2xl font-bold text-white">{financials.irr}%</span></div>
                            <div className="flex justify-between border-b border-slate-700 pb-2"><span className="text-slate-400">NPV</span><span className="text-2xl font-bold text-white">€ {financials.npv}M</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Payback</span><span className="text-2xl font-bold text-white">{financials.payback} <span className="text-sm font-normal text-slate-500">yrs</span></span></div>
                        </div>
                    </div>
                    {/* Risk */}
                    <div className="glass-panel p-6 rounded-2xl border-t-4 border-t-red-500 bg-gradient-to-b from-slate-800/80 to-slate-900/80">
                        <div className="flex justify-between mb-4"><h3 className="text-xs font-bold text-red-400 uppercase">Risk Adjusted</h3><span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-1 rounded">EXECUTION GAP</span></div>
                        <div className="space-y-4">
                            <div className="flex justify-between border-b border-slate-700 pb-2"><span className="text-slate-400">IRR</span><div className="text-right"><span className="text-2xl font-bold text-white">{riskFinancials.irr}%</span><span className="block text-xs text-red-400">(-{(parseFloat(financials.irr) - parseFloat(riskFinancials.irr)).toFixed(1)}%)</span></div></div>
                            <div className="flex justify-between border-b border-slate-700 pb-2"><span className="text-slate-400">NPV</span><div className="text-right"><span className="text-2xl font-bold text-white">€ {riskFinancials.npv}M</span><span className="block text-xs text-red-400">(-€ {(parseFloat(financials.npv) - parseFloat(riskFinancials.npv)).toFixed(2)}M)</span></div></div>
                            <div className="flex justify-between"><span className="text-slate-400">Payback</span><span className="text-2xl font-bold text-white">{riskFinancials.payback} <span className="text-sm font-normal text-slate-500">yrs</span></span></div>
                        </div>
                    </div>
                    {/* Value */}
                    <div className="glass-panel p-6 rounded-2xl border-t-4 border-t-cyan-500 bg-cyan-900/10 text-center flex flex-col justify-center">
                        <p className="text-slate-400 text-sm mb-2">Potential Value Recovery</p>
                        <span className="text-4xl font-black text-white mb-4">€ {riskFinancials.penalty}M</span>
                        <button onClick={handleGenerateReport} className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:shadow-cyan-500/30 transition-all flex items-center justify-center gap-2 group">
                            <span className="text-xl group-hover:scale-110 transition-transform">📄</span> Download Executive Report
                        </button>
                    </div>
                </div>
            </div>

            {/* --- SECTION 2: TECHNICAL RISK BRIEFING (OLD RESTORED) --- */}
            <div className="space-y-6 pt-8 border-t border-slate-700">
                <h3 className="text-2xl font-bold text-white border-b border-slate-700 pb-2">2. Technical Risk Breakdown</h3>
                
                {/* TABS */}
                <div className="flex justify-start overflow-x-auto pb-2">
                    <div className="flex p-1 bg-slate-900/80 rounded-xl border border-slate-700">
                        {Object.keys(turbineCategories).map((key) => (
                            <button key={key} onClick={() => handleCategorySelect(key)} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${selectedCategoryKey === key ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                                {turbineCategories[key].name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* SELECTOR */}
                    <div className="lg:col-span-4 space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase">Configuration Type</h3>
                        {currentCategory?.types.map(turbine => (
                            <button key={turbine.id} onClick={() => setSelectedTurbine(turbine)} className={`w-full text-left p-4 rounded-xl border transition-all ${activeTurbine?.id === turbine.id ? 'bg-cyan-900/30 border-cyan-500/50' : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800'}`}>
                                <span className={`font-bold block ${activeTurbine?.id === turbine.id ? 'text-white' : 'text-slate-300'}`}>{turbine.name}</span>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{turbine.description}</p>
                            </button>
                        ))}
                    </div>

                    {/* DETAILS */}
                    <div className="lg:col-span-8 space-y-6">
                        {activeDetails ? (
                            <>
                                <div className="glass-panel p-6 rounded-2xl bg-slate-800/50">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Operating Envelope</h3>
                                    <ul className="space-y-2">{activeDetails.conditions.map((c, i) => <li key={i} className="text-sm text-slate-300 flex"><span className="text-cyan-500 mr-2">▹</span>{c}</li>)}</ul>
                                </div>
                                <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-cyan-500">
                                    <h3 className="text-xl font-bold text-white mb-6">Risk Profile: {activeTurbine?.name}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {activeDetails.risks.map((risk, i) => <RiskBadge key={i} {...risk} />)}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="p-8 text-center text-slate-500 border border-slate-700 rounded-xl border-dashed">Select a configuration to view technical risks</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvestorBriefing;