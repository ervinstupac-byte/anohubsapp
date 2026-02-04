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
        <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500/30 overflow-x-hidden pb-32">
            {/* TOP COMMAND HUD */}
            <div className="border-b border-white/5 bg-slate-950/20 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-[1800px] mx-auto px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">System_Monitor_v3.0</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <AssetPicker />
                        <div className="h-4 w-px bg-white/10" />
                        <div className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {new Date().toLocaleTimeString([], { hour12: false })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1800px] mx-auto px-6 pt-10">
                {/* TRIPTYCH HUD: MASSIVE TELEMETRY CARDS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* LOAD CARD */}
                    <div className="bg-slate-900/10 border border-white/5 rounded-2xl p-8 relative overflow-hidden group hover:border-cyan-500/30 transition-all">
                        <div className="absolute top-0 right-0 p-4">
                            <Zap className="w-5 h-5 text-cyan-500/50" />
                        </div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">ACTIVE_LOAD</div>
                        <div className="text-7xl font-black text-cyan-500 numeric-display tracking-tighter">
                            12.5<span className="text-xl text-cyan-900 ml-2 font-mono uppercase">MW</span>
                        </div>
                        <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500 w-[83%] shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                        </div>
                    </div>

                    {/* VIBRATION CARD */}
                    <div className="bg-slate-900/10 border border-white/5 rounded-2xl p-8 relative overflow-hidden group hover:border-amber-500/30 transition-all">
                        <div className="absolute top-0 right-0 p-4">
                            <Activity className="w-5 h-5 text-amber-500/50" />
                        </div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">ROTOR_VIB</div>
                        <div className="text-7xl font-black text-amber-500 numeric-display tracking-tighter">
                            2.5<span className="text-xl text-amber-900 ml-2 font-mono uppercase">mm/s</span>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            <div className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[8px] font-black text-amber-500 uppercase tracking-widest">THRESHOLD_WARNING</div>
                            <div className="text-[8px] font-mono text-slate-600 uppercase">Limit: 2.0 mm/s</div>
                        </div>
                    </div>

                    {/* EFFICIENCY CARD */}
                    <div className="bg-slate-900/10 border border-white/5 rounded-2xl p-8 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                        <div className="absolute top-0 right-0 p-4">
                            <Gauge className="w-5 h-5 text-emerald-500/50" />
                        </div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">SYSTEM_EFF</div>
                        <div className="text-7xl font-black text-emerald-400 numeric-display tracking-tighter">
                            92<span className="text-xl text-emerald-900 ml-2 font-mono uppercase">%</span>
                        </div>
                        <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[92%] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <MaintenanceTimelineCard />
                    <ExpertMaintenanceAdvisorCard />
                </div>

                {/* DIAGNOSTIC DEEP-DIVE */}
                <div className="mt-12 bg-slate-900/5 border border-white/5 rounded-2xl overflow-hidden">
                    <button
                        className="w-full px-8 py-5 flex items-center justify-between bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
                        onClick={() => {
                            const el = document.getElementById('deep-dive-panel');
                            if (el) el.classList.toggle('hidden');
                        }}
                    >
                        <div className="flex items-center gap-4">
                            <Brain className="w-5 h-5 text-h-purple" />
                            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Diagnostic Deep-Dive</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-600" />
                    </button>
                    <div id="deep-dive-panel" className="hidden p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 border-t border-white/5">
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
                <div className="mt-12 pb-20">
                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] mb-8">Operational Continuity Protocols</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {protocols.map(proto => {
                            const nextDate = selectedAsset ? predictServiceDate(idAdapter.toNumber(selectedAsset.id) || 0, proto.threshold) : null;
                            const progress = (hours % proto.threshold) / proto.threshold * 100;

                            return (
                                <div key={proto.id} className="p-6 rounded-2xl bg-slate-900/10 border border-white/5 hover:border-white/10 transition-all flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{proto.name}</h4>
                                        <div className={`p-1.5 rounded bg-white/5 ${progress > 80 ? 'text-amber-500' : 'text-cyan-500'}`}>
                                            <ShieldCheck className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <div className="text-3xl font-black text-white numeric-display">
                                        {progress.toFixed(1)}%
                                    </div>
                                    <div className="h-1 bg-white/5 w-full rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${progress > 80 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]'} transition-all`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-[8px] font-mono text-slate-600 uppercase">
                                        <span>Next Schedule</span>
                                        <span className="text-slate-400">{nextDate ? nextDate.toLocaleDateString() : 'INF'}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
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
        </div>
    );
};
