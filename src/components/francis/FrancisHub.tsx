import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/paths';
import { TurbineRunner3D } from '../three/TurbineRunner3D';
import { GlassCard } from '../ui/GlassCard';
import {
    ArrowLeft, Cpu, Power, AlertTriangle, GitBranch,
    Droplets, GitPullRequest, Activity, Filter, Snowflake, Waves,
    Settings, Disc, Crosshair, LifeBuoy, Droplet, Octagon, BarChart2,
    ShieldAlert, Lock, ZapOff, BatteryCharging, Printer, Settings2, Merge, ArrowRight, RefreshCw, Link as LinkIcon, ArrowRightLeft, Wind, Wifi, Radio,
    ChevronDown, ChevronRight, Zap, Building2, Wrench, Book, Award
} from 'lucide-react';
import { useCerebro } from '../../contexts/ProjectContext';
import { FRANCIS_PATHS } from '../../routes/paths';
import { FrancisSensorData } from '../../models/turbine/types';
import { FrancisInteractiveCrossSection } from '../diagnostic-twin/FrancisInteractiveCrossSection';
import { FrancisHillChart } from '../diagnostic-twin/FrancisHillChart';
import { MaturityBadge } from '../dashboard/MaturityBadge';
import TurbineVisualNavigator from '../dashboard/TurbineVisualNavigator';
import { useContextEngine } from '../../hooks/useContextEngine';
import { FrancisHeader } from './layout/FrancisHeader';
import { FrancisQuickActions } from './layout/FrancisQuickActions';
import { FrancisHealthWidget } from './layout/FrancisHealthWidget';


