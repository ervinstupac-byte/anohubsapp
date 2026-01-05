import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Spinner } from '../components/Spinner';

// Lazy load all Francis components
const FrancisHub = React.lazy(() => import('../components/francis/FrancisHub').then(module => ({ default: module.FrancisHub })));
const HPPBuilder = React.lazy(() => import('../components/HPPBuilder').then(module => ({ default: module.HPPBuilder })));
const FrancisDiagnostics = React.lazy(() => import('../components/SpecializedDiagnostics').then(module => ({ default: module.SpecializedDiagnostics })));
const MissionControl = React.lazy(() => import('../components/francis/MissionControl').then(module => ({ default: module.MissionControl })));
const StartupFlowchart = React.lazy(() => import('../components/francis/StartupFlowchart').then(module => ({ default: module.StartupFlowchart })));
const LoadRejectionLogic = React.lazy(() => import('../components/francis/LoadRejectionLogic').then(module => ({ default: module.LoadRejectionLogic })));
const EmergencyProtocols = React.lazy(() => import('../components/francis/EmergencyProtocols').then(module => ({ default: module.EmergencyProtocols })));
const Manifesto = React.lazy(() => import('../components/francis/Manifesto').then(module => ({ default: module.Manifesto })));
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

import { LoadingShimmer } from '../components/ui/LoadingShimmer.tsx';
import { ROUTES } from './paths.ts';

/**
 * FrancisRouter - Dedicated sub-router for all Francis turbine modules
 * 
 * This router handles all /francis/* routes using React Router v6 nested routing.
 */
const FrancisRouter: React.FC = () => {
    return (
        <Suspense fallback={<LoadingShimmer />}>
            <Routes>
                {/* Command Center (Main View) */}
                <Route path={ROUTES.FRANCIS.COMMAND_CENTER} element={<CommandCenter />} />

                {/* Main Hub */}
                <Route path={ROUTES.FRANCIS.HUB} element={<FrancisHub />} />
                <Route path={ROUTES.FRANCIS.DESIGNER} element={<HPPBuilder />} />

                {/* Diagnostics */}
                <Route path={ROUTES.FRANCIS.DIAGNOSTICS.ROOT} element={<FrancisDiagnostics />} />
                <Route path={`${ROUTES.FRANCIS.DIAGNOSTICS.ROOT}/${ROUTES.FRANCIS.DIAGNOSTICS.HEATMAP}`} element={<TruthHeatmapDemo />} />
                <Route path={`${ROUTES.FRANCIS.DIAGNOSTICS.ROOT}/${ROUTES.FRANCIS.DIAGNOSTICS.FORENSICS}`} element={<ForensicLab />} />

                {/* Mission Control & Logic */}
                <Route path={ROUTES.FRANCIS.MISSION_CONTROL} element={<MissionControl />} />
                <Route path={ROUTES.FRANCIS.FLOWCHART_STARTUP} element={<StartupFlowchart />} />
                <Route path={ROUTES.FRANCIS.LOGIC_LOAD_REJECTION} element={<LoadRejectionLogic />} />
                <Route path={ROUTES.FRANCIS.EMERGENCY} element={<EmergencyProtocols />} />
                <Route path={ROUTES.FRANCIS.MANIFESTO} element={<Manifesto />} />

                {/* Mechanical Systems */}
                <Route path={ROUTES.FRANCIS.SOP.MIV_DISTRIBUTOR} element={<MIVDetail />} />
                <Route path={ROUTES.FRANCIS.SOP.BEARINGS} element={<BearingsDetail />} />
                <Route path={ROUTES.FRANCIS.SOP.ALIGNMENT} element={<ShaftAlignment />} />
                <Route path={ROUTES.FRANCIS.SOP.THRUST_BALANCE} element={<ThrustBalance />} />
                <Route path={ROUTES.FRANCIS.SOP.VORTEX_CONTROL} element={<VortexControl />} />
                <Route path={ROUTES.FRANCIS.SOP.REGULATING_RING} element={<RegulatingRing />} />
                <Route path={ROUTES.FRANCIS.SOP.LINKAGE} element={<Linkage />} />
                <Route path={ROUTES.FRANCIS.SOP.COUPLING} element={<Coupling />} />

                {/* Fluid & Chemical Integrity */}
                <Route path={ROUTES.FRANCIS.SOP.OIL_HEALTH} element={<OilHealth />} />
                <Route path={ROUTES.FRANCIS.SOP.COOLING_WATER} element={<CoolingWater />} />
                <Route path={ROUTES.FRANCIS.SOP.DRAINAGE_PUMPS} element={<DrainagePumps />} />
                <Route path={ROUTES.FRANCIS.SOP.LUBRICATION} element={<LubricationSystem />} />
                <Route path={ROUTES.FRANCIS.SOP.HPU} element={<HPU />} />

                {/* Governor & Control */}
                <Route path={ROUTES.FRANCIS.SOP.GOVERNOR_PID} element={<GovernorPID />} />

                {/* Electrical & Grid Systems */}
                <Route path={ROUTES.FRANCIS.SOP.GENERATOR} element={<GeneratorIntegrity />} />
                <Route path={ROUTES.FRANCIS.SOP.ELECTRICAL_HEALTH} element={<ElectricalHealth />} />
                <Route path={ROUTES.FRANCIS.SOP.GRID_SYNC} element={<GridSync />} />
                <Route path={ROUTES.FRANCIS.SOP.DISTRIBUTOR_SYNC} element={<DistributorSync />} />
                <Route path={ROUTES.FRANCIS.SOP.DC_SYSTEMS} element={<DCSystems />} />
                <Route path={ROUTES.FRANCIS.SOP.EXCITATION} element={<Excitation />} />
                <Route path={ROUTES.FRANCIS.SOP.TRANSFORMER} element={<Transformer />} />

                {/* Civil & Infrastructure */}
                <Route path={ROUTES.FRANCIS.SOP.PENSTOCK} element={<Penstock />} />
                <Route path={ROUTES.FRANCIS.SOP.INTAKE} element={<Intake />} />
                <Route path={ROUTES.FRANCIS.SOP.CATHODIC} element={<CathodicProtection />} />

                {/* Safety & Auxiliary */}
                <Route path={ROUTES.FRANCIS.SOP.WATER_HAMMER} element={<WaterHammer />} />
                <Route path={ROUTES.FRANCIS.SOP.BRAKING_SYSTEM} element={<BrakingSystem />} />
                <Route path={ROUTES.FRANCIS.SOP.SEAL_RECOVERY} element={<SealRecovery />} />
                <Route path={ROUTES.FRANCIS.SOP.AUXILIARY} element={<AuxiliarySystems />} />

                {/* Generic SOP Viewer (fallback for dynamic SOPs) */}
                <Route path="sop/:id" element={<SOPViewer />} />
            </Routes>
        </Suspense>
    );
};

export default FrancisRouter;
