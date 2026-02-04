import React from 'react';
import { Zap, Magnet, Activity } from 'lucide-react';
import { SovereignModal } from './SovereignModal';
import { MagneticPullAnalytics } from '../MagneticPullAnalytics';
import { GridNegotiator } from '../../services/GridNegotiator';
import { useDiagnostic } from '../../contexts/DiagnosticContext';

export const ElectricalGridModal: React.FC = () => {
    const { activeModal, setActiveModal } = useDiagnostic();
    const isOpen = activeModal === 'ELECTRICAL';
    const onClose = () => setActiveModal(null);

    return (
        <SovereignModal
            isOpen={isOpen}
            onClose={onClose}
            title="Electrical & Grid Integrity"
            subtitle="Unit_01 // Stator & Excitation Diagnostics"
            icon={<Zap className="w-5 h-5" />}
            borderColor="border-yellow-500/20"
            glowColor="rgba(234, 179, 8, 0.1)"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Magnet className="w-4 h-4 text-yellow-500" />
                            <h3 className="text-xs font-black text-yellow-500 uppercase tracking-widest">Magnetic Flux & Pull</h3>
                        </div>
                        <MagneticPullAnalytics />
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity className="w-4 h-4 text-blue-500" />
                            <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest">Grid Synchronization</h3>
                        </div>
                        <div className="p-4 bg-black/20 rounded-lg border border-white/5 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-mono text-slate-500 uppercase">Current Phase Angle</span>
                                <span className="text-xl font-black text-white">0.2°</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-mono text-slate-500 uppercase">Excitation Voltage</span>
                                <span className="text-xl font-black text-blue-400">110V DC</span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/5">
                                <div className="text-[9px] font-black text-blue-500 mb-2 uppercase">Protocol NC-27 Negotiation</div>
                                <div className="text-[8px] font-mono text-slate-400">
                                    Last Handshake: {new Date().toLocaleTimeString()} <br />
                                    Status: ENFORCED (Tier 1 Limit)
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 p-6 bg-white/[0.02] border border-white/5 rounded-xl">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Stator Insulation Resistance</h4>
                <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="text-[8px] text-slate-600 mb-1 uppercase">Phase L1</div>
                        <div className="text-lg font-black text-emerald-500">142 MΩ</div>
                    </div>
                    <div className="text-center">
                        <div className="text-[8px] text-slate-600 mb-1 uppercase">Phase L2</div>
                        <div className="text-lg font-black text-emerald-500">145 MΩ</div>
                    </div>
                    <div className="text-center">
                        <div className="text-[8px] text-slate-600 mb-1 uppercase">Phase L3</div>
                        <div className="text-lg font-black text-emerald-500">140 MΩ</div>
                    </div>
                </div>
                <div className="mt-4 text-center">
                    <span className="text-[8px] font-mono text-slate-600 uppercase italic">Test performed at 5000V DC // Ambient Temp: 22°C</span>
                </div>
            </div>
        </SovereignModal>
    );
};
