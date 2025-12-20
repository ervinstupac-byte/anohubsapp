import React, { useState, useEffect, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { HashRouter, useLocation, useNavigate, Route, Routes, useParams } from 'react-router-dom';

// --- 1. CONTEXTS ---
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { NavigationProvider } from './contexts/NavigationContext.tsx';
import { QuestionnaireProvider } from './contexts/QuestionnaireContext.tsx';
import { HPPDesignProvider } from './contexts/HPPDesignContext.tsx';
import { RiskProvider, useRisk } from './contexts/RiskContext.tsx';
import { ToastProvider } from './contexts/ToastContext.tsx';
import { AssetProvider } from './contexts/AssetContext.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { TelemetryProvider } from './contexts/TelemetryContext.tsx';
import { AuditProvider, useAudit } from './contexts/AuditContext.tsx';

// --- 2. CORE COMPONENTS ---
import { Login } from './components/Login.tsx';
import { Feedback } from './components/Feedback.tsx';
import { Onboarding } from './components/Onboarding.tsx';
import { InterventionCTA } from './components/InterventionCTA.tsx';
import { Spinner } from './components/Spinner.tsx';
import { LanguageSelector } from './components/LanguageSelector.tsx';
import { Hub } from './components/Hub.tsx';
import { Sidebar } from './components/scada/Sidebar.tsx';
import { FleetOverview } from './components/scada/FleetOverview.tsx';
import { DigitalPanel } from './components/scada/DigitalPanel.tsx';
import { AssetRegistrationWizard } from './components/AssetRegistrationWizard.tsx';
import { UnderConstruction } from './components/ui/UnderConstruction.tsx';
import { Breadcrumbs } from './components/ui/Breadcrumbs.tsx';

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
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { riskState } = useRisk();
    const { logAction } = useAudit();
    const { user } = useAuth();

    // Unified Navigation States
    const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isWizardOpen, setIsWizardOpen] = useState(false);

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
            'turbineDetail': '/turbine',
            'activeContext': '/vision',
            'vision': '/vision'
        };
        const target = routeMap[view];
        if (target) navigate(target);
    };

    const operationalModules = [
        { id: 'riskAssessment', title: t('modules.riskAssessment', 'Risk Diagnostics'), icon: '🛡️' },
        { id: 'installationGuarantee', title: t('modules.installationGuarantee', 'Precision Audit'), icon: '🏗️' },
        { id: 'hppBuilder', title: t('modules.hppBuilder', 'HPP Studio'), icon: '⚡' },
    ];

    const secondaryModules = [
        { id: 'riskReport', title: t('modules.riskReport', 'Dossier Archive'), icon: '📂' },
        { id: 'library', title: t('modules.library', 'Tech Library'), icon: '📚' },
        { id: 'standardOfExcellence', title: 'Standard', icon: '🏅' },
        { id: 'activeContext', title: 'Vision', icon: '👁️' }
    ];

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
            <div className="min-h-screen text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden flex relative bg-[#020617]"
                style={{
                    backgroundImage: `radial-gradient(circle at 50% 0%, rgba(34, 211, 238, 0.05) 0%, transparent 40%), url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundAttachment: 'fixed',
                    backgroundPosition: 'center top'
                }}
            >
                {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
                {isWizardOpen && <AssetRegistrationWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />}

                {/* UNIFIED SIDEBAR */}
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}>
                    <FleetOverview
                        onToggleMap={() => navigate('/map')}
                        showMap={location.pathname === '/map'}
                        onRegisterAsset={() => {
                            setIsWizardOpen(true);
                            setIsSidebarOpen(false);
                        }}
                    />
                    <div className="flex-1 overflow-y-auto custom-scrollbar py-4 space-y-1">
                        <div className="px-4 py-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">OPERATIONS</div>
                        {operationalModules.map(mod => (
                            <button
                                key={mod.id}
                                onClick={() => { logAction('MODULE_OPEN', mod.title, 'SUCCESS'); navigateTo(mod.id as AppView); setIsSidebarOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 border-l-2 transition-all group ${location.pathname.includes(mod.id) || (isHub && mod.id === 'hub') ? 'bg-cyan-900/20 border-cyan-400 text-white' : 'border-transparent hover:bg-slate-900 text-slate-500'}`}
                            >
                                <span className="text-lg">{mod.icon}</span>
                                <span className="text-xs font-bold uppercase tracking-wider">{mod.title}</span>
                            </button>
                        ))}
                        <div className="my-4 border-t border-white/5 mx-4"></div>
                        <div className="px-4 py-2 text-[10px] font-black text-slate-700 uppercase tracking-widest">KNOWLEDGE</div>
                        {secondaryModules.map(mod => (
                            <button
                                key={mod.id}
                                onClick={() => { logAction('MODULE_OPEN', mod.title, 'SUCCESS'); navigateTo(mod.id as AppView); setIsSidebarOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 border-l-2 transition-all group ${location.pathname.includes(mod.id) ? 'bg-cyan-900/20 border-cyan-400 text-white' : 'border-transparent hover:bg-slate-900 text-slate-500'}`}
                            >
                                <span className="text-lg">{mod.icon}</span>
                                <span className="text-xs font-bold uppercase tracking-wider">{mod.title}</span>
                            </button>
                        ))}
                    </div>
                    <div className="p-4 border-t border-white/5 bg-slate-950/50 backdrop-blur-md text-xs text-slate-600 font-mono">
                        <div>OP: {user?.email?.split('@')[0].toUpperCase() || 'GUEST'}</div>
                        <div className="text-[10px] mt-1 opacity-50 font-black">v2.6.0 ENTERPRISE</div>
                    </div>
                </Sidebar>

                {/* MAIN AREA */}
                <div className="flex-grow flex flex-col min-h-screen lg:ml-[280px]">
                    {/* UNIFIED HEADER */}
                    <header className="sticky top-0 z-30 h-16 border-b border-white/5 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-6">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-400 hover:text-white">☰</button>
                            <h1 className="text-xl font-black text-white tracking-widest uppercase">
                                AnoHUB <span className="text-cyan-500">SCADA</span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:block">
                                <DigitalPanel
                                    label="RISK STATUS"
                                    value={riskState.criticalFlags > 0 ? "CRITICAL" : "OPTIMAL"}
                                    status={riskState.criticalFlags > 0 ? "critical" : "normal"}
                                />
                            </div>
                            <LanguageSelector />
                        </div>
                    </header>

                    <main className="flex-grow w-full relative z-10">
                        <Suspense fallback={<div className="h-[80vh] flex flex-col items-center justify-center gap-4"><Spinner /> <span className="text-xs text-slate-500 tracking-widest animate-pulse">LOADING MODULE...</span></div>}>
                            <div className={!isHub ? "max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-fade-in" : "w-full h-full animate-fade-in"}>
                                {!isHub && <Breadcrumbs />}
                                <ErrorBoundary>
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
                                        <Route path="vision" element={<UnderConstruction />} />
                                        <Route path="*" element={<div className="flex flex-col items-center justify-center pt-20 text-slate-500"><div className="text-4xl mb-2">🚧</div><div className="text-xl">404: Sector Not Found</div></div>} />
                                    </Routes>
                                </ErrorBoundary>
                            </div>
                        </Suspense>
                    </main>

                    <footer className="text-center py-6 text-[10px] text-slate-600 uppercase tracking-widest no-print border-t border-white/5">
                        <p>&copy; {new Date().getFullYear()} Anohubs Inc. | ENGINEERING IMMUNITY PROTOCOL</p>
                    </footer>
                </div>

                <InterventionCTA />

                <button onClick={() => setIsFeedbackVisible(true)} className="fixed bottom-6 right-6 group flex items-center justify-center w-12 h-12 rounded-full bg-cyan-500 text-white shadow-lg hover:scale-110 transition-all z-50">
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