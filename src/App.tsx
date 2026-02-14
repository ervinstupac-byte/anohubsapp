import React, { useState, useEffect, Suspense, lazy, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { HashRouter, useLocation, useNavigate, Route, Routes, useParams, Navigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';

// --- 1. CONTEXTS ---
import { GlobalProvider } from './contexts/GlobalProvider.tsx';
import { useAuth } from './contexts/AuthContext.tsx';
import { NavigationProvider } from './contexts/NavigationContext.tsx';
import { useRisk, RiskProvider } from './contexts/RiskContext.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { useAudit } from './contexts/AuditContext.tsx';
import { ProjectProvider } from './contexts/ProjectContext.tsx'; // Technical Backbone
import { DEFAULT_TECHNICAL_STATE } from './core/TechnicalSchema.ts';
// ClientProvider removed (Simulation)
import { NotificationProvider } from './contexts/NotificationContext.tsx'; // Live Notifications
import { MaintenanceProvider } from './contexts/MaintenanceContext.tsx'; // Logbook
import { AssetProvider } from './contexts/AssetContext.tsx';
import { useRiskCalculator } from './hooks/useRiskCalculator.ts';
import { DocumentProvider } from './contexts/DocumentContext.tsx';
import { ContextAwarenessProvider } from './contexts/ContextAwarenessContext.tsx';
import { DrillDownProvider } from './contexts/DrillDownContext.tsx'; // <--- NEW Phase 3
import { CommandPalette } from './components/ui/CommandPalette.tsx'; // <--- NEW Phase 3
import { useToast } from './stores/useAppStore';
import { useTelemetryStore } from './features/telemetry/store/useTelemetryStore';
import { useAppStore } from './stores/useAppStore';

// --- 2. CORE COMPONENTS ---
import { Login } from './components/Login.tsx';
import { Feedback } from './components/Feedback.tsx';
// ClientDashboard removed (Simulation)
// MaintenanceLogbook removed (Unused)
import { Onboarding } from './components/Onboarding.tsx';
import { Spinner } from './shared/components/ui/Spinner';
import { LanguageSelector } from './components/LanguageSelector.tsx';
import { SystemStressTest } from './components/debug/SystemStressTest.tsx'; // Debug

import { Sidebar } from './components/diagnostic-twin/Sidebar.tsx';
import { NeuralFlowMap } from './components/diagnostic-twin/NeuralFlowMap.tsx';
import { FleetOverview } from './components/diagnostic-twin/FleetOverview.tsx';
import { DigitalPanel } from './components/diagnostic-twin/DigitalPanel.tsx';
import { UnderConstruction } from './components/ui/UnderConstruction.tsx';
import { LoadingShimmer } from './shared/components/ui/LoadingShimmer';
import { Breadcrumbs } from './shared/components/ui/Breadcrumbs';
import { VoiceAssistant } from './components/VoiceAssistant.tsx';
import { DashboardHeader } from './components/DashboardHeader.tsx';
import { WorkflowHeader } from './components/ui/WorkflowHeader'; // NEW: Global health status bar
import { AssetOnboardingWizard } from './components/digital-twin/AssetOnboardingWizard.tsx'; // NC-21000
const MasterSovereignDashboard = lazy(() => import('./components/dashboard/MasterSovereignDashboard').then(m => ({ default: m.MasterSovereignDashboard })));
import { GlobalFooter } from './components/GlobalFooter.tsx';
import { DataSyncBridge } from './components/DataSyncBridge';
import { ProjectPhaseGuide } from './components/ProjectPhaseGuide';
import { GlobalModalManager } from './components/managers/GlobalModalManager';
import { useCerebro } from './contexts/ProjectContext';
import { SystemBootScreen } from './components/ui/SystemBootScreen.tsx';
import { SimulationController } from './components/diagnostic-twin/SimulationController.tsx';
import { CommanderTerminal } from './components/dashboard/CommanderTerminal.tsx';
import { LibraryHealthMonitor } from './components/knowledge/LibraryHealthMonitor';
import { useProjectConfigStore } from './features/config/ProjectConfigStore';

// --- 3. ASSETS & TYPES ---
import type { AppView } from './contexts/NavigationContext.tsx';
import { ROUTES } from './routes/paths.ts';
import { useSentinelWatchdog } from './hooks/useSentinelWatchdog.ts';
import { useSafeExit } from './hooks/useSafeExit'; // NEW
import { BootstrapService } from './services/BootstrapService';
import { lazyHydratePhysicsSnapshots } from './services/DashboardDataService';
import { RoleGuard } from './components/auth/RoleGuard.tsx'; // <--- NEW
import { AccessDenied } from './components/auth/AccessDenied.tsx'; // <--- NEW
import { DetachedModuleLayout } from './components/DetachedModuleLayout.tsx'; // NC-9000
import { useSovereignSync } from './hooks/useSovereignSync.ts'; // NC-9000
import { SovereignOrchestrator } from './services/SovereignOrchestrator'; // NC-Sovereign-Integration

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
const InfrastructureHub = lazy(() => import('./components/infrastructure/InfrastructureHub.tsx').then(m => ({ default: m.InfrastructureHub })));
const ExecutiveDashboard = lazy(() => import('./components/dashboard/ExecutiveDashboard.tsx').then(m => ({ default: m.ExecutiveDashboard })));
const ExecutiveFinancialDashboard = lazy(() => import('./components/ExecutiveFinancialDashboard.tsx').then(m => ({ default: m.ExecutiveFinancialDashboard })));
const StructuralIntegrity = lazy(() => import('./components/StructuralIntegrity.tsx').then(m => ({ default: m.StructuralIntegrity })));

const AdminApproval = lazy(() => import('./components/AdminApproval.tsx').then(m => ({ default: m.AdminApproval })));
const AdminHealth = lazy(() => import('./pages/AdminHealth').then(m => ({ default: m.default })));

// NC-20701: Ghost Protocol Pages
const ProjectGenesisPage = lazy(() => import('./pages/ProjectGenesisPage'));
const KnowledgeCapturePage = lazy(() => import('./pages/KnowledgeCapturePage'));
const SovereignLedgerPage = lazy(() => import('./pages/SovereignLedgerPage'));
const ScadaCore = lazy(() => import('./components/dashboard/ScadaCore').then(m => ({ default: m.ScadaCore }))); // NC-21100
const SystemAuditLog = lazy(() => import('./components/ui/SystemAuditLog').then(m => ({ default: m.SystemAuditLog })));
const ForensicDashboard = lazy(() => import('./components/forensics/ForensicDashboard').then(m => ({ default: m.ForensicDashboard })));
const ForensicDeepDive = lazy(() => import('./components/forensics/ForensicDeepDive').then(m => ({ default: m.ForensicDeepDive }))); // NC-21100

const ForensicHub = lazy(() => import('./pages/ForensicHub').then(m => ({ default: m.default })));
const SandboxPage = lazy(() => import('./pages/SandboxPage'));
const ToolboxLaunchpad = lazy(() => import('./components/ToolboxLaunchpad.tsx').then(m => ({ default: m.ToolboxLaunchpad })));
const SpecializedDiagnostics = lazy(() => import('./components/SpecializedDiagnostics.tsx').then(m => ({ default: m.SpecializedDiagnostics })));
const LearningLab = lazy(() => import('./components/diagnostic-twin/LearningLab.tsx').then(m => ({ default: m.LearningLab })));
const PrecisionAudit = lazy(() => import('./components/PrecisionAudit.tsx').then(m => ({ default: m.PrecisionAudit })));
const FrancisHub = React.lazy(() => import('./features/francis/components/FrancisHub').then(module => ({ default: module.FrancisHub })));
const SOPViewer = React.lazy(() => import('./components/francis/SOPViewer').then(module => ({ default: module.SOPViewer })));
const LegacySOPViewer = React.lazy(() => import('./components/francis/LegacySOPViewer').then(module => ({ default: module.LegacySOPViewer }))); // NC-21000
const AlignmentWizardWrapper = React.lazy(() => import('./components/maintenance/AlignmentWizardWrapper').then(module => ({ default: module.AlignmentWizardWrapper }))); // NC-21000
// Francis Turbine Module - All routes extracted to dedicated sub-router
// Francis Turbine Module - All routes extracted to dedicated sub-router
const FrancisRouter = React.lazy(() => import('./routes/FrancisRouter'));

// Maintenance Module - Extracted to dedicated sub-router
const MaintenanceRouter = React.lazy(() => import('./routes/MaintenanceRouter.tsx'));

// Multi-tier entry points (Engineer / Owner / Hydroschool)
const EngineerLanding = React.lazy(() => import('./pages/EngineerLanding').then(m => ({ default: m.EngineerLanding })));
const OwnerLanding = React.lazy(() => import('./pages/OwnerLanding').then(m => ({ default: m.OwnerLanding })));
const HydroschoolLanding = React.lazy(() => import('./pages/HydroschoolLanding').then(m => ({ default: m.HydroschoolLanding })));

// Unified Navigation States
const MapModule = lazy(() => import('./components/MapModule.tsx').then(m => ({ default: m.MapModule })));
const AssetTypeSelector = lazy(() => import('./components/navigation/AssetTypeSelector').then(m => ({ default: m.AssetTypeSelector })));


// --- 4a. SCADA SAFE FALLBACKS ---
const LoadingScreen: React.FC = () => (
    <div className="min-h-screen bg-slate-950 text-slate-100 grid place-items-center">
        <div className="text-sm font-mono text-slate-400">Loading…</div>
    </div>
);

const ScadaRecoveryFallback: React.FC = () => (
    <div className="min-h-screen bg-slate-950 text-slate-100 grid grid-cols-12 gap-6 p-6">
        <div className="col-span-8 bg-[#111111] border border-[#222222] rounded-xl relative overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SCADA Mimic</div>
                <div className="text-[10px] font-mono text-slate-400">η-head: — • Q: — • RPM: —</div>
            </div>
            <div className="p-6">
                <svg viewBox="0 0 1200 600" className="w-full h-[520px]">
                    <rect x="0" y="0" width="1200" height="600" fill="#111111" />
                    <rect x="60" y="120" width="360" height="60" rx="12" fill="#111111" stroke="#444444" strokeWidth="2" />
                    <text x="80" y="110" fill="#888888" fontSize="14" fontFamily="monospace">Penstock</text>
                    <circle cx="600" cy="150" r="55" fill="none" stroke="#444444" strokeWidth="4" />
                    <text x="560" y="240" fill="#888888" fontSize="12" fontFamily="monospace">Runner</text>
                    <rect x="840" y="120" width="300" height="60" rx="12" fill="#111111" stroke="#444444" strokeWidth="2" />
                    <rect x="60" y="320" width="1080" height="200" rx="16" fill="#111111" stroke="#444444" strokeWidth="2" />
                    <text x="80" y="350" fill="#94a3b8" fontSize="12" fontFamily="monospace">Flow • NO DATA</text>
                    <text x="80" y="400" fill="#94a3b8" fontSize="12" fontFamily="monospace">Static Head • NO DATA</text>
                    <text x="540" y="300" fill="#ef4444" fontSize="16" fontFamily="monospace">SCADA MODULE RECOVERED • NO DATA</text>
                </svg>
            </div>
        </div>
        <div className="col-span-4 bg-[#111111] border border-[#222222] rounded-xl p-6">
            <div className="text-[10px] text-slate-300 uppercase font-mono tracking-widest mb-2">Project Parameters</div>
            <div className="text-xs text-slate-400 font-mono">No data available</div>
        </div>
    </div>
);


// --- 5. COMMAND CENTER DASHBOARD ---
// Replaced with Toolbox Launchpad for authentic engineering focus

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

    if (loading) return null; // Boot screen already parallelizes this. Avoid double spinner.
    if (!user) return null; // useEffect handles redirect to /login
    return <>{children}</>;
};

// --- 8. APP LAYOUT ---

// New component for collapsible fleet section
// FleetSection removed - Moved to Sidebar.tsx
const AppLayout: React.FC = () => {
    useSovereignSync(false); // NC-9000: Commander Mode (Broadcaster)
    useSentinelWatchdog(); // Infrastructure Watchdog
    useSafeExit(); // INFRASTRUCTURE: Guard unsaved data - NEW
    const location = useLocation();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { riskState: questionnaireRisk } = useRisk(); // Renamed Risk Context
    const { status: assetRiskStatus, reason: riskReasons } = useRiskCalculator(); // Calculated Asset Risk
    const { logAction } = useAudit();
    const { user, signOut } = useAuth(); // Auth integration
    const { showToast } = useToast();

    // Unified Navigation States
    const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false); // Map State
    const [showSignOutDialog, setShowSignOutDialog] = useState(false); // Sign Out Dialog
    const { state: cerebroState } = useCerebro();
    const isCriticalDemo = false;
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

    useEffect(() => {
        try {
            const didReset = useTelemetryStore.getState().hardResetIfSchemaMismatch?.();
            if (didReset) {
                showToast('Sovereign Core: Schema Updated. Workspace Synchronized.', 'info');
            }
            try { useProjectConfigStore.getState().integrityCheck(); } catch { }

            // Initialize Sovereign Orchestrator
            SovereignOrchestrator.initialize().catch(err => 
                console.error('[App] Sovereign Orchestrator failed to initialize:', err)
            );
        } catch { /* noop */ }
    }, []);
    // Listen for custom wizard trigger event from NeuralFlowMap
    useEffect(() => {
        // Reconstruction event listeners (moved to GlobalModalManager, but keeping reconstruction listeners here for now if they are used elsewhere? 
        // Actually GlobalModalManager handles the UI for reconstruction. 
        // But AppLayout had the listeners. If I remove them from AppLayout, does anything else break?
        // AppLayout state 'reconstructing' was unused in the JSX I saw! 
        // Wait, I didn't see 'reconstructing' state in AppLayout JSX.
        // Let's look at the listeners in AppLayout again.
        // const onStart = (e: any) => { setReconstructing(true); ... };
        // But I don't see 'const [reconstructing, setReconstructing] = useState(false)' in the AppLayout code I read!
        // I saw 'const [isWizardOpen, setIsWizardOpen] = useState(false);'
        // I saw 'const [isPreviewOpen, setIsPreviewOpen] = useState(false);' (implied by usage, but wait, I didn't see the useState definition for isPreviewOpen in the read output!
        // Let me check lines 225-235 again.
        // 229→    const [isWizardOpen, setIsWizardOpen] = useState(false);
        // 230→    const [isMapOpen, setIsMapOpen] = useState(false); // Map State
        // 231→    const [showSignOutDialog, setShowSignOutDialog] = useState(false); // Sign Out Dialog
        // I DO NOT see 'isPreviewOpen' or 'reconstructing' state in AppLayout!
        // But the useEffect (lines 268-289) uses them:
        // 269→        const onStart = (e: any) => { setReconstructing(true); setReconstructProgress(0); };
        // 277→        const handleOpenPreview = () => setIsPreviewOpen(true);
        // This implies I missed the useState definitions or they are defined elsewhere?
        // Or maybe I missed a chunk of code in my read?
        // Lines 212-238 seem to cover the state definitions.
        // If they are missing, then App.tsx might have errors or I misread.
        // Wait, 'const [isPreviewOpen, setIsPreviewOpen] = useState(false);' MUST be there if it's used.
        // Maybe I missed it in the truncation or skip?
        // Regardless, I want to REMOVE them.
        
        // I will remove the entire useEffect block that handles these events, and the state definitions.
        

    }, []);


    useEffect(() => {
        const hasCompleted = localStorage.getItem('hasCompletedOnboarding') === 'true';
        if (!hasCompleted) setShowOnboarding(true);
    }, []);

    // NC-20400: Global click diagnostic logger (DEV only)
    useEffect(() => {
        if (!import.meta.env.DEV) return;
        const handler = (e: MouseEvent) => {
            const el = e.target as HTMLElement;
            if (!el) return;
            const tag = el.tagName;
            const cls = (el.className || '').toString().slice(0, 80);
            const zi = window.getComputedStyle(el).zIndex;
            console.log(`[ClickTrace] <${tag}> z:${zi} class="${cls}"`);
        };
        window.addEventListener('click', handler, true);
        return () => window.removeEventListener('click', handler, true);
    }, []);

    // Lazy hydration: prefetch physics snapshots shortly after user session starts
    useEffect(() => {
        try {
            if (user) {
                lazyHydratePhysicsSnapshots(2000, 3);
            }
        } catch (e) { /* noop */ }
    }, [user]);

    const handleOnboardingComplete = () => {
        localStorage.setItem('hasCompletedOnboarding', 'true');
        setShowOnboarding(false);
    };

    const navigateTo = useCallback((view: AppView) => {
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
            'plantMaster': '/infrastructure/plant-master',
            'bidEvaluator': '/infrastructure/bid-evaluator',
            'hydrologyLab': '/infrastructure/hydrology-lab',
            'infrastructure': '/infrastructure',

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
            'forensicHub': '/forensic-hub',
            'adminApproval': '/admin-approval',
            'clientPortal': '/client-portal',
            'francisHub': '/francis/hub',
            'assetOnboarding': '/asset-onboarding'
        };
        const target = routeMap[view];
        if (target) {
            console.log('[Navigation] Target found:', target);
            navigate(target);
        } else {
            console.error('[Navigation] No route found for view:', view);
        }
    }, [navigate]);

    const navValue = useMemo(() => ({
        currentPage: isHub ? 'home' : 'intro' as AppView,
        navigateTo,
        navigateBack: () => navigate(-1),
        navigateToHub: () => navigate('/'),
        navigateToTurbineDetail: (id: string) => navigate(`/turbine/${id}`),
        showOnboarding,
        completeOnboarding: handleOnboardingComplete,
        showFeedbackModal: () => setIsFeedbackVisible(true),
        // --- NEW: Golden Thread Navigation Helpers ---
        navigateToExecutive: () => navigate('/executive'),
        navigateToBuilder: () => navigate('/hpp-builder'),
        navigateToToolbox: () => navigate('/'),
        navigateToMaintenance: () => navigate('/maintenance/dashboard')
    }), [isHub, navigateTo, navigate, showOnboarding, handleOnboardingComplete]);

    return (
        <NavigationProvider value={navValue}>
            <DrillDownProvider>
                {/* Fix 3: Layout "Hidden Corners" & Space Efficiency */}
                <div className={`field-mode h-screen w-screen bg-[#05070a] text-slate-100 overflow-hidden selection:bg-cyan-500/30 font-sans relative grid ${isSidebarOpen ? 'grid-cols-[280px_1fr]' : 'grid-cols-[0px_1fr]'} transition-[grid-template-columns] duration-300 bg-[#020617] ${isCriticalDemo ? 'shadow-[inset_0_0_100px_rgba(239,68,68,0.2)]' : ''}`}>

                    {/* The "Elite" Background Glows */}
                    <div className="fixed inset-0 pointer-events-none z-0">
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/20 blur-[120px] rounded-full" />
                        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full" />
                        <div className="noise-overlay opacity-20" />
                    </div>

                    {/* NEURAL BRIDGE (DATA SYNC V4.5) */}
                    <DataSyncBridge />

                    {/* UNIFIED SIDEBAR */}
                    <Sidebar
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                        showMap={isMapOpen}
                        onToggleMap={() => setIsMapOpen(!isMapOpen)}
                        onRegisterAsset={() => {
                            navigate('/asset-onboarding');
                            setIsSidebarOpen(false);
                        }}
                    />

                    {/* MAIN AREA */}
                    {/* MAIN AREA */}
                    {/* NC-25400: FIXED - COL-START-2 PREVENTS SIDEBAR OVERLAP */}
                    <div className="col-start-2 flex-1 flex flex-col min-h-0 relative overflow-y-auto custom-scrollbar w-full bg-slate-900/20">

                        {/* NEW: Global Workflow Header - Machine Health & Navigation */}
                        <WorkflowHeader />

                        <DashboardHeader
                            onToggleSidebar={() => setIsSidebarOpen(true)}
                        />

                        <div className={`flex-grow w-full relative z-10 ${isFullPage ? 'flex flex-col' : ''}`}>
                            <Suspense fallback={<LoadingShimmer />}>
                                <div className={!isFullPage ? "max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12" : "flex-grow w-full"}>
                                    {!isHub && location.pathname !== '/dashboard' && location.pathname !== '/executive' && <Breadcrumbs />}
                                    <ErrorBoundary fallback={
                                        <div className="p-8 text-center text-red-500">CRITICAL ROUTER ERROR</div>
                                    }>
                                        <div className="w-full">
                                            <Routes location={location}>
                                                {/* NC-25200: Black Hole Fix - Redirect to Fleet */}
                                                <Route index element={<Navigate to="/fleet" replace />} />
                                                <Route path={ROUTES.DIAGNOSTIC_TWIN} element={<NeuralFlowMap />} />
                                                <Route path="/asset-onboarding" element={<AssetOnboardingWizard isOpen={true} onClose={() => window.history.back()} />} />
                                                <Route path="/sandbox" element={<Suspense fallback={<LoadingScreen />}><SandboxPage /></Suspense>} />
                                                <Route path="/francis/*" element={<FrancisRouter />} />
                                                <Route path="profile" element={<UserProfile />} />
                                                <Route path="map" element={<GlobalMap />} />
                                                <Route path="risk-assessment" element={<QuestionnaireWrapper />} />
                                                <Route path="questionnaire-summary" element={<QuestionnaireSummary />} />
                                                <Route path="risk-report" element={<RiskReport />} />
                                                <Route path="investor-briefing" element={<InvestorBriefing />} />
                                                <Route path="engineer" element={<RoleGuard allowedRoles={['ENGINEER', 'TECHNICIAN', 'MANAGER']}><EngineerLanding /></RoleGuard>} />
                                                <Route path="owner" element={<RoleGuard allowedRoles={['OWNER', 'MANAGER']}><OwnerLanding /></RoleGuard>} />
                                                <Route path="hydroschool" element={<HydroschoolLanding />} />
                                                <Route path="standard-of-excellence" element={<StandardOfExcellence onCommit={() => { }} />} />
                                                <Route path="digital-introduction" element={<DigitalIntroduction />} />
                                                <Route path="hpp-builder" element={<RoleGuard allowedRoles={['ENGINEER', 'MANAGER', 'TECHNICIAN']}><HPPBuilder /></RoleGuard>} />
                                                <Route path="hpp-improvements" element={<HPPImprovements />} />
                                                <Route path="installation-guarantee" element={<InstallationGuarantee />} />
                                                <Route path="gender-equity" element={<GenderEquity />} />
                                                <Route path="infrastructure/*" element={<RoleGuard allowedRoles={['ENGINEER', 'MANAGER', 'TECHNICIAN']}><InfrastructureHub /></RoleGuard>} />
                                                <Route path="turbine/:id" element={<TurbineDetailWrapper />} />
                                                <Route path="phase-guide" element={<ProjectPhaseGuide />} />
                                                <Route path="river-wildlife" element={<RiverWildlife />} />
                                                <Route path="revitalization-strategy" element={<RevitalizationStrategy />} />
                                                <Route path="digital-integrity" element={<DigitalIntegrity />} />
                                                <Route path="contract-management" element={<ContractManagement />} />
                                                <Route path="library" element={<ComponentLibrary />} />
                                                <Route path="knowledge/health-monitor" element={<LibraryHealthMonitor />} />
                                                <Route path="vision" element={<UnderConstruction />} />
                                                <Route path="forensic-hub" element={<ForensicHub />} />
                                                <Route path="maintenance/*" element={<MaintenanceRouter />} />
                                                <Route path="executive" element={<RoleGuard allowedRoles={['MANAGER', 'TECHNICIAN']}><ExecutiveDashboard /></RoleGuard>} />
                                                <Route path="executive/finance" element={<RoleGuard allowedRoles={['MANAGER', 'TECHNICIAN']}><ExecutiveFinancialDashboard /></RoleGuard>} />
                                                <Route path="structural-integrity" element={<StructuralIntegrity />} />
                                                <Route path="admin-approval" element={<RoleGuard allowedRoles={['MANAGER', 'TECHNICIAN']}><AdminApproval /></RoleGuard>} />
                                                <Route path="admin/health" element={<RoleGuard allowedRoles={['MANAGER', 'TECHNICIAN']}><AdminHealth /></RoleGuard>} />
                                                <Route path="/forensics" element={<Suspense fallback={<LoadingScreen />}><ForensicDashboard /></Suspense>} />
                                                <Route path="audit" element={<SystemAuditLog />} />
                                                <Route path="stress-test" element={<SystemStressTest />} />
                                                <Route path="precision-audit" element={<PrecisionAudit />} />
                                                <Route path="learning-lab" element={<LearningLab />} />
                                                <Route path="/access-denied" element={<AccessDenied />} />
                                                <Route path="/genesis" element={<ProjectGenesisPage />} />
                                                <Route path="/knowledge/capture" element={<KnowledgeCapturePage />} />
                                                <Route path="/governance/ledger" element={<SovereignLedgerPage />} />
                                                <Route path="fleet" element={<FleetOverview showMap={isMapOpen} onToggleMap={() => setIsMapOpen(!isMapOpen)} onRegisterAsset={() => { navigate('/asset-onboarding'); setIsSidebarOpen(false); }} />} />
                                                <Route path="alerts" element={<Suspense fallback={<LoadingScreen />}><ScadaCore /></Suspense>} />
                                                <Route path="forensic-hub" element={<Suspense fallback={<LoadingScreen />}><ForensicHub /></Suspense>} />
                                                <Route path="forensics" element={<Suspense fallback={<LoadingScreen />}><ForensicDashboard /></Suspense>} />
                                                <Route path="maintenance/alignment" element={<Suspense fallback={<LoadingScreen />}><AlignmentWizardWrapper /></Suspense>} />
                                                <Route path="/francis/sop-shaft-alignment" element={<Suspense fallback={<LoadingScreen />}><AlignmentWizardWrapper /></Suspense>} />
                                                <Route path="/francis/legacy/:sopId" element={<Suspense fallback={<LoadingScreen />}><LegacySOPViewer /></Suspense>} />
                                                <Route path="forensics/deep-dive" element={<Suspense fallback={<LoadingScreen />}><ForensicDeepDive /></Suspense>} />
                                                <Route path="*" element={<Navigate to="/" replace />} />
                                            </Routes>
                                        </div>
                                    </ErrorBoundary>
                                </div>
                            </Suspense>
                        </div>
                    </div>
                    <GlobalFooter />
                </div >

                <VoiceAssistant />
                {isFeedbackVisible && <Feedback onClose={() => setIsFeedbackVisible(false)} />}
                
                {/* Global Modals Manager (Handles System Overview, Print, Passport, etc.) */}
                <GlobalModalManager />

                <Suspense fallback={null}>
                    <AssetTypeSelector />
                </Suspense>

                <SimulationController />
                <CommanderTerminal />
                <CommandPalette /> {/* GLOBAL COMMAND PALETTE - NOW INSIDE DRILLDOWN PROVIDER */}

                {/* Modals moved outside layout to prevent clipping */}
                {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
                <Suspense fallback={<Spinner />}>
                    <MapModule isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />
                </Suspense>
            </DrillDownProvider >
        </NavigationProvider >
    );
};

