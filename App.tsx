import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation, Outlet, useParams } from 'react-router-dom';

// --- IMPORTI KOMPONENTI ---
import { Questionnaire } from './components/Questionnaire.tsx';
import { Hub } from './components/Hub.tsx';
import { InvestorBriefing } from './components/InvestorBriefing.tsx';
import StandardOfExcellence from './components/StandardOfExcellence.tsx';
import DigitalIntroduction from './components/DigitalIntroduction.tsx';
import HPPImprovements from './components/HPPImprovements.tsx';
import InstallationGuarantee from './components/InstallationGuarantee.tsx';
import GenderEquity from './components/GenderEquity.tsx';
import HPPBuilder from './components/HPPBuilder.tsx';
import TurbineDetail from './components/TurbineDetail.tsx';
import ProjectPhaseGuide from './components/ProjectPhaseGuide.tsx';
import SuggestionBox from './components/SuggestionBox.tsx';
import { Feedback } from './components/Feedback.tsx';
import { Onboarding } from './components/Onboarding.tsx';
import RiverWildlife from './components/RiverWildlife.tsx';
import QuestionnaireSummary from './components/QuestionnaireSummary.tsx';
import { InterventionCTA } from './components/InterventionCTA.tsx';
import RevitalizationStrategy from './components/RevitalizationStrategy.tsx';
import DigitalIntegrity from './components/DigitalIntegrity.tsx';
import ContractManagement from './components/ContractManagement.tsx';

// --- IMPORTI KONTEKSTA I TIPOVA ---
import { NavigationProvider } from './contexts/NavigationContext.tsx';
import { QuestionnaireProvider } from './contexts/QuestionnaireContext.tsx';
import { RiskProvider } from './contexts/RiskContext.tsx';
import { ToastProvider } from './contexts/ToastContext.tsx'; // <--- NOVO
import { TURBINE_CATEGORIES } from './constants.ts';
import type { AppView } from './types.ts';

// --- SLIKA ---
import bgImage from './digital_cfd_mesh.png';

// --- POMOĆNA FUNKCIJA ZA ODREĐIVANJE NASLOVA ---
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

    switch (path) {
        case '':
            return { title: 'AnoHUB', subtitle: "Your center for enforcing the Standard of Excellence in hydropower." };
        case 'risk-assessment':
            return { title: 'HPP Risk Assessment', subtitle: "A diagnostic tool to quantify the Execution Gap and identify systemic risks before they impact LCC." };
        case 'investor-briefing':
            return { title: 'Investor Briefing (KPI Review)', subtitle: "A technical review ensuring KPIs are based on realistic risk assessment and ethical LCC Optimization." };
        case 'standard-of-excellence':
            return { title: 'THE STANDARD OF EXCELLENCE', subtitle: "Masterclass modules for eliminating the Execution Gap through the 0.05 mm/m precision mandate." };
        case 'digital-introduction':
            return { title: 'Digital Introduction', subtitle: "Our core principles: enforcing the 0.05 mm/m precision mandate to close the Execution Gap." };
        case 'hpp-improvements':
            return { title: 'HPP Ino-Hub', subtitle: "A collaborative hub for innovations that support LCC Optimization and Ecosystem Protection." };
        case 'installation-guarantee':
            return { title: 'Installation Standard', subtitle: "The non-negotiable protocol for closing the Execution Gap and M-E Synergy Gap during assembly." };
        case 'gender-equity':
            return { title: 'Gender Equity in Hydropower', subtitle: "Eliminating the 'Execution Gap' in human capital by applying the same zero-tolerance principles as our 0.05 mm/m technical mandate." };
        case 'hpp-builder':
            return { title: 'HPP Power Calculator', subtitle: "An interactive tool for HPP configuration, guided by the principles of LCC Optimization and resilience to the Execution Gap." };
        case 'phase-guide':
            return { title: 'Project Phase Guide', subtitle: "Enforcing the Three Postulates: Precision (0.05 mm/m), Risk Mitigation (Execution Gap), and Ethical LCC Optimization." };
        case 'suggestion-box':
            return { title: 'Suggestion & Idea Log', subtitle: "Share your ideas for improving our protocols for precision, risk mitigation, and ethics." };
        case 'river-wildlife':
            return { title: 'River & Wildlife Stewardship', subtitle: "The ethical mandate for Ecosystem Protection: enforcing and documenting E-Flow as a core operational requirement." };
        case 'questionnaire-summary':
            return { title: 'Preliminary Execution Gap Analysis', subtitle: "An initial analysis linking operational symptoms to failures in discipline against our non-negotiable precision standards." };
        case 'revitalization-strategy':
            return { title: 'Revitalization & Obsolescence', subtitle: "A data-driven framework for ensuring LCC Optimization by closing the M-E Synergy Gap in legacy assets." };
        case 'digital-integrity':
            return { title: 'Digital Integrity & Blockchain', subtitle: "Using an immutable ledger to provide irrefutable proof of discipline and close the Execution Gap against legal liability." };
        case 'contract-management':
            return { title: 'Contract & Legal Risk', subtitle: "Legally mandating the 0.05 mm/m precision standard to protect your warranty from the Execution Gap." };
        default:
            return { title: 'AnoHUB', subtitle: "Standard of Excellence" };
    }
};

