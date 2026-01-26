import React, { useMemo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Wrench, Clock, ChevronRight, AlertTriangle, AlertCircle, ArrowUpRight } from 'lucide-react';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { useMaintenance, WorkOrder } from '../../contexts/MaintenanceContext';
import { useAssetContext } from '../../contexts/AssetContext';
import idAdapter from '../../utils/idAdapter';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { aiPredictionService } from '../../services/AIPredictionService';
import { fetchForecastForAsset } from '../../services/DashboardDataService';
import { FinancialImpactEngine } from '../../services/FinancialImpactEngine';
import { supabase } from '../../services/supabaseClient';

/**
 * WorkOrderSummary — Intelligent Priority Queue
 * 
 * Shows the top 3 most urgent maintenance tasks for the selected asset.
 * Logic: Priority (HIGH > MEDIUM > LOW) -> Recency (Newest First).
 */

const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };

const priorityConfig = {
    HIGH: {
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        icon: <AlertTriangle className="w-3 h-3 text-red-400" />
    },
    MEDIUM: {
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        icon: <AlertCircle className="w-3 h-3 text-amber-400" />
    },
    LOW: {
        color: 'text-slate-300',
        bg: 'bg-slate-500/10',
        border: 'border-slate-500/20',
        icon: <Wrench className="w-3 h-3 text-slate-400" />
    }
};

