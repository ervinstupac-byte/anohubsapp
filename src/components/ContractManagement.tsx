import React, { useState, useEffect } from 'react';
import { BackButton } from './BackButton.tsx';
import { useToast } from '../contexts/ToastContext.tsx';

// --- DATA: WARRANTY KILLERS & SOLUTIONS ---
const warrantyKillers = [
    { 
        id: 1, 
        text: "No digital log of initial alignment (0.05 mm/m)", 
        cost: 450000, 
        severity: 'Critical',
        desc: "Without this proof, any bearing failure is blamed on installation.",
        // SPECIFIČNO RJEŠENJE ZA OVU STAVKU
        solutionTitle: "Blockchain Ledger",
        solutionDesc: "Creates an immutable, timestamped hash of the alignment report linked to the Asset ID."
    },
    { 
        id: 2, 
        text: "Operation below 40% load for >2 hours", 
        cost: 120000, 
        severity: 'High',
        desc: "Cavitation damage outside operating envelope is not covered.",
        solutionTitle: "AI Watchdog & SCADA",
        solutionDesc: "Real-time alerts trigger an automatic stop or SMS warning when load dips below threshold."
    },
    { 
        id: 3, 
        text: "Maintenance by uncertified local personnel", 
        cost: 85000, 
        severity: 'Medium',
        desc: "Manufacturer requires certified technicians for major service.",
        solutionTitle: "AR Remote Supervision",
        solutionDesc: "Local staff wears AR glasses, allowing a certified remote engineer to sign off on the work digitally."
    },
    { 
        id: 4, 
        text: "Use of non-OEM spare parts (Seals/Oil)", 
        cost: 25000, 
        severity: 'Medium',
        desc: "Immediate invalidation of hydraulic circuit warranty.",
        solutionTitle: "QR Inventory Control",
        solutionDesc: "App rejects maintenance logs if scanned spare part codes do not match the OEM whitelist."
    },
    { 
        id: 5, 
        text: "Missing vibration spectrum analysis logs", 
        cost: 150000, 
        severity: 'High',
        desc: "Cannot prove failure wasn't caused by resonance.",
        solutionTitle: "IoT Sensor Cloud",
        solutionDesc: "24/7 vibration monitoring automates data logging, removing human error from the equation."
    }
];

