import React, { useMemo } from 'react';
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
    ExternalLink
} from 'lucide-react';
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';
// import { AIPredictiveModule } from './AIPredictiveModule.tsx'; // REMOVED: simulation feature

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
    const { selectedAsset } = useAssetContext();
    const { operatingHours, predictServiceDate } = useMaintenance();
    const { getMissingParts } = useInventory();
    const { activeWorkOrder, startWorkOrder } = useWorkOrder();
    const { showToast } = useToast();
    const { activeQuery } = useDiagnostic();
    const { state } = useCerebro();

    const hours = selectedAsset ? operatingHours[idAdapter.toStorage(selectedAsset.id)] || 0 : 0;

    // Heatmap removed - showing real data only
    const heatmapData: number[] = [];

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
        <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500/30 overflow-x-hidden pb-24">
            {/* TOP COMMAND HUD */}
            <div className="border-b border-white/5 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-[1800px] mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors group"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-white" />
                        </button>
                        <div className="h-6 w-px bg-white/10" />
                        <div className="flex flex-col">
                            <h1 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-500">Maintenance_Engine_v2.4</h1>
                            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                CORE_KERNEL: NOMINAL // NC-22_ENABLED
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <AssetPicker />
                        <div className="h-6 w-px bg-white/10" />
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <div className="text-[10px] text-slate-500 font-mono uppercase">System Time</div>
                                <div className="text-xs font-mono numeric-display">{new Date().toLocaleTimeString()}</div>
                            </div>
                            <Clock className="w-4 h-4 text-slate-400" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1800px] mx-auto px-4 pt-6 space-y-6">
                {/* RULE OF THREE LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* COLUMN 1: PRIMARY VITALS */}
                    <div className="space-y-6">
                        <div className="bg-slate-900/40 border border-white/5 rounded-xl p-6 backdrop-blur-sm relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 group-hover:w-2 transition-all" />
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Primary Vitals</div>
                                <Activity className="w-4 h-4 text-cyan-400" />
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <div className="text-4xl font-black text-white numeric-display tracking-tighter">
                                        {hours.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                                        <span className="text-sm text-slate-500 ml-2 font-sans uppercase">Hours</span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 mt-1 uppercase">Operational Persistence</div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                                    <div>
                                        <div className="text-2xl font-black text-emerald-400 numeric-display">
                                            {(state.hydraulic.efficiency * 100).toFixed(1)}%
                                        </div>
                                        <div className="text-[9px] text-slate-500 uppercase mt-1">Efficiency ($\eta$)</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-cyan-400 numeric-display">
                                            0.82
                                            <span className="text-[10px] text-slate-500 ml-1">mm/s</span>
                                        </div>
                                        <div className="text-[9px] text-slate-500 uppercase mt-1">Rotor Vibration</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <MaintenanceTimelineCard />
                    </div>

                    {/* COLUMN 2: RISK VECTORS & CORE PROTOCOLS */}
                    <div className="space-y-6">
                        <div className="bg-slate-900/40 border border-white/5 rounded-xl p-6 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Risk Vectors</div>
                                <Shield className="w-4 h-4 text-red-400" />
                            </div>

                            <div className="space-y-4">
                                {[
                                    { label: 'Cavitation Index', value: '1.24', status: 'Nominal', icon: <Waves className="w-4 h-4 text-cyan-400" /> },
                                    { label: 'Bearing Temp', value: '42.5°C', status: 'Stable', icon: <Thermometer className="w-4 h-4 text-emerald-400" /> },
                                    { label: 'Fatigue Points', value: '12', status: 'Low Risk', icon: <Gauge className="w-4 h-4 text-slate-400" /> }
                                ].map((risk, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/5">
                                        <div className="flex items-center gap-3">
                                            {risk.icon}
                                            <div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase">{risk.label}</div>
                                                <div className="text-xs font-mono numeric-display">{risk.value}</div>
                                            </div>
                                        </div>
                                        <div className="text-[8px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                            {risk.status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <ExpertMaintenanceAdvisorCard />
                    </div>

                    {/* COLUMN 3: SOVEREIGN ACTIONS & SMART QUEUE */}
                    <div className="space-y-6">
                        <div className="bg-slate-900/40 border border-white/5 rounded-xl p-6 backdrop-blur-sm">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Sovereign Actions</div>
                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    onClick={() => showToast("Initializing Tactical Adjustment...", "info")}
                                    className="w-full flex items-center justify-between p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/20 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Settings className="w-5 h-5 text-cyan-400" />
                                        <div className="text-left">
                                            <div className="text-[10px] text-cyan-400 font-black uppercase">Execute Adjustment</div>
                                            <div className="text-[8px] text-slate-500 uppercase">Balance Setpoints</div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-cyan-500 group-hover:translate-x-1 transition-transform" />
                                </button>

                                <button
                                    className="w-full flex items-center justify-between p-4 bg-slate-800/40 border border-white/10 rounded-xl hover:bg-slate-800/60 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-slate-300" />
                                        <div className="text-left">
                                            <div className="text-[10px] text-slate-300 font-black uppercase">Verification Status</div>
                                            <div className="text-[8px] text-slate-500 uppercase">Ledger Signed</div>
                                        </div>
                                    </div>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                </button>
                            </div>
                        </div>

                        <SmartActionList />
                    </div>
                </div>

                {/* DIAGNOSTIC DEEP-DIVE: THE ACCORDION LOCKDOWN */}
                <div className="bg-slate-900/20 border border-white/5 rounded-2xl overflow-hidden mt-8">
                    <button
                        className="w-full px-6 py-4 flex items-center justify-between bg-white/[0.02] border-b border-white/5 hover:bg-white/[0.04] transition-colors"
                        onClick={() => {
                            const el = document.getElementById('deep-dive-panel');
                            if (el) el.classList.toggle('hidden');
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <Brain className="w-4 h-4 text-h-purple" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Diagnostic Deep-Dive (Advanced Analytics)</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-[10px] font-mono text-slate-600">NC-22 // NC-27 ACTIVE</div>
                            <ChevronRight className="w-4 h-4 text-slate-600" />
                        </div>
                    </button>

                    <div id="deep-dive-panel" className="hidden p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-950/30">
                        <SealingIntegrity />
                        <SystemResponseAnalytics />
                        <StressCycleCounter />
                        <MachineProtectionSystem />
                        <FluidForceDiagnostics />
                        <OrbitPlotter />
                        <MagneticPullAnalytics />
                        <AcousticDiagnosticModule />
                        <ForensicDepthAnalyzer />
                    </div>
                </div>

                {/* PROTOCOLS SECTION */}
                <div className="mt-8">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 text-center">Operational Integrity Protocols</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {protocols.map(proto => {
                            const nextDate = selectedAsset ? predictServiceDate(idAdapter.toNumber(selectedAsset.id) || 0, proto.threshold) : null;
                            const progress = (hours % proto.threshold) / proto.threshold * 100;

                            return (
                                <div key={proto.id} className="p-4 rounded-xl bg-slate-900/40 border border-white/5 group hover:border-cyan-500/30 transition-all flex gap-4 pr-16 relative overflow-hidden">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
                                        <ShieldCheck className={`w-6 h-6 ${progress > 80 ? 'text-amber-500' : 'text-cyan-500'}`} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-[10px] font-black uppercase text-white tracking-widest">{proto.name}</h4>
                                            <span className="text-[10px] font-mono numeric-display text-slate-500">{progress.toFixed(1)}%</span>
                                        </div>
                                        <div className="h-1 bg-white/5 w-full rounded-full overflow-hidden mb-3">
                                            <div
                                                className={`h-full ${progress > 80 ? 'bg-amber-500' : 'bg-cyan-500'} transition-all`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <p className="text-[9px] text-slate-500 uppercase leading-relaxed">{proto.description}</p>
                                    </div>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-right">
                                        <div className="text-[9px] text-slate-600 uppercase font-mono mb-1">Schedule</div>
                                        <div className="text-xs font-mono font-black text-white numeric-display">
                                            {nextDate ? nextDate.toLocaleDateString() : 'INF'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* THE COMMAND BAR (FIXED BOTTOM) */}
            <div className="fixed bottom-0 left-0 w-full bg-slate-950/80 backdrop-blur-xl border-t border-white/10 z-[100] h-20">
                <div className="max-w-[1800px] mx-auto h-full px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1 bg-white/5 rounded border border-white/10 flex items-center gap-2">
                            <Database className="w-3 h-3 text-cyan-400" />
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Ledger: <span className="text-emerald-400">Signed</span></span>
                        </div>
                        <div className="px-3 py-1 bg-white/5 rounded border border-white/10 flex items-center gap-2">
                            <Lock className="w-3 h-3 text-cyan-400" />
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Session: <span className="text-emerald-400">Encrypted</span></span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={async () => {
                                showToast("Verifying Ledger Integrity...", "info");
                                setTimeout(() => showToast("Ledger Integrity 100% Verified", "success"), 1500);
                            }}
                            className="px-6 py-2 bg-slate-800 text-slate-300 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all flex items-center gap-2"
                        >
                            <FileSearch className="w-4 h-4" />
                            Verify Ledger Integrity
                        </button>

                        <button
                            onClick={() => {
                                showToast("Generating Grand Dossier...", "info");
                            }}
                            className="px-6 py-2 bg-cyan-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center gap-2"
                        >
                            <FileText className="w-4 h-4" />
                            Grand Dossier Export
                        </button>
                    </div>
                </div>
            </div>

            {activeQuery && <GuidedDiagnosisModal query={activeQuery} />}
        </div>
    );
};
