import React, { useState, useEffect } from 'react';
import { ModernButton } from './ui/ModernButton.tsx'; // <--- UI Kit

interface OnboardingProps {
    onComplete: () => void;
}

const onboardingSteps = [
    {
        icon: '👋',
        title: 'Welcome to AnoHUB',
        subtitle: 'Systemic Risk & Excellence Platform',
        content: "Your central command for strategic hydropower management. We bridge the gap between engineering precision and operational reality.",
    },
    {
        icon: '🛠️',
        title: 'Strategic Arsenal',
        subtitle: 'Tools for Zero-Tolerance',
        content: "Access the 'Risk Assessment Tool' to quantify the Execution Gap and the 'Installation Standard' to enforce the 0.05 mm/m mandate.",
    },
    {
        icon: '⚡',
        title: 'Innovation Engine',
        subtitle: 'Configure & Optimize',
        content: "Model power output with the 'HPP Calculator' and capture breakthrough ideas in the 'Ino-Hub'. Innovation meets discipline.",
    },
    {
        icon: '🚀',
        title: 'Systems Online',
        subtitle: 'Ready for Deployment',
        content: 'The platform is calibrated and ready. Engage with the tools to secure your warranty and optimize Life Cycle Costs.',
    },
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [isExiting, setIsExiting] = useState(false);

    const handleComplete = () => {
        setIsExiting(true);
        setTimeout(onComplete, 300);
    };

    const nextStep = () => {
        if (step < onboardingSteps.length - 1) {
            setStep(s => s + 1);
        } else {
            handleComplete();
        }
    };

    const prevStep = () => {
        if (step > 0) {
            setStep(s => s - 1);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleComplete();
            if (e.key === 'ArrowRight') nextStep();
            if (e.key === 'ArrowLeft') prevStep();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [step]);

    const currentData = onboardingSteps[step];

    return (
        <div 
            className={`
                fixed inset-0 z-[200] flex items-center justify-center p-4
                bg-[#020617]/90 backdrop-blur-md transition-opacity duration-500
                ${isExiting ? 'opacity-0' : 'opacity-100 animate-fade-in'}
            `}
            role="dialog"
            aria-modal="true"
        >
            <div className={`
                relative w-full max-w-lg bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl shadow-black/50
                overflow-hidden transition-all duration-500 transform
                ${isExiting ? 'scale-95 translate-y-4' : 'scale-100 translate-y-0 animate-scale-in'}
            `}>
                
                {/* Background Decor */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none animate-pulse-glow"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }}></div>

                {/* Skip Button */}
                <button 
                    onClick={handleComplete}
                    className="absolute top-6 right-6 text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors z-20"
                >
                    Skip Intro
                </button>

                <div className="p-10 pb-8 text-center relative z-10">
                    {/* Animated Icon Container */}
                    <div className="mx-auto w-28 h-28 mb-8 flex items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900 rounded-full border border-slate-700 shadow-xl group relative">
                        <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <span className="text-6xl filter drop-shadow-lg transform transition-transform duration-500 group-hover:scale-110 select-none relative z-10">
                            {currentData.icon}
                        </span>
                    </div>

                    {/* Text Content */}
                    <div className="min-h-[140px] flex flex-col justify-center animate-fade-in" key={step}>
                        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                            {currentData.title}
                        </h2>
                        <p className="text-cyan-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">
                            {currentData.subtitle}
                        </p>
                        <p className="text-slate-400 text-base leading-relaxed font-light">
                            {currentData.content}
                        </p>
                    </div>
                </div>

                {/* Progress Bar & Footer */}
                <div className="bg-slate-950/50 p-8 border-t border-slate-800">
                    
                    {/* Step Indicators */}
                    <div className="flex justify-center gap-2 mb-8">
                        {onboardingSteps.map((_, index) => (
                            <div 
                                key={index}
                                className={`
                                    h-1.5 rounded-full transition-all duration-500 ease-out
                                    ${index === step ? 'w-12 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'w-2 bg-slate-800'}
                                `}
                            />
                        ))}
                    </div>

                    {/* Controls */}
                    <div className="flex justify-between items-center">
                        <button
                            onClick={prevStep}
                            disabled={step === 0}
                            className={`
                                text-xs font-bold uppercase tracking-widest px-4 py-2 transition-colors
                                ${step === 0 ? 'text-slate-800 cursor-default' : 'text-slate-500 hover:text-white'}
                            `}
                        >
                            Back
                        </button>

                        <ModernButton
                            onClick={nextStep}
                            variant="primary"
                            className="px-8 shadow-lg shadow-cyan-500/20"
                        >
                            {step === onboardingSteps.length - 1 ? 'Initialize System' : 'Next'}
                        </ModernButton>
                    </div>
                </div>

            </div>
        </div>
    );
};