const App: React.FC = () => {
    // BOOT SEQUENCE STATE (useEffect will resolve this)
    const [booting, setBooting] = useState(true);

    // DNS/DOMAIN REDIRECT GUARD: Redirect www.app.anohubs.com to app.anohubs.com
    useEffect(() => {
        const hostname = window.location.hostname;
        if (hostname.includes('www.app')) {
            const currentPath = window.location.pathname + window.location.search + window.location.hash;
            const targetUrl = `https://app.anohubs.com${currentPath}`;
            console.warn('[DNS Redirect] Redirecting from www.app.anohubs.com to app.anohubs.com');
            window.location.replace(targetUrl);
            return;
        }
    }, []);

    // NUCLEAR RESET / CLEAN SLATE OPTION
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const shouldReset = window.location.href.includes('reset=true') || urlParams.get('clean') === 'true';

        if (shouldReset) {
            console.warn('NUCLEAR RESET: Clearing LocalStorage & SessionStorage');
            localStorage.clear();
            sessionStorage.clear();
            // Force reload to apply clean state without the param
            const cleanUrl = window.location.href.split('?')[0];
            window.location.href = cleanUrl;
        }
    }, []);

    // NC-24000: Hydrate persistence layer
    useEffect(() => {
        useTelemetryStore.getState().hydrate();
        useAppStore.getState().hydrateSettings();
    }, []);

    // EMERGENCY INITIALIZATION TIMEOUT (Force Handshake Resolution)
    useEffect(() => {
        let mounted = true;
        let timer: NodeJS.Timeout;

        const startBootstrap = async () => {
            console.log('[System] Initiating controlled bootstrap sequence...');
            try {
                await BootstrapService.boot();
                if (mounted) {
                    console.log('[System] Bootstrap complete. Releasing lock.');
                    setBooting(false);
                    clearTimeout(timer);
                }
            } catch (err) {
                console.error('[System] Bootstrap failed:', err);
                // FORCE UNLOCK ON ERROR - SMASH THE WALL
                setBooting(false);
                clearTimeout(timer);
            }
        };
        startBootstrap();

        timer = setTimeout(() => {
            if (mounted) {
                console.warn('[System] Force-resolving boot sequence after timeout.');
                setBooting(false);
            }
        }, 5000); // 5 seconds max

        return () => {
            mounted = false;
            clearTimeout(timer);
        };
    }, []); // Run once on mount

    return (
        <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ErrorBoundary fallback={
                <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-white p-8">
                    <h1 className="text-3xl font-bold text-red-500 mb-4">CRITICAL SYSTEM FAILURE</h1>
                    <p className="text-slate-400 mb-8 max-w-lg text-center">The Neural Core encountered an unrecoverable error during initialization.</p>
                    <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-600 rounded hover:bg-red-700">REBOOT SYSTEM</button>
                    <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="mt-4 text-xs text-slate-600 underline">CLEAR CACHE & REBOOT</button>
                </div>
            }>
                <GlobalProvider>
                    {booting ? (
                        <SystemBootScreen key="boot-screen" onComplete={() => setBooting(false)} />
                    ) : (
                        <div className="w-full h-full animate-in fade-in zoom-in duration-300">
                            <ContextAwarenessProvider>
                                <Routes>
                                    {/* NC-9000: Detached Module Route (No Layout) */}
                                    <Route path="/detach/:moduleId" element={<DetachedModuleLayout />} />

                                    <Route path="/login" element={<Login />} />
                                    <Route path="/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
                                    <Route
                                        path="/master"
                                        element={
                                            <ProtectedRoute>
                                                <Suspense fallback={<LoadingScreen />}>
                                                    <ErrorBoundary fallback={<ScadaRecoveryFallback />}>
                                                        <MasterSovereignDashboard />
                                                    </ErrorBoundary>
                                                </Suspense>
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/scada/core"
                                        element={
                                            <ProtectedRoute>
                                                <Suspense fallback={<LoadingScreen />}>
                                                    <ErrorBoundary fallback={<ScadaRecoveryFallback />}>
                                                        <ScadaCore />
                                                    </ErrorBoundary>
                                                </Suspense>
                                            </ProtectedRoute>
                                        }
                                    />
                                </Routes>
                            </ContextAwarenessProvider>
                        </div>
                    )}
                </GlobalProvider>
            </ErrorBoundary>
        </HashRouter>
    );
};

export default App;
