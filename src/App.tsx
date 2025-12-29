import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { HashRouter, useLocation, useNavigate, Route, Routes, useParams, Navigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';

// --- 1. CONTEXTS ---
import { GlobalProvider } from './contexts/GlobalProvider.tsx';
import { useAuth } from './contexts/AuthContext.tsx';
import { NavigationProvider } from './contexts/NavigationContext.tsx';
import { useRisk } from './contexts/RiskContext.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { useAudit } from './contexts/AuditContext.tsx';
import { ProjectProvider } from './contexts/ProjectContext.tsx'; // Technical Backbone
import { DEFAULT_TECHNICAL_STATE } from './models/TechnicalSchema.ts';
// ClientProvider removed (Simulation)
import { NotificationProvider } from './contexts/NotificationContext.tsx'; // Live Notifications
import { MaintenanceProvider } from './contexts/MaintenanceContext.tsx'; // Logbook

// --- 2. CORE COMPONENTS ---
import { Login } from './components/Login.tsx';
import { Feedback } from './components/Feedback.tsx';
// ClientDashboard removed (Simulation)
import { MaintenanceLogbook } from './components/MaintenanceLogbook.tsx'; // Logbook
import { Onboarding } from './components/Onboarding.tsx';
import { Spinner } from './components/Spinner.tsx';
import { LanguageSelector } from './components/LanguageSelector.tsx';
import { SystemStressTest } from './components/debug/SystemStressTest.tsx'; // Debug

import { Hub } from './components/Hub.tsx';
import { Sidebar } from './components/scada/Sidebar.tsx';
import { FleetOverview } from './components/scada/FleetOverview.tsx';
import { DigitalPanel } from './components/scada/DigitalPanel.tsx';
import { AssetRegistrationWizard } from './components/AssetRegistrationWizard.tsx';
import { UnderConstruction } from './components/ui/UnderConstruction.tsx';
import { Breadcrumbs } from './components/ui/Breadcrumbs.tsx';
import { VoiceAssistant } from './components/VoiceAssistant.tsx';

// --- 3. ASSETS & TYPES ---
import type { AppView } from './contexts/NavigationContext.tsx';

// --- 4. LAZY LOADED MODULES ---
const UserProfile = lazy(() => import('./components/UserProfile.tsx').then(m => ({ default: m.UserProfile })));
const GlobalMap = lazy(() => import('./components/GlobalMap.tsx').then(m => ({ default: m.GlobalMap })));
const RiskAssessment = lazy(() => import('./components/RiskAssessment.tsx').then(m => ({ default: m.RiskAssessment })));
const InvestorBriefing = lazy(() => import('./components/InvestorBriefing.tsx').then(m => ({ default: m.InvestorBriefing })));
const TurbineDetail = lazy(() => import('./components/TurbineDetail.tsx').then(m => ({ default: m.TurbineDetail })));
const QuestionnaireSummary = lazy(() => import('./components/QuestionnaireSummary.tsx').then(m => ({ default: m.QuestionnaireSummary })));
const RiskReport = lazy(() => import('./components/RiskReport.tsx').then(m => ({ default: m.RiskReport })));
const StandardOfExcellence = lazy(() => import('./components/StandardOfExcellence.tsx').then(m => ({ default: m.StandardOfExcellence })));
const DigitalIntroduction = lazy(() => import('./components/DigitalIntroduction.tsx').then(m => ({ default: m.DigitalIntroduction })));
const HPPImprovements = lazy(() => import('./components/HPPImprovements.tsx').then(m => ({ default: m.HPPImprovements })));
const InstallationGuarantee = lazy(() => import('./components/InstallationGuarantee.tsx').then(m => ({ default: m.InstallationGuarantee })));
const GenderEquity = lazy(() => import('./components/GenderEquity.tsx').then(m => ({ default: m.GenderEquity })));
const HPPBuilder = lazy(() => import('./components/HPPBuilder.tsx').then(m => ({ default: m.HPPBuilder })));
const ProjectPhaseGuide = lazy(() => import('./components/ProjectPhaseGuide.tsx').then(m => ({ default: m.ProjectPhaseGuide })));
const RiverWildlife = lazy(() => import('./components/RiverWildlife.tsx').then(m => ({ default: m.RiverWildlife })));
const RevitalizationStrategy = lazy(() => import('./components/RevitalizationStrategy.tsx').then(m => ({ default: m.RevitalizationStrategy })));
const DigitalIntegrity = lazy(() => import('./components/DigitalIntegrity.tsx').then(m => ({ default: m.DigitalIntegrity })));
const ContractManagement = lazy(() => import('./components/ContractManagement.tsx').then(m => ({ default: m.ContractManagement })));
const ComponentLibrary = lazy(() => import('./components/ComponentLibrary.tsx').then(m => ({ default: m.ComponentLibrary })));
const MaintenanceDashboard = lazy(() => import('./components/MaintenanceDashboard.tsx').then(m => ({ default: m.MaintenanceDashboard })));
const ExecutiveDashboard = lazy(() => import('./components/dashboard/ExecutiveDashboard.tsx').then(m => ({ default: m.ExecutiveDashboard })));
const StructuralIntegrity = lazy(() => import('./components/StructuralIntegrity.tsx').then(m => ({ default: m.StructuralIntegrity })));
const ShaftAlignment = lazy(() => import('./components/ShaftAlignment').then(m => ({ default: m.ShaftAlignment })));
const HydraulicMaintenance = lazy(() => import('./components/HydraulicMaintenance').then(m => ({ default: m.HydraulicMaintenance })));
const BoltTorqueCalculator = lazy(() => import('./components/BoltTorqueCalculator').then(m => ({ default: m.BoltTorqueCalculator })));
const SOPManager = lazy(() => import('./components/SOPManager').then(m => ({ default: m.SOPManager })));
const ShiftLog = lazy(() => import('./components/ShiftLog').then(m => ({ default: m.ShiftLog })));
const AdminApproval = lazy(() => import('./components/AdminApproval').then(m => ({ default: m.AdminApproval })));
const ARManager = lazy(() => import('./components/ARManager').then(m => ({ default: m.ARManager })));
const ForensicDashboard = lazy(() => import('./components/forensics/ForensicDashboard').then(m => ({ default: m.ForensicDashboard })));

const ToolboxLaunchpad = lazy(() => import('./components/ToolboxLaunchpad.tsx').then(m => ({ default: m.ToolboxLaunchpad })));
const FrancisDiagnostics = lazy(() => import('./components/FrancisDiagnostics.tsx').then(m => ({ default: m.FrancisDiagnostics })));

// --- 5. COMMAND CENTER DASHBOARD ---
// Replaced with Toolbox Launchpad for authentic engineering focus
// const CommandCentreDashboard: React.FC = () => <Hub />;

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
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [loading, user, navigate]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0B0F19]"><Spinner /></div>;
    if (!user) return <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-slate-400">{t('auth.accessDenied', 'Access Denied')}</div>;
    return <>{children}</>;
};

