import React from 'react';
import { KnowledgeCapturePanel } from '../components/dashboard/KnowledgeCapturePanel';
import { DashboardHeader } from '../components/DashboardHeader';
import { GlobalFooter } from '../components/GlobalFooter';
import { BrainCircuit } from 'lucide-react';

const KnowledgeCapturePage: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen bg-[#020617] text-slate-100">
            <DashboardHeader
                title={<span className="text-purple-400 font-black tracking-widest uppercase">KNOWLEDGE BANK // CAPTURE</span>}
                onToggleSidebar={() => { }}
            />
            <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
                <div className="mb-6 flex items-start gap-4">
                    <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
                        <BrainCircuit className="w-8 h-8 text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-2">Institutional Knowledge Bank</h1>
                        <p className="text-slate-400 max-w-2xl">
                            Digitize engineering wisdom. Document incident patterns, root causes, and field solutions to train the Sovereign AI model.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <KnowledgeCapturePanel activeContext={null} />
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Recent Ingestions</h3>
                            <div className="text-sm text-slate-400 italic">No recent captures in current session.</div>
                        </div>
                    </div>
                </div>
            </main>
            <GlobalFooter />
        </div>
    );
};

export default KnowledgeCapturePage;
