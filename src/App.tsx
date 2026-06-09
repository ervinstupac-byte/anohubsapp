import React, { useState, useEffect, Suspense, lazy, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { HashRouter, useLocation, useNavigate, Route, Routes, useParams, Navigate } from 'react-router-dom';

// --- 1. CONTEXTS ---
import { GlobalProvider } from './contexts/GlobalProvider.tsx';
import { useAuth } from './contexts/AuthContext.tsx';
import { NavigationProvider } from './contexts/NavigationContext.tsx';
import { useRisk } from './contexts/RiskContext.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { useAudit } from './contexts/AuditContext.tsx';
// Providers removed or handled elsewhere to reduce bundle and avoid unused imports
// (ProjectProvider, DEFAULT_TECHNICAL_STATE, NotificationProvider,
// MaintenanceProvider, AssetProvider, RiskProvider, DocumentProvider)
import { useRiskCalculator } from './hooks/useRiskCalculator.ts'; // <--- NEW
import { ContextAwarenessProvider } from './contexts/ContextAwarenessContext.tsx';
import { DrillDownProvider } from './contexts/DrillDownContext.tsx'; // <--- NEW Phase 3
import { CommandPalette } from './components/ui/CommandPalette.tsx'; // <--- NEW Phase 3

// --- 2. CORE COMPONENTS ---
import { Login } from './components/Login.tsx';
import { Feedback } from './components/Feedback.tsx';
// ClientDashboard removed (Simulation)
import { Onboarding } from './components/Onboarding.tsx';
import { Spinner } from './shared/components/ui/Spinner';
import { SystemStressTest } from './components/debug/SystemStressTest.tsx'; // Debug

import { Sidebar } from './components/diagnostics/Sidebar.tsx';
import { NeuralFlowMap } from './components/diagnostics/NeuralFlowMap.tsx';
import { AssetRegistrationWizard } from './components/AssetRegistrationWizard.tsx';
import { UnderConstruction } from './components/ui/UnderConstruction.tsx';
import { LoadingShimmer } from './shared/components/ui/LoadingShimmer';
import { Breadcrumbs } from './shared/components/ui/Breadcrumbs';
import { VoiceAssistant } from './components/VoiceAssistant.tsx';
import { DashboardHeader } from './components/DashboardHeader.tsx';
import { WorkflowHeader } from './components/ui/WorkflowHeader'; // NEW: Global health status bar
import { GlobalFooter } from './components/GlobalFooter.tsx';
import { DataSyncBridge } from './components/DataSyncBridge';
import { ProjectPhaseGuide } from './components/ProjectPhaseGuide';
const PrintPreviewModal = React.lazy(() => import('./components/modals/PrintPreviewModal.tsx').then(m => ({ default: m.PrintPreviewModal })));
import { TRIGGER_FORENSIC_EXPORT } from './components/diagnostics/Sidebar.tsx';
import { useCerebro } from './contexts/ProjectContext';
import { SystemBootScreen } from './components/ui/SystemBootScreen.tsx';
import { CommanderTerminal } from './components/dashboard/CommanderTerminal.tsx';
import { LibraryHealthMonitor } from './components/knowledge/LibraryHealthMonitor';

// --- 3. ASSETS & TYPES ---
import type { AppView } from './contexts/NavigationContext.tsx';
import { ROUTES } from './routes/paths.ts';
import { useSentinelWatchdog } from './hooks/useSentinelWatchdog.ts';
import { useSafeExit } from './hooks/useSafeExit'; // NEW
import { BootstrapService } from './services/BootstrapService';
import { lazyHydratePhysicsSnapshots } from './services/DashboardDataService';
import { RoleGuard } from './components/auth/RoleGuard.tsx'; // <--- NEW
import { AccessDenied } from './components/auth/AccessDenied.tsx'; // <--- NEW
import { RoleBasedRedirect } from './components/RoleBasedRedirect'; // <--- NEW: Role-based routing

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
const HPPBuilder = lazy(() => import('./components/HPPBuilder.tsx').then(m => ({ default: m.HPPBuilder })));
const RiverWildlife = lazy(() => import('./components/RiverWildlife.tsx').then(m => ({ default: m.RiverWildlife })));
const RevitalizationStrategy = lazy(() => import('./components/RevitalizationStrategy.tsx').then(m => ({ default: m.RevitalizationStrategy })));
const DigitalIntegrity = lazy(() => import('./components/DigitalIntegrity.tsx').then(m => ({ default: m.DigitalIntegrity })));
const ContractManagement = lazy(() => import('./components/ContractManagement.tsx').then(m => ({ default: m.ContractManagement })));
const ComponentLibrary = lazy(() => import('./components/ComponentLibrary.tsx').then(m => ({ default: m.ComponentLibrary })));
const InfrastructureHub = lazy(() => import('./components/infrastructure/InfrastructureHub.tsx').then(m => ({ default: m.InfrastructureHub })));
const ExecutiveDashboard = lazy(() => import('./components/dashboard/ExecutiveDashboard.tsx').then(m => ({ default: m.ExecutiveDashboard })));
const StructuralIntegrity = lazy(() => import('./components/StructuralIntegrity.tsx').then(m => ({ default: m.StructuralIntegrity })));

const AdminApproval = lazy(() => import('./components/AdminApproval.tsx').then(m => ({ default: m.AdminApproval })));
const AdminHealth = lazy(() => import('./pages/AdminHealth').then(m => ({ default: m.default })));

// Maintenance components moved to MaintenanceRouter
const ForensicDashboard = lazy(() => import('./components/forensics/ForensicDashboard').then(m => ({ default: m.ForensicDashboard })));

// ToolboxLaunchpad and SpecializedDiagnostics removed (unused)
const LearningLab = lazy(() => import('./components/diagnostics/LearningLab.tsx').then(m => ({ default: m.LearningLab })));
const PrecisionAudit = lazy(() => import('./components/PrecisionAudit.tsx').then(m => ({ default: m.PrecisionAudit })));
const SystemPredictionLab = lazy(() => import('./components/SystemPredictionLab.tsx').then(m => ({ default: m.SystemPredictionLab })));
const VibrationAnalysisLab = lazy(() => import('./components/VibrationAnalysisLab.tsx').then(m => ({ default: m.VibrationAnalysisLab })));
const PredictiveIntelligenceCenter = lazy(() => import('./components/PredictiveIntelligenceCenter.tsx').then(m => ({ default: m.PredictiveIntelligenceCenter })));

// Predictive Intelligence Labs - Mechanical Forensics
const ShaftPlumbnessLab = lazy(() => import('./components/ShaftPlumbnessLab.tsx').then(m => ({ default: m.ShaftPlumbnessLab })));
const CouplingBoltTensioningLab = lazy(() => import('./components/CouplingBoltTensioningLab.tsx').then(m => ({ default: m.CouplingBoltTensioningLab })));
const GuideBearingClearanceLab = lazy(() => import('./components/GuideBearingClearanceLab.tsx').then(m => ({ default: m.GuideBearingClearanceLab })));
const HeadCoverDeflectionLab = lazy(() => import('./components/HeadCoverDeflectionLab.tsx').then(m => ({ default: m.HeadCoverDeflectionLab })));
const JackingOilSystemLab = lazy(() => import('./components/JackingOilSystemLab.tsx').then(m => ({ default: m.JackingOilSystemLab })));
const KaplanBladeTrunnionLab = lazy(() => import('./components/KaplanBladeTrunnionLab.tsx').then(m => ({ default: m.KaplanBladeTrunnionLab })));
const MechanicalBrakeWearLab = lazy(() => import('./components/MechanicalBrakeWearLab.tsx').then(m => ({ default: m.MechanicalBrakeWearLab })));
const RunnerLabyrinthSealLab = lazy(() => import('./components/RunnerLabyrinthSealLab.tsx').then(m => ({ default: m.RunnerLabyrinthSealLab })));
const ShearPinFatigueLab = lazy(() => import('./components/ShearPinFatigueLab.tsx').then(m => ({ default: m.ShearPinFatigueLab })));
const ThrustBearingLoadDistributionLab = lazy(() => import('./components/ThrustBearingLoadDistributionLab.tsx').then(m => ({ default: m.ThrustBearingLoadDistributionLab })));
const StayVaneCrackLab = lazy(() => import('./components/StayVaneCrackLab.tsx').then(m => ({ default: m.StayVaneCrackLab })));

// Predictive Intelligence Labs - Electrical Diagnostics
const GeneratorAirGapLab = lazy(() => import('./components/GeneratorAirGapLab.tsx').then(m => ({ default: m.GeneratorAirGapLab })));
const ExcitationHeatDissipationLab = lazy(() => import('./components/ExcitationHeatDissipationLab.tsx').then(m => ({ default: m.ExcitationHeatDissipationLab })));
const PartialDischargeLab = lazy(() => import('./components/PartialDischargeLab.tsx').then(m => ({ default: m.PartialDischargeLab })));
const RotorPoleImpedanceLab = lazy(() => import('./components/RotorPoleImpedanceLab.tsx').then(m => ({ default: m.RotorPoleImpedanceLab })));
const StatorCoreClampingLab = lazy(() => import('./components/StatorCoreClampingLab.tsx').then(m => ({ default: m.StatorCoreClampingLab })));
const StatorWindingThermalLab = lazy(() => import('./components/StatorWindingThermalLab.tsx').then(m => ({ default: m.StatorWindingThermalLab })));
const TransformerDissolvedGasLab = lazy(() => import('./components/TransformerDissolvedGasLab.tsx').then(m => ({ default: m.TransformerDissolvedGasLab })));

// Predictive Intelligence Labs - Hydraulic Analytics
const DraftTubeAirAdmissionLab = lazy(() => import('./components/DraftTubeAirAdmissionLab.tsx').then(m => ({ default: m.DraftTubeAirAdmissionLab })));
const DraftTubeSurgeLab = lazy(() => import('./components/DraftTubeSurgeLab.tsx').then(m => ({ default: m.DraftTubeSurgeLab })));
const FrancisCavitationProfilingLab = lazy(() => import('./components/FrancisCavitationProfilingLab.tsx').then(m => ({ default: m.FrancisCavitationProfilingLab })));
const KaplanCamCurveLab = lazy(() => import('./components/KaplanCamCurveLab.tsx').then(m => ({ default: m.KaplanCamCurveLab })));
const MainInletValveBypassLab = lazy(() => import('./components/MainInletValveBypassLab.tsx').then(m => ({ default: m.MainInletValveBypassLab })));
const OilCoolerThermalEfficiencyLab = lazy(() => import('./components/OilCoolerThermalEfficiencyLab.tsx').then(m => ({ default: m.OilCoolerThermalEfficiencyLab })));
const PeltonInjectorAlignmentLab = lazy(() => import('./components/PeltonInjectorAlignmentLab.tsx').then(m => ({ default: m.PeltonInjectorAlignmentLab })));
const PeltonNeedleValveLab = lazy(() => import('./components/PeltonNeedleValveLab.tsx').then(m => ({ default: m.PeltonNeedleValveLab })));
const PenstockWaterHammerLab = lazy(() => import('./components/PenstockWaterHammerLab.tsx').then(m => ({ default: m.PenstockWaterHammerLab })));
const SpiralCasePressureLossLab = lazy(() => import('./components/SpiralCasePressureLossLab.tsx').then(m => ({ default: m.SpiralCasePressureLossLab })));
const TrashRackHeadLossLab = lazy(() => import('./components/TrashRackHeadLossLab.tsx').then(m => ({ default: m.TrashRackHeadLossLab })));

// Predictive Intelligence Labs - Operational Scenarios
const BlackStartCapabilityLab = lazy(() => import('./components/BlackStartCapabilityLab.tsx').then(m => ({ default: m.BlackStartCapabilityLab })));
const GovernorDeadbandLab = lazy(() => import('./components/GovernorDeadbandLab.tsx').then(m => ({ default: m.GovernorDeadbandLab })));
const IndexTestingEfficiencyLab = lazy(() => import('./components/IndexTestingEfficiencyLab.tsx').then(m => ({ default: m.IndexTestingEfficiencyLab })));
const LoadRejectionOverspeedLab = lazy(() => import('./components/LoadRejectionOverspeedLab.tsx').then(m => ({ default: m.LoadRejectionOverspeedLab })));
const LubricatingOilDegradationLab = lazy(() => import('./components/LubricatingOilDegradationLab.tsx').then(m => ({ default: m.LubricatingOilDegradationLab })));
const RoughZoneOperationLab = lazy(() => import('./components/RoughZoneOperationLab.tsx').then(m => ({ default: m.RoughZoneOperationLab })));
const RunUpVibrationLab = lazy(() => import('./components/RunUpVibrationLab.tsx').then(m => ({ default: m.RunUpVibrationLab })));
const UnitStartupSequenceLab = lazy(() => import('./components/UnitStartupSequenceLab.tsx').then(m => ({ default: m.UnitStartupSequenceLab })));
const BearingCoolingWaterFlowLab = lazy(() => import('./components/BearingCoolingWaterFlowLab.tsx').then(m => ({ default: m.BearingCoolingWaterFlowLab })));

// FrancisHub and SOPViewer removed (routes moved to dedicated router)
// Francis Turbine Module - All routes extracted to dedicated sub-router
// Francis Turbine Module - All routes extracted to dedicated sub-router
const FrancisRouter = React.lazy(() => import('./routes/FrancisRouter'));

// Maintenance Module - Extracted to dedicated sub-router
const MaintenanceRouter = React.lazy(() => import('./routes/MaintenanceRouter.tsx'));

// Moved lazy imports for components that were previously declared inside AppLayout
const MapModule = lazy(() => import('./components/MapModule.tsx').then(m => ({ default: m.MapModule })));
const AssetTypeSelector = lazy(() => import('./components/navigation/AssetTypeSelector').then(m => ({ default: m.AssetTypeSelector })));

// Multi-tier entry points (Engineer / Owner / Hydroschool)
const EngineerLanding = React.lazy(() => import('./pages/EngineerLanding').then(m => ({ default: m.EngineerLanding })));
const OwnerLanding = React.lazy(() => import('./pages/OwnerLanding').then(m => ({ default: m.OwnerLanding })));
const HydroschoolLanding = React.lazy(() => import('./pages/HydroschoolLanding').then(m => ({ default: m.HydroschoolLanding })));

// Knowledge Base — static AnoHub_site HTML served via iframe wrapper
const KnowledgeBaseViewer = React.lazy(() => import('./pages/KnowledgeBaseViewer').then(m => ({ default: m.KnowledgeBaseViewer })));

// New visual navigation pages
const HomeHub = React.lazy(() => import('./pages/HomeHub').then(m => ({ default: m.HomeHub })));
const DigitalLogbook = React.lazy(() => import('./pages/DigitalLogbook').then(m => ({ default: m.DigitalLogbook })));
const ProblemDetector = React.lazy(() => import('./pages/ProblemDetector').then(m => ({ default: m.ProblemDetector })));
const TurbineHub = React.lazy(() => import('./pages/TurbineHub').then(m => ({ default: m.TurbineHub })));



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

    if (loading) return null; // Boot screen already parallelizes this. Avoid double spinner.
    if (!user) return <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-slate-400">{t('auth.accessDenied', 'Access Denied')}</div>;
    return <>{children}</>;
};

