import React, { useState, useEffect, Suspense } from 'react';
import { HashRouter, useLocation, useNavigate, Outlet, Route, Routes, useParams } from 'react-router-dom';

// --- IMPORTI KONTEKSTA ---
import { NavigationProvider } from './contexts/NavigationContext.tsx';
import { QuestionnaireProvider } from './contexts/QuestionnaireContext.tsx';
import { RiskProvider } from './contexts/RiskContext.tsx';
import { ToastProvider } from './contexts/ToastContext.tsx';

// --- IMPORTI KOMPONENTI (EAGER) ---
import { Feedback } from './components/Feedback.tsx';
import { Onboarding } from './components/Onboarding.tsx';
import { InterventionCTA } from './components/InterventionCTA.tsx';
import { Spinner } from './components/Spinner.tsx';

// --- IMPORT SLIKE ---
import bgImage from './assets/digital_cfd_mesh.png'; 

import type { AppView } from './types.ts';
import { TURBINE_CATEGORIES } from './constants.ts';

// --- LAZY LOADING (ZA BRŽE PERFORMANSE) ---
const Hub = React.lazy(() => import('./components/Hub.tsx').then(m => ({ default: m.Hub })));
const Questionnaire = React.lazy(() => import('./components/Questionnaire.tsx').then(m => ({ default: m.default })));
const QuestionnaireSummary = React.lazy(() => import('./components/QuestionnaireSummary.tsx'));
const InvestorBriefing = React.lazy(() => import('./components/InvestorBriefing.tsx').then(m => ({ default: m.InvestorBriefing })));
const StandardOfExcellence = React.lazy(() => import('./components/StandardOfExcellence.tsx'));
const DigitalIntroduction = React.lazy(() => import('./components/DigitalIntroduction.tsx'));
const HPPImprovements = React.lazy(() => import('./components/HPPImprovements.tsx'));
const InstallationGuarantee = React.lazy(() => import('./components/InstallationGuarantee.tsx'));
const GenderEquity = React.lazy(() => import('./components/GenderEquity.tsx'));
const HPPBuilder = React.lazy(() => import('./components/HPPBuilder.tsx'));
const TurbineDetail = React.lazy(() => import('./components/TurbineDetail.tsx'));
const ProjectPhaseGuide = React.lazy(() => import('./components/ProjectPhaseGuide.tsx'));
const SuggestionBox = React.lazy(() => import('./components/SuggestionBox.tsx'));
const RiverWildlife = React.lazy(() => import('./components/RiverWildlife.tsx'));
const RevitalizationStrategy = React.lazy(() => import('./components/RevitalizationStrategy.tsx'));
const DigitalIntegrity = React.lazy(() => import('./components/DigitalIntegrity.tsx'));
const ContractManagement = React.lazy(() => import('./components/ContractManagement.tsx'));
const GlobalMap = React.lazy(() => import('./components/GlobalMap.tsx').then(m => ({ default: m.GlobalMap })));

// --- WRAPPERS ---
const TurbineDetailWrapper = () => {
    const { id } = useParams();
    if (!id) return <div className="text-center text-slate-400 mt-10">Turbine not found</div>;
    return <TurbineDetail turbineKey={id} />;
};

const QuestionnaireWrapper = () => {
    // Koristimo window.location.hash jer lazy loading i router ponekad trebaju eksplicitni push
    return <Questionnaire onShowSummary={() => window.location.hash = '#/questionnaire-summary'} />;
};

// --- HEADER LOGIC ---
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
        'global-map': { title: 'Global Asset Map', subtitle: 'Geospatial intelligence and live status monitoring.' },
    };
    return titles[path] || { title: 'AnoHUB', subtitle: "Standard of Excellence" };
};

