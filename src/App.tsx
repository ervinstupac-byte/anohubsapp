import React, { useState, useEffect, Suspense } from 'react';
import { HashRouter, useLocation, useNavigate, Outlet, Route, Routes, useParams } from 'react-router-dom';

// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx'; 
import { NavigationProvider } from './contexts/NavigationContext.tsx';
import { QuestionnaireProvider } from './contexts/QuestionnaireContext.tsx';
import { RiskProvider } from './contexts/RiskContext.tsx';
import { ToastProvider } from './contexts/ToastContext.tsx';

// Components
import { Login } from './components/Login.tsx';
import { Feedback } from './components/Feedback.tsx';
import { Onboarding } from './components/Onboarding.tsx';
import { InterventionCTA } from './components/InterventionCTA.tsx';
import { Spinner } from './components/Spinner.tsx';
import { supabase } from './services/supabaseClient.ts'; // Za dohvat imena

import bgImage from './assets/digital_cfd_mesh.png'; 

import type { AppView } from './types.ts';
import { TURBINE_CATEGORIES } from './constants.ts';

// Lazy Load
const Hub = React.lazy(() => import('./components/Hub.tsx').then(m => ({ default: m.Hub })));
const UserProfile = React.lazy(() => import('./components/UserProfile.tsx').then(m => ({ default: m.UserProfile }))); // NOVO
const Questionnaire = React.lazy(() => import('./components/Questionnaire.tsx').then(m => ({ default: m.Questionnaire })));
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

// Wrappers
const TurbineDetailWrapper = () => {
    const { id } = useParams();
    if (!id) return <div className="text-center text-slate-400 mt-10">Turbine not found</div>;
    return <TurbineDetail turbineKey={id} />;
};

const QuestionnaireWrapper = () => {
    return <Questionnaire onShowSummary={() => window.location.hash = '#/questionnaire-summary'} />;
};

// Header Helper
const getHeaderInfo = (pathname: string): { title: string; subtitle: string } => {
    const path = pathname.startsWith('/') ? pathname.slice(1) : pathname;
    if (path.startsWith('turbine/')) {
        const turbineKey = path.split('/')[1];
        const turbineName = TURBINE_CATEGORIES[turbineKey]?.name || 'Turbine';
        return {
            title: `Details: ${turbineName} Turbine`,
            subtitle: "Technical overview focused on Execution Gap vulnerabilities."
        };
    }
    const titles: Record<string, {title: string, subtitle: string}> = {
        '': { title: 'AnoHUB', subtitle: "Global Operating System for Hydropower Excellence." },
        'profile': { title: 'Engineer Profile', subtitle: "Identity & Access Management." }, // NOVO
        'risk-assessment': { title: 'HPP Risk Assessment', subtitle: "Diagnostic tool to identify systemic risks." },
        'investor-briefing': { title: 'Investor Briefing', subtitle: "Financial KPIs and Risk Impact Analysis." },
        'standard-of-excellence': { title: 'THE STANDARD OF EXCELLENCE', subtitle: "Masterclass modules for eliminating the Execution Gap." },
        'digital-introduction': { title: 'Digital Introduction', subtitle: "Core principles: enforcing the 0.05 mm/m precision mandate." },
        'hpp-improvements': { title: 'HPP Ino-Hub', subtitle: "Collaborative hub for innovations supporting LCC Optimization." },
        'installation-guarantee': { title: 'Installation Standard', subtitle: "Non-negotiable protocol for closing the Execution Gap during assembly." },
        'gender-equity': { title: 'Gender Equity', subtitle: "Inclusive strategies for human capital." },
        'hpp-builder': { title: 'HPP Design Studio', subtitle: "Physics-based turbine selection and calculation." },
        'phase-guide': { title: 'Project Phase Guide', subtitle: "Enforcing the Three Postulates: Precision, Risk Mitigation, and Ethics." },
        'suggestion-box': { title: 'Suggestion & Idea Log', subtitle: "Feedback loop for protocol improvement." },
        'river-wildlife': { title: 'River & Wildlife', subtitle: "Ethical mandate for Ecosystem Protection." },
        'questionnaire-summary': { title: 'Execution Gap Analysis', subtitle: "Linking operational symptoms to failures in discipline." },
        'revitalization-strategy': { title: 'Revitalization Strategy', subtitle: "Closing the M-E Synergy Gap in legacy assets." },
        'digital-integrity': { title: 'Digital Integrity', subtitle: "Immutable ledger providing irrefutable proof." },
        'contract-management': { title: 'Contract & Legal', subtitle: "Warranty protection via data compliance." },
    };
    return titles[path] || { title: 'AnoHUB', subtitle: "Standard of Excellence" };
};