export const WorkOrderSummary: React.FC = () => {
    const { t } = useTranslation();
    const { workOrders } = useMaintenance();
    const { selectedAsset } = useAssetContext();
    const navigate = useNavigate();
    const [suggestedWorkOrder, setSuggestedWorkOrder] = useState<any | null>(null);
    const [costOfInaction, setCostOfInaction] = useState<number | null>(null);
    const [pfValue, setPfValue] = useState<number | null>(null);
    const [residualStd, setResidualStd] = useState<number | null>(null);
    const [anchorTimestamp, setAnchorTimestamp] = useState<string | null>(null);
    const [confirmationMsg, setConfirmationMsg] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Smart Sort: Priority > Date
    const assetOrders = useMemo(() => {
        if (!selectedAsset) return [];

        const storageId = idAdapter.toStorage(selectedAsset.id);
        const numericId = idAdapter.toNumber(selectedAsset.id);

        return workOrders
            .filter(wo =>
                (String(wo.assetId) === storageId || wo.assetId === numericId) &&
                wo.status !== 'COMPLETED' &&
                wo.status !== 'CANCELLED'
            )
            .sort((a, b) => {
                // 1. Priority Score Descending
                const scoreA = priorityOrder[a.priority] || 0;
                const scoreB = priorityOrder[b.priority] || 0;
                if (scoreB !== scoreA) return scoreB - scoreA;

                // 2. Date Descending (Newest first)
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            })
            .slice(0, 3);
    }, [workOrders, selectedAsset]);

    if (!selectedAsset) return null;

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res: any = await fetchForecastForAsset(selectedAsset);
                if (!mounted) return;
                const f = res?.forecast;
                if (f && f.suggestedWorkOrder) {
                    setSuggestedWorkOrder(f.suggestedWorkOrder);
                    setPfValue(typeof f.pf === 'number' ? f.pf : (f.pf ? Number(f.pf) : null));
                    setResidualStd(typeof f.residualStd === 'number' ? f.residualStd : (f.residualStd ? Number(f.residualStd) : null));
                    const anchorTs = f.predictedTimestamp ? new Date(f.predictedTimestamp).toISOString() : new Date().toISOString();
                    setAnchorTimestamp(anchorTs);

                    try {
                        const costObj: any = FinancialImpactEngine.calculateImpact({ identity: { assetId: selectedAsset.id, assetName: selectedAsset.name } } as any, (f.physics as any) || {} as any, { sigma: f.residualStd });
                        const cost = costObj?.maintenanceBufferEuro ?? costObj?.expectedMaintenanceCost ?? 0;
                        setCostOfInaction(cost);
                    } catch (e) {
                        setCostOfInaction(null);
                    }
                } else {
                    setSuggestedWorkOrder(null);
                }
            } catch (e) {
                // ignore
            }
        })();
        return () => { mounted = false; };
    }, [selectedAsset]);

    const hasHighPriority = assetOrders.some(wo => wo.priority === 'HIGH');

    return (
        <GlassCard className={`relative overflow-hidden transition-all duration-300 ${hasHighPriority ? 'border-l-4 border-l-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'border-l-4 border-l-amber-500'}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${hasHighPriority ? 'bg-red-500/20 animate-pulse-slow' : 'bg-amber-500/20'}`}>
                        <Wrench className={`w-5 h-5 ${hasHighPriority ? 'text-red-400' : 'text-amber-400'}`} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">
                            {t('dashboard.workOrders.title', 'Work Queue')}
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 font-mono">
                                {selectedAsset.name}
                            </span>
                            {hasHighPriority && (
                                <span className="px-1.5 py-0.5 rounded bg-red-500 text-white text-[9px] font-black uppercase">
                                    Urgent
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {assetOrders.length > 0 && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate('/maintenance/logbook')}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors group"
                            title="View all"
                        >
                            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
                        </button>
                    </div>
                )}
            </div>

            {/* Suggested Work Order (from AI) */}
            {suggestedWorkOrder && (
                <div className="p-4">
                    <div className="w-full p-3 rounded-lg border bg-gradient-to-r from-yellow-900/5 to-red-900/5 border-red-500/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-black text-white">{suggestedWorkOrder.title}</h4>
                                <p className="text-[11px] text-slate-400 mt-1">{suggestedWorkOrder.reason}</p>
                            </div>
                            <div className="text-right">
                                <div className="px-2 py-1 rounded bg-red-600 text-white text-[11px] font-black">{suggestedWorkOrder.priority}</div>
                                {costOfInaction !== null && (
                                    <div className="text-[11px] text-slate-400 mt-1">Cost of Inaction: €{new Intl.NumberFormat().format(Math.round(costOfInaction))}</div>
                                )}
                            </div>
                        </div>
                        {/* New: Current Leakage and 30-Day COI */}
                        <div className="mt-3 flex items-center justify-between gap-4">
                            <div className="text-[12px] text-slate-300">
                                <div className="text-[10px] text-slate-500 uppercase">Current Leakage</div>
                                <div className="text-sm font-black text-white">€{pfValue !== null && (typeof pfValue === 'number') ? new Intl.NumberFormat().format(Math.round((FinancialImpactEngine.calculateImpact as any)({ identity: { assetId: selectedAsset.id } } as any, {} as any).hourlyLossEuro || 0)) : '—'}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] uppercase text-red-400">30-Day Cost of Inaction</div>
                                <div className="text-sm font-black text-red-500">€{(FinancialImpactEngine.calculateImpact as any)({ identity: { assetId: selectedAsset.id } } as any, {} as any).projection30DayEuro ? new Intl.NumberFormat().format(Math.round((FinancialImpactEngine.calculateImpact as any)({ identity: { assetId: selectedAsset.id } } as any, {} as any).projection30DayEuro)) : '—'}</div>
                            </div>
                        </div>

                        {/* Pf Progress toward critical threshold */}
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                                <div className="text-[11px] text-slate-400">P_f: {pfValue !== null ? `${pfValue.toFixed(3)}%` : '—'}</div>
                                <div className="text-[11px] text-slate-400">Critical: 55%</div>
                            </div>
                            <div className="w-full h-2 bg-slate-800 rounded overflow-hidden">
                                <div className="h-2 bg-gradient-to-r from-amber-500 to-red-500" style={{ width: `${Math.min(100, pfValue ? (pfValue / 55) * 100 : 0)}%` }} />
                            </div>
                        </div>

                        {/* Create Work Order Button + Confirmation */}
                        <div className="mt-4 flex items-center gap-3">
                            <button
                                onClick={async () => {
                                    if (!pfValue || !residualStd || !anchorTimestamp) return;
                                    setIsCreating(true);
                                    try {
                                        const assetDbId = idAdapter.toDb(Number(selectedAsset.id));
                                        const { data, error } = await supabase.from('maintenance_ledger').insert({
                                            asset_id: assetDbId,
                                            pf: pfValue,
                                            residual_std: residualStd,
                                            anchor_timestamp: anchorTimestamp,
                                            created_at: new Date().toISOString()
                                        }).select().single();

                                        if (error) throw error;
                                        const id = data?.id || 'N/A';
                                        setConfirmationMsg(`Work Order #${id} generated. Evidence locked in Ledger.`);
                                    } catch (e: any) {
                                        setConfirmationMsg(e?.message || 'Failed to write ledger.');
                                    } finally {
                                        setIsCreating(false);
                                    }
                                }}
                                disabled={isCreating}
                                className="px-4 py-2 rounded bg-cyan-600 text-white font-bold"
                            >
                                {isCreating ? 'Creating...' : 'Create Work Order'}
                            </button>
                            {confirmationMsg && (
                                <div className="text-[12px] text-emerald-400 font-medium">{confirmationMsg}</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Work Orders List */}
            <div className="p-4 space-y-3 min-h-[140px]">
                {assetOrders.length > 0 ? (
                    assetOrders.map((order) => {
                        const style = priorityConfig[order.priority] || priorityConfig.LOW;
                        return (
                            <button
                                key={order.id}
                                onClick={() => navigate(`/maintenance/work-order/${order.id}`)}
                                className={`w-full p-3 rounded-lg border hover:border-opacity-50 transition-all text-left group flex flex-col gap-2 ${style.bg} ${style.border} border-opacity-30`}
                            >
                                <div className="flex items-start justify-between w-full">
                                    <div className="flex flex-col gap-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            {style.icon}
                                            <span className={`text-[9px] font-black uppercase tracking-wider ${style.color}`}>
                                                {order.priority} Priority
                                            </span>
                                            <span className="text-[9px] text-slate-500 font-mono">
                                                • {order.component}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-200 font-medium line-clamp-1 group-hover:text-white transition-colors">
                                            {order.description}
                                        </p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors mt-1" />
                                </div>
                                <div className="flex items-center gap-3 text-[10px] text-slate-500 border-t border-white/5 pt-2 mt-1 w-full">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                                    </span>
                                    {order.estimatedHoursToComplete && (
                                        <span className="font-mono">
                                            Est: {order.estimatedHoursToComplete}h
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center h-full">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-3">
                            <Wrench className="w-6 h-6 text-emerald-500" />
                        </div>
                        <p className="text-sm text-slate-400 font-medium">
                            {t('dashboard.workOrders.none', 'All Systems Nominal')}
                        </p>
                        <p className="text-[10px] text-slate-600 mt-1 max-w-[200px]">
                            No pending maintenance tasks for this asset.
                        </p>
                    </div>
                )}
            </div>

            {/* Quick Action Footer */}
            {assetOrders.length > 0 && assetOrders.length >= 3 && (
                <div className="px-4 pb-4">
                    <p className="text-[9px] text-center text-slate-600 font-mono">
                        + {workOrders.length - 3} more backlog items
                    </p>
                </div>
            )}
        </GlassCard>
    );
};
