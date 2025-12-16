import React, { useState, useEffect, Suspense } from 'react';
import { HashRouter, useLocation, useNavigate, Route, Routes, useParams } from 'react-router-dom';

// --- 1. CONTEXTS ---
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { NavigationProvider } from './contexts/NavigationContext.tsx';
import { QuestionnaireProvider } from './contexts/QuestionnaireContext.tsx';
import { HPPDesignProvider } from './contexts/HPPDesignContext.tsx';
import { RiskProvider } from './contexts/RiskContext.tsx';
import { ToastProvider } from './contexts/ToastContext.tsx';
import { AssetProvider } from './contexts/AssetContext.tsx';
import { TelemetryProvider } from './contexts/TelemetryContext.tsx';
import { AuditProvider } from './contexts/AuditContext.tsx';

// --- 2. CORE COMPONENTS ---
import { Login } from './components/Login.tsx';
import { Feedback } from './components/Feedback.tsx';
import { Onboarding } from './components/Onboarding.tsx';
import { InterventionCTA } from './components/InterventionCTA.tsx';
import { Spinner } from './components/Spinner.tsx';
import { LanguageSelector } from './components/LanguageSelector.tsx';
import { Hub } from './components/Hub.tsx';

// --- 3. ASSETS & TYPES ---
import bgImage from './assets/digital_cfd_mesh.png';
import type { AppView } from './contexts/NavigationContext.tsx';

// --- 4. LAZY LOADED MODULES (KONAČAN NAMED EXPORT FORMAT) ---
// Očekujemo da su SVE komponente u svojim fajlovima exportovane kao 'export const ImeKomponente = ...'
const UserProfile = React.lazy(() => import('./components/UserProfile.tsx').then(m => ({ default: m.UserProfile })));
const GlobalMap = React.lazy(() => import('./components/GlobalMap.tsx').then(m => ({ default: m.GlobalMap })));
const RiskAssessment = React.lazy(() => import('./components/RiskAssessment.tsx').then(m => ({ default: m.RiskAssessment })));
const InvestorBriefing = React.lazy(() => import('./components/InvestorBriefing.tsx').then(m => ({ default: m.InvestorBriefing })));
const TurbineDetail = React.lazy(() => import('./components/TurbineDetail.tsx').then(m => ({ default: m.TurbineDetail })));
const QuestionnaireSummary = React.lazy(() => import('./components/QuestionnaireSummary.tsx').then(m => ({ default: m.QuestionnaireSummary })));
const RiskReport = React.lazy(() => import('./components/RiskReport.tsx').then(m => ({ default: m.RiskReport })));
const StandardOfExcellence = React.lazy(() => import('./components/StandardOfExcellence.tsx').then(m => ({ default: m.StandardOfExcellence })));
const DigitalIntroduction = React.lazy(() => import('./components/DigitalIntroduction.tsx').then(m => ({ default: m.DigitalIntroduction })));
const HPPImprovements = React.lazy(() => import('./components/HPPImprovements.tsx').then(m => ({ default: m.HPPImprovements })));
const InstallationGuarantee = React.lazy(() => import('./components/InstallationGuarantee.tsx').then(m => ({ default: m.InstallationGuarantee })));
const GenderEquity = React.lazy(() => import('./components/GenderEquity.tsx').then(m => ({ default: m.GenderEquity })));
const HPPBuilder = React.lazy(() => import('./components/HPPBuilder.tsx').then(m => ({ default: m.HPPBuilder })));
const ProjectPhaseGuide = React.lazy(() => import('./components/ProjectPhaseGuide.tsx').then(m => ({ default: m.ProjectPhaseGuide })));
const RiverWildlife = React.lazy(() => import('./components/RiverWildlife.tsx').then(m => ({ default: m.RiverWildlife })));
const RevitalizationStrategy = React.lazy(() => import('./components/RevitalizationStrategy.tsx').then(m => ({ default: m.RevitalizationStrategy })));
const DigitalIntegrity = React.lazy(() => import('./components/DigitalIntegrity.tsx').then(m => ({ default: m.DigitalIntegrity })));
const ContractManagement = React.lazy(() => import('./components/ContractManagement.tsx').then(m => ({ default: m.ContractManagement })));
const ComponentLibrary = React.lazy(() => import('./components/ComponentLibrary.tsx').then(m => ({ default: m.ComponentLibrary })));


