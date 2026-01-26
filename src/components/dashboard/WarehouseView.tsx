import React from 'react';
import { Package, Printer, ShoppingCart, Box } from 'lucide-react';

interface WarehouseData {
    parts: {
        name: string;
        stock: number;
        status: string;
        printable: boolean;
        criticality: number;
    }[];
    printing: {
        active: boolean;
        jobName: string;
        progress: number;
    };
    procurement: {
        pendingOrders: number;
        budgetSpent: number;
    };
}

export const WarehouseView: React.FC<{ data: WarehouseData }> = ({ data }) => {
    return (
        <div className="w-full bg-slate-950 p-6 text-white border-2 border-slate-800 rounded-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-900/30 rounded-full">
                    <Box className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Supply Chain Sovereignty</h2>
                    <p className="text-xs text-slate-400">Inventory • Additive Mfg • Automated Logistics</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">

                {/* 1. INVENTORY HEALTH */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Package className="w-4 h-4 text-emerald-400" />
                        Stock Health
                    </h3>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {data.parts.map((p, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-slate-800 rounded border border-slate-700">
                                <div>
                                    <div className="text-xs font-bold text-white">{p.name}</div>
                                    <div className="flex gap-1 mt-1">
                                        {p.printable && (
                                            <span className="px-1 py-0.5 bg-blue-900/50 text-blue-300 text-[9px] rounded uppercase">Printable</span>
                                        )}
                                        <span className={`px-1 py-0.5 text-[9px] rounded uppercase ${p.status === 'LOW_STOCK' ? 'bg-red-900/50 text-red-300' : 'bg-emerald-900/50 text-emerald-300'}`}>
                                            {p.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold font-mono">{p.stock}</div>
                                    <div className={`text-[10px] font-bold ${p.criticality > 70 ? 'text-red-400' : 'text-slate-500'}`}>
                                        Crit: {p.criticality.toFixed(0)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. ADDITIVE MANUFACTURING */}
                <div className={`bg-slate-900/50 p-4 rounded-lg border ${data.printing.active ? 'border-blue-500 animate-pulse' : 'border-slate-700'}`}>
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Printer className="w-4 h-4 text-blue-400" />
                        Fabrication Bridge
                    </h3>

                    {data.printing.active ? (
                        <div className="text-center py-2 h-full flex flex-col justify-center">
                            <div className="text-xs text-blue-300 font-bold mb-2">PRINTING ACTIVE</div>
                            <div className="text-lg font-mono text-white mb-2">{data.printing.jobName}</div>

                            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-1">
                                <div
                                    className="h-full bg-blue-500"
                                    style={{ width: `${data.printing.progress}%` }}
                                />
                            </div>
                            <div className="text-xs text-slate-400">{data.printing.progress}% Completed</div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500 text-xs italic">
                            Queue Empty. 3D Printers Standby.
                        </div>
                    )}
                </div>

                {/* 3. SMART PROCUREMENT */}
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-amber-400" />
                        DAO Procurement
                    </h3>

                    <div className="space-y-4">
                        <div className="bg-slate-800 p-3 rounded flex justify-between items-center">
                            <span className="text-xs text-slate-400">Pending Orders</span>
                            <span className="text-xl font-bold text-amber-300">{data.procurement.pendingOrders}</span>
                        </div>

                        <div className="bg-slate-800 p-3 rounded flex justify-between items-center">
                            <span className="text-xs text-slate-400">YTD Spend</span>
                            <span className="text-xl font-bold text-emerald-300">€{data.procurement.budgetSpent}</span>
                        </div>

                        <div className="p-2 bg-slate-800/50 rounded text-center text-[10px] text-slate-500">
                            Smart Contracts Active on Polygon
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
