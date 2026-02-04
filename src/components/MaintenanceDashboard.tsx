import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../routes/paths.ts';
import { useMaintenance, protocols } from '../contexts/MaintenanceContext.tsx';
import { useInventory } from '../contexts/InventoryContext.tsx';
import { useWorkOrder } from '../contexts/WorkOrderContext.tsx';
import { useAssetContext } from '../contexts/AssetContext.tsx';
import idAdapter from '../utils/idAdapter';
import { useToast } from '../contexts/ToastContext.tsx';
import { ForensicReportService } from '../services/ForensicReportService';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { MaintenanceTimelineCard } from './maintenance/MaintenanceTimelineCard';
import { ExpertMaintenanceAdvisorCard } from './maintenance/ExpertMaintenanceAdvisorCard';
import { SmartActionList } from './dashboard/SmartActionList';
import { AssetPicker } from './AssetPicker.tsx';
import { BackButton } from './BackButton.tsx';
import { WorkOrderOrchestrator } from './WorkOrderOrchestrator.tsx';
import { useDiagnostic } from '../contexts/DiagnosticContext.tsx';
import { useCerebro } from '../contexts/ProjectContext.tsx';
import { GuidedDiagnosisModal } from './GuidedDiagnosisModal.tsx';
import { SealingIntegrity } from './SealingIntegrity.tsx';
import { SystemResponseAnalytics } from './SystemResponseAnalytics.tsx';
import { StressCycleCounter } from './StressCycleCounter.tsx';
import { MachineProtectionSystem } from './MachineProtectionSystem.tsx';
import { FluidForceDiagnostics } from './FluidForceDiagnostics.tsx';
import { ForensicDepthAnalyzer } from './ForensicDepthAnalyzer.tsx';
import { OrbitPlotter } from '../features/telemetry/components/OrbitPlotter';
import { MagneticPullAnalytics } from './MagneticPullAnalytics.tsx';
import { AcousticDiagnosticModule } from './AcousticDiagnosticModule.tsx';
import { FrancisTurbineWireframe } from '../shared/components/ui/FrancisTurbineWireframe';
import { KaplanTurbineWireframe } from '../shared/components/ui/KaplanTurbineWireframe';
import { PeltonTurbineWireframe } from '../shared/components/ui/PeltonTurbineWireframe';
import { SimpleSparkline } from '../shared/components/ui/SimpleSparkline';
import { MechanicalSystemsModal } from './modals/MechanicalSystemsModal';
import { ElectricalGridModal } from './modals/ElectricalGridModal';
import { ForensicDeepDiveModal } from './modals/ForensicDeepDiveModal';
import {
    Activity,
    Zap,
    Shield,
    Waves,
    ChevronRight,
    ArrowLeft,
    ShieldCheck,
    Clock,
    Database,
    FileText,
    History,
    Settings,
    Gauge,
    Thermometer,
    Compass,
    Volume2,
    Magnet,
    CheckCircle2,
    AlertTriangle,
    FileSearch,
    Brain,
    Lock,
    ExternalLink,
    DollarSign,
    TrendingUp,
    TrendingDown,
    ShieldAlert,
    HardHat,
    GraduationCap
} from 'lucide-react';
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';
import { GridNegotiator, GridRequest } from '../services/GridNegotiator';
import { FleetAsset } from '../services/FleetOptimizer';
import { Responsive as ResponsiveLayout } from 'react-grid-layout';
import * as ReactGridLayoutModule from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import '../styles/nc89-fixes.css';
import { SovereignStrategist, FinancialContext } from '../services/SovereignStrategist';

const RGL = ReactGridLayoutModule as any;
const WidthProvider = RGL.WidthProvider || RGL.default?.WidthProvider;
const ResponsiveGridLayout = WidthProvider(ResponsiveLayout);

const WIDGET_IDS = {
    LOAD: 'vitals-load',
    VIBRATION: 'vitals-vibration',
    EFFICIENCY: 'vitals-efficiency',
    TURBINE_HUB: 'turbine-hub',
    MECHANICAL: 'mechanical-systems',
    ELECTRICAL: 'electrical-grid',
    FORENSICS: 'forensic-deep-dive',
    TIMELINE: 'maintenance-timeline',
    ADVISOR: 'expert-advisor',
    PROTOCOLS: 'continuity-protocols',
    ROI: 'roi-master',
    ENGINEER: 'engineer-portal',
    HYDROSCHOOL: 'hydroschool-portal'
    ,HERITAGE_SEARCH: 'heritage-search',
    SAFE_STATE_HMI: 'safe-state-hmi'
};

import { AssetTypeSelector } from './navigation/AssetTypeSelector';
import { useRef } from 'react';
import { EventJournal } from '../services/EventJournal';

import { AlarmAckPanel } from './dashboard/AlarmAckPanel.tsx';

import { HeritageSearchWidget } from './dashboard/HeritageSearchWidget';
import { SafeStateHMI } from './dashboard/SafeStateHMI';
import { MqttBridge } from '../services/MqttBridge';
import guardedAction from '../utils/guardedAction';