// --- 8. APP LAYOUT ---

// New component for collapsible fleet section
// FleetSection removed - Moved to Sidebar.tsx
const AppLayout: React.FC = () => {
    useSentinelWatchdog(); // Infrastructure Watchdog
    useSafeExit(); // INFRASTRUCTURE: Guard unsaved data - NEW
    const location = useLocation();
    const navigate = useNavigate();
    useRisk(); // initialize risk context hook
    useRiskCalculator(); // initialize risk calculator hook
    useAudit();
    const { user } = useAuth(); // Auth integration

    // Unified Navigation States


    // Unified Navigation States
    const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false); // Map State
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [reconstructing, setReconstructing] = useState(false);
    const [reconstructProgress, setReconstructProgress] = useState<number | null>(null);
    const { state: technicalState } = useCerebro();

    const isHub = location.pathname === '/';
    const isFullPage = isHub || location.pathname === '/map';

    // RISK CALCULATION LOGIC (detailed badge rendering moved to DashboardHeader)

    // badgeLabel/badgeStatus/handleBadgeClick removed (moved to DashboardHeader)

    // Listen for custom wizard trigger event from NeuralFlowMap
    useEffect(() => {
        const onStart = () => { setReconstructing(true); setReconstructProgress(0); };
        const onProgress = (e: any) => { setReconstructProgress(e?.detail?.processed || null); };
        const onComplete = () => { setReconstructing(false); setReconstructProgress(null); };
        window.addEventListener('reconstruction:start', onStart as any);
        window.addEventListener('reconstruction:progress', onProgress as any);
        window.addEventListener('reconstruction:complete', onComplete as any);

        const handleOpenWizard = () => setIsWizardOpen(true);
        const handleOpenPreview = () => setIsPreviewOpen(true);

        window.addEventListener('openAssetWizard', handleOpenWizard);
        window.addEventListener(TRIGGER_FORENSIC_EXPORT, handleOpenPreview);

        return () => {
            window.removeEventListener('openAssetWizard', handleOpenWizard);
            window.removeEventListener(TRIGGER_FORENSIC_EXPORT, handleOpenPreview);
            window.removeEventListener('reconstruction:start', onStart as any);
            window.removeEventListener('reconstruction:progress', onProgress as any);
            window.removeEventListener('reconstruction:complete', onComplete as any);
        };
    }, []);

    useEffect(() => {
        const hasCompleted = localStorage.getItem('hasCompletedOnboarding') === 'true';
        if (!hasCompleted) {
            // Defer to avoid calling setState synchronously in effect
            setTimeout(() => setShowOnboarding(true), 0);
        }
    }, []);

    // Lazy hydration: prefetch physics snapshots shortly after user session starts
    useEffect(() => {
        try {
            if (user) {
                lazyHydratePhysicsSnapshots(2000, 3);
            }
        } catch { /* noop */ }
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
                <div className={`h-screen w-screen bg-[#020617] text-slate-100 overflow-hidden selection:bg-cyan-500/30 font-sans relative grid grid-rows-[1fr] ${isSidebarOpen ? 'lg:grid-cols-[280px_1fr]' : 'grid-cols-[0px_1fr]'} transition-[grid-template-columns] duration-300`}>
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
                    <div className="row-start-1 col-start-2 min-h-0 h-full flex flex-col relative z-20 overflow-y-auto custom-scrollbar">

                        {/* NEW: Global Workflow Header - Machine Health & Navigation */}
                        <WorkflowHeader />

                        <DashboardHeader
                            onToggleSidebar={() => setIsSidebarOpen(s => !s)}
                            isSidebarOpen={isSidebarOpen}
                            title={<span className="text-h-gold">ANOHUB // NC-9.0 NEURAL CORE</span>}
                        />

                        <div className={`flex-grow w-full relative z-10 ${isFullPage ? 'flex flex-col' : ''}`}> {/* Renamed main to div so we dont nest mains */}
                            <Suspense fallback={<LoadingShimmer />}>
                                <div className={!isFullPage ? "max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12" : "flex-grow w-full"}>
                                    {!isHub && location.pathname !== '/dashboard' && location.pathname !== '/executive' && <Breadcrumbs />}
                                    <ErrorBoundary fallback={
                                        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                                            <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20">
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
                                        <div className="w-full">
                                                <Routes location={location}>
                                                 <Route index element={<HomeHub />} />
                                                 <Route path="logbook" element={<DigitalLogbook />} />
                                                 <Route path="problems" element={<ProblemDetector />} />
                                                 <Route path="turbines/*" element={<TurbineHub />} />
                                                 <Route path={ROUTES.DIAGNOSTIC_TWIN} element={<NeuralFlowMap />} />
                                                {/* Francis Turbine Module - All routes handled by dedicated sub-router */}
                                                <Route path="/francis/*" element={<FrancisRouter />} />
                                                <Route path="profile" element={<UserProfile />} />
                                                <Route path="map" element={<GlobalMap />} />

                                                {/* RISK: Accessible to all but mostly Manager focused */}
                                                <Route path="risk-assessment" element={<QuestionnaireWrapper />} />
                                                <Route path="questionnaire-summary" element={<QuestionnaireSummary />} />
                                                <Route path="risk-report" element={<RiskReport />} />

                                                {/* PUBLIC-FACING / STAKEHOLDER */}
                                                <Route path="investor-briefing" element={<InvestorBriefing />} />
                                                {/* Multi-tier entry points */}
                                                <Route path="engineer" element={
                                                    <RoleGuard allowedRoles={['ENGINEER', 'TECHNICIAN', 'MANAGER']}>
                                                        <EngineerLanding />
                                                    </RoleGuard>
                                                } />
                                                <Route path="owner" element={
                                                    <RoleGuard allowedRoles={['OWNER', 'MANAGER']}>
                                                        <OwnerLanding />
                                                    </RoleGuard>
                                                } />
                                                <Route path="hydroschool" element={<HydroschoolLanding />} />
                                                <Route path="standard-of-excellence" element={<StandardOfExcellence onCommit={() => { }} />} />
                                                <Route path="digital-introduction" element={<DigitalIntroduction />} />

                                                {/* ENGINEERING TOOLS - RESTRICTED */}
                                                <Route path="hpp-builder" element={
                                                    <RoleGuard allowedRoles={['ENGINEER', 'MANAGER', 'TECHNICIAN']}>
                                                        <HPPBuilder />
                                                    </RoleGuard>
                                                } />

                                                {/* GENERAL INFO */}
                                                <Route path="hpp-improvements" element={<HPPImprovements />} />
                                                <Route path="installation-guarantee" element={<InstallationGuarantee />} />

                                                {/* INFRASTRUCTURE - RESTRICTED */}
                                                <Route path="infrastructure/*" element={
                                                    <RoleGuard allowedRoles={['ENGINEER', 'MANAGER', 'TECHNICIAN']}>
                                                        <InfrastructureHub />
                                                    </RoleGuard>
                                                } />

                                                <Route path="turbine/:id" element={<TurbineDetailWrapper />} />
                                                <Route path="phase-guide" element={<ProjectPhaseGuide />} />
                                                <Route path="river-wildlife" element={<RiverWildlife />} />
                                                <Route path="revitalization-strategy" element={<RevitalizationStrategy />} />
                                                <Route path="digital-integrity" element={<DigitalIntegrity />} />
                                                <Route path="contract-management" element={<ContractManagement />} />
                                                <Route path="library" element={<ComponentLibrary />} />
                                                <Route path="knowledge/health-monitor" element={<LibraryHealthMonitor />} />
                                                <Route path="vision" element={<UnderConstruction />} />

                                                {/* Knowledge Base — static AnoHub_site HTML via iframe wrapper */}
                                                <Route path="knowledge-base" element={<KnowledgeBaseViewer />} />
                                                <Route path="knowledge-base/:section" element={<KnowledgeBaseViewer />} />

                                                {/* Maintenance Sub-Router */}
                                                <Route path="/maintenance/*" element={<MaintenanceRouter />} />

                                                {/* EXECUTIVE - RESTRICTED */}
                                                <Route path="executive" element={
                                                    <RoleGuard allowedRoles={['MANAGER', 'TECHNICIAN']}>
                                                        <ExecutiveDashboard />
                                                    </RoleGuard>
                                                } />

                                                <Route path="structural-integrity" element={<StructuralIntegrity />} />

                                                {/* ADMIN - RESTRICTED */}
                                                <Route path="admin-approval" element={
                                                    <RoleGuard allowedRoles={['MANAGER', 'TECHNICIAN']}>
                                                        <AdminApproval />
                                                    </RoleGuard>
                                                } />

                                                <Route path="admin/health" element={
                                                    <RoleGuard allowedRoles={['MANAGER', 'TECHNICIAN']}>
                                                        <AdminHealth />
                                                    </RoleGuard>
                                                } />

                                                <Route path="/forensics" element={<ForensicDashboard />} />
                                                <Route path="stress-test" element={<SystemStressTest />} />
                                                <Route path="precision-audit" element={<PrecisionAudit />} />
                                                <Route path="learning-lab" element={<LearningLab />} />
                                                <Route path="prediction-lab" element={<SystemPredictionLab />} />
                                                <Route path="vibration-lab" element={<VibrationAnalysisLab />} />
                                                <Route path="lab/system-prediction" element={<SystemPredictionLab />} />
                                                <Route path="lab/vibration-analysis" element={<VibrationAnalysisLab />} />

                                                {/* Predictive Intelligence Center */}
                                                <Route path="predictive-intelligence" element={<PredictiveIntelligenceCenter />} />

                                                {/* Predictive Intelligence Labs - Mechanical Forensics */}
                                                <Route path="lab/shaft-plumbness" element={<ShaftPlumbnessLab />} />
                                                <Route path="lab/coupling-bolt-tensioning" element={<CouplingBoltTensioningLab />} />
                                                <Route path="lab/guide-bearing-clearance" element={<GuideBearingClearanceLab />} />
                                                <Route path="lab/head-cover-deflection" element={<HeadCoverDeflectionLab />} />
                                                <Route path="lab/jacking-oil-system" element={<JackingOilSystemLab />} />
                                                <Route path="lab/kaplan-blade-trunnion" element={<KaplanBladeTrunnionLab />} />
                                                <Route path="lab/mechanical-brake-wear" element={<MechanicalBrakeWearLab />} />
                                                <Route path="lab/runner-labyrinth-seal" element={<RunnerLabyrinthSealLab />} />
                                                <Route path="lab/shear-pin-fatigue" element={<ShearPinFatigueLab />} />
                                                <Route path="lab/thrust-bearing-load" element={<ThrustBearingLoadDistributionLab />} />
                                                <Route path="lab/stay-vane-crack" element={<StayVaneCrackLab />} />

                                                {/* Predictive Intelligence Labs - Electrical Diagnostics */}
                                                <Route path="lab/generator-airgap" element={<GeneratorAirGapLab />} />
                                                <Route path="lab/excitation-heat" element={<ExcitationHeatDissipationLab />} />
                                                <Route path="lab/partial-discharge" element={<PartialDischargeLab />} />
                                                <Route path="lab/rotor-pole-impedance" element={<RotorPoleImpedanceLab />} />
                                                <Route path="lab/stator-core-clamping" element={<StatorCoreClampingLab />} />
                                                <Route path="lab/stator-winding-thermal" element={<StatorWindingThermalLab />} />
                                                <Route path="lab/transformer-gas" element={<TransformerDissolvedGasLab />} />

                                                {/* Predictive Intelligence Labs - Hydraulic Analytics */}
                                                <Route path="lab/draft-tube-air" element={<DraftTubeAirAdmissionLab />} />
                                                <Route path="lab/draft-tube-surge" element={<DraftTubeSurgeLab />} />
                                                <Route path="lab/francis-cavitation" element={<FrancisCavitationProfilingLab />} />
                                                <Route path="lab/kaplan-cam-curve" element={<KaplanCamCurveLab />} />
                                                <Route path="lab/miv-bypass" element={<MainInletValveBypassLab />} />
                                                <Route path="lab/oil-cooler" element={<OilCoolerThermalEfficiencyLab />} />
                                                <Route path="lab/pelton-injector" element={<PeltonInjectorAlignmentLab />} />
                                                <Route path="lab/pelton-needle" element={<PeltonNeedleValveLab />} />
                                                <Route path="lab/penstock-hammer" element={<PenstockWaterHammerLab />} />
                                                <Route path="lab/spiral-case" element={<SpiralCasePressureLossLab />} />
                                                <Route path="lab/trash-rack" element={<TrashRackHeadLossLab />} />

                                                {/* Predictive Intelligence Labs - Operational Scenarios */}
                                                <Route path="lab/black-start" element={<BlackStartCapabilityLab />} />
                                                <Route path="lab/governor-deadband" element={<GovernorDeadbandLab />} />
                                                <Route path="lab/index-testing" element={<IndexTestingEfficiencyLab />} />
                                                <Route path="lab/load-rejection" element={<LoadRejectionOverspeedLab />} />
                                                <Route path="lab/oil-degradation" element={<LubricatingOilDegradationLab />} />
                                                <Route path="lab/rough-zone" element={<RoughZoneOperationLab />} />
                                                <Route path="lab/runup-vibration" element={<RunUpVibrationLab />} />
                                                <Route path="lab/startup-sequence" element={<UnitStartupSequenceLab />} />
                                                <Route path="lab/bearing-cooling" element={<BearingCoolingWaterFlowLab />} />

                                                {/* ACCESS DENIED PAGE */}
                                                <Route path="/access-denied" element={<AccessDenied />} />

                                                <Route path="*" element={<Navigate to="/" replace />} />
                                            </Routes>
                                        </div>
                                    </ErrorBoundary>
                                </div>
                            </Suspense>
                        </div>
                    </div>
                    <VoiceAssistant />
                    {isFeedbackVisible && <Feedback onClose={() => setIsFeedbackVisible(false)} />}
                    <Suspense fallback={<div />}>
                        <PrintPreviewModal
                            isOpen={isPreviewOpen}
                            onClose={() => setIsPreviewOpen(false)}
                            state={technicalState}
                        />
                    </Suspense>
                    {reconstructing && (
                        <div className="fixed inset-0 z-[120] flex items-center justify-center">
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                            <div className="relative z-10 p-6 bg-white/6 border border-white/10 rounded-lg text-center max-w-lg">
                                <h3 className="text-lg font-black text-white mb-2">Reconstructing Reality...</h3>
                                <p className="text-sm text-slate-300 mb-3">Replaying historical events to restore the requested snapshot. This may take a few seconds.</p>
                                {reconstructProgress !== null ? (
                                    <div className="text-sm text-slate-300">Processed: {reconstructProgress}</div>
                                ) : null}
                            </div>
                        </div>
                    )}
                    <GlobalFooter />

                    <Suspense fallback={null}>
                        <AssetTypeSelector />
                    </Suspense>

                    <CommanderTerminal />
                    <CommandPalette /> {/* GLOBAL COMMAND PALETTE - NOW INSIDE DRILLDOWN PROVIDER */}
                </div>
            </DrillDownProvider>
        </NavigationProvider>
    );
};

const App: React.FC = () => {
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

    // EMERGENCY INITIALIZATION TIMEOUT (Force Handshake Resolution)
    useEffect(() => {
        let mounted = true;
        const startBootstrap = async () => {
            console.log('[System] Initiating controlled bootstrap sequence...');
            try {
                await BootstrapService.boot();
                if (mounted) {
                    console.log('[System] Bootstrap complete. Releasing lock.');
                    setBooting(false);
                }
            } catch (err) {
                console.error('[System] Bootstrap failed:', err);
                if (mounted) setBooting(false); // Fail open
            }
        };
        startBootstrap();

        const timer = setTimeout(() => {
            if (mounted && booting) {
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
        <HashRouter>
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
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
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
