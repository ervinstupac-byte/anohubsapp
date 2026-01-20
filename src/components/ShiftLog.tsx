import React, { useState } from 'react';
import { useDiagnostic } from '../contexts/DiagnosticContext.tsx';
import { useAssetContext } from '../contexts/AssetContext.tsx';
import idAdapter from '../utils/idAdapter';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ModernButton } from '../shared/components/ui/ModernButton';
import { BackButton } from './BackButton.tsx';

export const ShiftLog: React.FC = () => {
    const { addShiftLog, shiftLogs, activeDiagnoses } = useDiagnostic();
    const { selectedAsset } = useAssetContext();
    const [observation, setObservation] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!observation.trim() || !selectedAsset) return;

        const numeric = idAdapter.toNumber(selectedAsset.id);
        addShiftLog({
            assetId: numeric !== null ? numeric : selectedAsset.id as any,
            workerName: 'Duty Engineer',
            observation: observation.trim()
        });
        setObservation('');
    };

    const fieldDiagnoses = activeDiagnoses.filter(d => d.source === 'FIELD_LOG');

    return (
        <div className="animate-fade-in space-y-8 pb-12">
            <div className="flex justify-between items-center bg-slate-900/40 p-6 rounded-3xl border border-white/5 backdrop-blur-xl">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-widest uppercase mb-1">Intuition <span className="text-amber-400">Log</span></h2>
                    <p className="text-slate-400 text-sm font-light italic">"The Old Man's Ear" - Textual Experience Correlation.</p>
                </div>
                <BackButton text="Back to Hub" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <GlassCard title="Enter Observation" className="border-l-4 border-l-amber-500">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-1">Active Asset</label>
                                <p className="text-sm text-white font-mono">{selectedAsset?.name || 'No Asset Selected'}</p>
                            </div>

                            <div>
                                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-2">Subjective Symptom</label>
                                <textarea
                                    value={observation}
                                    onChange={(e) => setObservation(e.target.value)}
                                    placeholder="e.g., Cijevi vibriraju više nego juče, čuje se čudan zvuk kod ležaja..."
                                    className="w-full h-32 bg-slate-950 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-amber-500/50 outline-none transition-all resize-none"
                                />
                            </div>

                            <ModernButton
                                variant="primary"
                                className="w-full py-3 bg-amber-500 hover:bg-amber-600 border-amber-400/50"
                                disabled={!selectedAsset || !observation.trim()}
                            >
                                Submit to EKB Correlation
                            </ModernButton>
                        </form>
                    </GlassCard>

                    {fieldDiagnoses.length > 0 && (
                        <GlassCard title="Ano-Agent Feedback" className="border-l-4 border-l-cyan-500 animate-pulse">
                            <div className="space-y-4">
                                {fieldDiagnoses.map((d, i) => (
                                    <div key={i} className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                                        <p className="text-[10px] text-cyan-400 font-black uppercase mb-1">Pattern Identified</p>
                                        <p className="text-sm text-slate-200 italic leading-relaxed">"{d.message}"</p>
                                        {d.diagnosis && (
                                            <div className="mt-3 pt-3 border-t border-cyan-500/20">
                                                <p className="text-[9px] text-slate-500 uppercase font-bold">Recommended Action:</p>
                                                <p className="text-xs text-white">{d.diagnosis.recommended_action}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    )}
                </div>

                <div className="lg:col-span-2">
                    <GlassCard title="Log History" className="h-full">
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {shiftLogs.length === 0 ? (
                                <p className="text-center py-20 text-slate-600 uppercase font-black tracking-widest text-xs">No entries recorded</p>
                            ) : (
                                shiftLogs.map((log) => (
                                    <div key={log.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all border-l-2 border-l-slate-700">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-mono text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                                            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase font-bold">{log.workerName}</span>
                                        </div>
                                        <p className="text-white text-sm">{log.observation}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};