// Status Dot Component
const StatusDot = ({ status, onClick }: { status: 'green' | 'yellow' | 'red', onClick: (e: React.MouseEvent) => void }) => {
    const colors = {
        green: 'bg-green-500 text-green-500 shadow-[0_0_5px_currentColor]',
        yellow: 'bg-yellow-500 text-yellow-500 shadow-[0_0_5px_currentColor]',
        red: 'bg-red-500 text-red-500 shadow-[0_0_5px_currentColor] animate-pulse'
    };

    return (
        <div
            onClick={onClick}
            className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${colors[status]}`}
        />
    );
};

// Module Link Component
const ModuleLink = ({
    icon: Icon,
    label,
    status,
    onClick,
    href
}: {
    icon: React.ElementType<{ className?: string }>,
    label: string,
    status?: 'green' | 'yellow' | 'red',
    onClick?: () => void,
    href?: string
}) => {
    const handleClick = (e: React.MouseEvent) => {
        if (onClick) {
            e.preventDefault();
            onClick();
        }
    };

    return (
        <a
            href={href || "#"}
            onClick={handleClick}
            className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-700/30 hover:bg-slate-800/80 hover:border-blue-500 transition-all duration-200 group"
        >
            <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-cyan-600 group-hover:text-cyan-400 transition-colors" />
                <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{label}</span>
            </div>
            {status && onClick && (
                <StatusDot status={status} onClick={(e) => {
                    e.preventDefault();
                    onClick();
                }} />
            )}
        </a>
    );
};

// Accordion Sector Component
interface AccordionSectorProps {
    title: string;
    icon: React.ElementType<{ className?: string }>;
    iconColor: string;
    borderColor: string;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

const AccordionSector: React.FC<AccordionSectorProps> = ({
    title,
    icon: Icon,
    iconColor,
    borderColor,
    isExpanded,
    onToggle,
    children
}) => {
    return (
        <div className={`rounded-lg bg-slate-900/60 border ${borderColor} overflow-hidden transition-all duration-300`}>
            <button
                onClick={onToggle}
                className={`w-full p-5 flex items-center justify-between ${iconColor} hover:bg-slate-800/50 transition-colors`}
            >
                <div className="flex items-center gap-3">
                    <Icon className="w-6 h-6" />
                    <h2 className="text-lg font-black uppercase tracking-wider">{title}</h2>
                </div>
                {isExpanded ? (
                    <ChevronDown className="w-5 h-5" />
                ) : (
                    <ChevronRight className="w-5 h-5" />
                )}
            </button>

            <div
                className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="p-5 space-y-3">
                    {children}
                </div>
            </div>
        </div>
    );
};

export const FrancisHub: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    // Connect to Global Engineering State
    const { state: techState, dispatch } = useCerebro();
    const { structuralSafetyMargin, extendedLifeYears, estimatedFailureDate } = useContextEngine();

    // Live Physics Data Hook (Mock for now or derive from techState)
    const simData: Partial<FrancisSensorData> = {
        rpm: techState.specializedState?.sensors?.rpm || 428.5,
        gridFrequency: techState.specializedState?.sensors?.gridFrequency || 50.02,
        activePower: techState.specializedState?.sensors?.activePower || 142.5
    };

    // Fallback if state.specializedState is undefined
    const moduleStates = techState.specializedState?.modules || {
        miv: 'green',
        penstock: 'green',
        cooling: 'green',
        drainage: 'green',
        bearings: 'red',
        alignment: 'green',
        lube: 'green',
        brakes: 'green',
        hpu: 'green',
        pid: 'green',
        dc: 'green'
    };

    const [healthScore, setHealthScore] = useState(88);

    // Accordion state with localStorage persistence
    const [expandedSectors, setExpandedSectors] = useState<Record<string, boolean>>(() => {
        const saved = localStorage.getItem('francisHub_expandedSectors');
        if (saved) {
            return JSON.parse(saved);
        }
        // Default: Critical Safety expanded, others collapsed
        return {
            criticalSafety: true,
            mechanical: false,
            fluidChemical: false,
            electricalGrid: false,
            civilInfrastructure: false,
            philosophy: false
        };
    });

    // Persist accordion state to localStorage
    useEffect(() => {
        localStorage.setItem('francisHub_expandedSectors', JSON.stringify(expandedSectors));
    }, [expandedSectors]);

    const toggleSector = (sector: string) => {
        setExpandedSectors(prev => ({
            ...prev,
            [sector]: !prev[sector]
        }));
    };

    const expandAll = () => {
        setExpandedSectors({
            criticalSafety: true,
            mechanical: true,
            fluidChemical: true,
            electricalGrid: true,
            civilInfrastructure: true,
            philosophy: true
        });
    };

    const collapseAll = () => {
        setExpandedSectors({
            criticalSafety: true, // Keep Critical Safety expanded
            mechanical: false,
            fluidChemical: false,
            electricalGrid: false,
            civilInfrastructure: false,
            philosophy: false
        });
    };

    // Toggle module status
    const toggleStatus = (key: string) => {
        const current = moduleStates[key] || 'green';
        let next: 'green' | 'yellow' | 'red' = 'green';
        if (current === 'green') next = 'yellow';
        else if (current === 'yellow') next = 'red';

        dispatch({
            type: 'UPDATE_SPECIALIZED_MODULE',
            payload: { moduleId: key, status: next }
        });
    };

    // Health score calculation
    useEffect(() => {
        // Use default sensor values since FrancisState doesn't track sensors directly
        const sensorData: Partial<FrancisSensorData> = {
            bearingTemp: 45,
            vibration: 0.08,
            siltConc: 800,
            gridFrequency: 50.0
        };

        let startScore = 100;

        Object.entries(sensorData).forEach(([key, value]) => {
            if (key === 'bearingTemp' && value > 60) startScore -= 15;
            if (key === 'vibration' && value > 0.1) startScore -= 20;
            if (key === 'siltConc' && value > 2000) startScore -= 10;
            if (key === 'gridFrequency' && Math.abs(value - 50) > 1) startScore -= 25;
        });

        if (moduleStates.hpu === 'red') startScore -= 50;
        if (moduleStates.pid === 'red') startScore -= 40;

        setHealthScore(Math.max(0, Math.round(startScore)));
    }, [moduleStates, techState.identity]);

    const getDialColor = (pct: number) => {
        if (pct < 50) return '#ef4444';
        if (pct < 80) return '#eab308';
        return '#22c55e';
    };

    const dialColor = getDialColor(healthScore);

    return (
        <div className="min-h-screen p-4 md:p-8 bg-h-dark font-mono text-slate-300 relative overflow-hidden">
            {/* Blueprint Grid Background */}
            <div className="absolute inset-0 pointer-events-none opacity-10" style={{
                backgroundImage: 'linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
            }}></div>

            {/* Header & Health Score */}
            <header className="mb-10 border-b border-slate-800 pb-6 relative z-10">
                <FrancisHeader t={t} navigate={navigate} healthScore={healthScore} />

                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 bg-gradient-to-r from-slate-900/50 via-slate-800/30 to-slate-900/50 p-6 rounded-xl border border-slate-700/50 relative overflow-hidden mt-4">
                    <FrancisQuickActions t={t} navigate={navigate} />
                    <FrancisHealthWidget t={t} healthScore={healthScore} dialColor={dialColor} techState={techState} />
                </div>
            </header>

            {/* NC-4.2 PRIMARY VISUALIZATION - PRIORITY 1 */}
            <div className="w-full mb-8 relative z-20">
                <GlassCard className="border-cyan-500/30 overflow-hidden">
                    <TurbineVisualNavigator />
                </GlassCard>
            </div>

            {/* 3D VISUALIZATION HEADER */}
            <div className="relative h-96 w-full bg-[#050505] overflow-hidden rounded-b-3xl border-b border-white/5 shadow-2xl mb-8 z-10">
                <div className="absolute inset-0 z-0 opacity-80">
                    <TurbineRunner3D rpm={(simData as any).rpm || 428} />
                </div>

                {/* Overlay Content */}
                <div className="absolute inset-0 z-10 p-8 flex flex-col justify-between pointer-events-none">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-h-teal/10 border border-h-teal/30 text-h-teal text-[10px] font-bold uppercase tracking-widest rounded">
                                    {t('francis.machineHall')}
                                </span>
                                <span className="px-2 py-0.5 bg-slate-800 border border-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded flex items-center gap-1">
                                    <Activity className="w-3 h-3" /> {t('common.status')} {t('common.stable')}
                                </span>
                            </div>
                        </div>
                        <GlassCard className="pointer-events-auto backdrop-blur-md bg-black/40 border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">{t('executive.sensors.gridFrequency')}</p>
                                    <p className="text-xl font-mono text-white font-bold">50.02 <span className="text-xs text-slate-500">{t('francis.units.hz')}</span></p>
                                </div>
                                <div className="h-8 w-px bg-white/10" />
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">{t('executive.sensors.activePower')}</p>
                                    <p className="text-xl font-mono text-h-teal font-bold">142.5 <span className="text-xs text-slate-500">{t('francis.units.mw')}</span></p>
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    <div className="flex justify-between items-end">
                        <GlassCard className="pointer-events-auto backdrop-blur-md bg-black/40 border-white/10 border-l-warn border-l-2">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between gap-8">
                                    <div className="flex items-center gap-2">
                                        <ShieldAlert className="w-4 h-4 text-amber-500" />
                                        <span className="text-[10px] text-slate-400 uppercase font-black uppercase tracking-widest">Structural Integrity</span>
                                    </div>
                                    <span className="text-xs font-mono text-white font-bold">{structuralSafetyMargin.toFixed(1)}% Margin</span>
                                </div>
                                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${structuralSafetyMargin > 50 ? 'bg-cyan-500' : 'bg-amber-500'}`}
                                        style={{ width: `${Math.min(100, structuralSafetyMargin)}%` }}
                                    />
                                </div>
                                <FrancisHillChart />
                            </div>
                        </GlassCard>

                        <GlassCard className="border-t-2 border-t-slate-500/50 overflow-hidden h-full">
                            <div className="mb-6 flex justify-between items-center p-2">
                                <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                    <Settings2 className="w-5 h-5 text-slate-400" />
                                    Legacy Topology
                                </h3>
                                <span className="text-[10px] bg-slate-500/10 text-slate-400 px-2 py-1 rounded border border-slate-500/20 font-bold uppercase">Standard View</span>
                            </div>
                            <FrancisInteractiveCrossSection />
                        </GlassCard>
                    </div>
                </div>
            </div>

            {/* Expand/Collapse All Toggle */}
            <div className="mb-6 flex justify-end gap-3 relative z-10">
                <button
                    onClick={expandAll}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-slate-800/50 hover:bg-cyan-900/30 text-slate-400 hover:text-cyan-400 border border-slate-700 hover:border-cyan-500/50 rounded transition-all"
                >
                    {t('francis.sectors.expandAll')}
                </button>
                <button
                    onClick={collapseAll}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded transition-all"
                >
                    {t('francis.sectors.collapseAll')}
                </button>
            </div>
            {/* ACCORDION SECTORS */}
            <div className="space-y-4 relative z-10">
                {/* SECTOR 1: CRITICAL SAFETY */}
                <AccordionSector
                    title={`🔴 ${t('francis.sectors.critical')}`}
                    icon={ShieldAlert}
                    iconColor="text-red-400"
                    borderColor="border-red-500/50"
                    isExpanded={expandedSectors.criticalSafety}
                    onToggle={() => toggleSector('criticalSafety')}
                >
                    <ModuleLink
                        icon={AlertTriangle}
                        label={t('francis.waterHammer.title', 'Water Hammer')}
                        status={moduleStates.hpu}
                        onClick={() => navigate(`/francis/${ROUTES.FRANCIS.SOP.WATER_HAMMER}`)}
                        href="#"
                    />
                    <ModuleLink
                        icon={Power}
                        label={t('francis.emergencyProtocols.title', 'Emergency Protocols')}
                        onClick={() => navigate(`/francis/${ROUTES.FRANCIS.EMERGENCY}`)}
                        href="#"
                    />
                    <ModuleLink
                        icon={ZapOff}
                        label={t('francis.loadRejection.title', 'Load Rejection Logic')}
                        onClick={() => navigate(`/francis/${ROUTES.FRANCIS.LOGIC_LOAD_REJECTION}`)}
                        href="#"
                    />
                    <ModuleLink
                        icon={GitBranch}
                        label={t('francis.startupFlowchart.title', 'Startup Flowchart')}
                        onClick={() => navigate(`/francis/${ROUTES.FRANCIS.FLOWCHART_STARTUP}`)}
                        href="#"
                    />
                    <ModuleLink
                        icon={Cpu}
                        label={t('francis.missionControl.title', 'Mission Control')}
                        onClick={() => navigate(`/francis/${ROUTES.FRANCIS.MISSION_CONTROL}`)}
                        href="#"
                    />
                </AccordionSector>

                {/* SECTOR 2: MECHANICAL SYSTEMS */}
                <AccordionSector
                    title={`⚙️ ${t('francis.sectors.mechanical')}`}
                    icon={Settings}
                    iconColor="text-amber-400"
                    borderColor="border-amber-500/50"
                    isExpanded={expandedSectors.mechanical}
                    onToggle={() => toggleSector('mechanical')}
                >
                    <ModuleLink
                        icon={Disc}
                        label={t('francis.modules.bearings')}
                        status={moduleStates.bearings}
                        onClick={() => navigate(`/francis/${ROUTES.FRANCIS.SOP.BEARINGS}`)}
                        href="#"
                    />
                    <ModuleLink
                        icon={Crosshair}
                        label={t('francis.modules.alignment')}
                        status={moduleStates.alignment}
                        onClick={() => navigate(`/francis/${ROUTES.FRANCIS.SOP.ALIGNMENT}`)}
                        href="#"
                    />
                    <ModuleLink
                        icon={ArrowRightLeft}
                        label={t('francis.thrustBalance.title', 'Thrust Balance')}
                        status={moduleStates.bearings}
                        onClick={() => navigate(`/francis/${ROUTES.FRANCIS.SOP.THRUST_BALANCE}`)}
                        href="#"
                    />
                    <ModuleLink
                        icon={Wind}
                        label={t('francis.vortex.title', 'Vortex Control')}
                        status={moduleStates.bearings}
                        onClick={() => navigate(`/francis/${ROUTES.FRANCIS.SOP.VORTEX_CONTROL}`)}
                        href="#"
                    />
                    <ModuleLink
                        icon={GitPullRequest}
                        label={t('francis.modules.miv')}
                        status={moduleStates.miv}
                        onClick={() => navigate(`/francis/${ROUTES.FRANCIS.SOP.MIV_DISTRIBUTOR}`)}
                        href="#"
                    />
                    <ModuleLink
                        icon={RefreshCw}
                        label={t('francis.modules.regRing', 'Regulating Ring')}
                        status={moduleStates.brakes}
                        onClick={() => navigate(`/francis/${ROUTES.FRANCIS.SOP.REGULATING_RING}`)}
                        href="#"
                    />
                    <ModuleLink
                        icon={LinkIcon}
                        label={t('francis.modules.linkage', 'Linkage')}
                        status={moduleStates.brakes}
                        onClick={() => navigate(`/francis/${ROUTES.FRANCIS.SOP.LINKAGE}`)}
                        href="#"
                    />
                    {/* Moved Coupling, Brakes, Recovery to Civil Sector */}
                </AccordionSector>

                {/* SECTOR 3: FLUID & CHEMICAL INTEGRITY */}
                <AccordionSector
                    title={`💧 ${t('francis.sectors.fluid')}`}
                    icon={Droplet}
                    iconColor="text-cyan-400"
                    borderColor="border-cyan-500/50"
                    isExpanded={expandedSectors.fluidChemical}
                    onToggle={() => toggleSector('fluidChemical')}
                >
                    <ModuleLink
                        icon={Droplet}
                        label={t('francis.oilHealth.label', 'Oil Health')}
                        status={moduleStates.hpu}
                        onClick={() => navigate(`/francis/${ROUTES.FRANCIS.SOP.OIL_HEALTH}`)}
                        href="#"
                    />
                    <ModuleLink
                        icon={Snowflake}
                        label={t('francis.modules.cooling')}
                        status={moduleStates.cooling}
                        onClick={() => navigate(`/francis/${ROUTES.FRANCIS.SOP.COOLING_WATER}`)}
                        href="#"
                    />
                    <ModuleLink
                        icon={Waves}
                        label={t('francis.modules.drainage')}
                        status={moduleStates.drainage}
                        onClick={() => navigate(`/francis/${ROUTES.FRANCIS.SOP.DRAINAGE_PUMPS}`)}
                        href="#"
                    />
                    <ModuleLink
                        icon={Droplet}
                        label={t('francis.modules.lube')}
                        status={moduleStates.lube}
                        onClick={() => navigate(`/francis/${ROUTES.FRANCIS.SOP.LUBRICATION}`)}
                        href="#"
                    />
                    <ModuleLink
                        icon={Lock}
                        label={t('francis.modules.hpu')}
                        status={moduleStates.hpu}
                        onClick={() => navigate(`/francis/${ROUTES.FRANCIS.SOP.HPU}`)}
                        href="#"
                    />

                </AccordionSector>

                {/* SECTOR 4: ELECTRICAL & GRID */}
                <AccordionSector
                    title={`⚡ ${t('francis.sectors.electrical')}`}
                    icon={Zap}
                    iconColor="text-yellow-400"
                    borderColor="border-yellow-500/50"
                    isExpanded={expandedSectors.electricalGrid}
                    onToggle={() => toggleSector('electricalGrid')}
                >
                    <ModuleLink
                        icon={ZapOff}
                        label={t('francis.modules.generator', 'Generator Integrity')}
                        status={moduleStates.pid}
                        onClick={() => navigate(`/francis/${ROUTES.FRANCIS.SOP.GENERATOR}`)}
                        href="#"
                    />
                    <ModuleLink
                        icon={Activity}
                        label={t('francis.modules.elecHealth', 'Electrical Health')}
                        status={moduleStates.pid}
                        onClick={() => navigate(`/francis/${ROUTES.FRANCIS.SOP.ELECTRICAL_HEALTH}`)}
                        href="#"
                    />
                    <ModuleLink
                        icon={Cpu}
                        label={t('francis.modules.pid', 'Governor PID')}
                        status={moduleStates.pid}
                        onClick={() => navigate(`/francis/${ROUTES.FRANCIS.SOP.GOVERNOR_PID}`)}
                        href="#"
                    />
                    <ModuleLink
                        icon={Merge}
                        label={t('francis.modules.gridSync', 'Grid Synchronization')}
                        status={moduleStates.pid}
                        onClick={() => navigate(`/francis/${ROUTES.FRANCIS.SOP.GRID_SYNC}`)}
                        href="#"
                    />
                    <ModuleLink
                        icon={Settings2}
                        label={t('francis.modules.distributorSync', 'Distributor Sync')}
                        status={moduleStates.miv}
                        onClick={() => navigate(`/francis/${ROUTES.FRANCIS.SOP.DISTRIBUTOR_SYNC}`)}
                        href="#"
                    />
                    <ModuleLink
                        icon={BatteryCharging}
                        label={t('francis.modules.dc', 'DC Control Systems')}
                        status={moduleStates.hpu}
                        onClick={() => navigate(`/francis/${ROUTES.FRANCIS.SOP.DC_SYSTEMS}`)}
                        href="#"
                    />
                    <ModuleLink
                        icon={Zap}
                        label={t('francis.modules.excitation')}
                        onClick={() => navigate(`/francis/${ROUTES.FRANCIS.SOP.EXCITATION}`)}
                        href="#"
                    />
                    <ModuleLink
                        icon={Zap}
                        label={t('francis.modules.transformer')}
                        onClick={() => navigate(`/francis/${ROUTES.FRANCIS.SOP.TRANSFORMER}`)}
                        href="#"
                    />
                </AccordionSector>

                {/* SECTOR 5: CIVIL & INFRASTRUCTURE */}
                <AccordionSector
                    title={`🏗️ ${t('francis.sectors.civil')}`}
                    icon={Building2}
                    iconColor="text-slate-400"
                    borderColor="border-slate-500/50"
                    isExpanded={expandedSectors.civilInfrastructure}
                    onToggle={() => toggleSector('civilInfrastructure')}
                >
                    {/* Moved from Mechanical */}
                    <ModuleLink
                        icon={Octagon}
                        label={t('francis.modules.brakes')}
                        status={moduleStates.brakes}
                        onClick={() => navigate(`/francis/${ROUTES.FRANCIS.SOP.BRAKING_SYSTEM}`)}
                        href="#"
                    />
                    <ModuleLink
                        icon={LifeBuoy}
                        label={t('francis.modules.recovery', 'Seal Recovery')}
                        status={moduleStates.recovery}
                        onClick={() => navigate(`/francis/${ROUTES.FRANCIS.SOP.SEAL_RECOVERY}`)}
                        href="#"
                    />
                    <ModuleLink
                        icon={Wifi}
                        label={t('francis.modules.coupling', 'Coupling')}
                        status={moduleStates.alignment}
                        onClick={() => navigate(`/francis/${ROUTES.FRANCIS.SOP.COUPLING}`)}
                        href="#"
                    />

                    <ModuleLink
                        icon={Activity}
                        label={t('francis.modules.penstock', 'Penstock Integrity')}
                        status={moduleStates.penstock}
                        onClick={() => navigate(`/francis/${ROUTES.FRANCIS.SOP.PENSTOCK}`)}
                        href="#"
                    />
                    <ModuleLink
                        icon={Filter}
                        label={t('francis.modules.intake', 'Intake & Sediment')}
                        status={moduleStates.penstock}
                        onClick={() => navigate(`/francis/${ROUTES.FRANCIS.SOP.INTAKE}`)}
                        href="#"
                    />
                    <ModuleLink
                        icon={Radio}
                        label={t('francis.modules.cathodic', 'Cathodic Protection')}
                        status={moduleStates.alignment}
                        onClick={() => navigate(`/francis/${ROUTES.FRANCIS.SOP.CATHODIC}`)}
                        href="#"
                    />
                    <ModuleLink
                        icon={Filter}
                        label={t('francis.modules.auxiliary', 'Auxiliary Systems')}
                        status={moduleStates.drainage}
                        onClick={() => navigate(`/francis/${ROUTES.FRANCIS.SOP.AUXILIARY}`)}
                        href="#"
                    />
                </AccordionSector>

                {/* SECTOR 6: PHILOSOPHY & STANDARDS */}
                <AccordionSector
                    title={`📜 Philosophy & Standards`}
                    icon={Book}
                    iconColor="text-cyan-500"
                    borderColor="border-cyan-500/30"
                    isExpanded={expandedSectors.philosophy}
                    onToggle={() => toggleSector('philosophy')}
                >
                    <ModuleLink
                        icon={Book}
                        label="The Roots of Engineering Manifesto"
                        onClick={() => navigate(FRANCIS_PATHS.MANIFESTO)}
                        href="#"
                    />
                </AccordionSector>
            </div>

            {/* Footer Actions */}
            <div className="mt-8 flex justify-between items-end border-t border-slate-800 pt-4 relative z-10">
                <div className="text-slate-700 text-[10px] font-mono max-w-2xl">
                    <p className="font-black text-slate-600 mb-1 tracking-widest uppercase">Roots of Engineering Disclaimer:</p>
                    <p>
                        This is a pro-bono engineering tool designed for field validation of Francis units &lt; 5 MW.
                        All calculations are rooted in fundamental mechanical principles and industrial standards
                        (Barlow&apos;s Law, ISO 10816-3 Vibration, IEEE 43 Insulation, and Cubic Fatigue Stress-Life).
                    </p>
                    <p className="mt-1 italic text-cyan-900/60">Non-commercial engine // Open Scientific Logic.</p>
                </div>

                <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-600 transition group">
                    <Printer className="w-4 h-4 text-cyan-500 group-hover:text-cyan-400" />
                    <span className="text-xs font-bold uppercase tracking-widest">[ {t('francis.actions.generateReport', 'Generate Report')} ]</span>
                </button>
            </div>
        </div>
    );
};

export default FrancisHub;
