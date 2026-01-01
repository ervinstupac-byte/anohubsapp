import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowDown, CheckCircle, XCircle, Play, Pause, AlertTriangle } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';

export const StartupFlowchart: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);

    const steps = [
        { id: 1, key: 'step1', type: 'check', next: 2, fail: 'stop' },
        { id: 2, key: 'step2', type: 'check', next: 3, fail: 'leak' },
        { id: 3, key: 'step3', type: 'action', next: 4 },
        { id: 4, key: 'step4', type: 'decision', next: 5, fail: 'abort' },
        { id: 5, key: 'step5', type: 'action', next: 6 },
        { id: 6, key: 'step6', type: 'action', next: 7 }
    ];

    const handleStepClick = (id: number) => {
        if (id === activeStep + 1 || (activeStep === 0 && id === 1)) {
            setActiveStep(id);
        }
    };

    const VerticalConnector = ({ active }: { active: boolean }) => (
        <div className={`w-[2px] h-10 my-1 transition-colors duration-500 ${active ? 'bg-cyan-500' : 'bg-slate-700'}`}></div>
    );

    const StepNode = ({ step, index }: { step: any, index: number }) => {
        const isActive = activeStep >= step.id;
        const isCurrent = activeStep === step.id;

        // Colors based on type
        let borderColor = 'border-slate-700';
        let iconColor = 'text-slate-500';

        if (isActive) {
            if (step.type === 'check') { borderColor = 'border-purple-500'; iconColor = 'text-purple-400'; }
            if (step.type === 'action') { borderColor = 'border-blue-500'; iconColor = 'text-blue-400'; }
            if (step.type === 'decision') { borderColor = 'border-amber-500'; iconColor = 'text-amber-400'; }
        }

        return (
            <div className="flex flex-col items-center">
                {/* Step Card */}
                <div
                    onClick={() => handleStepClick(step.id)}
                    className={`
                        relative w-[340px] p-5 rounded-lg border-2 transition-all duration-300 cursor-pointer
                        ${borderColor}
                        ${isActive ? 'bg-slate-800/90 shadow-[0_0_20px_rgba(0,0,0,0.3)]' : 'bg-slate-900/40 opacity-50'}
                        ${isCurrent ? 'scale-105 shadow-[0_0_25px_rgba(14,165,233,0.15)]' : ''}
                        hover:bg-slate-800
                    `}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase mb-1 bg-slate-900 inline-block px-2 py-0.5 rounded">
                                {t('francis.startupFlowchart.step_label').replace('1', step.id.toString())}
                            </div>
                            <h3 className={`font-bold mb-2 ${isActive ? 'text-white' : 'text-slate-400'}`}>
                                {t(`francis.startupFlowchart.${step.key}.title`)}
                            </h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                {t(`francis.startupFlowchart.${step.key}.desc`)}
                            </p>
                        </div>
                        {/* Status Icon */}
                        {isActive && (
                            <CheckCircle className={`w-6 h-6 ${iconColor}`} />
                        )}
                    </div>

                    {/* Decision Buttons (Only for current step or active checks) */}
                    {(step.type === 'check' || step.type === 'decision') && (
                        <div className={`mt-4 pt-3 border-t border-slate-700/50 flex gap-4 text-xs font-bold transition-opacity ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                            <div className="flex items-center gap-1 text-green-500">
                                <CheckCircle className="w-3 h-3" />
                                {step.key === 'step4' ? t('francis.startupFlowchart.decisions.yesEqualized') : t('francis.startupFlowchart.decisions.yes')}
                            </div>
                            <div className="flex items-center gap-1 text-red-500">
                                <XCircle className="w-3 h-3" />
                                {step.fail === 'leak' ? t('francis.startupFlowchart.decisions.noLeak') :
                                    step.fail === 'abort' ? t('francis.startupFlowchart.decisions.noAbort') :
                                        t('francis.startupFlowchart.decisions.noStop')}
                            </div>
                        </div>
                    )}
                </div>

                {/* Arrow */}
                <VerticalConnector active={activeStep > step.id} />
                <ArrowDown className={`w-4 h-4 mb-4 ${activeStep > step.id ? 'text-cyan-500' : 'text-slate-700'}`} />
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#020617] p-4 md:p-8 font-mono text-slate-300">
            <div className="max-w-3xl mx-auto flex flex-col items-center">

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-2">
                        {t('francis.startupFlowchart.title')}
                    </h1>
                    <p className="text-slate-500 text-sm">
                        {t('francis.startupFlowchart.subtitle')}
                    </p>
                </div>

                {/* START NODE */}
                <div
                    onClick={() => setActiveStep(1)}
                    className={`
                        w-16 h-16 rounded-full flex items-center justify-center font-bold text-white cursor-pointer transition-all duration-300
                        ${activeStep > 0 ? 'bg-green-500 shadow-[0_0_20px_#22c55e]' : 'bg-slate-700 hover:bg-green-600'}
                    `}
                >
                    {activeStep > 0 ? <Play className="w-6 h-6 fill-current" /> : 'START'}
                </div>
                <VerticalConnector active={activeStep > 0} />
                <ArrowDown className={`w-4 h-4 mb-4 ${activeStep > 0 ? 'text-cyan-500' : 'text-slate-700'}`} />

                {/* STEPS LOOP */}
                {steps.map((step, index) => (
                    <StepNode key={step.id} step={step} index={index} />
                ))}

                {/* END NODE - RUN */}
                <div className={`
                    w-20 h-20 mt-4 rounded-full flex items-center justify-center font-black text-white text-lg transition-all duration-500
                    ${activeStep === 7 ? 'bg-blue-600 shadow-[0_0_30px_#2563eb] scale-110' : 'bg-slate-800 border-2 border-slate-700'}
                `}>
                    {t('francis.startupFlowchart.run')}
                </div>

                {/* Footer */}
                <button
                    onClick={() => navigate(FRANCIS_PATHS.HUB)}
                    className="mt-16 text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest"
                >
                    ← {t('francis.startupFlowchart.backBtn')}
                </button>

            </div>
        </div>
    );
};
