import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowDown, CheckCircle, XCircle, Play, Pause, AlertTriangle, ArrowLeft, ShieldCheck, Timer, Cpu, Zap, Activity } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';
import { useCerebro } from '../../contexts/ProjectContext';
import { GlassCard } from '../ui/GlassCard';
import { NeuralPulse } from '../ui/NeuralPulse';

export const StartupFlowchart: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { state } = useCerebro();
    const [activeStep, setActiveStep] = useState(0);

    const steps = [
        { id: 1, key: 'step1', type: 'check', next: 2, fail: 'stop', icon: ShieldCheck },
        { id: 2, key: 'step2', type: 'check', next: 3, fail: 'leak', icon: Activity },
        { id: 3, key: 'step3', type: 'action', next: 4, icon: Zap },
        { id: 4, key: 'step4', type: 'decision', next: 5, fail: 'abort', icon: Cpu },
        { id: 5, key: 'step5', type: 'action', next: 6, icon: Timer },
        { id: 6, key: 'step6', type: 'action', next: 7, icon: ShieldCheck }
    ];

    const handleStepClick = (id: number) => {
        if (id === activeStep + 1 || (activeStep === 0 && id === 1)) {
            setActiveStep(id);
        }
    };

    const VerticalConnector = ({ active, current }: { active: boolean, current: boolean }) => (
        <div className="relative w-1.5 h-16 my-2 group">
            <div className={`absolute inset-0 w-full h-full rounded-full transition-all duration-1000 ${active ? 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-slate-900 border-x border-white/5'}`} />
            {current && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-cyan-400 rounded-full animate-ping opacity-40" />}
        </div>
    );

    const StepNode = ({ step, index }: { step: any, index: number }) => {
        const isActive = activeStep >= step.id;
        const isCurrent = activeStep === step.id;
        const Icon = step.icon;

        // Custom styling based on state
        let cardStyle = isActive ? 'bg-slate-900/60 border-cyan-500 shadow-2xl' : 'bg-black/40 border-white/5 opacity-40';
        if (isCurrent) cardStyle += ' scale-105 border-2 shadow-[0_0_40px_rgba(34,211,238,0.2)] z-10';

        return (
            <div className="flex flex-col items-center group/node">
                <div
                    onClick={() => handleStepClick(step.id)}
                    className={`relative w-[450px] p-10 rounded-[3rem] border transition-all duration-700 cursor-pointer backdrop-blur-md ${cardStyle}`}
                >
                    <div className="flex justify-between items-start gap-8">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border italic transition-colors ${isActive ? 'bg-cyan-950 text-cyan-500 border-cyan-800' : 'bg-slate-900 text-slate-600 border-white/5'}`}>
                                    {t('francis.startupFlowchart.step_label').replace('1', step.id.toString())}
                                </span>
                                {isCurrent && <NeuralPulse color="cyan" />}
                            </div>
                            <h3 className={`text-2xl font-black uppercase tracking-tighter mb-4 italic transition-colors ${isActive ? 'text-white' : 'text-slate-700'}`}>
                                {t(`francis.startupFlowchart.${step.key}.title`)}
                            </h3>
                            <p className={`text-sm font-bold italic transition-colors leading-relaxed uppercase tracking-tighter ${isActive ? 'text-slate-400' : 'text-slate-800'}`}>
                                {t(`francis.startupFlowchart.${step.key}.desc`)}
                            </p>
                        </div>

                        <div className={`p-6 rounded-[2rem] border transition-all duration-700 ${isActive ? 'bg-cyan-600 text-white shadow-xl rotate-0' : 'bg-slate-900 text-slate-800 border-white/5 rotate-12'}`}>
                            <Icon className="w-10 h-10" />
                        </div>
                    </div>

                    {(step.type === 'check' || step.type === 'decision') && (
                        <div className={`mt-10 pt-8 border-t border-white/5 flex gap-8 text-[11px] font-black uppercase tracking-widest transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="flex items-center gap-3 text-emerald-500 italic bg-emerald-950/20 px-6 py-2 rounded-2xl border border-emerald-900/30">
                                <CheckCircle className="w-4 h-4" />
                                {step.key === 'step4' ? t('francis.startupFlowchart.decisions.yesEqualized') : t('francis.startupFlowchart.decisions.yes')}
                            </div>
                            <div className="flex items-center gap-3 text-red-500 italic bg-red-950/10 px-6 py-2 rounded-2xl border border-red-900/20 opacity-40 hover:opacity-100 transition-opacity">
                                <XCircle className="w-4 h-4" />
                                {step.fail === 'leak' ? t('francis.startupFlowchart.decisions.noLeak') :
                                    step.fail === 'abort' ? t('francis.startupFlowchart.decisions.noAbort') :
                                        t('francis.startupFlowchart.decisions.noStop')}
                            </div>
                        </div>
                    )}
                </div>

                {index < steps.length - 1 && (
                    <VerticalConnector active={activeStep > step.id} current={activeStep === step.id} />
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-24">
            {/* Header */}
            <header className="bg-black/40 border-b-2 border-cyan-900 py-8 px-4 md:px-8 mb-16 sticky top-0 z-50 backdrop-blur-md shadow-2xl transition-all">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="p-4 bg-cyan-600 rounded-3xl border border-white/10 shadow-lg relative group overflow-hidden">
                            <Play className="text-white w-8 h-8 relative z-10 animate-pulse fill-current" />
                        </div>
                        <div>
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-500 text-[10px] font-black border border-cyan-900/50 uppercase tracking-widest">SOP-LIFE-001</span>
                                <NeuralPulse color="cyan" />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase relative z-10">
                                {t('francis.startupFlowchart.title')}
                            </h1>
                            <p className="text-[10px] text-cyan-500/70 font-black uppercase tracking-[0.2em] italic mt-1">
                                Sequential Operational Readiness Matrix
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-black text-slate-400 hover:text-white hover:bg-white/10 transition group uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4 text-cyan-500 group-hover:-translate-x-1 transition" />
                        <span>{t('francis.startupFlowchart.backBtn')}</span>
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 flex flex-col items-center">

                {/* START NODE */}
                <button
                    onClick={() => setActiveStep(1)}
                    className={`
                        w-24 h-24 rounded-[2.5rem] flex items-center justify-center font-black text-white transition-all duration-700 relative group overflow-hidden
                        ${activeStep > 0 ? 'bg-emerald-600 shadow-[0_0_50px_rgba(16,185,129,0.4)] scale-90' : 'bg-slate-900 border-2 border-white/10 hover:border-cyan-500 hover:scale-110 shadow-2xl'}
                    `}
                >
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {activeStep > 0 ? <ShieldCheck className="w-10 h-10" /> : <Play className="w-10 h-10 fill-current" />}
                </button>

                <VerticalConnector active={activeStep > 0} current={activeStep === 0} />

                {/* STEPS LOOP */}
                {steps.map((step, index) => (
                    <StepNode key={step.id} step={step} index={index} />
                ))}

                <VerticalConnector active={activeStep === 7} current={activeStep === 6} />

                {/* FINAL RUN NODE */}
                <div className={`
                    w-40 h-40 mt-8 rounded-[4rem] flex flex-col items-center justify-center font-black transition-all duration-1000 border-4 relative overflow-hidden group
                    ${activeStep === 7 ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_80px_rgba(37,99,235,0.4)] scale-110' : 'bg-black/40 border-white/5 text-slate-800 opacity-20'}
                `}>
                    <div className="absolute inset-0 bg-white/10 animate-pulse opacity-0 group-hover:opacity-100" />
                    <Zap className={`w-12 h-12 mb-2 ${activeStep === 7 ? 'animate-bounce' : ''}`} />
                    <span className="text-xl tracking-tighter uppercase italic">{t('francis.startupFlowchart.run')}</span>
                    {activeStep === 7 && <NeuralPulse color="white" />}
                </div>

                {/* Reset Control */}
                {activeStep > 0 && (
                    <button
                        onClick={() => setActiveStep(0)}
                        className="mt-24 px-8 py-3 bg-red-950/20 border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-[0.4em] rounded-full hover:bg-red-600 hover:text-white transition-all italic"
                    >
                        Emergency Logic Reset
                    </button>
                )}

            </main>
        </div>
    );
};
