import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES, getMaintenancePath } from '../routes/paths.ts';
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
import { QuickAccessCard } from '../shared/components/ui/QuickAccessCard';
import { Wrench, Settings, Activity, Shield, FileText, Clock, AlertTriangle, Calendar, CheckCircle, Smartphone, AlertCircle, TrendingUp, Info } from 'lucide-react';
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
    const [maintenanceStatus, setMaintenanceStatus] = useState<'nominal' | 'attention' | 'critical'>('nominal');
    const [upcomingServices, setUpcomingServices] = useState<any[]>([]);

    const hours = selectedAsset ? operatingHours[idAdapter.toStorage(selectedAsset.id)] || 0 : 0;

    // Calculate maintenance status based on protocols
    useEffect(() => {
        if (!selectedAsset) return;
        
        const numericId = idAdapter.toNumber(selectedAsset.id) || 0;
        const protocolStatuses = protocols.map(proto => {
            const progress = (hours % proto.threshold) / proto.threshold * 100;
            return { proto, progress };
        });
        
        const criticalServices = protocolStatuses.filter(p => p.progress > 80);
        const attentionServices = protocolStatuses.filter(p => p.progress > 50 && p.progress <= 80);
        
        if (criticalServices.length > 0) {
            setMaintenanceStatus('critical');
        } else if (attentionServices.length > 0) {
            setMaintenanceStatus('attention');
        } else {
            setMaintenanceStatus('nominal');
        }
        
        // Get upcoming services (next 3)
        const upcoming = protocolStatuses
            .filter(p => p.progress < 100)
            .sort((a, b) => b.progress - a.progress)
            .slice(0, 3);
        setUpcomingServices(upcoming);
    }, [selectedAsset, hours]);

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
        <div className="animate-fade-in pb-12 max-w-7xl mx-auto space-y-8">
            <div className="text-center space-y-6 pt-6">
                <div className="flex justify-between items-center absolute top-0 w-full max-w-7xl px-4">
                    <BackButton text={t('actions.back', 'Back to Hub')} />
                </div>
                <div>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 uppercase">
                        Maintenance <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Engine</span>
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">
                        Service intervals and operational integrity ledger.
                    </p>
                </div>
                <div className="max-w-md mx-auto">
                    <AssetPicker />
                </div>
            </div>

            {/* QUICK ACCESS CARDS SECTION */}
            <div className="mb-6">
                {/* Maintenance Status Banner */}
                {selectedAsset && (
                    <div className={`mb-4 p-4 rounded-xl border-2 flex items-center justify-between ${
                        maintenanceStatus === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                        maintenanceStatus === 'attention' ? 'bg-amber-500/10 border-amber-500/30' :
                        'bg-emerald-500/10 border-emerald-500/30'
                    }`}>
                        <div className="flex items-center gap-3">
                            {maintenanceStatus === 'critical' ? <AlertCircle className="w-5 h-5 text-red-500" /> :
                             maintenanceStatus === 'attention' ? <AlertTriangle className="w-5 h-5 text-amber-500" /> :
                             <CheckCircle className="w-5 h-5 text-emerald-500" />}
                            <div>
                                <div className={`text-xs font-bold uppercase tracking-wider ${
                                    maintenanceStatus === 'critical' ? 'text-red-500' :
                                    maintenanceStatus === 'attention' ? 'text-amber-500' :
                                    'text-emerald-500'
                                }`}>
                                    Maintenance Status: {maintenanceStatus.toUpperCase()}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                    {upcomingServices.length > 0 ? `${upcomingServices.length} service${upcomingServices.length > 1 ? 's' : ''} upcoming` : 'All systems nominal'}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Operating Hours</div>
                            <div className="text-sm font-bold text-white">{hours.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}h</div>
                        </div>
                    </div>
                )}

                <div className="mb-4">
                    <h2 className="text-xl font-black text-white uppercase tracking-widest mb-1">Maintenance Command Center</h2>
                    <p className="text-sm text-slate-400">Quick access to maintenance functions</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    <QuickAccessCard
                        id="timeline"
                        title="Timeline"
                        description="Service schedule"
                        icon={<Calendar className="w-6 h-6" />}
                        color="bg-red-500/10"
                        borderColor="border-red-500/30"
                        priority="critical"
                        onClick={() => document.getElementById('maintenance-timeline')?.scrollIntoView({ behavior: 'smooth' })}
                    />
                    <QuickAccessCard
                        id="protocols"
                        title="Protocols"
                        description="Service procedures"
                        icon={<CheckCircle className="w-6 h-6" />}
                        color="bg-red-500/10"
                        borderColor="border-red-500/30"
                        priority="critical"
                        onClick={() => document.getElementById('service-protocols')?.scrollIntoView({ behavior: 'smooth' })}
                    />
                    <QuickAccessCard
                        id="hydraulic"
                        title="Hydraulic"
                        description="Labyrinth health"
                        icon={<Activity className="w-6 h-6" />}
                        route={getMaintenancePath(ROUTES.MAINTENANCE.HYDRAULIC)}
                        color="bg-amber-500/10"
                        borderColor="border-amber-500/30"
                        priority="high"
                    />
                    <QuickAccessCard
                        id="bolt-torque"
                        title="Bolt Torque"
                        description="Fastener integrity"
                        icon={<Wrench className="w-6 h-6" />}
                        route={getMaintenancePath(ROUTES.MAINTENANCE.BOLT_TORQUE)}
                        color="bg-amber-500/10"
                        borderColor="border-amber-500/30"
                        priority="high"
                    />
                    <QuickAccessCard
                        id="shadow-engineer"
                        title="Shadow Engineer"
                        description="SOP manager"
                        icon={<Settings className="w-6 h-6" />}
                        route={getMaintenancePath(ROUTES.MAINTENANCE.SHADOW_ENGINEER)}
                        color="bg-cyan-500/10"
                        borderColor="border-cyan-500/30"
                        priority="medium"
                    />
                    <QuickAccessCard
                        id="ar-guide"
                        title="AR Guide"
                        description="Field manual"
                        icon={<Smartphone className="w-6 h-6" />}
                        route={getMaintenancePath(ROUTES.MAINTENANCE.AR_GUIDE)}
                        color="bg-cyan-500/10"
                        borderColor="border-cyan-500/30"
                        priority="medium"
                    />
                </div>
            </div>

            {!selectedAsset ? (
                <GlassCard className="text-center py-20">
                    <p className="text-slate-500 uppercase tracking-widest font-bold">Select an Asset to view Maintenance Schedule</p>
                </GlassCard>
            ) : (
                <>
                    {/* AI PREDICTIVE MODULE REMOVED - simulation feature */}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LEFT: STATUS CARD */}
                        <div className="space-y-6" id="maintenance-timeline">
                            <MaintenanceTimelineCard />
                            <ExpertMaintenanceAdvisorCard />
                            <SmartActionList />
                            <GlassCard className="bg-slate-900/60 border-l-4 border-l-emerald-500">
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Total Operating Hours</p>
                                <div className="text-5xl font-black text-white tracking-tighter mb-2">
                                    {hours.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}h
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Current Load:</span>
                                    <span className="text-[10px] text-emerald-400 font-mono font-bold animate-pulse">
                                        RUNNING • {state.hydraulic.efficiency * 100}% EFFICIENCY
                                    </span>
                                </div>
                            </GlassCard>

                            {/* Maintenance Insights Panel */}
                            {upcomingServices.length > 0 && (
                                <GlassCard className="bg-gradient-to-r from-amber-950/20 to-cyan-950/20 border border-amber-500/30">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Info className="w-5 h-5 text-amber-400" />
                                        <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider">Upcoming Services</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {upcomingServices.map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-white/5">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${
                                                        item.progress > 80 ? 'bg-red-500 animate-pulse' :
                                                        item.progress > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                                                    }`} />
                                                    <span className="text-xs text-slate-200 font-bold">{item.proto.name}</span>
                                                </div>
                                                <span className={`text-[10px] font-mono font-bold ${
                                                    item.progress > 80 ? 'text-red-400' :
                                                    item.progress > 50 ? 'text-amber-400' : 'text-emerald-400'
                                                }`}>{item.progress.toFixed(1)}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </GlassCard>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-900/40 p-4 rounded-2xl border border-white/5">
                                    <p className="text-[9px] text-slate-500 uppercase font-black mb-1">Last Service</p>
                                    <p className="text-xs text-white font-bold">Not recorded</p>
                                </div>
                                <div className={`bg-slate-900/40 p-4 rounded-2xl border border-white/5 ${
                                    maintenanceStatus === 'critical' ? 'border-red-500/30' :
                                    maintenanceStatus === 'attention' ? 'border-amber-500/30' : 'border-emerald-500/30'
                                }`}>
                                    <p className="text-[9px] text-slate-500 uppercase font-black mb-1">Node Integrity</p>
                                    <p className={`text-xs font-bold ${
                                        maintenanceStatus === 'critical' ? 'text-red-400' :
                                        maintenanceStatus === 'attention' ? 'text-amber-400' : 'text-cyan-400'
                                    }`}>{maintenanceStatus === 'nominal' ? 'VERIFIED' : 'ATTENTION REQUIRED'}</p>
                                </div>
                            </div>

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

                        {/* MIDDLE: PROTOCOLS & SCHEDULE */}
                        <div className="lg:col-span-2 space-y-6" id="service-protocols">
                            <GlassCard title="Service Protocols & Schedule" className="bg-slate-900/80">
                                <div className="space-y-4">
                                    {protocols.map(proto => {
                                        const nextDate = predictServiceDate(idAdapter.toNumber(selectedAsset.id) || 0, proto.threshold);
                                        const progress = (hours % proto.threshold) / proto.threshold * 100;

                                        return (
                                            <div key={proto.id} className="p-4 rounded-xl bg-slate-950/50 border border-white/5 group hover:border-emerald-500/30 transition-all">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{proto.name}</h4>
                                                        <p className="text-[10px] text-slate-500 max-w-sm">{proto.description}</p>

                                                        {(() => {
                                                            const missingParts = getMissingParts(selectedAsset.turbine_type || 'francis');
                                                            const hasShortage = missingParts.length > 0 && progress > 50;

                                                            if (!hasShortage) return null;

                                                            const handleGenerateOrder = (e: React.MouseEvent) => {
                                                                e.stopPropagation();
                                                                const blob = ForensicReportService.generatePurchaseOrder({
                                                                    vendorName: 'ANO_LOGISTICS_BHD',
                                                                    parts: missingParts.map((p: any) => ({
                                                                        name: p.name,
                                                                        partNumber: p.partNumber,
                                                                        quantity: p.minStockThreshold * 2,
                                                                        unitPrice: p.unitPrice
                                                                    })),
                                                                    t
                                                                });
                                                                ForensicReportService.openAndDownloadBlob(blob, `PO_${proto.id}_${selectedAsset.name}.pdf`, true, {
                                                                    assetId: idAdapter.toDb(selectedAsset.id),
                                                                    reportType: 'PURCHASE_ORDER',
                                                                    metadata: { protoId: proto.id }
                                                                });
                                                            };

                                                            return (
                                                                <div className="mt-2 flex items-center gap-2">
                                                                    <div className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 rounded text-[9px] font-black text-red-500 animate-pulse tracking-widest uppercase">
                                                                        ! INSUFFICIENT STOCK: Order required
                                                                    </div>
                                                                    <button
                                                                        onClick={handleGenerateOrder}
                                                                        className="text-[9px] font-black text-cyan-400 hover:text-white underline decoration-cyan-500/30 underline-offset-2 uppercase tracking-widest"
                                                                    >
                                                                        Download Order Draft
                                                                    </button>
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`text-xs font-mono font-black ${progress > 80 ? 'text-orange-400 animate-pulse' : 'text-slate-300'}`}>
                                                            {nextDate ? nextDate.toLocaleDateString() : 'STATIONARY'}
                                                        </p>
                                                        {progress > 80 && (
                                                            <div className="flex flex-col gap-2 mt-2">
                                                                <button
                                                                    onClick={async () => {
                                                                        showToast(`SYSTEM ALERT: ${proto.name} threshold exceeded. Initializing Work Order...`, "info");
                                                                        await startWorkOrder('seeded-id-placeholder');
                                                                    }}
                                                                    className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded text-[9px] font-black text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all uppercase tracking-widest"
                                                                >
                                                                    Initiate Tactical Maintenance
                                                                </button>
                                                                <button
                                                                    onClick={() => navigate(`/${ROUTES.MAINTENANCE.ROOT}/${ROUTES.MAINTENANCE.AR_GUIDE}`)}
                                                                    className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/50 rounded text-[9px] font-black text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                                                                >
                                                                    <span>📷</span> AR FIELD GUIDE & VISUAL EXPERT
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-[9px] font-bold uppercase">
                                                        <span className="text-slate-500">Service Threshold: {proto.threshold}h</span>
                                                        <span className={progress > 80 ? 'text-orange-400' : 'text-emerald-500'}>{progress.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-1000 ${progress > 80 ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'}`}
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </GlassCard>

                            <GlassCard title="Operational Intensity Log" className="bg-slate-900/80">
                                <p className="text-xs text-slate-500 mb-4">Historical turbine load distribution.</p>
                                {heatmapData.length > 0 ? (
                                    <Heatmap data={heatmapData} />
                                ) : (
                                    <div className="py-8 text-center border border-dashed border-slate-800 rounded-lg">
                                        <p className="text-xs text-slate-500 uppercase tracking-widest">No operational data logged yet</p>
                                    </div>
                                )}
                            </GlassCard>
                        </div>
                    </div>
                </>
            )}

            {activeQuery && <GuidedDiagnosisModal query={activeQuery} />}
        </div>
    );
};
