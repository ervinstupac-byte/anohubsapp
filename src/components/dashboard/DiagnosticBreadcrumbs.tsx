import React from 'react';
import { ChevronRight, GitCommit } from 'lucide-react';

interface CausalNode {
    metric: string;
    value: number;
    contribution: number;
}

interface DiagnosticBreadcrumbsProps {
    chain?: {
        path: CausalNode[];
        description: string;
    };
}

export const DiagnosticBreadcrumbs: React.FC<DiagnosticBreadcrumbsProps> = ({ chain }) => {
    if (!chain || chain.path.length <= 1) return null;

    return (
        <div className="w-full bg-slate-900/80 border border-indigo-500/30 rounded-lg p-4 mt-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
                <GitCommit className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-300">Forensic Path</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {chain.path.map((node, idx) => (
                    <React.Fragment key={idx}>
                        {idx > 0 && <ChevronRight className="w-4 h-4 text-slate-600" />}
                        <div className={`
                            px-3 py-1.5 rounded border text-xs font-mono
                            ${idx === 0
                                ? 'bg-red-900/40 border-red-500 text-red-100' // Root Cause
                                : idx === chain.path.length - 1
                                    ? 'bg-amber-900/40 border-amber-500 text-amber-100' // Symptom
                                    : 'bg-slate-800 border-slate-600 text-slate-300'} // Intermediate
                        `}>
                            <span className="uppercase font-bold block text-[10px] opacity-70">
                                {idx === 0 ? 'ROOT CAUSE' : idx === chain.path.length - 1 ? 'SYMPTOM' : 'FACTOR'}
                            </span>
                            {node.metric}: <span className="font-bold">{node.value.toFixed(1)}</span>
                        </div>
                    </React.Fragment>
                ))}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-indigo-200 font-mono flex items-center gap-2">
                <span className="text-indigo-500">AI CONCLUSION:</span>
                {chain.description}
            </div>
        </div>
    );
};