// --- LAYOUT ---
const AppLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const { title, subtitle } = getHeaderInfo(location.pathname);
    const isHub = location.pathname === '/' || location.pathname === '';

    useEffect(() => {
        const hasCompleted = localStorage.getItem('hasCompletedOnboarding') === 'true';
        if (!hasCompleted) setShowOnboarding(true);
    }, []);

    const handleOnboardingComplete = () => {
        localStorage.setItem('hasCompletedOnboarding', 'true');
        setShowOnboarding(false);
    };

    // --- EXTERNAL LINK LOGIC (NOVO) ---
    const goToExternalHome = () => {
        window.location.href = 'https://www.anohubs.com/index.html';
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
                        'digitalIntegrity': '/digital-integrity', 'globalMap': '/global-map', 'contractManagement': '/contract-management',
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
                        {/* BACK BUTTON (samo ako nismo na Hub-u) */}
                        {!isHub && (
                            <button onClick={() => navigate(-1)} className="absolute left-0 top-4 flex items-center space-x-2 text-slate-400 hover:text-cyan-400 transition-colors z-20">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                <span className="hidden sm:inline">Back</span>
                            </button>
                        )}

                        {/* EXTERNAL HOME BUTTON */}
                        <button onClick={goToExternalHome} className="absolute right-0 top-4 flex items-center space-x-2 text-slate-400 hover:text-cyan-400 transition-colors z-20" title="Return to Main Website">
                            <span className="hidden sm:inline text-sm font-semibold">MAIN SITE</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </button>

                        <div className="py-4">
                            {/* EXTERNAL LINK ON TITLE */}
                            <h1 
                                onClick={goToExternalHome} 
                                className="text-4xl sm:text-5xl font-bold text-cyan-400 cursor-pointer hover:text-cyan-300 transition-colors inline-block"
                                title="Go to Anohubs Main Page"
                            >
                                {title}
                            </h1>
                            <p className="mt-2 text-lg text-slate-400 max-w-3xl mx-auto">{subtitle}</p>
                        </div>
                    </header>

                    <main className="bg-slate-800/80 rounded-xl shadow-2xl p-6 sm:p-8 transition-all duration-500 print-main backdrop-blur-md border border-slate-700/50 flex-grow">
                        <Suspense fallback={
                            <div className="flex flex-col items-center justify-center h-64">
                                <Spinner />
                                <p className="text-slate-400 mt-4 animate-pulse">Loading Module...</p>
                            </div>
                        }>
                            <Outlet />
                        </Suspense>
                    </main>

                    <footer className="text-center mt-8 text-sm text-slate-500 no-print">
                        <p>&copy; {new Date().getFullYear()} Strategic Risk Mitigation. All rights reserved.</p>
                    </footer>
                </div>

                <InterventionCTA />
                
                <button onClick={() => setIsFeedbackVisible(true)} className="fixed bottom-6 right-6 bg-cyan-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-cyan-500 transition-all transform hover:-translate-y-1 z-50 flex items-center space-x-2 no-print">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="font-semibold hidden sm:inline">Feedback</span>
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
                        <Route index element={<Hub />} />
                        <Route path="risk-assessment" element={<QuestionnaireWrapper />} />
                        <Route path="questionnaire-summary" element={<QuestionnaireSummary />} />
                        <Route path="investor-briefing" element={<InvestorBriefing turbineCategories={TURBINE_CATEGORIES} />} />
                        <Route path="standard-of-excellence" element={<StandardOfExcellence />} />
                        <Route path="digital-introduction" element={<DigitalIntroduction />} />
                        <Route path="hpp-improvements" element={<HPPImprovements />} />
                        <Route path="installation-guarantee" element={<InstallationGuarantee />} />
                        <Route path="gender-equity" element={<GenderEquity />} />
                        <Route path="hpp-builder" element={<HPPBuilder />} />
                        <Route path="turbine/:id" element={<TurbineDetailWrapper />} />
                        <Route path="phase-guide" element={<ProjectPhaseGuide />} />
                        <Route path="suggestion-box" element={<SuggestionBox />} />
                        <Route path="river-wildlife" element={<RiverWildlife />} />
                        <Route path="revitalization-strategy" element={<RevitalizationStrategy />} />
                        <Route path="digital-integrity" element={<DigitalIntegrity />} />
                        <Route path="global-map" element={<GlobalMap />} />
                        <Route path="contract-management" element={<ContractManagement />} />
                        <Route path="*" element={<div className="text-center p-10 text-xl text-slate-400">404 - Module Not Found</div>} />
                    </Route>
                </Routes>
            </HashRouter>
        </ToastProvider>
      </RiskProvider>
    </QuestionnaireProvider>
  );
};

export default App;