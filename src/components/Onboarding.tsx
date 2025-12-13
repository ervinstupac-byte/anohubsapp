import React, { useState, useEffect } from 'react';

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
        setTimeout(onComplete, 300); // Čekamo da završi izlazna animacija
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

    // Close on Escape
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
                fixed inset-0 z-[100] flex items-center justify-center p-4
                bg-slate-900/90 backdrop-blur-md transition-opacity duration-300
                ${isExiting ? 'opacity-0' : 'opacity-100 animate-fade-in'}
            `}
            role="dialog"
            aria-modal="true"
        >
            <div className={`
                relative w-full max-w-lg bg-slate-800 border border-slate-700 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] 
                overflow-hidden transition-all duration-300 transform
                ${isExiting ? 'scale-95' : 'scale-100 animate-scale-in'}
            `}>
                
                {/* Background Decor */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

                {/* Skip Button */}
                <button 
                    onClick={handleComplete}
                    className="absolute top-4 right-4 text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors z-10"
                >
                    Skip Intro
                </button>

                <div className="p-8 pb-6 text-center relative z-10">
                    {/* Animated Icon Container */}
                    <div className="mx-auto w-24 h-24 mb-6 flex items-center justify-center bg-slate-900/50 rounded-full border border-slate-700 shadow-inner group">
                        <span className="text-5xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] transform transition-transform duration-500 group-hover:scale-110">
                            {currentData.icon}
                        </span>
                    </div>

                    {/* Text Content */}
                    <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">
                        {currentData.title}
                    </h2>
                    <p className="text-cyan-400 text-sm font-bold uppercase tracking-wider mb-6">
                        {currentData.subtitle}
                    </p>
                    
                    <p className="text-slate-300 text-base leading-relaxed h-20 mb-4">
                        {currentData.content}
                    </p>
                </div>

                {/* Progress Bar & Footer */}
                <div className="bg-slate-900/50 p-6 border-t border-slate-700/50">
                    
                    {/* Step Indicators */}
                    <div className="flex justify-center gap-2 mb-6">
                        {onboardingSteps.map((_, index) => (
                            <div 
                                key={index}
                                className={`
                                    h-1.5 rounded-full transition-all duration-300 
                                    ${index === step ? 'w-8 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'w-2 bg-slate-700'}
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
                                text-sm font-bold px-4 py-2 rounded-lg transition-colors
                                ${step === 0 ? 'text-slate-700 cursor-default' : 'text-slate-400 hover:text-white hover:bg-slate-800'}
                            `}
                        >
                            Back
                        </button>

                        <button
                            onClick={nextStep}
                            className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-2.5 px-8 rounded-lg shadow-lg hover:shadow-cyan-500/25 hover:-translate-y-0.5 transition-all duration-300"
                        >
                            {step === onboardingSteps.length - 1 ? 'Initialize System' : 'Next'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};