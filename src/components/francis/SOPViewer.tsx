import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { FRANCIS_PATHS } from '../../routes/paths';

export const SOPViewer: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Default to index if no ID provided (though route should prevent this)
    const activeDoc = id || 'index';

    return (
        <div className="flex flex-col h-screen bg-[#020617] text-white">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(FRANCIS_PATHS.HUB)}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t('actions.back')}
                    </button>
                    <div className="h-4 w-px bg-slate-700 mx-2" />
                    <h1 className="font-mono text-sm text-cyan-400 font-bold uppercase tracking-wider">
                        {activeDoc.replace(/_/g, ' ')}
                    </h1>
                </div>

                <a
                    href={`/francis-docs/${activeDoc}.html`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-cyan-400 transition-colors"
                >
                    <span className="hidden md:inline">OPEN RAW HTML</span>
                    <ExternalLink className="w-4 h-4" />
                </a>
            </div>

            <div className="flex-grow bg-white">
                <iframe
                    src={`/francis-docs/${activeDoc}.html`}
                    className="w-full h-full border-none"
                    title="SOP Viewer"
                />
            </div>
        </div>
    );
};
