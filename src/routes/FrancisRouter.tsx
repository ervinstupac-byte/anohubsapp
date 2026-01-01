import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Spinner } from '../components/Spinner';

// Lazy load all Francis components
const FrancisHub = React.lazy(() => import('../components/francis/FrancisHub').then(module => ({ default: module.FrancisHub })));
const FrancisDiagnostics = React.lazy(() => import('../components/FrancisDiagnostics').then(module => ({ default: module.FrancisDiagnostics })));
const MissionControl = React.lazy(() => import('../components/francis/MissionControl').then(module => ({ default: module.MissionControl })));
const StartupFlowchart = React.lazy(() => import('../components/francis/StartupFlowchart').then(module => ({ default: module.StartupFlowchart })));
const LoadRejectionLogic = React.lazy(() => import('../components/francis/LoadRejectionLogic').then(module => ({ default: module.LoadRejectionLogic })));
const EmergencyProtocols = React.lazy(() => import('../components/francis/EmergencyProtocols').then(module => ({ default: module.EmergencyProtocols })));
const MIVDetail = React.lazy(() => import('../components/francis/MIVDetail').then(module => ({ default: module.MIVDetail })));
const BearingsDetail = React.lazy(() => import('../components/francis/BearingsDetail').then(module => ({ default: module.BearingsDetail })));
const ShaftAlignment = React.lazy(() => import('../components/francis/ShaftAlignment').then(module => ({ default: module.ShaftAlignment })));
const CoolingWater = React.lazy(() => import('../components/francis/CoolingWater'));
const DrainagePumps = React.lazy(() => import('../components/francis/DrainagePumps'));
const OilHealth = React.lazy(() => import('../components/francis/OilHealth'));
const LubricationSystem = React.lazy(() => import('../components/francis/LubricationSystem').then(module => ({ default: module.LubricationSystem })));
const GovernorPID = React.lazy(() => import('../components/francis/GovernorPID').then(module => ({ default: module.GovernorPID })));
const GeneratorIntegrity = React.lazy(() => import('../components/francis/GeneratorIntegrity').then(module => ({ default: module.GeneratorIntegrity })));
const BrakingSystem = React.lazy(() => import('../components/francis/BrakingSystem').then(module => ({ default: module.BrakingSystem })));
const SealRecovery = React.lazy(() => import('../components/francis/SealRecovery').then(module => ({ default: module.SealRecovery })));
const GridSync = React.lazy(() => import('../components/francis/GridSync').then(module => ({ default: module.GridSync })));
const DistributorSync = React.lazy(() => import('../components/francis/DistributorSync').then(module => ({ default: module.DistributorSync })));
const HPU = React.lazy(() => import('../components/francis/HPU').then(module => ({ default: module.HPU })));
const DCSystems = React.lazy(() => import('../components/francis/DCSystems').then(module => ({ default: module.DCSystems })));
const ElectricalHealth = React.lazy(() => import('../components/francis/ElectricalHealth').then(module => ({ default: module.ElectricalHealth })));
const AuxiliarySystems = React.lazy(() => import('../components/francis/AuxiliarySystems').then(module => ({ default: module.AuxiliarySystems })));
const Penstock = React.lazy(() => import('../components/francis/Penstock').then(module => ({ default: module.Penstock })));
const Intake = React.lazy(() => import('../components/francis/Intake').then(module => ({ default: module.Intake })));
const Excitation = React.lazy(() => import('../components/francis/Excitation').then(module => ({ default: module.Excitation })));
const Transformer = React.lazy(() => import('../components/francis/Transformer').then(module => ({ default: module.Transformer })));
const Coupling = React.lazy(() => import('../components/francis/Coupling').then(module => ({ default: module.Coupling })));
const CathodicProtection = React.lazy(() => import('../components/francis/CathodicProtection').then(module => ({ default: module.CathodicProtection })));
const RegulatingRing = React.lazy(() => import('../components/francis/RegulatingRing').then(module => ({ default: module.RegulatingRing })));
const Linkage = React.lazy(() => import('../components/francis/Linkage').then(module => ({ default: module.Linkage })));
const ThrustBalance = React.lazy(() => import('../components/francis/ThrustBalance').then(module => ({ default: module.ThrustBalance })));
const VortexControl = React.lazy(() => import('../components/francis/VortexControl').then(module => ({ default: module.VortexControl })));
const WaterHammer = React.lazy(() => import('../components/francis/WaterHammer').then(module => ({ default: module.WaterHammer })));
const SOPViewer = React.lazy(() => import('../components/francis/SOPViewer').then(module => ({ default: module.SOPViewer })));
const TruthHeatmapDemo = React.lazy(() => import('../components/TruthHeatmapDemo').then(module => ({ default: module.TruthHeatmapDemo })));
const CommandCenter = React.lazy(() => import('../components/CommandCenter').then(module => ({ default: module.CommandCenter })));
const ForensicLab = React.lazy(() => import('../components/ForensicLab').then(module => ({ default: module.ForensicLab })));

