import React from 'react';
import SovereignLedgerPanel from '../components/dashboard/SovereignLedgerPanel';
import { DashboardHeader } from '../components/DashboardHeader';
import { GlobalFooter } from '../components/GlobalFooter';
import { Shield, Lock } from 'lucide-react';

const SovereignLedgerPage: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen bg-[#020617] text-slate-100">
            <DashboardHeader
                title={<span className="text-amber-500 font-black tracking-widest uppercase">GOVERNANCE // BLACK BOX</span>}
                onToggleSidebar={() => { }}
            />
            <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
                <div className="mb-6 flex items-start gap-4">
                    <div className="p-3 bg-amber-900/20 rounded-lg border border-amber-500/30">
                        <Shield className="w-8 h-8 text-amber-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-2">Sovereign Ledger (Black Box)</h1>
                        <p className="text-slate-400 max-w-2xl">
                            Immutable record of all system overrides, Commander interactions, and autonomous setpoint adjustments.
                            <span className="text-amber-500/80 ml-2 font-mono text-xs border border-amber-500/30 px-2 py-0.5 rounded">READ ONLY</span>
                        </p>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto">
                    <SovereignLedgerPanel />
                </div>
            </main>
            <GlobalFooter />
        </div>
    );
};

export default SovereignLedgerPage;
