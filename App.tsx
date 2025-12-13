import React, { useState, useEffect } from 'react';
import { HashRouter, useLocation, useNavigate, Outlet, Route, Routes } from 'react-router-dom';

// --- IMPORTI KONTEKSTA ---
import { NavigationProvider } from './contexts/NavigationContext.tsx';
import { QuestionnaireProvider } from './contexts/QuestionnaireContext.tsx';
import { RiskProvider } from './contexts/RiskContext.tsx';
import { ToastProvider } from './contexts/ToastContext.tsx';

// --- IMPORT NOVIH RUTA (POPRAVLJENA PUTANJA) ---
// Budući da je App.tsx u rootu, a AppRoutes u src/routes, moramo ući u src
import { AppRoutes } from './src/routes/AppRoutes.tsx';

import type { AppView } from './types.ts';
import { TURBINE_CATEGORIES } from './constants.ts';

// --- GLOBALNE KOMPONENTE ---
import { Feedback } from './components/Feedback.tsx';
import { Onboarding } from './components/Onboarding.tsx';
import { InterventionCTA } from './components/InterventionCTA.tsx';
import bgImage from './digital_cfd_mesh.png';

// --- POMOĆNA FUNKCIJA ZA NASLOVE ---
const getHeaderInfo = (pathname: string): { title: string; subtitle: string } => {
    const path = pathname.startsWith('/') ? pathname.slice(1) : pathname;

    if (path.startsWith('turbine/')) {
        const turbineKey = path.split('/')[1];
        const turbineName = TURBINE_CATEGORIES[turbineKey]?.name || 'Turbine';
        return {
            title: `Details: ${turbineName} Turbine`,
            subtitle: "A technical overview focused on components critical to LCC and vulnerable to the Execution Gap."
        };
    }

    const titles: Record<string, {title: string, subtitle: string}> = {
        '': { title: 'AnoHUB', subtitle: "Your center for enforcing the Standard of Excellence in hydropower." },
        'risk-assessment': { title: 'HPP Risk Assessment', subtitle: "A diagnostic tool to quantify the Execution Gap and identify systemic risks." },
        'investor-briefing': { title: 'Investor Briefing', subtitle: "Technical review ensuring KPIs are based on realistic risk assessment." },
        'standard-of-excellence': { title: 'THE STANDARD OF EXCELLENCE', subtitle: "Masterclass modules for eliminating the Execution Gap." },
        'digital-introduction': { title: 'Digital Introduction', subtitle: "Core principles: enforcing the 0.05 mm/m precision mandate." },
        'hpp-improvements': { title: 'HPP Ino-Hub', subtitle: "Collaborative hub for innovations supporting LCC Optimization." },
        'installation-guarantee': { title: 'Installation Standard', subtitle: "Non-negotiable protocol for closing the Execution Gap during assembly." },
        'gender-equity': { title: 'Gender Equity', subtitle: "Eliminating the 'Execution Gap' in human capital." },
        'hpp-builder': { title: 'HPP Power Calculator', subtitle: "Interactive HPP configuration guided by LCC Optimization principles." },
        'phase-guide': { title: 'Project Phase Guide', subtitle: "Enforcing the Three Postulates: Precision, Risk Mitigation, and Ethics." },
        'suggestion-box': { title: 'Suggestion & Idea Log', subtitle: "Share ideas for improving protocols." },
        'river-wildlife': { title: 'River & Wildlife Stewardship', subtitle: "Ethical mandate for Ecosystem Protection and E-Flow." },
        'questionnaire-summary': { title: 'Execution Gap Analysis', subtitle: "Linking operational symptoms to failures in discipline." },
        'revitalization-strategy': { title: 'Revitalization Strategy', subtitle: "Framework for closing the M-E Synergy Gap in legacy assets." },
        'digital-integrity': { title: 'Digital Integrity', subtitle: "Immutable ledger providing irrefutable proof of discipline." },
        'contract-management': { title: 'Contract & Legal Risk', subtitle: "Legally mandating precision standards to protect warranty." },
    };

    return titles[path] || { title: 'AnoHUB', subtitle: "Standard of Excellence" };
};

