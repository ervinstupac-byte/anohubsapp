import React from 'react';
import { SpecialistNotebook, DamageReport, DamageType } from '../services/SpecialistNotebook';
import { AlertTriangle, Info, Wrench, DollarSign } from 'lucide-react';

/**
 * SPECIALIST'S NOTEBOOK - Damage Diagnosis Card
 * 
 * Shows when ant-explorer looks at battle scars on runner
 */

interface DamageDialogProps {
    damageDescription: string;
    location: string;
    operatingConditions?: {
        sigma?: number;
        sedimentPPM?: number;
        flowPercent?: number;
    };
    onClose: () => void;
}

export const SpecialistDamageCard: React.FC<DamageDialogProps> = ({
    damageDescription,
    location,
    operatingConditions,
    onClose
}) => {
    // Get diagnosis from expert system
    const diagnosis: DamageReport = SpecialistNotebook.diagnoseDamage(
        damageDescription,
        location,
        operatingConditions
    );

    const damageColors = {
        CAVITATION: 'from-red-600 to-orange-600',
        EROSION_SAND: 'from-amber-600 to-yellow-600',
        EROSION_SILT: 'from-slate-600 to-gray-600',
        CORROSION: 'from-emerald-600 to-teal-600',
        FATIGUE_CRACK: 'from-purple-600 to-pink-600',
        UNKNOWN: 'from-slate-700 to-slate-800'
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border-2 border-cyan-500/30 rounded-2xl shadow-2xl">
                {/* Header */}
                <div className={`bg-gradient-to-r ${damageColors[diagnosis.damageType]} p-6`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-wide flex items-center gap-3">
                                <AlertTriangle className="w-8 h-8" />
                                Specialist's Notebook
                            </h2>
                            <p className="text-white/90 text-sm mt-1">Battle Scar Analysis</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-red-400 text-3xl font-bold"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Diagnosis Result */}
                <div className="p-6 bg-slate-800/50 border-b-2 border-slate-700">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="text-3xl font-black text-white mb-2">
                                {diagnosis.damageType === DamageType.CAVITATION && '💥 CAVITATION DAMAGE'}
                                {diagnosis.damageType === DamageType.EROSION_SAND && '🌪️ SAND EROSION'}
                                {diagnosis.damageType === DamageType.EROSION_SILT && '💨 SILT EROSION'}
                                {diagnosis.damageType === DamageType.UNKNOWN && '❓ UNKNOWN DAMAGE'}
                            </h3>
                            <p className="text-slate-300 text-sm">
                                Location: <span className="text-cyan-400 font-mono">{location}</span>
                            </p>
                        </div>

                        <div className="text-right">
                            <div className="text-[10px] text-slate-500 uppercase">Confidence</div>
                            <div className={`text-4xl font-black font-mono ${diagnosis.confidence > 70 ? 'text-emerald-400' :
                                    diagnosis.confidence > 40 ? 'text-amber-400' :
                                        'text-red-400'
                                }`}>
                                {diagnosis.confidence}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Repair Strategy */}
                <div className="p-6 space-y-6">
                    <div className="bg-red-900/20 border-2 border-red-500/30 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Wrench className="w-5 h-5 text-red-400" />
                            <h4 className="text-white font-bold uppercase text-sm">IMMEDIATE ACTION (Next 24 hours)</h4>
                        </div>
                        <ul className="space-y-2">
                            {diagnosis.repairStrategy.immediate.map((action, i) => (
                                <li key={i} className="text-white text-sm flex items-start gap-2">
                                    <span className="text-red-400 font-bold">•</span>
                                    <span>{action}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-amber-900/20 border-2 border-amber-500/30 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Wrench className="w-5 h-5 text-amber-400" />
                            <h4 className="text-white font-bold uppercase text-sm">SHORT-TERM (Next Shutdown)</h4>
                        </div>
                        <ul className="space-y-2">
                            {diagnosis.repairStrategy.shortTerm.map((action, i) => (
                                <li key={i} className="text-white text-sm flex items-start gap-2">
                                    <span className="text-amber-400 font-bold">•</span>
                                    <span>{action}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-blue-900/20 border-2 border-blue-500/30 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Wrench className="w-5 h-5 text-blue-400" />
                            <h4 className="text-white font-bold uppercase text-sm">LONG-TERM (Major Overhaul)</h4>
                        </div>
                        <ul className="space-y-2">
                            {diagnosis.repairStrategy.longTerm.map((action, i) => (
                                <li key={i} className="text-white text-sm flex items-start gap-2">
                                    <span className="text-blue-400 font-bold">•</span>
                                    <span>{action}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Cost & Urgency */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="w-4 h-4 text-emerald-400" />
                                <span className="text-slate-400 text-xs uppercase">Estimated Cost</span>
                            </div>
                            <div className="text-emerald-400 text-xl font-black font-mono">
                                {diagnosis.estimatedCost}
                            </div>
                        </div>

                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Info className="w-4 h-4 text-amber-400" />
                                <span className="text-slate-400 text-xs uppercase">Urgency</span>
                            </div>
                            <div className={`text-xl font-black uppercase ${diagnosis.urgency === 'EMERGENCY' ? 'text-red-400 animate-pulse' :
                                    diagnosis.urgency === 'URGENT' ? 'text-orange-400' :
                                        diagnosis.urgency === 'SCHEDULED' ? 'text-amber-400' :
                                            'text-emerald-400'
                                }`}>
                                {diagnosis.urgency}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-slate-900 border-t border-slate-700 p-4">
                    <button
                        onClick={onClose}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition-colors"
                    >
                        Close Diagnosis
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * Example Usage:
 * 
 * <SpecialistDamageCard
 *   damageDescription="Sponge-like pitting with deep craters on blade outlet"
 *   location="Runner blade suction side - outlet"
 *   operatingConditions={{ sigma: 0.08, flowPercent: 65 }}
 *   onClose={() => setShowDialog(false)}
 * />
 */