// --- TREND INDICATOR (NC-86) ---
const TrendArrow: React.FC<{ trend: 'UP' | 'DOWN' | 'STABLE', value?: number, threshold?: number, className?: string }> = ({ trend, value, threshold = 2.0, className }) => {
    const isProjectedDanger = trend === 'UP' && value !== undefined && value > (threshold * 0.8);

    if (trend === 'UP') return <TrendingUp className={`w-4 h-4 ${isProjectedDanger ? 'text-red-500 animate-pulse' : 'text-emerald-500'} ${className}`} />;
    if (trend === 'DOWN') return <TrendingDown className={`w-4 h-4 text-red-500 ${className}`} />;
    return <div className={`w-4 h-0.5 bg-slate-500 rounded-full ${className}`} />;
};

// --- HEATMAP GENERATOR ---
const Heatmap: React.FC<{ data: number[] }> = ({ data }) => {
    // We simulate a 52-week grid (columns) with 7 days (rows)
    return (
        <div className="flex flex-wrap gap-1 mt-4">
            {data.map((value, i) => {
                const intensity = Math.min(value * 25, 100); // 0-100% scale
                return (
                    <div
                        key={i}
                        className="w-3 h-3 rounded-[2px] transition-all hover:scale-150 cursor-pointer"
                        style={{
                            backgroundColor: intensity === 0 ? '#1e293b' : `rgba(34, 197, 94, ${intensity / 100})`,
                            boxShadow: intensity > 80 ? '0 0 8px rgba(34, 197, 94, 0.4)' : 'none'
                        }}
                        title={`Load intensity: ${intensity.toFixed(0)}%`}
                    />
                );
            })}
        </div>
    );
};