export const ContractManagement: React.FC = () => {
    const { showToast } = useToast();
    const [selectedRisks, setSelectedRisks] = useState<number[]>([]);
    const [isVoid, setIsVoid] = useState(false);
    const [totalLiability, setTotalLiability] = useState(0);

    const toggleRisk = (id: number) => {
        const isSelected = selectedRisks.includes(id);
        const newSelection = isSelected 
            ? selectedRisks.filter(riskId => riskId !== id) 
            : [...selectedRisks, id];
        
        setSelectedRisks(newSelection);
    };

    // Calculate status
    useEffect(() => {
        const currentLiability = warrantyKillers
            .filter(k => selectedRisks.includes(k.id))
            .reduce((acc, curr) => acc + curr.cost, 0);
        
        setTotalLiability(currentLiability);

        // Logic: 1 Critical OR >= 2 High/Medium voids the warranty
        const criticalCount = warrantyKillers.filter(k => selectedRisks.includes(k.id) && k.severity === 'Critical').length;
        const otherCount = selectedRisks.length - criticalCount;
        const shouldVoid = criticalCount > 0 || otherCount >= 2;

        setIsVoid(shouldVoid);
    }, [selectedRisks]);

    const handleReset = () => {
        setSelectedRisks([]);
        setIsVoid(false);
        setTotalLiability(0);
        showToast('Simulator reset.', 'info');
    };

    return (
        <div className="animate-fade-in pb-12 max-w-6xl mx-auto space-y-10">
            <BackButton text="Back to Dashboard" />

            <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    Contract & <span className="text-cyan-400">Legal Shield</span>
                </h2>
                <p className="text-slate-400 text-lg max-w-3xl mx-auto">
                    Manufacturers use lack of data to void warranties. See exactly how AnoHUB plugs those specific legal holes.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                
                {/* LEFT: SIMULATOR INPUTS */}
                <div className="glass-panel p-6 rounded-2xl bg-slate-800/50 border border-slate-700">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                        <h3 className="text-xl font-bold text-white">⚠️ Operational Errors</h3>
                        <span className="text-xs text-slate-400 uppercase tracking-widest">Select to simulate</span>
                    </div>
                    
                    <div className="space-y-4">
                        {warrantyKillers.map((killer) => (
                            <div 
                                key={killer.id}
                                onClick={() => toggleRisk(killer.id)}
                                className={`
                                    relative p-4 rounded-xl border cursor-pointer transition-all duration-300 flex items-start gap-4 group
                                    ${selectedRisks.includes(killer.id) 
                                        ? 'bg-red-900/20 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
                                        : 'bg-slate-900/40 border-slate-700 hover:bg-slate-800'}
                                `}
                            >
                                <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${selectedRisks.includes(killer.id) ? 'bg-red-500 border-red-500 text-white' : 'border-slate-500 group-hover:border-slate-400'}`}>
                                    {selectedRisks.includes(killer.id) && '✓'}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className={`font-bold transition-colors ${selectedRisks.includes(killer.id) ? 'text-red-300' : 'text-slate-200'}`}>{killer.text}</h4>
                                        {killer.severity === 'Critical' && <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold uppercase">Critical</span>}
                                    </div>
                                    <p className="text-xs text-slate-500">{killer.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <button onClick={handleReset} className="mt-6 w-full py-3 text-sm font-bold text-slate-400 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors">
                        Reset Simulator
                    </button>
                </div>

                {/* RIGHT: STATUS & SOLUTIONS */}
                <div className="space-y-6 sticky top-8">
                    
                    {/* CERTIFICATE CARD */}
                    <div className={`
                        relative p-8 rounded-2xl border-4 transition-all duration-500 overflow-hidden min-h-[300px] flex flex-col justify-between
                        ${isVoid 
                            ? 'bg-slate-200 border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.4)]' 
                            : 'bg-gradient-to-br from-slate-100 to-slate-300 border-green-600 shadow-xl'}
                    `}>
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                        <div className="text-center border-b-2 border-slate-400 pb-4 mb-4 relative z-10">
                            <h2 className="text-2xl font-serif font-black text-slate-800 tracking-widest uppercase">Warranty Status</h2>
                        </div>

                        <div className="space-y-4 text-slate-800 font-mono text-sm relative z-10">
                            <div className="flex justify-between border-b border-slate-300 pb-1"><span>Coverage:</span><span className="font-bold">Full Mechanical</span></div>
                            <div className="mt-8 pt-4 border-t-2 border-slate-800">
                                <p className="text-xs uppercase tracking-bold mb-1">Liability Exposure</p>
                                <div className={`text-4xl font-black ${isVoid ? 'text-red-600' : 'text-slate-400'}`}>
                                    € {totalLiability.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* STAMP */}
                        <div className={`
                            absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                            border-8 rounded-xl px-8 py-2 font-black text-5xl tracking-widest opacity-80 rotate-[-15deg] transition-all duration-300
                            ${isVoid ? 'border-red-600 text-red-600 scale-100' : 'border-green-600 text-green-600 scale-0 opacity-0'}
                        `}>
                            VOID
                        </div>
                        
                        {!isVoid && (
                            <div className="absolute bottom-6 right-6 w-20 h-20 rounded-full border-4 border-green-600 flex items-center justify-center text-green-600 font-bold rotate-[-10deg] opacity-60">
                                VALID
                            </div>
                        )}
                    </div>

                    {/* DYNAMIC SOLUTION LIST (OVO JE NOVO) */}
                    {selectedRisks.length > 0 && (
                        <div className="animate-fade-in-up">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xl">🛡️</span>
                                <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">AnoHUB Mitigation Protocols</h4>
                            </div>
                            
                            <div className="space-y-3">
                                {warrantyKillers.filter(k => selectedRisks.includes(k.id)).map(risk => (
                                    <div key={risk.id} className="bg-cyan-900/20 border border-cyan-500/30 p-4 rounded-xl flex gap-4 animate-scale-in">
                                        <div className="mt-1 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold border border-cyan-500/50 flex-shrink-0">
                                            {risk.id}
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-bold text-white mb-1">{risk.solutionTitle}</h5>
                                            <p className="text-xs text-cyan-200/70 leading-relaxed">{risk.solutionDesc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContractManagement;