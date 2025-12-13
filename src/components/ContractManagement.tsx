import React, { useState, useEffect } from 'react';
import { BackButton } from './BackButton.tsx';
import { useToast } from '../contexts/ToastContext.tsx';

// --- DATA: WARRANTY KILLERS ---
const warrantyKillers = [
    { 
        id: 1, 
        text: "No digital log of initial alignment (0.05 mm/m)", 
        cost: 450000, 
        severity: 'Critical',
        desc: "Without this proof, any bearing failure is blamed on installation." 
    },
    { 
        id: 2, 
        text: "Operation below 40% load for >2 hours", 
        cost: 120000, 
        severity: 'High',
        desc: "Cavitation damage outside operating envelope is not covered." 
    },
    { 
        id: 3, 
        text: "Maintenance by uncertified local personnel", 
        cost: 85000, 
        severity: 'Medium',
        desc: "Manufacturer requires certified technicians for major service." 
    },
    { 
        id: 4, 
        text: "Use of non-OEM spare parts (Seals/Oil)", 
        cost: 25000, 
        severity: 'Medium',
        desc: "Immediate invalidation of hydraulic circuit warranty." 
    },
    { 
        id: 5, 
        text: "Missing vibration spectrum analysis logs", 
        cost: 150000, 
        severity: 'High',
        desc: "Cannot prove failure wasn't caused by resonance." 
    }
];

