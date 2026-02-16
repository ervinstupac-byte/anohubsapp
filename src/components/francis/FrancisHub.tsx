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
    ChevronDown, ChevronRight, Zap, Building2, Wrench
} from 'lucide-react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { FrancisSensorData } from '../../models/turbine/types';


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
    const telemetry = useTelemetryStore();
    const { updateTelemetry } = telemetry;

    // Live Physics Data Hook (Simulated for now or derive from techState)
    const simData: Partial<FrancisSensorData> = {
        rpm: telemetry.specializedState?.sensors?.rpm || 428.5,
        gridFrequency: telemetry.specializedState?.sensors?.gridFrequency || 50.02,
        activePower: telemetry.specializedState?.sensors?.activePower || 142.5
    };

    // Fallback if specializedState is undefined
    const moduleStates = telemetry.specializedState?.modules || {
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
            civilInfrastructure: false
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
            civilInfrastructure: true
        });
    };

    const collapseAll = () => {
        setExpandedSectors({
            criticalSafety: true, // Keep Critical Safety expanded
            mechanical: false,
            fluidChemical: false,
            electricalGrid: false,
            civilInfrastructure: false
        });
    };

    // Toggle module status
    const toggleStatus = (key: string) => {
        const current = moduleStates[key] || 'green';
        let next: 'green' | 'yellow' | 'red' = 'green';
        if (current === 'green') next = 'yellow';
        else if (current === 'yellow') next = 'red';

        updateTelemetry({
            specializedState: {
                ...telemetry.specializedState!,
                modules: {
                    ...telemetry.specializedState?.modules,
                    [key]: next
                }
            }
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
    }, [moduleStates, telemetry.identity]);

    const getDialColor = (pct: number) => {
        if (pct < 50) return '#ef4444';
        if (pct < 80) return '#eab308';
        return '#22c55e';
    };

    const dialColor = getDialColor(healthScore);

    return (
        <div className="min-h-screen p-4 md:p-8 bg-[#020617] font-mono text-slate-300">
            {/* Header & Health Score */}
            <header className="mb-10 border-b border-slate-800 pb-6">
                <div className="mb-6">
                    <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
                        <span className="text-sm font-bold">{t('common.back', 'Back to Turbine Selection')}</span>
                    </button>
                </div>

                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 bg-gradient-to-r from-slate-900/50 via-slate-800/30 to-slate-900/50 p-6 rounded-xl border border-slate-700/50">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-cyan-900/30 rounded-lg border border-cyan-500/30">
                                <Cpu className="text-cyan-400 w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-white tracking-tighter uppercase">
                                    {t('francis.title').split('•')[0]} <span className="text-cyan-400">{t('francis.title').split('•')[1] || 'UNIT 1'}</span>
                                </h1>
                                <p className="text-slate-500 text-xs tracking-widest mt-1">{t('francis.subtitle')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => navigate(`/francis/${ROUTES.FRANCIS.MISSION_CONTROL}`)}
                            className="px-5 py-3 bg-gradient-to-br from-orange-900/40 to-orange-950/60 border border-orange-500/50 rounded-lg flex items-center justify-center gap-3 hover:from-orange-800/50 hover:to-orange-900/70 hover:border-orange-400 transition-all group shadow-lg shadow-orange-900/20"
                        >
                            <Power className="text-red-400 w-5 h-5 group-hover:scale-110 transition" />
                            <div className="text-left">
                                <div className="text-[9px] text-red-400 font-bold uppercase tracking-wider">{t('francis.actions.missionControl')}</div>
                                <div className="text-white text-xs font-black tracking-widest">{t('francis.actions.startSequence')}</div>
                            </div>
                        </button>

                        <button
                            onClick={() => navigate(`/francis/${ROUTES.FRANCIS.EMERGENCY}`)}
                            className="px-5 py-3 bg-gradient-to-br from-indigo-900/40 to-indigo-950/60 border border-indigo-500/50 rounded-lg flex items-center justify-center gap-3 hover:from-indigo-800/50 hover:to-indigo-900/70 hover:border-indigo-400 transition-all group shadow-lg shadow-indigo-900/20"
                        >
                            <AlertTriangle className="text-orange-400 w-5 h-5 group-hover:scale-110 transition" />
                            <div className="text-left">
                                <div className="text-[9px] text-orange-400 font-bold uppercase tracking-wider">{t('francis.actions.emergency')}</div>
                                <div className="text-white text-xs font-black tracking-widest">{t('francis.actions.protocols')}</div>
                            </div>
                        </button>

                        <button
                            onClick={() => navigate(`/francis/${ROUTES.FRANCIS.FLOWCHART_STARTUP}`)}
                            className="px-5 py-3 bg-gradient-to-br from-green-900/40 to-green-950/60 border border-green-500/50 rounded-lg flex items-center justify-center gap-3 hover:from-green-800/50 hover:to-green-900/70 hover:border-green-400 transition-all group shadow-lg shadow-green-900/20"
                        >
                            <GitBranch className="text-green-400 w-5 h-5 group-hover:scale-110 transition" />
                            <div className="text-left">
                                <div className="text-[9px] text-green-400 font-bold uppercase tracking-wider">{t('francis.actions.startup')}</div>
                                <div className="text-white text-xs font-black tracking-widest">{t('francis.actions.flowchart')}</div>
                            </div>
                        </button>
                    </div>

                    {/* Health Score */}
                    {/* Health Score */}
                    <div className="flex items-center gap-6 bg-slate-900/70 p-4 rounded-lg border border-slate-700/50 shadow-xl">
                        <div
                            className="w-[120px] h-[120px] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.4),inset_0_0_20px_rgba(0,0,0,0.5)] animate-[pulse-glow_3s_ease-in-out_infinite]"
                            style={{
                                background: `conic-gradient(from 180deg, ${dialColor} 0%, ${dialColor} ${healthScore}%, #334155 ${healthScore}%, #334155 100%)`
                            }}
                        >
                            <div className="bg-[#020617] w-[80%] h-[80%] rounded-full flex flex-col items-center justify-center">
                                <span className="text-2xl font-black text-white">{healthScore}%</span>
                                <span className="text-sm text-slate-500 uppercase">{t('francis.health.label')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* 3D VISUALIZATION HEADER */}
            <div className="relative h-96 w-full bg-[#050505] overflow-hidden rounded-b-3xl border-b border-white/5 shadow-2xl mb-8">
                <div className="absolute inset-0 z-0 opacity-80">
                    <TurbineRunner3D rpm={(simData as any).rpm || 428} />
                </div>

                {/* Overlay Content */}
                <div className="absolute inset-0 z-10 p-8 flex flex-col justify-between pointer-events-none">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-[#2dd4bf]/10 border border-[#2dd4bf]/30 text-[#2dd4bf] text-[10px] font-bold uppercase tracking-widest rounded">
                                    Machine Hall 1
                                </span>
                                <span className="px-2 py-0.5 bg-slate-800 border border-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded flex items-center gap-1">
                                    <Activity className="w-3 h-3" /> Live Physics
                                </span>
                            </div>
                        </div>
                        <GlassCard className="pointer-events-auto backdrop-blur-md bg-black/40 border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">Grid Frequency</p>
                                    <p className="text-xl font-mono text-white font-bold">50.02 <span className="text-xs text-slate-500">Hz</span></p>
                                </div>
                                <div className="h-8 w-px bg-white/10" />
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">Active Power</p>
                                    <p className="text-xl font-mono text-[#2dd4bf] font-bold">142.5 <span className="text-xs text-slate-500">MW</span></p>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>

            {/* Expand/Collapse All Toggle */}
            <div className="mb-6 flex justify-end gap-3">
                <button
                    onClick={expandAll}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-slate-800/50 hover:bg-cyan-900/30 text-slate-400 hover:text-cyan-400 border border-slate-700 hover:border-cyan-500/50 rounded transition-all"
                >
                    Expand All
                </button>
                <button
                    onClick={collapseAll}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded transition-all"
                >
                    Collapse All
                </button>
            </div>
            {/* ACCORDION SECTORS */}
            <div className="space-y-4">
                {/* SECTOR 1: CRITICAL SAFETY */}
                <AccordionSector
                    title="🔴 Critical Safety"
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
                    title="⚙️ Mechanical Systems"
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
                    title="💧 Fluid & Chemical Integrity"
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
                    title="⚡ Electrical & Grid"
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
                        label="Excitation & AVR"
                        onClick={() => navigate(`/francis/${ROUTES.FRANCIS.SOP.EXCITATION}`)}
                        href="#"
                    />
                    <ModuleLink
                        icon={Zap}
                        label="Transformer Integrity"
                        onClick={() => navigate(`/francis/${ROUTES.FRANCIS.SOP.TRANSFORMER}`)}
                        href="#"
                    />
                </AccordionSector>

                {/* SECTOR 5: CIVIL & INFRASTRUCTURE */}
                <AccordionSector
                    title="🏗️ Civil & Infrastructure"
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
            </div>

            {/* Footer Actions */}
            <div className="mt-8 flex justify-between items-end border-t border-slate-800 pt-4">
                <div className="text-slate-700 text-xs font-mono">
                    <p>{t('francis.health.systemMap')}</p>
                    <p>{t('francis.health.calcDescription')}</p>
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