// --- GLAVNI LAYOUT ---
const AppLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);

    const { title, subtitle } = getHeaderInfo(location.pathname);
    const isHub = location.pathname === '/';

    useEffect(() => {
        const hasCompleted = localStorage.getItem('hasCompletedOnboarding') === 'true';
        if (!hasCompleted) {
            setShowOnboarding(true);
        }
    }, []);

    const handleOnboardingComplete = () => {
        localStorage.setItem('hasCompletedOnboarding', 'true');
        setShowOnboarding(false);
    };

    const navigationContextValue = {
        navigateTo: (view: AppView) => {
            const routeMap: Record<string, string> = {
                'hub': '/',
                'riskAssessment': '/risk-assessment',
                'investorBriefing': '/investor-briefing',
                'standardOfExcellence': '/standard-of-excellence',
                'digitalIntroduction': '/digital-introduction',
                'hppImprovements': '/hpp-improvements',
                'installationGuarantee': '/installation-guarantee',
                'genderEquity': '/gender-equity',
                'hppBuilder': '/hpp-builder',
                'phaseGuide': '/phase-guide',
                'suggestionBox': '/suggestion-box',
                'riverWildlife': '/river-wildlife',
                'questionnaireSummary': '/questionnaire-summary',
                'revitalizationStrategy': '/revitalization-strategy',
                'digitalIntegrity': '/digital-integrity',
                'contractManagement': '/contract-management',
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
            <div
                className="min-h-screen text-slate-200 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans print-container"
                style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.95)), url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}

                <div className="w-full max-w-6xl mx-auto flex-grow flex flex-col">
                    <header className="text-center mb-8 no-print relative">
                        {!isHub && (
                            <button
                                onClick={() => navigate(-1)}
                                className="absolute left-0 top-4 flex items-center space-x-2 text-slate-400 hover:text-cyan-400 transition-colors z-20"
                                aria-label="Back to previous screen"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                <span className="hidden sm:inline">Back</span>
                            </button>
                        )}

                        <button
                            onClick={() => navigate('/')}
                            className="absolute right-0 top-4 flex items-center space-x-2 text-slate-400 hover:text-cyan-400 transition-colors z-20"
                            title="Return to AnoHUB Home"
                        >
                            <span className="hidden sm:inline text-sm font-semibold">HOME</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </button>

                        <div className="py-4">
                            <h1
                                onClick={() => navigate('/')}
                                className="text-4xl sm:text-5xl font-bold text-cyan-400 cursor-pointer hover:text-cyan-300 transition-colors inline-block"
                                title="Go to Dashboard"
                            >
                                {title}
                            </h1>
                            <p className="mt-2 text-lg text-slate-400 max-w-3xl mx-auto">
                                {subtitle}
                            </p>
                        </div>
                    </header>

                    <main className="bg-slate-800/80 rounded-xl shadow-2xl p-6 sm:p-8 transition-all duration-500 print-main backdrop-blur-md border border-slate-700/50 flex-grow">
                        <Outlet />
                    </main>

                    <footer className="text-center mt-8 text-sm text-slate-500 no-print">
                        <p>&copy; {new Date().getFullYear()} Strategic Risk Mitigation. All rights reserved.</p>
                    </footer>
                </div>

                <InterventionCTA />

                <button
                    onClick={() => setIsFeedbackVisible(true)}
                    className="fixed bottom-6 right-6 bg-cyan-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-cyan-500 transition-all transform hover:-translate-y-1 z-50 flex items-center space-x-2 no-print"
                    aria-label="Provide Feedback"
                >
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

const TurbineDetailWrapper = () => {
    const { id } = useParams();
    if (!id) return <div>Turbine not found</div>;
    return <TurbineDetail turbineKey={id} />;
};

const QuestionnaireWrapper = () => {
    const navigate = useNavigate();
    return <Questionnaire onShowSummary={() => navigate('/questionnaire-summary')} />;
}

const App: React.FC = () => {
  return (
    <QuestionnaireProvider>
      <RiskProvider>
        <ToastProvider> {/* <--- OMOTANO S TOAST PROVIDEROM */}
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
                        <Route path="contract-management" element={<ContractManagement />} />
                        <Route path="*" element={<div className="text-center p-10 text-xl text-slate-400">404 - Stranica nije pronađena</div>} />
                    </Route>
                </Routes>
            </HashRouter>
        </ToastProvider>
      </RiskProvider>
    </QuestionnaireProvider>
  );
};

export default App;