// Auth Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900"><Spinner /></div>;
    if (!user) return <Login />;
    return <>{children}</>;
};

// --- APP LAYOUT ---
const AppLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [displayName, setDisplayName] = useState('Engineer'); // State za ime
    
    const { title, subtitle } = getHeaderInfo(location.pathname);
    const isHub = location.pathname === '/';
    const { signOut, user } = useAuth();

    // Dohvati pravo ime (ili Nickname) iz Profile tablice
    useEffect(() => {
        const fetchProfileName = async () => {
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .single();
                
                if (data?.full_name) setDisplayName(data.full_name);
                else setDisplayName(user.email?.split('@')[0] || 'Engineer');
            }
        };
        fetchProfileName();
    }, [user]);

    useEffect(() => {
        const hasCompleted = localStorage.getItem('hasCompletedOnboarding') === 'true';
        if (!hasCompleted) setShowOnboarding(true);
    }, []);

    const handleOnboardingComplete = () => {
        localStorage.setItem('hasCompletedOnboarding', 'true');
        setShowOnboarding(false);
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    const navigationContextValue = {
        navigateTo: (view: AppView) => {
            // Mapping... (skraćeno za preglednost, ali logika je ista kao prije)
            const routeMap: any = {
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
                        
                        {/* USER PROFILE & LOGOUT */}
                        <div className="absolute right-0 top-0 flex items-center gap-4 z-20">
                            <div className="hidden md:flex flex-col items-end cursor-pointer" onClick={() => navigate('/profile')}>
                                <span className="text-xs text-slate-400">Logged in as</span>
                                <span className="text-sm font-bold text-cyan-400 hover:text-white transition-colors">{displayName}</span>
                            </div>
                            <button onClick={handleLogout} className="px-3 py-1 bg-slate-800 hover:bg-red-900/30 text-slate-300 hover:text-red-400 border border-slate-700 rounded text-xs transition-colors">
                                EXIT
                            </button>
                        </div>

                        <div className="py-4">
                            <h1 onClick={() => navigate('/')} className="text-4xl sm:text-5xl font-bold text-cyan-400 cursor-pointer hover:text-cyan-300 transition-colors inline-block">{title}</h1>
                            <p className="mt-2 text-lg text-slate-400 max-w-3xl mx-auto">{subtitle}</p>
                        </div>
                    </header>
                    <main className="bg-slate-800/80 rounded-xl shadow-2xl p-6 sm:p-8 transition-all duration-500 print-main backdrop-blur-md border border-slate-700/50 flex-grow">
                        <Suspense fallback={<div className="flex flex-col items-center justify-center h-64"><Spinner /><p className="text-slate-400 mt-4 animate-pulse">Loading Module...</p></div>}>
                            <Outlet />
                        </Suspense>
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

const App: React.FC = () => {
  return (
    <ToastProvider>
        <AuthProvider>
            <QuestionnaireProvider>
                <RiskProvider>
                    <HashRouter>
                        <Routes>
                            <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                                <Route index element={<Hub />} />
                                <Route path="profile" element={<UserProfile />} /> {/* NOVO */}
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
                                <Route path="*" element={<div className="text-center p-10 text-xl text-slate-400">404 - Module Not Found</div>} />
                            </Route>
                        </Routes>
                    </HashRouter>
                </RiskProvider>
            </QuestionnaireProvider>
        </AuthProvider>
    </ToastProvider>
  );
};

export default App;