// --- LAYOUT KOMPONENTA ---
const AppLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);

    const { title, subtitle } = getHeaderInfo(location.pathname);
    const isHub = location.pathname === '/';

    useEffect(() => {
        const hasCompleted = localStorage.getItem('hasCompletedOnboarding') === 'true';
        if (!hasCompleted) setShowOnboarding(true);
    }, []);

    const handleOnboardingComplete = () => {
        localStorage.setItem('hasCompletedOnboarding', 'true');
        setShowOnboarding(false);
    };

    const navigationContextValue = {
        navigateTo: (view: AppView) => {
            const routeMap: Record<string, string> = {
                'hub': '/', 'riskAssessment': '/risk-assessment', 'investorBriefing': '/investor-briefing',
                'standardOfExcellence': '/standard-of-excellence', 'digitalIntroduction': '/digital-introduction',
                'hppImprovements': '/hpp-improvements', 'installationGuarantee': '/installation-guarantee',
                'genderEquity': '/gender-equity', 'hppBuilder': '/hpp-builder', 'phaseGuide': '/phase-guide',
                'suggestionBox': '/suggestion-box', 'riverWildlife': '/river-wildlife',
                'questionnaireSummary': '/questionnaire-summary', 'revitalizationStrategy': '/revitalization-strategy',
                'digitalIntegrity': '/digital-integrity', 'contractManagement': '/contract-management',
                'turbineDetail': '/turbine'
            };
            navigate(routeMap[view] || '/');
        },
        navigateBack: () => navigate(-1),
        navigateToHub: () => navigate('/'),
        navigateToTurbineDetail: (turbineKey: string) => navigate(`/turbine/${turbineKey}`),
        showFeedbackModal: () => setIsFeedbackVisible(true),
    };

    return (
        <NavigationProvider value={navigationContextValue}>
            <div className="min-h-screen text-slate-200 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans print-container"
                style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.95)), url(${bgImage})`,
                    backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', backgroundRepeat: 'no-repeat'
                }}
            >
                {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}

                <div className="w-full max-w-6xl mx-auto flex-grow flex flex-col">
                    <header className="text-center mb-8 no-print relative">
                        {!isHub && (
                            <button onClick={() => navigate(-1)} className="absolute left-0 top-4 flex items-center space-x-2 text-slate-400 hover:text-cyan-400 transition-colors z-20">
                                <span className="text-2xl">←</span> <span className="hidden sm:inline">Back</span>
                            </button>
                        )}
                        <button onClick={() => navigate('/')} className="absolute right-0 top-4 flex items-center space-x-2 text-slate-400 hover:text-cyan-400 transition-colors z-20">
                            <span className="hidden sm:inline text-sm font-semibold">HOME</span> <span className="text-xl">🏠</span>
                        </button>

                        <div className="py-4">
                            <h1 onClick={() => navigate('/')} className="text-4xl sm:text-5xl font-bold text-cyan-400 cursor-pointer hover:text-cyan-300 transition-colors inline-block">{title}</h1>
                            <p className="mt-2 text-lg text-slate-400 max-w-3xl mx-auto">{subtitle}</p>
                        </div>
                    </header>

                    <main className="bg-slate-800/80 rounded-xl shadow-2xl p-6 sm:p-8 transition-all duration-500 print-main backdrop-blur-md border border-slate-700/50 flex-grow">
                        {/* OVDJE SE UČITAVAJU RUTE */}
                        <Outlet /> 
                    </main>

                    <footer className="text-center mt-8 text-sm text-slate-500 no-print">
                        <p>&copy; {new Date().getFullYear()} Strategic Risk Mitigation. All rights reserved.</p>
                    </footer>
                </div>

                <InterventionCTA />

                <button onClick={() => setIsFeedbackVisible(true)} className="fixed bottom-6 right-6 bg-cyan-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-cyan-500 transition-all transform hover:-translate-y-1 z-50 flex items-center space-x-2 no-print">
                    <span>💬</span> <span className="font-semibold hidden sm:inline">Feedback</span>
                </button>

                {isFeedbackVisible && <Feedback onClose={() => setIsFeedbackVisible(false)} />}
            </div>
        </NavigationProvider>
    );
};

// --- GLAVNA APP KOMPONENTA ---
const App: React.FC = () => {
  return (
    <QuestionnaireProvider>
      <RiskProvider>
        <ToastProvider>
            <HashRouter>
                <Routes>
                    <Route path="/" element={<AppLayout />}>
                        {/* SVE RUTE SU SADA U AppRoutes */}
                        <Route path="*" element={<AppRoutes />} />
                    </Route>
                </Routes>
            </HashRouter>
        </ToastProvider>
      </RiskProvider>
    </QuestionnaireProvider>
  );
};

export default App;