export const ContractManagement: React.FC = () => {
    const { showToast } = useToast();
    const [selectedRisks, setSelectedRisks] = useState<number[]>([]);
    const [isVoid, setIsVoid] = useState(false);
    const [totalLiability, setTotalLiability] = useState(0);

    const toggleRisk = (id: number, cost: number) => {
        const isSelected = selectedRisks.includes(id);
        let newSelection: number[];

        if (isSelected) {
            newSelection = selectedRisks.filter(riskId => riskId !== id);
        } else {
            newSelection = [...selectedRisks, id];
        }

        setSelectedRisks(newSelection);
    };

    // Calculate status on change
    useEffect(() => {
        const currentLiability = warrantyKillers
            .filter(k => selectedRisks.includes(k.id))
            .reduce((acc, curr) => acc + curr.cost, 0);
        
        setTotalLiability(currentLiability);

        // Logic: 1 Critical OR >= 2 High/Medium voids the warranty
        const criticalCount = warrantyKillers.filter(k => selectedRisks.includes(k.id) && k.severity === 'Critical').length;
        const otherCount = selectedRisks.length - criticalCount;

        const shouldVoid = criticalCount > 0 || otherCount >= 2;

        if (shouldVoid && !isVoid) {
            showToast('WARNING: Warranty Terms Violated!', 'error');
        }
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
                    The "Execution Gap" isn't just technical—it's a legal loophole. 
                    Manufacturers use lack of data to void warranties. Test your vulnerability below.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                
                {/* LEFT: SIMULATOR INPUTS */}
                <div className="glass-panel p-6 rounded-2xl bg-slate-800/50 border border-slate-700">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                        <h3 className="text-xl font-bold text-white">⚠️ Operational Actions</h3>
                        <span className="text-xs text-slate-400 uppercase tracking-widest">Select to simulate</span>
                    </div>
                    
                    <div className="space-y-4">
                        {warrantyKillers.map((killer) => (
                            <div 
                                key={killer.id}
                                onClick={() => toggleRisk(killer.id, killer.cost)}
                                className={`
                                    relative p-4 rounded-xl border cursor-pointer transition-all duration-300 flex items-start gap-4
                                    ${selectedRisks.includes(killer.id) 
                                        ? 'bg-red-900/20 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
                                        : 'bg-slate-900/40 border-slate-700 hover:bg-slate-800'}
                                `}
                            >
                                <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${selectedRisks.includes(killer.id) ? 'bg-red-500 border-red-500 text-white' : 'border-slate-500'}`}>
                                    {selectedRisks.includes(killer.id) && '✓'}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className={`font-bold ${selectedRisks.includes(killer.id) ? 'text-red-300' : 'text-slate-200'}`}>{killer.text}</h4>
                                        {killer.severity === 'Critical' && <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold uppercase">Critical</span>}
                                    </div>
                                    <p className="text-xs text-slate-500">{killer.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <button 
                        onClick={handleReset}
                        className="mt-6 w-full py-3 text-sm font-bold text-slate-400 hover:text-white border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                        Reset Simulator
                    </button>
                </div>

                {/* RIGHT: WARRANTY STATUS CERTIFICATE */}
                <div className="sticky top-8">
                    <div className={`
                        relative p-8 rounded-2xl border-4 transition-all duration-500 overflow-hidden min-h-[400px] flex flex-col justify-between
                        ${isVoid 
                            ? 'bg-slate-200 border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.5)]' 
                            : 'bg-gradient-to-br from-slate-100 to-slate-300 border-green-600 shadow-2xl'}
                    `}>
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                        {/* Certificate Header */}
                        <div className="text-center border-b-2 border-slate-400 pb-4 mb-6">
                            <h2 className="text-3xl font-serif font-black text-slate-800 tracking-widest uppercase">Warranty Certificate</h2>
                            <p className="text-slate-600 font-serif italic mt-1">Global Hydropower Manufacturer Ltd.</p>
                        </div>

                        {/* Content */}
                        <div className="space-y-4 text-slate-800 font-mono text-sm relative z-10">
                            <div className="flex justify-between border-b border-slate-300 pb-1">
                                <span>Project ID:</span>
                                <span className="font-bold">HPP-2025-X</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-300 pb-1">
                                <span>Coverage:</span>
                                <span className="font-bold">Full Mechanical & Hydraulic</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-300 pb-1">
                                <span>Valid Until:</span>
                                <span className="font-bold">December 2030</span>
                            </div>
                            
                            {/* LIABILITY CALCULATOR */}
                            <div className="mt-8 pt-4 border-t-2 border-slate-800">
                                <p className="text-xs uppercase tracking-bold mb-1">Estimated Liability (Uncovered)</p>
                                <div className={`text-4xl font-black ${isVoid ? 'text-red-600' : 'text-slate-400'}`}>
                                    € {totalLiability.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* STATUS STAMP */}
                        <div className={`
                            absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                            border-8 rounded-xl px-10 py-4 font-black text-6xl tracking-widest opacity-80 rotate-[-15deg] transition-all duration-300 scale-150
                            ${isVoid 
                                ? 'border-red-600 text-red-600 block animate-scale-in' 
                                : 'border-green-600 text-green-600 hidden'}
                        `}>
                            VOID
                        </div>
                        
                        {!isVoid && (
                            <div className="absolute bottom-8 right-8">
                                <div className="w-24 h-24 rounded-full border-4 border-green-600 flex items-center justify-center text-green-600 font-bold rotate-[-10deg] opacity-60">
                                    VALID
                                </div>
                            </div>
                        )}

                        {/* Footer Message */}
                        <div className={`mt-6 text-center text-xs font-bold p-2 rounded ${isVoid ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {isVoid ? 'CONTRACT TERMS VIOLATED. CLAIM REJECTED.' : 'TERMS COMPLIANT. FULL COVERAGE ACTIVE.'}
                        </div>
                    </div>

                    {/* SOLUTION CTA */}
                    {isVoid && (
                        <div className="mt-6 p-4 bg-cyan-900/30 border border-cyan-500/50 rounded-xl animate-fade-in-up">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">🛡️</span>
                                <div>
                                    <h4 className="font-bold text-white">How AnoHUB Prevents This</h4>
                                    <p className="text-sm text-cyan-200/80 mt-1">
                                        Our Blockchain Ledger provides irrefutable, timestamped proof of every alignment (0.05mm) and maintenance task, legally forcing manufacturers to honor the warranty.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContractManagement;