import React, { useState } from 'react';

interface OnboardingProps {
  onComplete: () => void;
}

const onboardingSteps = [
  {
    icon: '👋',
    title: 'Welcome to AnoHUB!',
    content: "This is your central hub for strategic hydropower plant (HPP) risk management and operational excellence. Let's take a quick tour of the key features.",
  },
  {
    icon: '🛠️',
    title: 'Core Strategic Tools',
    content: "Explore powerful resources like the 'Risk Assessment Tool' to diagnose operational issues, the 'Project Phase Guide' for lifecycle management, and the 'Installation Standard' for flawless execution.",
  },
  {
    icon: '💡',
    title: 'Interactive & Innovative Features',
    content: "Use the 'HPP Power Calculator' to estimate plant output and explore turbine recommendations. Capture and develop your ideas in the 'HPP Ino-Hub'.",
  },
  {
    icon: '🚀',
    title: "You're Ready to Go!",
    content: 'All tools and resources are now at your fingertips. Dive in and start exploring the path to operational excellence.',
  },
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const nextStep = () => {
    if (step < onboardingSteps.length - 1) {
      setStep(s => s + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(s => s - 1);
    }
  };

  const currentStepData = onboardingSteps[step];

  return (
    <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
    >
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md m-4 text-center transform scale-95 animate-scale-in">
        <button 
          onClick={onComplete}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
          aria-label="Skip Onboarding"
        >
          Skip
        </button>

        <div className="text-5xl mb-4">{currentStepData.icon}</div>
        
        <h2 id="onboarding-title" className="text-2xl font-bold text-white mb-2">
          {currentStepData.title}
        </h2>
        
        <p className="text-slate-400 mb-8 min-h-[72px]">
          {currentStepData.content}
        </p>

        {/* Progress Dots */}
        <div className="flex justify-center space-x-2 mb-8">
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                step === index ? 'bg-cyan-400' : 'bg-slate-600'
              }`}
            ></div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            className={`px-4 py-2 font-bold rounded-lg bg-slate-600 hover:bg-slate-500 text-white transition-opacity ${step === 0 ? 'opacity-0 cursor-default' : 'opacity-100'}`}
            disabled={step === 0}
          >
            Back
          </button>
          <button
            onClick={nextStep}
            className="px-8 py-3 text-lg font-bold rounded-lg transition-colors bg-cyan-600 hover:bg-cyan-500 text-white"
          >
            {step === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};