// --- 5. COMMAND CENTER DASHBOARD ---
const CommandCentreDashboard: React.FC = () => <Hub />;


// --- 6. WRAPPERS ---
const TurbineDetailWrapper = () => {
    const { id } = useParams();
    if (!id) return <div className="text-center text-slate-400 mt-10">Turbine not found</div>;
    return <TurbineDetail turbineKey={id} />;
};

const QuestionnaireWrapper = () => {
    return <RiskAssessment onShowSummary={() => window.location.hash = '#/questionnaire-summary'} />;
};

// --- 7. AUTH GUARD ---
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0B0F19]"><Spinner /></div>;
    if (!user) return <Login />;
    return <>{children}</>;
};

// --- 8. APP LAYOUT ---
const AppLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);

    const isHub = location.pathname === '/';

    useEffect(() => {
        const hasCompleted = localStorage.getItem('hasCompletedOnboarding') === 'true';
        if (!hasCompleted) setShowOnboarding(true);
    }, []);

    const handleOnboardingComplete = () => {
        localStorage.setItem('hasCompletedOnboarding', 'true');
        setShowOnboarding(false);
    };

    const navigateTo = (view: AppView) => {
        const routeMap: Record<string, string> = {
            'home': '/',
            'hub': '/',
            'intro': '/digital-introduction',
            'digitalIntroduction': '/digital-introduction',
            'login': '/login',
            'globalMap': '/map',
            'riskAssessment': '/risk-assessment',
            'investor': '/investor-briefing',
            'investorBriefing': '/investor-briefing',
            'standard': '/standard-of-excellence',
            'standardOfExcellence': '/standard-of-excellence',
            'improvements': '/hpp-improvements',
            'hppImprovements': '/hpp-improvements',
            'installation': '/installation-guarantee',
            'installationGuarantee': '/installation-guarantee',
            'gender': '/gender-equity',
            'genderEquity': '/gender-equity',
            'hppBuilder': '/hpp-builder',
            'phases': '/phase-guide',
            'phaseGuide': '/phase-guide',
            'wildlife': '/river-wildlife',
            'riverWildlife': '/river-wildlife',
            'riskReport': '/risk-report',
            'integrity': '/digital-integrity',
            'digitalIntegrity': '/digital-integrity',
            'contracts': '/contract-management',
            'contractManagement': '/contract-management',
            'library': '/library',
            'questionnaireSummary': '/questionnaire-summary',
            'revitalizationStrategy': '/revitalization-strategy',
            'turbineDetail': '/turbine'
        };
        const target = routeMap[view];
        if (target) navigate(target);
    };

    return (
        <NavigationProvider value={{
            currentPage: isHub ? 'home' : 'intro',
            navigateTo,
            navigateBack: () => navigate(-1),
            navigateToHub: () => navigate('/'),
            navigateToTurbineDetail: (id) => navigate(`/turbine/${id}`),
            showOnboarding,
            completeOnboarding: handleOnboardingComplete,
            showFeedbackModal: () => setIsFeedbackVisible(true)
        }}>
            <div className="min-h-screen text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden flex flex-col"
                style={{
                    backgroundColor: '#0f172a',
                    backgroundImage: `radial-gradient(circle at 50% 0%, rgba(34, 211, 238, 0.08) 0%, transparent 40%), url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundAttachment: 'fixed',
                    backgroundPosition: 'center top'
                }}
            >
                {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}

                {!isHub && (
                    <header className="sticky top-0 z-50 w-full backdrop-blur-md border-b border-white/5 bg-[#0f172a]/80 h-16 flex items-center px-6 justify-between">
                        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                            <span>←</span> <span className="text-xs font-bold uppercase tracking-widest">Return to Command</span>
                        </button>
                        <LanguageSelector />
                    </header>
                )}

                <main className="flex-grow w-full relative z-10">
                    <Suspense fallback={<div className="h-[80vh] flex flex-col items-center justify-center gap-4"><Spinner /> <span className="text-xs text-slate-500 tracking-widest animate-pulse">LOADING MODULE...</span></div>}>
                        <div className={!isHub ? "max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-fade-in" : "w-full h-full animate-fade-in"}>
                            <Routes>
                                <Route index element={<CommandCentreDashboard />} />

                                <Route path="profile" element={<UserProfile />} />
                                <Route path="map" element={<GlobalMap />} />
                                <Route path="risk-assessment" element={<QuestionnaireWrapper />} />
                                <Route path="questionnaire-summary" element={<QuestionnaireSummary />} />
                                <Route path="risk-report" element={<RiskReport />} />
                                <Route path="investor-briefing" element={<InvestorBriefing />} />
                                <Route path="standard-of-excellence" element={<StandardOfExcellence />} />
                                <Route path="digital-introduction" element={<DigitalIntroduction />} />
                                <Route path="hpp-improvements" element={<HPPImprovements />} />
                                <Route path="installation-guarantee" element={<InstallationGuarantee />} />
                                <Route path="gender-equity" element={<GenderEquity />} />
                                <Route path="hpp-builder" element={<HPPBuilder />} />
                                <Route path="turbine/:id" element={<TurbineDetailWrapper />} />
                                <Route path="phase-guide" element={<ProjectPhaseGuide />} />
                                <Route path="river-wildlife" element={<RiverWildlife />} />
                                <Route path="revitalization-strategy" element={<RevitalizationStrategy />} />
                                <Route path="digital-integrity" element={<DigitalIntegrity />} />
                                <Route path="contract-management" element={<ContractManagement />} />
                                <Route path="library" element={<ComponentLibrary />} />
                                <Route path="*" element={<div className="flex flex-col items-center justify-center pt-20 text-slate-500"><div className="text-4xl mb-2">🚧</div><div className="text-xl">404: Sector Not Found</div></div>} />
                            </Routes>
                        </div>
                    </Suspense>
                </main>

                <footer className="text-center py-8 text-[10px] text-slate-600 uppercase tracking-widest no-print border-t border-white/5 mt-auto">
                    <p>&copy; {new Date().getFullYear()} Anohubs Inc. | ENGINEERING IMMUNITY PROTOCOL</p>
                </footer>

                <InterventionCTA />

                <button onClick={() => setIsFeedbackVisible(true)} className="fixed bottom-6 right-6 group flex items-center justify-center w-12 h-12 rounded-full bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-110 hover:bg-cyan-400 transition-all z-50">
                    <span className="text-xl group-hover:rotate-12 transition-transform">💬</span>
                </button>

                {isFeedbackVisible && <Feedback onClose={() => setIsFeedbackVisible(false)} />}
            </div>
        </NavigationProvider>
    );
};

// --- 9. APP ENTRY POINT ---
const App: React.FC = () => {
    return (
        <ToastProvider>
            <AuditProvider>
                <AuthProvider>
                    <QuestionnaireProvider>
                        <HPPDesignProvider>
                            <RiskProvider>
                                <AssetProvider>
                                    <TelemetryProvider>
                                        <HashRouter>
                                            <Routes>
                                                <Route path="/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
                                            </Routes>
                                        </HashRouter>
                                    </TelemetryProvider>
                                </AssetProvider>
                            </RiskProvider>
                        </HPPDesignProvider>
                    </QuestionnaireProvider>
                </AuthProvider>
            </AuditProvider>
        </ToastProvider>
    );
};

export default App;