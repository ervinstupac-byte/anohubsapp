import React from 'react';
import { Search, Volume2, Target } from 'lucide-react';
import { SovereignModal } from './SovereignModal';
import { ForensicDepthAnalyzer } from '../ForensicDepthAnalyzer';
import { AcousticDiagnosticModule } from '../AcousticDiagnosticModule';
import { OrbitPlotter } from '../../features/telemetry/components/OrbitPlotter';
import { useDiagnostic } from '../../contexts/DiagnosticContext';
import { SealingIntegrity } from '../SealingIntegrity';
import { FluidForceDiagnostics } from '../FluidForceDiagnostics';
import { SystemResponseAnalytics } from '../SystemResponseAnalytics';
import { ShieldCheck, Waves, Gauge, FileText } from 'lucide-react';
import { ModernButton } from '../../shared/components/ui/ModernButton';

export const ForensicDeepDiveModal: React.FC = () => {
    const { activeModal, setActiveModal } = useDiagnostic();
    const isOpen = activeModal === 'FORENSICS';
    const onClose = () => setActiveModal(null);

    return (
        <SovereignModal
            isOpen={isOpen}
            onClose={onClose}
            title="Forensic Data Analysis"
            subtitle="Incident_Archive // RCA Pattern Matching"
            icon={<Search className="w-5 h-5" />}
            borderColor="border-purple-500/20"
            glowColor="rgba(168, 85, 247, 0.1)"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-8 lg:col-span-2">
                    <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Target className="w-4 h-4 text-purple-500" />
                            <h3 className="text-xs font-black text-purple-500 uppercase tracking-widest">Orbit & Shaft Centerline</h3>
                        </div>
                        <div className="h-[300px] w-full bg-black/40 rounded border border-white/5 flex items-center justify-center p-4">
                            <OrbitPlotter />
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl h-full">
                        <div className="flex items-center gap-2 mb-4">
                            <Volume2 className="w-4 h-4 text-amber-500" />
                            <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest">Acoustic Signature</h3>
                        </div>
                        <AcousticDiagnosticModule />
                    </div>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 border-t border-white/10 pt-8">
                <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                        <ShieldCheck className="w-4 h-4 text-cyan-500" />
                        <h3 className="text-xs font-black text-cyan-500 uppercase tracking-widest">Seal Integrity Detail</h3>
                    </div>
                    <SealingIntegrity />
                </div>
                <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                        <Waves className="w-4 h-4 text-blue-500" />
                        <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest">Fluid & Force Detail</h3>
                    </div>
                    <FluidForceDiagnostics />
                </div>
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                        <Gauge className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-xs font-black text-emerald-500 uppercase tracking-widest">System Hysteresis Detail</h3>
                    </div>
                    <SystemResponseAnalytics />
                </div>
            </div>

            <div className="mt-8">
                <div className="p-4 bg-slate-900/40 border border-white/10 rounded-xl">
                    <div className="flex items-center gap-2 mb-6">
                        <Search className="w-4 h-4 text-cyan-500" />
                        <h3 className="text-xs font-black text-cyan-500 uppercase tracking-widest">Root Cause Pattern Discovery</h3>
                    </div>
                    <ForensicDepthAnalyzer />
                </div>
            </div>

            <div className="mt-8 flex justify-end gap-4">
                <ModernButton
                    onClick={() => (window as any).__MONOLIT_DEBUG__?.exportLedgerSnapshot()}
                    variant="secondary"
                    className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                >
                    <FileText className="w-4 h-4 mr-2" />
                    EXPORT AUDIT (SHA-256)
                </ModernButton>
                <ModernButton onClick={onClose} variant="primary">
                    CLOSE_SESSION
                </ModernButton>
            </div>
        </SovereignModal>
    );
};
