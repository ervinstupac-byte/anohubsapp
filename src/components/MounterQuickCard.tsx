import React, { useState } from 'react';
import { AssetNodeWithPassport, ServiceLogEntry } from '../models/MaintenanceChronicles';
import { Calendar, Wrench, TrendingUp, Info, FileText, Clock } from 'lucide-react';

/**
 * MOUNTER'S QUICK-CARD
 * 
 * Instant pop-up showing 3 magic numbers:
 * 1. Clearances (Zazori)
 * 2. Bolt Torques (Moment pritezanja)  
 * 3. Next Service Date
 */

interface MounterQuickCardProps {
    asset: AssetNodeWithPassport;
    onClose: () => void;
}

export const MounterQuickCard: React.FC<MounterQuickCardProps> = ({ asset, onClose }) => {
    const [showFullHistory, setShowFullHistory] = useState(false);

    const passport = asset.passport;
    const clearances = passport.mechanicalSpecs.clearances;
    const torques = passport.mechanicalSpecs.boltTorques;
    const schedule = passport.maintenanceSchedule;

    // Calculate days until next service
    const daysUntilService = Math.ceil(
        (new Date(schedule.nextServiceDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-cyan-500/30 rounded-2xl shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-cyan-600 to-blue-600 p-5 border-b border-cyan-400/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-wide">
                                🔧 Mounter's Quick-Card
                            </h2>
                            <p className="text-cyan-100 text-sm mt-1 font-mono">
                                {asset.path}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-red-400 text-2xl font-bold transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Component Identity */}
                <div className="p-6 bg-slate-800/50 border-b border-slate-700">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Component</p>
                            <p className="text-white font-bold text-lg">{asset.name}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Manufacturer</p>
                            <p className="text-white font-mono text-sm">{passport.identity.manufacturer}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Model</p>
                            <p className="text-cyan-400 font-mono text-sm">{passport.identity.model}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Serial Number</p>
                            <p className="text-amber-400 font-mono text-sm">{passport.identity.serialNumber}</p>
                        </div>
                    </div>
                </div>

                {/* ========================================== */}
                {/* THE 3 MAGIC NUMBERS! ✨                   */}
                {/* ========================================== */}

                <div className="p-6 space-y-6">
                    {/* 1. CLEARANCES (Zazori) */}
                    {clearances && (
                        <div className="bg-blue-900/20 border-2 border-blue-500/30 rounded-xl p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-black text-sm uppercase">
                                        1. Clearances (Zazori)
                                    </h3>
                                    <p className="text-blue-300 text-xs">Critical mechanical tolerances</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {clearances.radial !== undefined && (
                                    <div className="bg-slate-800/50 p-3 rounded-lg">
                                        <p className="text-slate-400 text-[10px] uppercase mb-1">Radial Zazor</p>
                                        <p className="text-cyan-400 text-2xl font-black font-mono">
                                            {clearances.radial.toFixed(3)} mm
                                        </p>
                                    </div>
                                )}

                                {clearances.axial !== undefined && (
                                    <div className="bg-slate-800/50 p-3 rounded-lg">
                                        <p className="text-slate-400 text-[10px] uppercase mb-1">Axial Zazor</p>
                                        <p className="text-cyan-400 text-2xl font-black font-mono">
                                            {clearances.axial.toFixed(3)} mm
                                        </p>
                                    </div>
                                )}

                                {clearances.tolerance && (
                                    <div className="bg-slate-800/50 p-3 rounded-lg col-span-2">
                                        <p className="text-slate-400 text-[10px] uppercase mb-1">ISO Tolerance</p>
                                        <p className="text-emerald-400 text-lg font-black font-mono">
                                            {clearances.tolerance}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 2. BOLT TORQUES (Moment pritezanja) */}
                    {torques && (
                        <div className="bg-amber-900/20 border-2 border-amber-500/30 rounded-xl p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                                    <Wrench className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-black text-sm uppercase">
                                        2. Bolt Torques (Moment pritezanja)
                                    </h3>
                                    <p className="text-amber-300 text-xs">Tightening specifications</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {torques.mountingBolts !== undefined && (
                                    <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg">
                                        <span className="text-slate-300 text-sm">Mounting Bolts</span>
                                        <span className="text-amber-400 text-xl font-black font-mono">
                                            {torques.mountingBolts} Nm
                                        </span>
                                    </div>
                                )}

                                {torques.coverBolts !== undefined && (
                                    <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg">
                                        <span className="text-slate-300 text-sm">Cover Bolts</span>
                                        <span className="text-amber-400 text-xl font-black font-mono">
                                            {torques.coverBolts} Nm
                                        </span>
                                    </div>
                                )}

                                {torques.housingBolts !== undefined && (
                                    <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg">
                                        <span className="text-slate-300 text-sm">Housing Bolts</span>
                                        <span className="text-amber-400 text-xl font-black font-mono">
                                            {torques.housingBolts} Nm
                                        </span>
                                    </div>
                                )}

                                {torques.torqueSequence && (
                                    <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg mt-3">
                                        <p className="text-amber-300 text-xs font-bold mb-1">Sequence:</p>
                                        <p className="text-white text-sm">{torques.torqueSequence}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 3. NEXT SERVICE DATE */}
                    <div className="bg-emerald-900/20 border-2 border-emerald-500/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-black text-sm uppercase">
                                    3. Next Service Date
                                </h3>
                                <p className="text-emerald-300 text-xs">Maintenance schedule</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-800/50 p-4 rounded-lg">
                                <p className="text-slate-400 text-[10px] uppercase mb-2">Next Inspection</p>
                                <p className="text-white text-lg font-bold">
                                    {new Date(schedule.nextInspectionDate).toLocaleDateString()}
                                </p>
                            </div>

                            <div className="bg-slate-800/50 p-4 rounded-lg">
                                <p className="text-slate-400 text-[10px] uppercase mb-2">Next Service</p>
                                <p className="text-white text-lg font-bold">
                                    {new Date(schedule.nextServiceDate).toLocaleDateString()}
                                </p>
                            </div>

                            <div className="col-span-2 bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 border border-emerald-500/30 p-4 rounded-lg">
                                <p className="text-emerald-300 text-xs mb-2">Time Until Service:</p>
                                <p className={`text-3xl font-black font-mono ${daysUntilService < 30 ? 'text-red-400' :
                                        daysUntilService < 90 ? 'text-amber-400' :
                                            'text-emerald-400'
                                    }`}>
                                    {daysUntilService} DAYS
                                </p>
                                {daysUntilService < 30 && (
                                    <p className="text-red-400 text-xs mt-2 font-bold animate-pulse">
                                        ⚠️ SERVICE DUE SOON!
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Additional Info - Lubrication */}
                    {passport.consumables && (
                        <div className="bg-slate-800/30 border border-slate-600/30 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Info className="w-5 h-5 text-cyan-400" />
                                <h4 className="text-white font-bold text-sm">Lubrication Info</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-slate-400">Type:</span>
                                    <span className="text-white ml-2 font-mono">
                                        {passport.consumables.lubricationType}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-400">Grade:</span>
                                    <span className="text-cyan-400 ml-2 font-mono">
                                        {passport.consumables.lubricantGrade}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-400">Quantity:</span>
                                    <span className="text-white ml-2 font-mono">
                                        {passport.consumables.lubricantQuantity} kg
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-400">Refill Interval:</span>
                                    <span className="text-amber-400 ml-2 font-mono">
                                        {passport.consumables.refillIntervalHours} hrs
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Service History Preview */}
                <div className="border-t border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-cyan-400" />
                            <h3 className="text-white font-bold">Service History</h3>
                        </div>
                        <button
                            onClick={() => setShowFullHistory(!showFullHistory)}
                            className="text-cyan-400 hover:text-cyan-300 text-sm font-bold"
                        >
                            {showFullHistory ? 'Hide' : 'Show All'} ({asset.serviceHistory.length})
                        </button>
                    </div>

                    <div className="space-y-3">
                        {(showFullHistory ? asset.serviceHistory : asset.serviceHistory.slice(0, 2))
                            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                            .map(log => (
                                <ServiceLogCard key={log.id} log={log} />
                            ))}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 bg-slate-900 border-t border-slate-700 p-4 flex gap-3">
                    <button className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                        📄 View Full Passport
                    </button>
                    <button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                        ✏️ Log Service Entry
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * Service Log Card Mini Component
 */
const ServiceLogCard: React.FC<{ log: ServiceLogEntry }> = ({ log }) => {
    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300 text-xs font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                    </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded ${log.action === 'INSTALLATION' ? 'bg-blue-500/20 text-blue-400' :
                        log.action === 'REPAIR' ? 'bg-red-500/20 text-red-400' :
                            log.action === 'MAINTENANCE' ? 'bg-emerald-500/20 text-emerald-400' :
                                'bg-slate-500/20 text-slate-400'
                    }`}>
                    {log.action}
                </span>
            </div>

            <p className="text-white text-sm mb-2">{log.description}</p>

            <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>👷 {log.performedBy.name}</span>
                {log.verified && (
                    <span className="text-emerald-400">✓ Verified</span>
                )}
            </div>
        </div>
    );
};

/**
 * ========================================
 * USAGE EXAMPLE
 * ========================================
 */

export function DemoMounterQuickCard() {
    const [selectedAsset, setSelectedAsset] = useState<AssetNodeWithPassport | null>(null);

    // Import the example bearing
    // const thrustBearing = createThrustBearingWithHistory();

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <h1 className="text-3xl font-black text-white mb-8">
                Mounter's Quick-Card Demo
            </h1>

            {/* Asset selection (would be AssetTreeNavigator in real app) */}
            <button
                onClick={() => {
                    // setSelectedAsset(thrustBearing);
                }}
                className="bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg"
            >
                Click: Thrust Bearing
            </button>

            {/* Quick Card appears when asset selected */}
            {selectedAsset && (
                <MounterQuickCard
                    asset={selectedAsset}
                    onClose={() => setSelectedAsset(null)}
                />
            )}
        </div>
    );
}
