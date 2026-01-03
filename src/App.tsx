import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { AssetProvider } from './contexts/AssetContext.tsx'; // <--- NEW
import { RiskProvider } from './contexts/RiskContext.tsx'; // <--- NEW (Ensuring it exists)
import { useRiskCalculator } from './hooks/useRiskCalculator.ts'; // <--- NEW
import { DocumentProvider } from './contexts/DocumentContext.tsx'; // <--- NEW

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
import { Sidebar } from './components/diagnostic-twin/Sidebar.tsx';
import { FleetOverview } from './components/diagnostic-twin/FleetOverview.tsx';
import { DigitalPanel } from './components/diagnostic-twin/DigitalPanel.tsx';
import { AssetRegistrationWizard } from './components/AssetRegistrationWizard.tsx';
import { UnderConstruction } from './components/ui/UnderConstruction.tsx';
import { Breadcrumbs } from './components/ui/Breadcrumbs.tsx';
import { VoiceAssistant } from './components/VoiceAssistant.tsx';
import { DashboardHeader } from './components/DashboardHeader.tsx';
import { GlobalFooter } from './components/GlobalFooter.tsx';
import { DataSyncBridge } from './components/DataSyncBridge';
import { ProjectPhaseGuide } from './components/ProjectPhaseGuide';
import { PrintPreviewModal } from './components/modals/PrintPreviewModal.tsx';
import { TRIGGER_FORENSIC_EXPORT } from './components/diagnostic-twin/Sidebar.tsx';
import { useCerebro } from './contexts/ProjectContext';
import { CommanderDemoHUD } from './components/diagnostic-twin/CommanderDemoHUD';

// --- 3. ASSETS & TYPES ---
import type { AppView } from './contexts/NavigationContext.tsx';
import { ROUTES } from './routes/paths.ts';

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
const RiverWildlife = lazy(() => import('./components/RiverWildlife.tsx').then(m => ({ default: m.RiverWildlife })));
const RevitalizationStrategy = lazy(() => import('./components/RevitalizationStrategy.tsx').then(m => ({ default: m.RevitalizationStrategy })));
const DigitalIntegrity = lazy(() => import('./components/DigitalIntegrity.tsx').then(m => ({ default: m.DigitalIntegrity })));
const ContractManagement = lazy(() => import('./components/ContractManagement.tsx').then(m => ({ default: m.ContractManagement })));
const ComponentLibrary = lazy(() => import('./components/ComponentLibrary.tsx').then(m => ({ default: m.ComponentLibrary })));
const ExecutiveDashboard = lazy(() => import('./components/dashboard/ExecutiveDashboard.tsx').then(m => ({ default: m.ExecutiveDashboard })));
const StructuralIntegrity = lazy(() => import('./components/StructuralIntegrity.tsx').then(m => ({ default: m.StructuralIntegrity })));

const AdminApproval = lazy(() => import('./components/AdminApproval.tsx').then(m => ({ default: m.AdminApproval })));

// Maintenance components moved to MaintenanceRouter
const ForensicDashboard = lazy(() => import('./components/forensics/ForensicDashboard').then(m => ({ default: m.ForensicDashboard })));

const ToolboxLaunchpad = lazy(() => import('./components/ToolboxLaunchpad.tsx').then(m => ({ default: m.ToolboxLaunchpad })));
const FrancisDiagnostics = lazy(() => import('./components/FrancisDiagnostics.tsx').then(m => ({ default: m.FrancisDiagnostics })));
const FrancisHub = React.lazy(() => import('./components/francis/FrancisHub').then(module => ({ default: module.FrancisHub })));
const SOPViewer = React.lazy(() => import('./components/francis/SOPViewer').then(module => ({ default: module.SOPViewer })));
// Francis Turbine Module - All routes extracted to dedicated sub-router
// Francis Turbine Module - All routes extracted to dedicated sub-router
const FrancisRouter = React.lazy(() => import('./routes/FrancisRouter'));

