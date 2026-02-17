import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ExternalLink } from 'lucide-react';
import { GlassCard } from '../../shared/components/ui/GlassCard';

export const LegacySOPViewer: React.FC = () => {
    const { sopId } = useParams<{ sopId: string }>();
    const navigate = useNavigate();

    // Construct path to public legacy site
    // Structure: /AnoHub_site/Turbine_Friend/Francis_H/[SOP_NAME]/index.html
    const sopUrl = `/AnoHub_site/Turbine_Friend/Francis_H/${sopId}/index.html`;

    return (
        <div className="flex flex-col h-screen bg-[#020617] p-4 text-white">
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Back to Operations
                </button>
                <div className="flex items-center gap-4">
                    <h1 className="text-lg font-bold font-mono text-cyan-400 uppercase tracking-widest">
                        LEGACY SOP ARCHIVE: {sopId?.replace(/_/g, ' ')}
                    </h1>
                    <a
                        href={sopUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-slate-500 hover:text-cyan-400 flex items-center gap-1"
                    >
                        <ExternalLink className="w-3 h-3" />
                        Open Raw
                    </a>
                </div>
            </div>

            <GlassCard className="flex-1 overflow-hidden p-0 border border-slate-800 bg-white/5 rounded-none">
                <iframe
                    src={sopUrl}
                    className="w-full h-full border-none bg-white"
                    title={`SOP: ${sopId}`}
                    sandbox="allow-scripts allow-same-origin allow-forms"
                />
            </GlassCard>
        </div>
    );
};
