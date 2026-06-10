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
import { ProjectProvider } from './contexts/ProjectContext';
import { DEFAULT_TECHNICAL_STATE } from './core/TechnicalSchema';
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
import { AssetOnboardingWizard } from './components/digital-twin/AssetOnboardingWizard.tsx';
import { AlignmentWizard } from './components/commissioning/AlignmentWizard.tsx';
import { UnderConstruction } from './components/ui/UnderConstruction.tsx';
import { LoadingShimmer } from './shared/components/ui/LoadingShimmer';
import { Breadcrumbs } from './shared/components/ui/Breadcrumbs';
import { VoiceAssistant } from './components/VoiceAssistant.tsx';
import { DashboardHeader } from './components/DashboardHeader.tsx';
import { WorkflowHeader } from './components/ui/WorkflowHeader'; // NEW: Global health status bar
// GlobalFooter imported removed
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
import AppRouter from './routes/AppRouter';

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
const ManagementSummary = lazy(() => import('./pages/analytics/management-summary').then(m => ({ default: m.default })));
const StrategicPlanningDashboard = lazy(() => import('./components/StrategicPlanningDashboard').then(m => ({ default: m.StrategicPlanningDashboard })));

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

// Pelton Turbine Module
const PeltonRouter = React.lazy(() => import('./routes/PeltonRouter'));
const KaplanRouter = React.lazy(() => import('./routes/KaplanRouter'));

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
const StrategicDecisionLab = React.lazy(() => import('./components/StrategicDecisionLab.tsx').then(m => ({ default: m.StrategicDecisionLab })));
const LongTermForecastLab = React.lazy(() => import('./components/LongTermForecastLab.tsx').then(m => ({ default: m.LongTermForecastLab })));
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

    if (loading) return null;
    if (!user) return <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-slate-400">{t('auth.accessDenied', 'Access Denied')}</div>;
    return <>{children}</>;
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
                                <ProjectProvider initialState={DEFAULT_TECHNICAL_STATE}>
                                    <Routes>
                                        <Route path="/login" element={<Login />} />
                                        <Route path="/*" element={<ProtectedRoute><AppRouter /></ProtectedRoute>} />
                                    </Routes>
                                </ProjectProvider>
                            </ContextAwarenessProvider>
                        </div>
                    )}
                </GlobalProvider>
            </ErrorBoundary>
        </HashRouter>
    );
};

export default App;
