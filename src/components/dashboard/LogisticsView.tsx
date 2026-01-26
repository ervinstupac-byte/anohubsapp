import React from 'react';
import { Package, Truck, AlertTriangle, CheckCircle } from 'lucide-react';
import { ProcurementRequisition } from '../../services/PredictiveProcurementService';
import { SparePart } from '../../services/WarehouseIntegrationService';

interface LogisticsViewProps {
    requisitions: ProcurementRequisition[];
    inventory: SparePart[];
}

export const LogisticsView: React.FC<LogisticsViewProps> = ({ requisitions, inventory }) => {
    const criticalGaps = requisitions.filter(r => r.logisticsGapDays > 0);
    const totalInventoryValue = inventory.reduce((sum, p) => sum + (p.stockQuantity * p.unitCost), 0);
    const stockouts = inventory.filter(p => p.stockQuantity === 0);

    return (
        <div className="w-full bg-slate-950 p-6">
            <div className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Package className="w-6 h-6 text-orange-400" />
                Supply Chain & Logistics
            </div>

            {/* Critical Alerts */}
            {criticalGaps.length > 0 && (
                <div className="mb-6 p-4 bg-red-950 border-2 border-red-500 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
                        <div className="text-lg font-bold text-red-300">
                            🚨 CRITICAL LOGISTICS GAP DETECTED
                        </div>
                    </div>
                    <div className="text-sm text-red-400">
                        {criticalGaps.length} component(s) will fail BEFORE parts arrive!
                    </div>
                </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-900 border border-orange-500 rounded-lg p-4">
                    <div className="text-xs text-orange-400 mb-1">Total Inventory Value</div>
                    <div className="text-2xl font-bold text-orange-300 font-mono">
                        €{(totalInventoryValue / 1000).toFixed(0)}k
                    </div>
                </div>

                <div className="bg-slate-900 border border-red-500 rounded-lg p-4">
                    <div className="text-xs text-red-400 mb-1">Stockouts</div>
                    <div className="text-2xl font-bold text-red-300 font-mono">
                        {stockouts.length}
                    </div>
                </div>

                <div className="bg-slate-900 border border-amber-500 rounded-lg p-4">
                    <div className="text-xs text-amber-400 mb-1">Active Requisitions</div>
                    <div className="text-2xl font-bold text-amber-300 font-mono">
                        {requisitions.length}
                    </div>
                </div>

                <div className="bg-slate-900 border border-emerald-500 rounded-lg p-4">
                    <div className="text-xs text-emerald-400 mb-1">In Stock Parts</div>
                    <div className="text-2xl font-bold text-emerald-300 font-mono">
                        {inventory.filter(p => p.stockQuantity > 0).length}
                    </div>
                </div>
            </div>

            {/* Procurement Requisitions */}
            <div className="mb-6">
                <div className="text-lg font-bold text-white mb-3">Procurement Requisitions</div>
                <div className="space-y-3">
                    {requisitions.length === 0 ? (
                        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-center text-slate-400">
                            No active requisitions
                        </div>
                    ) : (
                        requisitions.map((req) => (
                            <RequisitionCard key={req.requisitionId} requisition={req} />
                        ))
                    )}
                </div>
            </div>

            {/* Inventory Status */}
            <div>
                <div className="text-lg font-bold text-white mb-3">Spare Parts Inventory</div>
                <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                        <thead className="bg-slate-800">
                            <tr>
                                <th className="text-left p-3 text-slate-400 font-bold">Part</th>
                                <th className="text-left p-3 text-slate-400 font-bold">Asset</th>
                                <th className="text-left p-3 text-slate-400 font-bold">Stock</th>
                                <th className="text-left p-3 text-slate-400 font-bold">Reorder Point</th>
                                <th className="text-left p-3 text-slate-400 font-bold">Lead Time</th>
                                <th className="text-left p-3 text-slate-400 font-bold">Unit Cost</th>
                                <th className="text-left p-3 text-slate-400 font-bold">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventory.map((part) => (
                                <tr key={part.componentId} className="border-t border-slate-800">
                                    <td className="p-3">
                                        <div className="font-bold text-white">{part.description}</div>
                                        <div className="text-slate-500 font-mono text-[10px]">{part.partNumber}</div>
                                    </td>
                                    <td className="p-3 font-mono text-blue-300">{part.assetId}</td>
                                    <td className="p-3">
                                        <div className={`font-mono font-bold ${part.stockQuantity === 0 ? 'text-red-400' :
                                            part.stockQuantity <= part.reorderPoint ? 'text-amber-400' :
                                                'text-emerald-400'
                                            }`}>
                                            {part.stockQuantity}
                                        </div>
                                    </td>
                                    <td className="p-3 font-mono text-slate-400">{part.reorderPoint}</td>
                                    <td className="p-3 font-mono text-purple-300">{part.leadTimeDays}d</td>
                                    <td className="p-3 font-mono text-orange-300">€{part.unitCost.toLocaleString()}</td>
                                    <td className="p-3">
                                        {part.stockQuantity === 0 ? (
                                            <div className="px-2 py-1 bg-red-950 text-red-300 rounded text-center">STOCKOUT</div>
                                        ) : part.stockQuantity <= part.reorderPoint ? (
                                            <div className="px-2 py-1 bg-amber-950 text-amber-300 rounded text-center">LOW</div>
                                        ) : (
                                            <div className="px-2 py-1 bg-emerald-950 text-emerald-300 rounded text-center">OK</div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const RequisitionCard: React.FC<{ requisition: ProcurementRequisition }> = ({ requisition }) => {
    const isLate = requisition.logisticsGapDays > 0;
    const urgencyColors = {
        ROUTINE: 'blue',
        URGENT: 'amber',
        CRITICAL: 'red'
    };
    const color = urgencyColors[requisition.urgency];

    return (
        <div className={`bg-slate-900 border-2 rounded-lg p-4 ${isLate ? 'border-red-500' : `border-${color}-500/30`
            }`}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${requisition.urgency === 'CRITICAL' ? 'bg-red-950 text-red-300' :
                            requisition.urgency === 'URGENT' ? 'bg-amber-950 text-amber-300' :
                                'bg-blue-950 text-blue-300'
                            }`}>
                            {requisition.urgency}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">{requisition.requisitionId}</div>
                    </div>
                    <div className="text-sm font-bold text-white mb-1">{requisition.part.description}</div>
                    <div className="text-xs text-slate-400">{requisition.reason}</div>
                </div>

                <Truck className={`w-8 h-8 ${isLate ? 'text-red-400' : `text-${color}-400`}`} />
            </div>

            {/* Timeline Visualization */}
            <div className="grid grid-cols-3 gap-4 text-xs mb-3">
                <div>
                    <div className="text-slate-500 mb-1">Days Until Failure</div>
                    <div className={`text-2xl font-bold font-mono ${requisition.rulDays < 30 ? 'text-red-400' : 'text-amber-400'
                        }`}>
                        {requisition.rulDays}d
                    </div>
                </div>

                <div>
                    <div className="text-slate-500 mb-1">Shipping Time</div>
                    <div className="text-2xl font-bold font-mono text-purple-400">
                        {requisition.part.leadTimeDays}d
                    </div>
                </div>

                <div>
                    <div className="text-slate-500 mb-1">Logistics Gap</div>
                    <div className={`text-2xl font-bold font-mono ${isLate ? 'text-red-400' : 'text-emerald-400'
                        }`}>
                        {isLate ? `+${requisition.logisticsGapDays}d` : `${requisition.logisticsGapDays}d`}
                    </div>
                    {isLate && (
                        <div className="text-[10px] text-red-400 font-bold">WILL ARRIVE LATE!</div>
                    )}
                </div>
            </div>

            {/* Order Details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-800 rounded p-2">
                    <div className="text-slate-500 mb-1">Quantity Needed</div>
                    <div className="font-mono text-white">{requisition.requestedQuantity} units</div>
                </div>

                <div className="bg-slate-800 rounded p-2">
                    <div className="text-slate-500 mb-1">Estimated Cost</div>
                    <div className="font-mono text-orange-300">€{requisition.estimatedCost.toLocaleString()}</div>
                </div>
            </div>

            {/* Action Button */}
            <button className={`mt-3 w-full py-2 rounded font-bold text-sm ${isLate
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                } transition-all`}>
                {isLate ? '🚨 EXPEDITE ORDER' : '✓ GENERATE PURCHASE ORDER'}
            </button>
        </div>
    );
};
