import React, { useState } from 'react';
import { useDiagnostic } from '../contexts/DiagnosticContext.tsx';
import { GlassCard } from './ui/GlassCard.tsx';
import { ModernButton } from './ui/ModernButton.tsx';

export const ExpertDiagnosticPanel: React.FC = () => {
    const { activeDiagnoses, recordLessonLearned } = useDiagnostic();
    const [lessonForm, setLessonForm] = useState<{ symptom: string; cause: string; resolution: string } | null>(null);

    if (activeDiagnoses.length === 0) return null;

    return (
        <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                <span className="p-1 px-2 bg-indigo-500 rounded text-[10px]">EKB</span>
                Expert Troubleshooting Advisor
            </h3>

            {activeDiagnoses.map((item, idx) => (
                <GlassCard
                    key={idx}
                    title={item.diagnosis ? item.diagnosis.diagnosis : 'Unknown Symptom'}
                    className={`border-l-4 ${item.diagnosis?.severity === 'CRITICAL' ? 'border-l-red-500' :
                        item.diagnosis?.severity === 'HIGH' ? 'border-l-orange-500' : 'border-l-indigo-500'
                        }`}
                >
                    <div className="space-y-4 mt-4">
                        <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                            <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Likely Cause</p>
                            <p className="text-sm text-white italic">"{item.message}"</p>
                            {item.diagnosis && (
                                <p className="text-xs text-indigo-300 mt-2">{item.diagnosis.diagnosis}</p>
                            )}
                        </div>

                        {item.diagnosis && (
                            <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                                <p className="text-[10px] text-indigo-400 uppercase font-black mb-1">Recommended Action</p>
                                <p className="text-sm text-white font-bold leading-relaxed">{item.diagnosis.recommended_action}</p>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <ModernButton
                                variant="secondary"
                                className="h-10 text-[10px]"
                                onClick={() => setLessonForm({
                                    symptom: item.message,
                                    cause: '',
                                    resolution: ''
                                })}
                            >
                                RECORD LESSON LEARNED
                            </ModernButton>
                        </div>
                    </div>
                </GlassCard>
            ))}

            {/* EXPERIENCE LEDGER FORM */}
            {lessonForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <h4 className="text-2xl font-black text-white uppercase tracking-tighter mb-6">Archive Experience</h4>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] text-slate-500 uppercase font-black mb-1 block">Actual Cause</label>
                                <input
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500 transition-all"
                                    placeholder="What was the real issue?"
                                    value={lessonForm.cause}
                                    onChange={e => setLessonForm({ ...lessonForm, cause: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500 uppercase font-black mb-1 block">Resolution Steps</label>
                                <textarea
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-indigo-500 transition-all h-32"
                                    placeholder="How was it fixed?"
                                    value={lessonForm.resolution}
                                    onChange={e => setLessonForm({ ...lessonForm, resolution: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <ModernButton
                                variant="secondary"
                                fullWidth
                                onClick={() => setLessonForm(null)}
                            >
                                CANCEL
                            </ModernButton>
                            <ModernButton
                                variant="primary"
                                fullWidth
                                disabled={!lessonForm.cause || !lessonForm.resolution}
                                onClick={async () => {
                                    await recordLessonLearned(lessonForm);
                                    setLessonForm(null);
                                }}
                            >
                                ARCHIVE TO LEDGER
                            </ModernButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