/**
 * FrancisRouter - Dedicated sub-router for all Francis turbine modules
 * 
 * This router handles all /francis-* routes using React Router v6 nested routing.
 * Parent route in App.tsx: <Route path="/francis-*" element={<FrancisRouter />} />
 * 
 * All paths here are RELATIVE (no leading slash) to maintain correct URL structure.
 */
const FrancisRouter: React.FC = () => {
    return (
        <Suspense fallback={
            <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
                <Spinner />
                <span className="text-xs text-slate-500 tracking-widest animate-pulse">LOADING FRANCIS MODULE...</span>
            </div>
        }>
            <Routes>
                {/* Command Center (Main View) */}
                <Route path="command-center" element={<CommandCenter />} />

                {/* Main Hub */}
                <Route path="hub" element={<FrancisHub />} />

                {/* Diagnostics */}
                <Route path="diagnostics" element={<FrancisDiagnostics />} />
                <Route path="diagnostics/heatmap" element={<TruthHeatmapDemo />} />
                <Route path="diagnostics/forensics" element={<ForensicLab />} />

                {/* Mission Control & Logic */}
                <Route path="mission-control" element={<MissionControl />} />
                <Route path="flowchart-startup" element={<StartupFlowchart />} />
                <Route path="logic-load-rejection" element={<LoadRejectionLogic />} />
                <Route path="emergency-protocols" element={<EmergencyProtocols />} />

                {/* Mechanical Systems */}
                <Route path="sop-miv-distributor" element={<MIVDetail />} />
                <Route path="sop-bearings" element={<BearingsDetail />} />
                <Route path="sop-shaft-alignment" element={<ShaftAlignment />} />
                <Route path="sop-thrust-balance" element={<ThrustBalance />} />
                <Route path="sop-vortex-control" element={<VortexControl />} />
                <Route path="sop-regulating-ring" element={<RegulatingRing />} />
                <Route path="sop-linkage" element={<Linkage />} />
                <Route path="sop-coupling" element={<Coupling />} />

                {/* Fluid & Chemical Integrity */}
                <Route path="sop-oil-health" element={<OilHealth />} />
                <Route path="sop-cooling-water" element={<CoolingWater />} />
                <Route path="sop-drainage-pumps" element={<DrainagePumps />} />
                <Route path="sop-lubrication" element={<LubricationSystem />} />
                <Route path="sop-hpu" element={<HPU />} />

                {/* Governor & Control */}
                <Route path="sop-governor-pid" element={<GovernorPID />} />

                {/* Electrical & Grid Systems */}
                <Route path="sop-generator-integrity" element={<GeneratorIntegrity />} />
                <Route path="sop-electrical-health" element={<ElectricalHealth />} />
                <Route path="sop-grid-sync" element={<GridSync />} />
                <Route path="sop-distributor-sync" element={<DistributorSync />} />
                <Route path="sop-dc-systems" element={<DCSystems />} />
                <Route path="sop-excitation" element={<Excitation />} />
                <Route path="sop-transformer" element={<Transformer />} />

                {/* Civil & Infrastructure */}
                <Route path="sop-penstock" element={<Penstock />} />
                <Route path="sop-intake" element={<Intake />} />
                <Route path="sop-cathodic" element={<CathodicProtection />} />

                {/* Safety & Auxiliary */}
                <Route path="sop-water-hammer" element={<WaterHammer />} />
                <Route path="sop-braking-system" element={<BrakingSystem />} />
                <Route path="sop-recovery" element={<SealRecovery />} />
                <Route path="sop-auxiliary" element={<AuxiliarySystems />} />

                {/* Generic SOP Viewer (fallback for dynamic SOPs) */}
                <Route path="sop/:id" element={<SOPViewer />} />
            </Routes>
        </Suspense>
    );
};

export default FrancisRouter;
