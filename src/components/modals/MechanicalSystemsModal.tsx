import React from 'react';
import { Settings, Droplets, Activity } from 'lucide-react';
import { SovereignModal } from './SovereignModal';
import { SealingIntegrity } from '../SealingIntegrity';
import { FluidForceDiagnostics } from '../FluidForceDiagnostics';
import { useDiagnostic } from '../../contexts/DiagnosticContext';

export const MechanicalSystemsModal: React.FC = () => {
    const { activeModal, setActiveModal } = useDiagnostic();
    const isOpen = activeModal === 'MECHANICAL';
    const onClose = () => setActiveModal(null);

    return (
        <SovereignModal
            isOpen={isOpen}
            onClose={onClose}
            title="Mechanical Systems Audit"
            subtitle="Unit_01 // Structural & Hydraulic Integrity"
            icon={<Settings className="w-5 h-5" />}
            borderColor="border-amber-500/20"
            glowColor="rgba(245, 158, 11, 0.1)"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Droplets className="w-4 h-4 text-amber-500" />
                            <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest">Hydraulic Flow State</h3>
                        </div>
                        <FluidForceDiagnostics />
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity className="w-4 h-4 text-cyan-500" />
                            <h3 className="text-xs font-black text-cyan-500 uppercase tracking-widest">Sealing & Clearances</h3>
                        </div>
                        <SealingIntegrity />
                    </div>
                </div>
            </div>

            <div className="mt-8 p-6 bg-white/[0.02] border border-white/5 rounded-xl">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Technical Observations</h4>
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-[9px] font-mono p-2 bg-black/20 rounded border border-white/10">
                        <span className="text-slate-400">GUIDE_VANE_GAP_ALIGN</span>
                        <span className="text-emerald-400">0.02mm (NOMINAL)</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-mono p-2 bg-black/20 rounded border border-white/10">
                        <span className="text-slate-400">LABYRINTH_WEAR_INDEX</span>
                        <span className="text-cyan-400">0.12 (Tier 1)</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-mono p-2 bg-black/20 rounded border border-white/10">
                        <span className="text-slate-400">THRUST_BEARING_OFFSET</span>
                        <span className="text-amber-400">0.05mm (ADJUST_REC)</span>
                    </div>
                </div>
            </div>
        </SovereignModal>
    );
};
