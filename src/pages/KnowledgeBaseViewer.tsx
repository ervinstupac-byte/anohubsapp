import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '../routes/paths';

/**
 * KnowledgeBaseViewer
 *
 * Thin iframe wrapper that serves the static AnoHub_site HTML pages
 * (located in public/anohub_site/ after the Phase 3 migration) within
 * the React SPA shell. This preserves full interactivity of the existing
 * static pages without requiring a full HTML→TSX rewrite.
 *
 * Route: /knowledge-base/:section  (wildcard handled in App.tsx)
 *
 * Future: Replace individual iframes with native React components as each
 * section is rewritten. This wrapper acts as the migration bridge.
 */

// Map of route section names → relative paths within /anohub_site/
const SECTION_MAP: Record<string, { path: string; label: string }> = {
    [ROUTES.KNOWLEDGE_BASE.TURBINE_FRIEND]: {
        path: '/anohub_site/Turbine_Friend/index.html',
        label: 'Turbine Friend — Knowledge Base',
    },
    [ROUTES.KNOWLEDGE_BASE.CASE_STUDIES]: {
        path: '/anohub_site/case-studies/index.html',
        label: 'Case Studies',
    },
    [ROUTES.KNOWLEDGE_BASE.INSIGHTS]: {
        path: '/anohub_site/insights/index.html',
        label: 'Engineering Insights',
    },
    [ROUTES.KNOWLEDGE_BASE.PROTOCOL]: {
        path: '/anohub_site/protocol/index.html',
        label: 'Protocol Library',
    },
};

const NAV_ENTRIES = [
    { key: ROUTES.KNOWLEDGE_BASE.TURBINE_FRIEND, icon: '⚙️', shortLabel: 'Turbine Friend' },
    { key: ROUTES.KNOWLEDGE_BASE.CASE_STUDIES,   icon: '📋', shortLabel: 'Case Studies'   },
    { key: ROUTES.KNOWLEDGE_BASE.INSIGHTS,       icon: '💡', shortLabel: 'Insights'        },
    { key: ROUTES.KNOWLEDGE_BASE.PROTOCOL,       icon: '📐', shortLabel: 'Protocol'        },
];

export const KnowledgeBaseViewer: React.FC = () => {
    const { section } = useParams<{ section: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    // Default to turbine-friend if no section provided
    const activeSection = section && SECTION_MAP[section] ? section : ROUTES.KNOWLEDGE_BASE.TURBINE_FRIEND;
    const current = SECTION_MAP[activeSection];

    useEffect(() => {
        // Reset loading state when section changes
        setIsLoading(true);
    }, [activeSection]);

    useEffect(() => {
        // If no valid section in URL, redirect to default
        if (section && !SECTION_MAP[section]) {
            navigate(`/${ROUTES.KNOWLEDGE_BASE.ROOT}/${ROUTES.KNOWLEDGE_BASE.TURBINE_FRIEND}`, { replace: true });
        }
    }, [section, navigate]);

    return (
        <div className="flex flex-col h-[calc(100vh-10rem)] min-h-0 gap-3">
            {/* Section navigation bar */}
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                {NAV_ENTRIES.map(({ key, icon, shortLabel }) => {
                    const isActive = activeSection === key;
                    return (
                        <Link
                            key={key}
                            to={`/${ROUTES.KNOWLEDGE_BASE.ROOT}/${key}`}
                            className={`
                                inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider
                                border transition-all duration-200
                                ${isActive
                                    ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20 hover:text-white'
                                }
                            `}
                        >
                            <span>{icon}</span>
                            <span>{shortLabel}</span>
                        </Link>
                    );
                })}

                {/* Label and open-in-new-tab button */}
                <div className="ml-auto flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500 hidden sm:block">
                        {current.label}
                    </span>
                    <a
                        href={current.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold
                                   bg-white/5 border border-white/10 text-slate-400
                                   hover:bg-white/10 hover:text-white transition-all duration-200"
                        title="Open in new tab"
                    >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                            <polyline points="15 3 21 3 21 9"/>
                            <line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                        Open
                    </a>
                </div>
            </div>

            {/* iframe container */}
            <div className="relative flex-1 min-h-0 rounded-xl border border-white/10 overflow-hidden bg-[#020617]">
                {/* Loading overlay */}
                {isLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#020617]">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
                            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                                Loading {current.label}…
                            </span>
                        </div>
                    </div>
                )}
                <iframe
                    key={activeSection}
                    id="knowledge-iframe"
                    src={current.path}
                    title={current.label}
                    className="w-full h-full border-0"
                    onLoad={() => {
                        setIsLoading(false);
                        try {
                            // Try to patch the iframe so internal links do not escape
                            // eslint-disable-next-line @typescript-eslint/no-var-requires
                            const { patchIframe } = require('../utils/iframeUtils');
                            const iframeEl = document.getElementById('knowledge-iframe');
                            if (iframeEl) patchIframe(iframeEl as HTMLIFrameElement);
                        } catch (e) {
                            // ignore
                        }
                    }}
                    // Allow same-origin so embedded site JS can access its own resources (fixes missing modal content)
                    sandbox="allow-scripts allow-forms allow-same-origin"
                    referrerPolicy="no-referrer"
                />
            </div>
        </div>
    );
};

export default KnowledgeBaseViewer;
