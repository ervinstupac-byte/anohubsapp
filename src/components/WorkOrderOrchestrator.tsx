import React, { useState } from 'react';
import { useWorkOrder } from '../contexts/WorkOrderContext.tsx';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';

export const WorkOrderOrchestrator: React.FC = () => {
    const { activeWorkOrder, currentStepIndex, completeStep, confirmTools, loading } = useWorkOrder();
    const [inputValue, setInputValue] = useState('');
    const [toolsConfirmed, setToolsConfirmed] = useState(false);

    if (loading) return <div className="p-8 text-center animate-pulse text-cyan-500 uppercase font-black">Synchronizing Neural Link...</div>;
    if (!activeWorkOrder) return null;

    const currentStep = activeWorkOrder.steps[currentStepIndex];

    const handleComplete = async () => {
        const val = currentStep.target_value !== null ? parseFloat(inputValue) : undefined;
        await completeStep(val);
        setInputValue('');
        setToolsConfirmed(false);
    };

    return (
        <div className="animate-fade-in space-y-6 max-w-4xl mx-auto pb-12">
            <header className="flex justify-between items-center bg-slate-900/50 p-6 rounded-2xl border border-white/5">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{activeWorkOrder.title}</h2>
                    <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mt-1">STATUS: {activeWorkOrder.status}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase font-black">Progress</p>
                    <p className="text-2xl font-black text-white">{currentStepIndex + 1} / {activeWorkOrder.steps.length}</p>
                </div>
            </header>

            <GlassCard
                title={`STEP ${currentStep.step_number}: ${currentStep.description}`}
                className="border-l-4 border-l-cyan-500"
            >
                <div className="space-y-8 mt-6">
                    {/* TOOLS SECTION */}
                    <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span>🛠️</span> Required Tools
                        </h4>
                        <div className="flex flex-wrap gap-3">
                            {currentStep.required_tools.map(tool => (
                                <div key={tool} className={`px-4 py-2 rounded-xl border text-[10px] font-bold uppercase transition-all ${toolsConfirmed ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-800/50 border-white/5 text-slate-400'}`}>
                                    {tool} {toolsConfirmed && '✓'}
                                </div>
                            ))}
                        </div>
                        {!toolsConfirmed && (
                            <ModernButton
                                variant="primary"
                                className="mt-4 bg-cyan-600 h-10 text-[10px]"
                                onClick={() => { confirmTools(currentStep.required_tools); setToolsConfirmed(true); }}
                            >
                                CONFIRM TOOLS AVAILABILITY
                            </ModernButton>
                        )}
                    </div>

                    {/* INPUT SECTION */}
                    {currentStep.target_value !== null && toolsConfirmed && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-black">Target Value</p>
                                    <p className="text-3xl font-black text-white">{currentStep.target_value} {currentStep.unit}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-500 uppercase font-black">Injection Point</p>
                                    <input
                                        type="number"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="Enter Measure..."
                                        className="bg-slate-950 border-2 border-cyan-500/30 rounded-xl px-4 py-3 text-xl font-black text-white w-48 outline-none focus:border-cyan-500 transition-all text-right"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CONSUMABLES SECTION */}
                    {currentStep.required_consumables.length > 0 && (
                        <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/20">
                            <p className="text-[9px] text-amber-500 uppercase font-black mb-2 italic">Automated Inventory Deduction Triggered on Completion</p>
                            {currentStep.required_consumables.map(c => (
                                <div key={c.name} className="flex justify-between text-xs">
                                    <span className="text-slate-400">{c.name}</span>
                                    <span className="text-white font-bold">Qty: {c.quantity}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <ModernButton
                        disabled={!toolsConfirmed}
                        variant="primary"
                        fullWidth
                        onClick={handleComplete}
                        className={`h-14 text-lg tracking-widest ${!toolsConfirmed ? 'opacity-30' : 'bg-gradient-to-r from-cyan-600 to-blue-600 shadow-[0_0_20px_rgba(6,182,212,0.3)]'}`}
                    >
                        {currentStepIndex === activeWorkOrder.steps.length - 1 ? 'SEAL WORK ORDER' : 'COMPLETE STEP & PROCEED'}
                    </ModernButton>
                </div>
            </GlassCard>

            {/* HANDOVER STATUS */}
            <div className="flex gap-4">
                <div className="flex-1 bg-slate-900/40 p-4 rounded-xl border border-white/5 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Technician Active: Field Unit Alpha</span>
                </div>
                <div className="flex-1 bg-slate-900/40 p-4 rounded-xl border border-white/5 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reviewer: PENDING HANDOVER</span>
                </div>
            </div>
        </div>
    );
};