// Maintenance Module - Extracted to dedicated sub-router
const MaintenanceRouter = React.lazy(() => import('./routes/MaintenanceRouter.tsx'));



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
    const { riskState: questionnaireRisk } = useRisk(); // Renamed Risk Context
    const { status: assetRiskStatus, reason: riskReasons } = useRiskCalculator(); // Calculated Asset Risk
    const { logAction } = useAudit();
    const { user, signOut } = useAuth(); // Auth integration

    // Unified Navigation States
    const MapModule = lazy(() => import('./components/MapModule.tsx').then(m => ({ default: m.MapModule }))); // Import MapModule

    // Unified Navigation States
    const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false); // Map State
    const [showSignOutDialog, setShowSignOutDialog] = useState(false); // Sign Out Dialog
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const { state: cerebroState } = useCerebro();
    const isCriticalDemo = cerebroState?.demoMode?.active && cerebroState?.demoMode?.scenario !== 'NORMAL';
    const { state: technicalState } = useCerebro();

    const isHub = location.pathname === '/';
    const isFullPage = isHub || location.pathname === '/map';

    // RISK CALCULATION LOGIC
    const isCritical = questionnaireRisk.criticalFlags > 0 || assetRiskStatus === 'CRITICAL';
    const isWarning = assetRiskStatus === 'WARNING';

    const badgeLabel = isCritical ? "CRITICAL" : isWarning ? "WARNING" : "OPTIMAL";
    const badgeStatus = isCritical ? "critical" : isWarning ? "warning" : "normal";

    const handleBadgeClick = () => {
        if (assetRiskStatus !== 'SAFE') {
            console.log("Risk Reasons:", riskReasons);
        }
        navigateTo('riskAssessment');
    };

    // Listen for custom wizard trigger event from NeuralFlowMap
    useEffect(() => {
        const handleOpenWizard = () => setIsWizardOpen(true);
        const handleOpenPreview = () => setIsPreviewOpen(true);

        window.addEventListener('openAssetWizard', handleOpenWizard);
        window.addEventListener(TRIGGER_FORENSIC_EXPORT, handleOpenPreview);

        return () => {
            window.removeEventListener('openAssetWizard', handleOpenWizard);
            window.removeEventListener(TRIGGER_FORENSIC_EXPORT, handleOpenPreview);
        };
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
        console.log('[Navigation] Navigating to:', view);
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

            // Maintenance Routes - Hardcoded for Stability
            'maintenanceDashboard': '/maintenance/dashboard',
            'hydraulicMaintenance': '/maintenance/hydraulic',
            'boltTorque': '/maintenance/bolt-torque',
            'shadowEngineer': '/maintenance/shadow-engineer',
            'intuitionLog': '/maintenance/intuition-log',
            'ar-guide': '/maintenance/ar-guide',
            'logbook': '/maintenance/logbook',

            'executiveDashboard': '/executive',
            'structuralIntegrity': '/structural-integrity',
            'shaftAlignment': '/francis/sop-shaft-alignment',
            'adminApproval': '/admin-approval',
            'clientPortal': '/client-portal',
            'francisHub': '/francis/hub'
        };
        const target = routeMap[view];
        if (target) {
            console.log('[Navigation] Target found:', target);
            navigate(target);
        } else {
            console.error('[Navigation] No route found for view:', view);
        }
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
            {/* Fix 3: Layout "Hidden Corners" & Space Efficiency */}
            <main className={`min-h-screen w-full bg-[#05070a] text-slate-100 overflow-x-hidden selection:bg-cyan-500/30 font-sans relative flex bg-[#020617] ${isCriticalDemo ? 'shadow-[inset_0_0_100px_rgba(239,68,68,0.2)]' : ''}`}>
                {isCriticalDemo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.1, 0.2, 0.1] }}
                        transition={{ repeat: Infinity, duration: 3 }}
                        className="fixed inset-0 pointer-events-none z-[99] border-[16px] border-red-500/10"
                    />
                )}
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

                {/* NEURAL BRIDGE (DATA SYNC V4.5) */}
                <DataSyncBridge />

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

                    <DashboardHeader
                        onToggleSidebar={() => setIsSidebarOpen(true)}
                        title="ANOHUB // NC-4.2 NEURAL CORE"
                    />

                    {/* Sign Out Dialog handled within DashboardHeader now to avoid prop drilling or dupes, 
                        BUT keeping App-level state if needed. 
                        Actually DashboardHeader handles its own SignOut Dialog. 
                        Removing inline Header and inline Dialog from App.tsx. 
                    */}

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
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={location.pathname}
                                            initial={{ opacity: 0, y: 30, scale: 0.98, filter: 'blur(20px)' }}
                                            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                                            exit={{ opacity: 0, y: -30, scale: 1.02, filter: 'blur(20px)' }}
                                            transition={{
                                                duration: 0.5,
                                                ease: [0.22, 1, 0.36, 1] // Custom hydraulic flow curve
                                            }}
                                            className="w-full"
                                        >
                                            <Routes location={location}>
                                                <Route index element={<ToolboxLaunchpad />} />
                                                {/* Francis Turbine Module - All routes handled by dedicated sub-router */}
                                                <Route path="/francis/*" element={<FrancisRouter />} />
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

                                                {/* Maintenance Sub-Router */}
                                                <Route path="/maintenance/*" element={<MaintenanceRouter />} />

                                                <Route path="executive" element={<ExecutiveDashboard />} />
                                                <Route path="structural-integrity" element={<StructuralIntegrity />} />

                                                <Route path="admin-approval" element={<AdminApproval />} />
                                                <Route path="/forensics" element={<ForensicDashboard />} />
                                                <Route path="stress-test" element={<SystemStressTest />} />
                                                <Route path="learning-lab" element={<UnderConstruction />} />
                                                <Route path="*" element={<Navigate to="/" replace />} />
                                            </Routes>
                                        </motion.div>
                                    </AnimatePresence>
                                </ErrorBoundary>
                            </div>
                        </Suspense>
                    </div>
                </div>
                <VoiceAssistant />
                {isFeedbackVisible && <Feedback onClose={() => setIsFeedbackVisible(false)} />}
                <PrintPreviewModal
                    isOpen={isPreviewOpen}
                    onClose={() => setIsPreviewOpen(false)}
                    state={technicalState}
                />
                <GlobalFooter />
            </main>
            <CommanderDemoHUD />
        </NavigationProvider>
    );
};

import { ContextAwarenessProvider } from './contexts/ContextAwarenessContext.tsx'; // <--- NEW

const App: React.FC = () => {
    return (
        <GlobalProvider>
            <ProjectProvider initialState={DEFAULT_TECHNICAL_STATE}> {/* Technical Backbone */}
                <NotificationProvider>
                    <MaintenanceProvider>
                        <AssetProvider> {/* Centralized Asset State */}
                            <RiskProvider>
                                <HashRouter>
                                    <DocumentProvider>
                                        <ContextAwarenessProvider>
                                            <Routes>
                                                <Route path="/login" element={<Login />} />
                                                <Route path="/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
                                            </Routes>
                                        </ContextAwarenessProvider>
                                    </DocumentProvider>
                                </HashRouter>
                            </RiskProvider>
                        </AssetProvider>
                    </MaintenanceProvider>
                </NotificationProvider>
            </ProjectProvider>
        </GlobalProvider>
    );
};

export default App;