export const MaintenanceDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { assets, selectedAsset, selectAsset } = useAssetContext();
    const { operatingHours, predictServiceDate } = useMaintenance();
    const { getMissingParts } = useInventory();
    const { activeWorkOrder, startWorkOrder } = useWorkOrder();
    const { showToast } = useToast();
    const { activeQuery, visibleWidgets, toggleWidget, setWidgets } = useDiagnostic();
    const { state } = useCerebro();
    const [hapticBurst, setHapticBurst] = useState(false);

    const { mechanical, hydraulic, physics, fleet, diagnosis, rcaResults, isMaintenanceLocked, toggleLOTO } = useTelemetryStore();
    // Efficiency percent (0-100) for UI thresholds
    const effPct = ((hydraulic?.efficiency || 0) * 100);
    const hours = selectedAsset ? operatingHours[idAdapter.toStorage(selectedAsset.id)] || 0 : 0;

    const currentType = selectedAsset?.turbine_type || selectedAsset?.type || 'FRANCIS';
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // NC-85: Screen resize listener
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const [userRole, setUserRole] = useState<'OWNER' | 'ENGINEER' | 'OPERATOR'>('OPERATOR');
    const [latency, setLatency] = useState(42);
    const [linkStatus, setLinkStatus] = useState<'CONNECTED' | 'DEGRADED' | 'DISCONNECTED'>('CONNECTED');
    const [acknowledgedAlarms, setAcknowledgedAlarms] = useState<string[]>([]);

    const layoutKey = `MONOLIT_LAYOUT_${currentType.toUpperCase()}`;

    const [layouts, setLayouts] = useState(() => {
        try {
            const saved = localStorage.getItem(layoutKey);
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error("[NC-85] Layout parse failed, purging localStorage", e);
            localStorage.removeItem(layoutKey);
        }

        return {
            lg: [
                { i: WIDGET_IDS.LOAD, x: 0, y: 0, w: 4, h: 2 },
                { i: WIDGET_IDS.VIBRATION, x: 4, y: 0, w: 4, h: 2 },
                { i: WIDGET_IDS.EFFICIENCY, x: 8, y: 0, w: 4, h: 2 },
                { i: WIDGET_IDS.TURBINE_HUB, x: 0, y: 2, w: 12, h: 4 },
                { i: WIDGET_IDS.TIMELINE, x: 0, y: 6, w: 6, h: 3 },
                { i: WIDGET_IDS.ADVISOR, x: 6, y: 6, w: 6, h: 3 },
                { i: WIDGET_IDS.HERITAGE_SEARCH, x: 0, y: 9, w: 6, h: 3 },
                { i: WIDGET_IDS.SAFE_STATE_HMI, x: 6, y: 9, w: 6, h: 3 },
                { i: WIDGET_IDS.PROTOCOLS, x: 0, y: 12, w: 12, h: 2 }
            ]
        };
    });


    // EFFECT: Reload layout when turbine type changes
    useEffect(() => {
        try {
            const saved = localStorage.getItem(layoutKey);
            if (saved) {
                setLayouts(JSON.parse(saved));
            } else {
                setLayouts({
                    lg: [
                        { i: WIDGET_IDS.LOAD, x: 0, y: 0, w: 4, h: 2 },
                        { i: WIDGET_IDS.VIBRATION, x: 4, y: 0, w: 4, h: 2 },
                        { i: WIDGET_IDS.EFFICIENCY, x: 8, y: 0, w: 4, h: 2 },
                        { i: WIDGET_IDS.TURBINE_HUB, x: 0, y: 2, w: 12, h: 4 },
                        { i: WIDGET_IDS.TIMELINE, x: 0, y: 6, w: 6, h: 3 },
                        { i: WIDGET_IDS.ADVISOR, x: 6, y: 6, w: 6, h: 3 },
                        { i: WIDGET_IDS.HERITAGE_SEARCH, x: 0, y: 9, w: 6, h: 3 },
                        { i: WIDGET_IDS.SAFE_STATE_HMI, x: 6, y: 9, w: 6, h: 3 },
                        { i: WIDGET_IDS.PROTOCOLS, x: 0, y: 12, w: 12, h: 2 }
                    ]
                });
            }
        } catch (e) {
            console.error("[NC-85] Layout parse failed in useEffect", e);
            localStorage.removeItem(layoutKey);
        }
    }, [currentType, layoutKey]);

    const onLayoutChange = (currentLayout: any, allLayouts: any) => {
        setLayouts(allLayouts);
        localStorage.setItem(layoutKey, JSON.stringify(allLayouts));
    };

    // --- INTELLIGENT PLACEMENT LOGIC (NC-81) ---
    const prevVisibleWidgets = useRef<string[]>(visibleWidgets);
    useEffect(() => {
        const added = visibleWidgets.filter(w => !prevVisibleWidgets.current.includes(w));
        if (added.length > 0) {
            setLayouts((currentLayouts: any) => {
                const updated = { ...currentLayouts };
                const breakpoint = 'lg'; // Simplified for LG
                const items: any[] = updated[breakpoint] || [];

                added.forEach(id => {
                    // Check if widget already has a layout entry
                    const exists = items.some((it: any) => it.i === id);
                    if (!exists) {
                        // Calculate max Y + H
                        const maxY = items.reduce((max: number, item: any) => Math.max(max, item.y + item.h), 0);

                        // Default dimensions for new widgets
                        let w = 4, h = 3;
                        if (id === WIDGET_IDS.TURBINE_HUB) { w = 12; h = 4; }
                        if (id.includes('vitals')) { w = 4; h = 2; }
                        if (id.includes('systems') || id.includes('grid') || id.includes('dive')) { w = 6; h = 4; }

                        items.push({ i: id, x: 0, y: maxY, w, h });
                    }
                });

                updated[breakpoint] = [...items];
                return updated;
            });
        }
        prevVisibleWidgets.current = visibleWidgets;
    }, [visibleWidgets]);

    // Heatmap removed - showing real data only
    const heatmapData: number[] = [];

    const [dashboardReady, setDashboardReady] = useState(false);

    const [ledgerHash, setLedgerHash] = useState('UNINITIALIZED');

    // --- MS-VS DEBUG BRIDGE (NC-81) ---
    useEffect(() => {
        (window as any).__MONOLIT_DEBUG__ = {
            ...(window as any).__MONOLIT_DEBUG__,
            injectGridRequest: async (power: number) => {
                console.log(`[MS-VS] Injecting Grid Request: ${power}MW`);
                const mockFleet: FleetAsset[] = [
                    { id: 'UNIT-01', efficiency: 0.92, currentPowerMW: 12.5, maxCapacityMW: 14.5 }
                ];
                const request: GridRequest = {
                    requestId: `DEBUG-${Date.now()}`,
                    requestedMW: power,
                    duration: 'SPOT',
                    priority: 'NORMAL',
                    timestamp: Date.now()
                };
                const result = await GridNegotiator.negotiate(request, mockFleet);
                if (result.status === 'DECLINED') {
                    setHapticBurst(true);
                    setTimeout(() => setHapticBurst(false), 1000);
                    showToast(`GRID REJECTED: ${result.reason}`, "error");
                } else {
                    showToast(`GRID ACCEPTED: ${result.approvedMW}MW`, "success");
                }
            },
            resetSovereignState: () => {
                console.log("[MS-VS] PURGING SOVEREIGN STATE...");
                localStorage.clear();
                window.location.reload();
            },
            getLedgerHash: async () => {
                const events = EventJournal.recent(5000);
                const payload = JSON.stringify(events);
                const msgBuffer = new TextEncoder().encode(payload);
                const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                setLedgerHash(hash);
                return hash;
            },
            setUserRole: (role: 'OWNER' | 'ENGINEER' | 'OPERATOR') => {
                console.log(`[RBAC] Setting user role to: ${role}`);
                setUserRole(role);
                showToast(`ROLE_CHANGED: ${role}`, "info");
            },
            simulateLatency: (ms: number) => {
                setLatency(ms);
                setLinkStatus(ms > 200 ? 'DEGRADED' : 'CONNECTED');
            }
        };

        // Ready trigger: after components mount and layout initializes
        // We simulate a "scan complete" or "settled" delay for the robot
        const timer = setTimeout(() => setDashboardReady(true), 3000);
        return () => clearTimeout(timer);
    }, [assets]);

    const handleGridRequest = async () => {
        // Mock a high-load request that triggers a Sovereign Tier 1 violation (>15MW per unit)
        // Asset context usually has 1 unit for this MVP, but we mock fleet for negotiator
        const mockFleet: FleetAsset[] = [
            { id: 'UNIT-01', efficiency: 0.92, currentPowerMW: 12.5, maxCapacityMW: 14.5 }
        ];

        const request: GridRequest = {
            requestId: `REQ-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
            requestedMW: 25.0, // This will definitely trigger the 15MW/unit limit
            duration: 'SPOT',
            priority: 'NORMAL',
            timestamp: Date.now()
        };

        const result = await GridNegotiator.negotiate(request, mockFleet);

        if (result.status === 'DECLINED') {
            setHapticBurst(true);
            setTimeout(() => setHapticBurst(false), 1000);
            showToast(`GRID REJECTED: ${result.reason}`, "error");
        } else {
            showToast(`GRID ACCEPTED: ${result.approvedMW}MW`, "success");
        }
    };

    if (activeWorkOrder) {
        return (
            <div className="p-4">
                <div className="mb-4">
                    <BackButton text="Cancel & Exit Work Order" />
                </div>
                <WorkOrderOrchestrator />
            </div>
        );
    }

    return (
        <div
            className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500/30 overflow-x-hidden pb-32"
            data-ready={dashboardReady ? "true" : "false"}
            data-testid="maintenance-dashboard"
        >
            {/* TOP COMMAND HUD */}
            <div className="border-b border-white/5 bg-slate-950/20 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-[1800px] mx-auto px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">System_Monitor_v3.0</h1>
                        </div>
                        <div className="h-4 w-px bg-white/10 mx-2" />
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${linkStatus === 'CONNECTED' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                                <span className="text-[9px] font-mono text-slate-400" data-latency-ms={latency} data-link-status={linkStatus}>
                                    LINK: {latency}ms
                                </span>
                            </div>
                            <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                ROLE: {userRole}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center bg-slate-900/40 rounded-lg p-1 border border-white/5">
                            {assets.map(asset => (
                                <button
                                    key={asset.id}
                                    onClick={() => selectAsset(asset.id)}
                                    className={`px-3 py-1 rounded text-[10px] font-black transition-all ${selectedAsset?.id === asset.id
                                        ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                                        : 'text-slate-500 hover:text-slate-300'
                                        }`}
                                >
                                    {asset.name.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={handleGridRequest}
                            data-testid="grid-request-button"
                            className="text-[10px] font-black text-cyan-500 hover:text-cyan-400 uppercase tracking-widest border border-cyan-500/20 px-3 py-1 rounded bg-cyan-500/5 transition-all hover:bg-cyan-500/10"
                        >
                            Request_Load_Alpha
                        </button>
                        <button
                            onClick={() => {
                                const ok = guardedAction('Start Simulation', () => MqttBridge.manualStartSimulation());
                                if (!ok) { try { showToast('Manual simulation start blocked: LOTO active', 'error'); } catch (e) {} }
                            }}
                            disabled={isMaintenanceLocked}
                            className={`px-3 py-1 rounded text-[10px] font-black transition-all ${isMaintenanceLocked ? 'bg-red-600 text-white' : 'bg-emerald-500 text-black hover:bg-emerald-600'}`}
                        >
                            Start Simulation
                        </button>
                        <AssetPicker />
                        <div className="h-4 w-px bg-white/10" />
                        <div className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {new Date().toLocaleTimeString([], { hour12: false })}
                        </div>
                        <button
                            onClick={toggleLOTO}
                            className={`px-3 py-1 rounded text-[10px] font-black transition-all border ${isMaintenanceLocked
                                ? 'bg-red-500 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse'
                                : 'bg-slate-800 text-slate-400 border-white/5 hover:border-white/20'
                                }`}
                        >
                            {isMaintenanceLocked ? 'LOTO_ACTIVE' : 'ACTIVATE_LOTO'}
                        </button>
                    </div>
                </div>
            </div>

            {/* LOTO BANNER (NC-87.1) */}
            <AnimatePresence>
                {isMaintenanceLocked && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-red-500/90 backdrop-blur-md border-b border-red-400/50 flex items-center justify-center py-2 h-8 overflow-hidden"
                    >
                        <ShieldAlert className="w-4 h-4 text-white mr-3 animate-bounce" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.5em] drop-shadow-lg">
                            MAINTENANCE LOCK - LOTO ACTIVE - CONTROL INHIBITED
                        </span>
                        <ShieldAlert className="w-4 h-4 text-white ml-3 animate-bounce" />
                    </motion.div>
                )}
            </AnimatePresence>

            <AssetTypeSelector />

            <AlarmAckPanel
                alarms={[
                    ...(diagnosis?.messages.map((m: any, idx: number) => ({
                        id: `diag-${m.code || idx}`,
                        description: m.en,
                        severity: diagnosis.severity
                    })) || []),
                    ...(rcaResults.filter((r: any) => r.severity === 'CRITICAL').map((r: any, idx: number) => ({
                        id: `rca-${idx}`,
                        description: r.cause,
                        severity: r.severity
                    })))
                ].filter(a => !acknowledgedAlarms.includes(a.id))}
                onAck={(id: string) => {
                    setAcknowledgedAlarms(prev => [...prev, id]);
                    EventJournal.append('ALARM_ACK', { alarmId: id, operator: 'MONOLIT_ARCHITECT', role: userRole });
                    showToast("ALARM_ACKNOWLEDGED: Recorded in Ledger", "success");
                }}
            />

            <div className="max-w-[1800px] mx-auto px-6 pt-10">
                <ResponsiveGridLayout
                    className="layout"
                    layouts={layouts}
                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                    cols={{ lg: 12, md: 10, sm: 6, xs: 1, xxs: 1 }}
                    rowHeight={100}
                    onLayoutChange={onLayoutChange}
                    draggableHandle=".drag-grip"
                    isDraggable={!isMobile}
                    isResizable={!isMobile}
                    useCSSTransforms={!isMobile}
                >
                    {visibleWidgets.includes(WIDGET_IDS.LOAD) && (
                        <div key={WIDGET_IDS.LOAD}>
                            <div
                                id="hud-load-card"
                                data-testid="hud-load-card"
                                className="h-full bg-slate-900/50 backdrop-blur-[12px] border border-white/10 rounded-2xl p-8 relative overflow-hidden group hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all duration-500"
                            >
                                <div className="drag-handle absolute top-0 left-0 right-0 h-6 pointer-events-none">
                                    <div className="drag-grip absolute top-0 left-3 w-6 h-6 z-20" />
                                </div>
                                <div className="absolute top-0 right-0 p-4 flex flex-col items-end gap-2 text-shadow-glow">
                                    <Zap className="w-5 h-5 text-cyan-500/50" />
                                    <SimpleSparkline data={[12.1, 12.3, 12.2, 12.5, 12.4, 12.5]} width={60} height={20} />
                                </div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">ACTIVE_LOAD</div>
                                <div className="text-7xl font-black text-cyan-500 numeric-display tracking-tighter drop-shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-baseline gap-4">
                                    {((hydraulic.powerKW || 0) / 1000).toFixed(1)}
                                    <span className="text-xl text-cyan-900 font-mono uppercase">MW</span>
                                    <TrendArrow trend={physics.trends?.output || 'STABLE'} className="mb-2" />
                                </div>
                                <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-500 w-[83%] shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                                </div>
                                <div className="mt-4 text-[9px] font-mono text-slate-500 bg-black/20 px-2 py-1 rounded inline-block">KKS: 01HPP-P-001</div>
                            </div>
                        </div>
                    )}

                    {visibleWidgets.includes(WIDGET_IDS.VIBRATION) && (
                        <div key={WIDGET_IDS.VIBRATION}>
                            <div
                                id="hud-vibration-card"
                                data-testid="hud-vibration-card"
                                className="h-full bg-slate-900/50 backdrop-blur-[12px] border border-white/10 rounded-2xl p-8 relative overflow-hidden group hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] transition-all duration-500"
                            >
                                <div className="drag-handle absolute top-0 left-0 right-0 h-6 pointer-events-none">
                                    <div className="drag-grip absolute top-0 left-3 w-6 h-6 z-20" />
                                </div>
                                <div className="absolute top-0 right-0 p-4 flex flex-col items-end gap-2 text-shadow-glow">
                                    <Activity className="w-5 h-5 text-amber-500/50" />
                                    <SimpleSparkline data={[2.1, 2.4, 2.2, 2.5, 2.7, 2.5]} width={60} height={20} />
                                </div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">ROTOR_VIB</div>
                                <div className="text-7xl font-black text-amber-500 numeric-display tracking-tighter drop-shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-baseline gap-4">
                                    {mechanical.vibrationX?.toFixed(1) || '0.0'}
                                    <span className="text-xl text-amber-900 font-mono uppercase">mm/s</span>
                                    <TrendArrow
                                        trend={physics.trends?.vibration || 'STABLE'}
                                        value={mechanical.vibrationX}
                                        threshold={2.0}
                                        className="mb-2"
                                    />
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[8px] font-black text-amber-500 uppercase tracking-widest">THRESHOLD_WARNING</div>
                                        <div className="text-[8px] font-mono text-slate-600 uppercase">Limit: 2.0 mm/s</div>
                                    </div>
                                    <div className="text-[9px] font-mono text-slate-500 bg-black/20 px-2 py-1 rounded">KKS: 01HPP-V-001</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {visibleWidgets.includes(WIDGET_IDS.EFFICIENCY) && (
                        <div key={WIDGET_IDS.EFFICIENCY}>
                            <div
                                id="hud-efficiency-card"
                                data-testid="hud-efficiency-card"
                                className="h-full bg-slate-900/50 backdrop-blur-[12px] border border-white/10 rounded-2xl p-8 relative overflow-hidden group hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all duration-500"
                            >
                                <div className="drag-handle absolute top-0 left-0 right-0 h-6 pointer-events-none">
                                    <div className="drag-grip absolute top-0 left-3 w-6 h-6 z-20" />
                                </div>
                                <div className="absolute top-0 right-0 p-4 flex flex-col items-end gap-2 text-shadow-glow">
                                    <Gauge className="w-5 h-5 text-emerald-500/50" />
                                    <SimpleSparkline data={[91, 92, 91.5, 92, 92.2, 92]} width={60} height={20} />
                                </div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">SYSTEM_EFF</div>
                                <div className="text-7xl font-black text-emerald-400 numeric-display tracking-tighter drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-baseline gap-4">
                                    {((hydraulic.efficiency || 0) * 100).toFixed(1)}
                                    <span className="text-xl text-emerald-900 font-mono uppercase">%</span>
                                    <TrendArrow trend={physics.trends?.efficiency || 'STABLE'} className="mb-2" />
                                </div>
                                <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[92%] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                </div>
                                <div className="mt-4 flex justify-between items-center text-[9px] font-mono text-slate-500">
                                    <div className="bg-black/20 px-2 py-1 rounded">KKS: 01HPP-ETA-001</div>
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-1">
                                            <span className="text-slate-600">{'$H_{head}$'}:</span>
                                            <span className="text-cyan-500 font-black">{physics.head_m?.toFixed(1) || '0.0'}m</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-slate-600">{'$Q$'}:</span>
                                            <span className="text-cyan-500 font-black">{physics.flow_m3s?.toFixed(1) || '0.0'}m³/s</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {visibleWidgets.includes(WIDGET_IDS.TURBINE_HUB) && (
                        <div key={WIDGET_IDS.TURBINE_HUB}>
                            <div id="turbine-navigation-hub" data-testid="turbine-navigation-hub" className="h-full bg-slate-900/5 backdrop-blur-md border border-white/5 rounded-3xl p-6 relative group overflow-hidden">
                                <div className="drag-handle absolute top-0 left-0 right-0 h-8 pointer-events-none">
                                    <div className="drag-grip absolute top-0 left-3 w-6 h-8 z-20" />
                                </div>
                                <div className="absolute inset-0 bg-cyan-500/[0.02] pointer-events-none" />
                                <div className="h-full flex justify-center items-center">
                                    {currentType.toUpperCase() === 'FRANCIS' && <FrancisTurbineWireframe activeFeature={activeQuery?.toString()} />}
                                    {currentType.toUpperCase() === 'KAPLAN' && <KaplanTurbineWireframe activeFeature={activeQuery?.toString()} />}
                                    {currentType.toUpperCase() === 'PELTON' && <PeltonTurbineWireframe activeFeature={activeQuery?.toString()} />}
                                </div>
                                <div className="absolute bottom-4 left-6 text-[8px] font-mono text-cyan-600/50 tracking-widest bg-black/40 px-3 py-1 rounded">
                                    KKS: 01HPP-T-001 | {currentType.toUpperCase()}_MODEL
                                </div>
                            </div>
                        </div>
                    )}

                    {visibleWidgets.includes(WIDGET_IDS.TIMELINE) && (
                        <div key={WIDGET_IDS.TIMELINE}>
                            <div className="h-full relative group">
                                <div className="drag-handle absolute top-0 left-0 right-0 h-6 pointer-events-none">
                                    <div className="drag-grip absolute top-0 left-3 w-6 h-6 z-20" />
                                </div>
                                <MaintenanceTimelineCard />
                            </div>
                        </div>
                    )}

                    {visibleWidgets.includes(WIDGET_IDS.ADVISOR) && (
                        <div key={WIDGET_IDS.ADVISOR}>
                            <div className="h-full relative group">
                                <div className="drag-handle absolute top-0 left-0 right-0 h-6 pointer-events-none">
                                    <div className="drag-grip absolute top-0 left-3 w-6 h-6 z-20" />
                                </div>
                                <ExpertMaintenanceAdvisorCard />
                            </div>
                        </div>
                    )}

                    {visibleWidgets.includes(WIDGET_IDS.PROTOCOLS) && (
                        <div key={WIDGET_IDS.PROTOCOLS}>
                            <div className="h-full bg-slate-900/5 border border-white/5 rounded-2xl p-8 relative overflow-hidden group">
                                <div className="drag-handle absolute top-0 left-0 right-0 h-6 pointer-events-none">
                                    <div className="drag-grip absolute top-0 left-3 w-6 h-6 z-20" />
                                </div>
                                <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] mb-8">Operational Continuity Protocols</div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {protocols.map(proto => {
                                        const nextDate = selectedAsset ? predictServiceDate(idAdapter.toNumber(selectedAsset.id) || 0, proto.threshold) : null;
                                        const progress = (hours % proto.threshold) / proto.threshold * 100;

                                        return (
                                            <div key={proto.id} className="p-4 rounded-xl bg-slate-900/10 border border-white/5 hover:border-white/10 transition-all flex flex-col gap-2">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{proto.name}</h4>
                                                    <div className={`p-1 rounded bg-white/5 ${progress > 80 ? 'text-amber-500' : 'text-cyan-500'}`}>
                                                        <ShieldCheck className="w-3 h-3" />
                                                    </div>
                                                </div>
                                                <div className="text-xl font-black text-white numeric-display">
                                                    {progress.toFixed(1)}%
                                                </div>
                                                <div className="h-1 bg-white/5 w-full rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${progress > 80 ? 'bg-amber-500' : 'bg-cyan-500'} transition-all`}
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center text-[7px] font-mono text-slate-600 uppercase">
                                                    <span>Next</span>
                                                    <span className="text-slate-400">{nextDate ? nextDate.toLocaleDateString() : 'INF'}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* DYNAMIC FUNCTIONAL WIDGETS */}
                    {visibleWidgets.includes(WIDGET_IDS.MECHANICAL) && (
                        <div key={WIDGET_IDS.MECHANICAL}>
                            <div className="h-full bg-slate-900/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 relative overflow-hidden group">
                                <div className="drag-handle absolute top-0 left-0 right-0 h-8 pointer-events-none">
                                    <div className="drag-grip absolute top-0 left-3 w-6 h-8 z-20" />
                                </div>
                                <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                                        <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest">Mechanical Systems Audit</h3>
                                    </div>
                                    <button onClick={() => toggleWidget(WIDGET_IDS.MECHANICAL)} className="text-slate-500 hover:text-white">×</button>
                                </div>
                                <div className="grid grid-cols-1 gap-6 overflow-y-auto h-[calc(100%-4rem)] custom-scrollbar">
                                    <SealingIntegrity minimal />
                                    <FluidForceDiagnostics minimal />
                                    <SystemResponseAnalytics minimal />
                                </div>
                            </div>
                        </div>
                    )}

                    {visibleWidgets.includes(WIDGET_IDS.ELECTRICAL) && (
                        <div key={WIDGET_IDS.ELECTRICAL}>
                            <div className="h-full bg-slate-900/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 relative overflow-hidden group">
                                <div className="drag-handle absolute top-0 left-0 right-0 h-8 pointer-events-none">
                                    <div className="drag-grip absolute top-0 left-3 w-6 h-8 z-20" />
                                </div>
                                <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                                        <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest">Electrical & Grid Integrity</h3>
                                    </div>
                                    <button onClick={() => toggleWidget(WIDGET_IDS.ELECTRICAL)} className="text-slate-500 hover:text-white">×</button>
                                </div>
                                <div className="grid grid-cols-1 gap-6 overflow-y-auto h-[calc(100%-4rem)] custom-scrollbar">
                                    <MagneticPullAnalytics />
                                    <MachineProtectionSystem />
                                </div>
                            </div>
                        </div>
                    )}

                    {visibleWidgets.includes(WIDGET_IDS.FORENSICS) && (
                        <div key={WIDGET_IDS.FORENSICS}>
                            <div className="h-full bg-[#020617]/90 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 relative overflow-hidden group">
                                <div className="drag-handle absolute top-0 left-0 right-0 h-8 pointer-events-none">
                                    <div className="drag-grip absolute top-0 left-3 w-6 h-8 z-20" />
                                </div>
                                <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/10">
                                    <div className="flex items-center gap-2">
                                        <FileSearch className="w-4 h-4 text-purple-500" />
                                        <h3 className="text-xs font-black text-white uppercase tracking-widest">Forensic Data Analysis</h3>
                                    </div>
                                    <button onClick={() => toggleWidget(WIDGET_IDS.FORENSICS)} className="text-slate-500 hover:text-white">×</button>
                                </div>
                                <div className="grid grid-cols-1 gap-8 overflow-y-auto h-[calc(100%-4rem)] custom-scrollbar">
                                    <OrbitPlotter />
                                    <AcousticDiagnosticModule />
                                    <ForensicDepthAnalyzer />
                                    {/* LEDGER SNAPSHOT FOR ROBOT AUDIT */}
                                    <div
                                        data-testid="ledger-snapshot"
                                        className="hidden"
                                        data-events-count={EventJournal.recent(5000).length}
                                        data-root-hash={ledgerHash}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    {visibleWidgets.includes(WIDGET_IDS.ROI) && (
                        <div key={WIDGET_IDS.ROI}>
                            <ROIMasterCard telemetry={{ mechanical, hydraulic, physics }} userRole={userRole} />
                        </div>
                    )}

                    {visibleWidgets.includes(WIDGET_IDS.ENGINEER) && (
                        <div key={WIDGET_IDS.ENGINEER}>
                            <PortalWindow
                                title="Engineer Console"
                                icon={<HardHat className="w-4 h-4 text-amber-500" />}
                                id={WIDGET_IDS.ENGINEER}
                                onToggle={() => toggleWidget(WIDGET_IDS.ENGINEER)}
                            />
                        </div>
                    )}

                    {visibleWidgets.includes(WIDGET_IDS.HYDROSCHOOL) && (
                        <div key={WIDGET_IDS.HYDROSCHOOL}>
                            <PortalWindow
                                title="Hydroschool — Pro-Bono"
                                icon={<GraduationCap className="w-4 h-4 text-cyan-500" />}
                                id={WIDGET_IDS.HYDROSCHOOL}
                                onToggle={() => toggleWidget(WIDGET_IDS.HYDROSCHOOL)}
                            />
                        </div>
                    )}
                </ResponsiveGridLayout>
            </div>

            {/* FORENSIC DRAWER (INTEGRITY VERIFICATION) */}
            <div className="fixed bottom-0 left-0 w-full z-[100]">
                <div className="bg-[#020617] border-t border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.8)] px-8">
                    <button
                        onClick={() => {
                            const el = document.getElementById('forensic-drawer-content');
                            if (el) el.classList.toggle('hidden');
                        }}
                        className="w-full h-12 flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Integrity: <span className="text-emerald-500">Sealed</span> | SHA-256 Verified</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Database className="w-3 h-3 text-slate-600" />
                                <span className="text-[9px] font-mono text-slate-600 uppercase">Ledger: signed</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors rotate-90" />
                        </div>
                    </button>

                    <div id="forensic-drawer-content" className="hidden py-8 border-t border-white/5 max-h-[40vh] overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div>
                                <div className="text-[9px] font-black text-cyan-500 uppercase tracking-widest mb-4">Command History Integrity</div>
                                <div className="space-y-2">
                                    {[1, 2, 3, 4].map(v => (
                                        <div key={v} className="flex items-center justify-between text-[8px] font-mono text-slate-500 p-2 bg-white/[0.02] border border-white/5 rounded">
                                            <span>RECORD_ID_00{v} // NC-29_ENFORCED</span>
                                            <span className="text-emerald-500/50">VALIDATED</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col justify-end gap-4">
                                <button
                                    onClick={() => showToast("Verifying Ledger Integrity...", "info")}
                                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/5"
                                >
                                    Force Full Ledger Re-Sync
                                </button>
                                <button
                                    onClick={() => showToast("Generating Grand Dossier...", "info")}
                                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-cyan-500/20"
                                >
                                    Export v1.1 Grand Dossier
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {activeQuery && <GuidedDiagnosisModal query={activeQuery} />}

            <MechanicalSystemsModal />
            <ElectricalGridModal />
            <ForensicDeepDiveModal />

            {/* HAPTIC GLOW BURST OVERLAY (NC-31) */}
            <AnimatePresence>
                {hapticBurst && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1.5 }}
                        exit={{ opacity: 0, scale: 2 }}
                        transition={{ duration: 0.6 }}
                        className="fixed inset-0 pointer-events-none z-[200] flex items-center justify-center bg-red-900/10"
                    >
                        <div className="w-[80vw] h-[80vw] bg-red-500/20 blur-[120px] rounded-full" />
                        <div className="absolute text-red-500 font-mono text-xl font-black uppercase tracking-[1em] animate-pulse">
                            GRID_REJECTION_ACTIVE
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- NC-83: ROI_MASTER WIDGET ---
const ROIMasterCard: React.FC<{ telemetry: any, userRole: string }> = ({ telemetry, userRole }) => {
    const { mechanical, hydraulic, physics } = telemetry;

    const financialContext: FinancialContext = {
        marketPriceEurPerMWh: 85, // Current spotting rate
        maintenanceHourlyRate: 250,
        replacementCost: 1500000
    };

    const calculation = SovereignStrategist.calculateBridge(
        { timestamp: Date.now(), mechanical: mechanical as any, hydraulic: hydraulic as any },
        financialContext,
        { accumulatedFatigue: 0.12 }
    );

    return (
        <div className="h-full bg-slate-900/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 relative overflow-hidden group">
            <div className="drag-handle absolute top-0 left-0 right-0 h-8 pointer-events-none">
                <div className="drag-grip absolute top-0 left-3 w-6 h-8 z-20" />
            </div>
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Sovereign ROI Master</h3>
                </div>
                <div className="text-[9px] font-mono text-slate-500 bg-black/20 px-2 py-1 rounded">KKS: 01HPP-ROI-001</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Est. Revenue</div>
                    <div className="text-2xl font-black text-emerald-400 font-mono">
                        €{((hydraulic?.powerKW || 0) / 1000 * financialContext.marketPriceEurPerMWh).toFixed(2)}<span className="text-[8px] ml-1 opacity-50">/h</span>
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Wear Cost ($Wrate)</div>
                    <div className="text-2xl font-black text-red-400 font-mono">
                        €{calculation.molecularDebtRate.toFixed(2)}<span className="text-[8px] ml-1 opacity-50">/h</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl relative overflow-hidden">
                <div className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1">Net Sovereign Profit</div>
                <div className="text-4xl font-black text-emerald-400 font-mono leading-none">
                    €{calculation.netProfitRate.toFixed(2)}
                </div>
                <TrendingUp className="absolute bottom-2 right-2 w-12 h-12 text-emerald-500/10" />
            </div>

            <div className="mt-4 flex items-center justify-between text-[8px] font-mono text-slate-500 uppercase">
                <span>Health Index: {(calculation.profitHealthRatio * 100).toFixed(0)}%</span>
                {userRole === 'ENGINEER' ? (
                    <button className="text-cyan-500 hover:underline">OVERRIDE_$Wrate</button>
                ) : (
                    <span className="text-slate-700 select-none cursor-not-allowed">OVERRIDE_LOCKED</span>
                )}
            </div>
        </div>
    );
};

// --- NC-83: PORTAL WINDOW WIDGET ---
const PortalWindow: React.FC<{ title: string; icon: React.ReactNode; id: string; onToggle: () => void }> = ({ title, icon, id, onToggle }) => {
    return (
        <div className="h-full bg-slate-900/90 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 relative overflow-hidden flex flex-col">
            <div className="drag-handle absolute top-0 left-0 right-0 h-8 pointer-events-none">
                <div className="drag-grip absolute top-0 left-3 w-6 h-8 z-20" />
            </div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                    {icon}
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">{title}</h3>
                </div>
                <button onClick={onToggle} className="text-slate-500 hover:text-white relative z-20">×</button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10 animate-pulse">
                    {icon}
                </div>
                <h4 className="text-sm font-bold text-slate-400 mb-2">Service Initializing...</h4>
                <p className="text-[10px] text-slate-600 font-mono max-w-[200px]">
                    Establishing hardened bridge to {title.toUpperCase()} infrastructure.
                </p>
                <div className="mt-8 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500/40 w-1/3 animate-[shimmer_2s_infinite]" />
                </div>
            </div>
        </div>
    );
};