// --- 8. APP LAYOUT ---

// New component for collapsible fleet section
// FleetSection removed - Moved to Sidebar.tsx
const AppLayout: React.FC = () => {
    const location = useLocation();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { riskState } = useRisk();
    const { logAction } = useAudit();
    const { user, signOut } = useAuth(); // Auth integration

    // Unified Navigation States
    const MapModule = lazy(() => import('./components/MapModule.tsx').then(m => ({ default: m.MapModule }))); // Import MapModule

    // ... (existing imports)

    // Unified Navigation States
    const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false); // Map State
    const [showSignOutDialog, setShowSignOutDialog] = useState(false); // Sign Out Dialog

    const isHub = location.pathname === '/';
    const isFullPage = isHub || location.pathname === '/map';

    // Demo data seeder removed - app now uses only real user data

    // Listen for custom wizard trigger event from ScadaMimic
    useEffect(() => {
        const handleOpenWizard = () => setIsWizardOpen(true);
        window.addEventListener('openAssetWizard', handleOpenWizard);
        return () => window.removeEventListener('openAssetWizard', handleOpenWizard);
    }, []);

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
            'vision': '/vision',
            'maintenanceDashboard': '/maintenance',
            'executiveDashboard': '/executive',
            'structuralIntegrity': '/structural-integrity',
            'shaftAlignment': '/shaft-alignment',
            'hydraulicMaintenance': '/hydraulic-maintenance',
            'boltTorque': '/bolt-torque',
            'shadowEngineer': '/shadow-engineer',
            'intuitionLog': '/intuition-log',
            'adminApproval': '/admin-approval',
            'clientPortal': '/client-portal',
            'logbook': '/logbook'
        };
        const target = routeMap[view];
        if (target) navigate(target);
    };

    // Modules list moved to Sidebar.tsx

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
            {/* Fix 3: Layout "Hidden Corners" & Space Efficiency */}
            <main className="min-h-screen w-full bg-[#05070a] text-slate-100 overflow-x-hidden selection:bg-cyan-500/30 font-sans relative flex bg-[#020617]">
                {/* The "Elite" Background Glows */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/20 blur-[120px] rounded-full" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full" />
                    <div className="noise-overlay opacity-20" />
                </div>

                {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
                {isWizardOpen && <AssetRegistrationWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />}

                {/* GLOBAL MAP MODAL */}
                <Suspense fallback={<Spinner />}>
                    <MapModule isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />
                </Suspense>

                {/* UNIFIED SIDEBAR */}
                <Sidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    showMap={isMapOpen}
                    onToggleMap={() => setIsMapOpen(!isMapOpen)}
                    onRegisterAsset={() => {
                        setIsWizardOpen(true);
                        setIsSidebarOpen(false);
                    }}
                />

                {/* MAIN AREA */}
                <div className="flex-grow flex flex-col min-h-screen lg:ml-[280px] relative z-20">
                    <header className="sticky top-0 z-30 h-16 border-b border-white/5 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-6">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-400 hover:text-white">☰</button>
                            <h1 className="text-xl font-black text-white tracking-widest uppercase">
                                AnoHUB <span className="text-h-cyan">SCADA</span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <DigitalPanel
                                label="RISK STATUS"
                                value={riskState.criticalFlags > 0 ? "CRITICAL" : "OPTIMAL"}
                                status={riskState.criticalFlags > 0 ? "critical" : "normal"}
                            />
                            {/* Sign Out Button */}
                            {user && (
                                <button
                                    onClick={() => setShowSignOutDialog(true)}
                                    className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-slate-800/50 hover:bg-red-900/30 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/50 rounded transition-all"
                                    title={t('auth.signOut', 'Sign Out')}
                                >
                                    {t('auth.signOut', 'Sign Out')}
                                </button>
                            )}
                            <LanguageSelector />
                        </div>
                    </header>

                    {/* Sign Out Confirmation Dialog */}
                    {showSignOutDialog && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl animate-scale-in">
                                <h3 className="text-xl font-bold text-white mb-2">{t('auth.signOut', 'Sign Out')}</h3>
                                <p className="text-slate-400 text-sm mb-6">{t('auth.signOutConfirm', 'Are you sure you want to sign out?')}</p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowSignOutDialog(false)}
                                        className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold transition-colors"
                                    >
                                        {t('actions.cancel', 'Cancel')}
                                    </button>
                                    <button
                                        onClick={async () => {
                                            await signOut();
                                            setShowSignOutDialog(false);
                                            navigate('/login');
                                        }}
                                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition-colors"
                                    >
                                        {t('auth.signOut', 'Sign Out')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={`flex-grow w-full relative z-10 ${isFullPage ? 'flex flex-col' : ''}`}> {/* Renamed main to div so we dont nest mains */}
                        <Suspense fallback={<div className="h-[80vh] flex flex-col items-center justify-center gap-4"><Spinner /> <span className="text-xs text-slate-500 tracking-widest animate-pulse">LOADING...</span></div>}>
                            <div className={!isFullPage ? "max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-fade-in" : "flex-grow w-full animate-fade-in"}>
                                {!isHub && <Breadcrumbs />}
                                <ErrorBoundary fallback={
                                    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                                        <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20 animate-pulse">
                                            <span className="text-4xl">⚠️</span>
                                        </div>
                                        <h2 className="text-xl font-black text-white uppercase tracking-widest">Module System Failure</h2>
                                        <p className="text-slate-400 max-w-md text-center">
                                            The requested module encountered a critical runtime error.
                                            Diagnostic data has been logged to the black box.
                                        </p>
                                        <button
                                            onClick={() => window.location.reload()}
                                            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded transition-colors uppercase tracking-wider text-sm"
                                        >
                                            System Reboot
                                        </button>
                                    </div>
                                }>
                                    <Routes>
                                        <Route index element={<ToolboxLaunchpad />} />
                                        <Route path="francis-diagnostics" element={<FrancisDiagnostics />} />
                                        <Route path="profile" element={<UserProfile />} />
                                        <Route path="map" element={<GlobalMap />} />
                                        <Route path="risk-assessment" element={<QuestionnaireWrapper />} />
                                        <Route path="questionnaire-summary" element={<QuestionnaireSummary />} />
                                        <Route path="risk-report" element={<RiskReport />} />
                                        <Route path="investor-briefing" element={<InvestorBriefing />} />
                                        <Route path="standard-of-excellence" element={<StandardOfExcellence onCommit={() => { }} />} />
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
                                        <Route path="maintenance" element={<MaintenanceDashboard />} />
                                        <Route path="shaft-alignment" element={<ShaftAlignment />} />
                                        <Route path="hydraulic-maintenance" element={<HydraulicMaintenance />} />
                                        <Route path="bolt-torque" element={<BoltTorqueCalculator />} />
                                        <Route path="shadow-engineer" element={<SOPManager />} />
                                        <Route path="intuition-log" element={<ShiftLog />} />
                                        <Route path="executive" element={<ExecutiveDashboard />} />
                                        <Route path="structural-integrity" element={<StructuralIntegrity />} />
                                        <Route path="admin-approval" element={<AdminApproval />} />
                                        <Route path="ar-guide" element={<ARManager />} />
                                        <Route path="/forensics" element={<ForensicDashboard />} />
                                        <Route path="logbook" element={<MaintenanceLogbook />} />
                                        <Route path="stress-test" element={<SystemStressTest />} />
                                        <Route path="*" element={<Navigate to="/" replace />} />
                                    </Routes>
                                </ErrorBoundary>
                            </div>
                        </Suspense>
                    </div>
                </div>
                <VoiceAssistant />
                {isFeedbackVisible && <Feedback onClose={() => setIsFeedbackVisible(false)} />}
            </main>
        </NavigationProvider>
    );
};

const App: React.FC = () => {
    return (
        <GlobalProvider>
            <ProjectProvider initialState={DEFAULT_TECHNICAL_STATE}> {/* Technical Backbone */}
                <NotificationProvider>
                    <MaintenanceProvider>
                        <HashRouter>
                            <Routes>
                                <Route path="/login" element={<Login />} />
                                <Route path="/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
                            </Routes>
                        </HashRouter>
                    </MaintenanceProvider>
                </NotificationProvider>
            </ProjectProvider>
        </GlobalProvider>
    );
};

export default App;