import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, AlertCircle, BookOpen, ChevronRight, X, AlertTriangle } from 'lucide-react';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { LegacyKnowledgeService, WTFCase } from '../../services/LegacyKnowledgeService';
import { useAssetContext } from '../../contexts/AssetContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

/**
 * HeritageSearchWidget — Legacy Knowledge Integration
 * 
 * Connects to LegacyKnowledgeService.semanticSearch() for
 * field engineers to quickly find historical solutions.
 * "Someone solved this 10 years ago" → instant retrieval.
 */

const severityColors: Record<string, string> = {
    CRITICAL: 'bg-red-500 text-white border-red-400',
    HIGH: 'bg-amber-500 text-black border-amber-400',
    MEDIUM: 'bg-yellow-500 text-black border-yellow-400',
    LOW: 'bg-slate-500 text-white border-slate-400'
};

const severityBg: Record<string, string> = {
    CRITICAL: 'bg-red-500/10 border-red-500/20 hover:bg-red-500/20',
    HIGH: 'bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20',
    MEDIUM: 'bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20',
    LOW: 'bg-slate-900/50 border-white/5 hover:bg-slate-800/80'
};

export const HeritageSearchWidget: React.FC = () => {
    const { t } = useTranslation();
    const { selectedAsset } = useAssetContext();
    const navigate = useNavigate();

    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [results, setResults] = useState<WTFCase[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // Get turbine family from selected asset
    const turbineFamily = selectedAsset?.turbine_type || 'ALL';

    // Debounce Logic (500ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 500);
        return () => clearTimeout(timer);
    }, [query]);

    // Search Effect
    useEffect(() => {
        if (debouncedQuery.length < 2) {
            setResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        // Simulate small network delay for realism if strict local, but service is synchronous.
        // We'll just run it.
        const matches = LegacyKnowledgeService.semanticSearch(debouncedQuery, turbineFamily).slice(0, 5);
        setResults(matches);
        setIsSearching(false);
    }, [debouncedQuery, turbineFamily]);

    // Recommended cases (High Severity match for current asset type)
    const recommendedCases = React.useMemo(() => {
        if (debouncedQuery.length >= 2) return [];
        return LegacyKnowledgeService.getCasesBySeverity('CRITICAL')
            .filter(c => c.turbineFamily === 'ALL' || c.turbineFamily === turbineFamily)
            .slice(0, 2);
    }, [debouncedQuery, turbineFamily]);

    const handleResultClick = useCallback((caseItem: WTFCase) => {
        navigate(`/legacy-hub?case=${caseItem.id}`);
    }, [navigate]);

    const clearSearch = () => {
        setQuery('');
        setDebouncedQuery('');
    };

    return (
        <GlassCard className="relative overflow-hidden">
            {/* Header */}
            <div
                className="flex items-center justify-between p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                        <BookOpen className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">
                            {t('dashboard.heritageSearch.title')}
                        </h3>
                        <p className="text-[10px] text-slate-500 font-mono">
                            Legacy Knowledge Base
                        </p>
                    </div>
                </div>
                <ChevronRight
                    className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
                />
            </div>

            {/* Expanded Interface */}
            {isExpanded && (
                <div className="p-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
                    {/* Search Input - High Contrast */}
                    <div className="relative group">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isSearching ? 'text-purple-400 animate-pulse' : 'text-slate-400'}`} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t('dashboard.heritageSearch.placeholder', 'Search symptoms, codes...')}
                            className="w-full pl-10 pr-10 py-3 bg-black/40 border-2 border-slate-700/50 rounded-xl text-white text-base placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:bg-black/60 transition-all"
                        />
                        {query.length > 0 && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-700 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        )}
                    </div>

                    {/* Results Area */}
                    <div className="space-y-2 min-h-[100px]">
                        {/* Loading State */}
                        {isSearching && (
                            <div className="text-center py-4">
                                <span className="text-xs text-purple-400 font-mono animate-pulse">Searching Archive...</span>
                            </div>
                        )}

                        {/* Valid Results */}
                        {!isSearching && results.length > 0 && (
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-1">
                                    Matches Found ({results.length})
                                </span>
                                {results.map((caseItem) => (
                                    <button
                                        key={caseItem.id}
                                        onClick={() => handleResultClick(caseItem)}
                                        className={`w-full p-3 rounded-lg border text-left transition-all group relative overflow-hidden ${severityBg[caseItem.severity]}`}
                                    >
                                        <div className="flex items-start justify-between gap-3 relative z-10">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase border ${severityColors[caseItem.severity]}`}>
                                                        {caseItem.severity}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-mono">
                                                        {formatDistanceToNow(caseItem.dateOccurred, { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-200 font-medium line-clamp-2 leading-snug group-hover:text-white transition-colors">
                                                    {caseItem.symptom}
                                                </p>
                                                <div className="text-[10px] text-slate-500 mt-1.5 line-clamp-1 flex items-center gap-1">
                                                    <BookOpen className="w-3 h-3" />
                                                    {caseItem.realCause}
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-purple-400 transition-colors flex-shrink-0 self-center" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* No Results Fallback */}
                        {!isSearching && debouncedQuery.length >= 2 && results.length === 0 && (
                            <div className="flex flex-col items-center justify-center p-6 bg-slate-900/30 rounded-xl border border-dashed border-slate-700/50 text-center">
                                <AlertCircle className="w-8 h-8 text-slate-600 mb-2" />
                                <span className="text-sm text-slate-400 font-medium">
                                    {t('dashboard.heritageSearch.noResults', 'No exact matches found')}
                                </span>
                                <span className="text-[10px] text-slate-500 mt-1 max-w-[200px]">
                                    Try distinct keywords like "vibration" or "bearing".
                                </span>
                            </div>
                        )}

                        {/* Default / Recommended State */}
                        {!isSearching && debouncedQuery.length < 2 && (
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="w-3 h-3 text-red-400" />
                                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">
                                        Active Critical Alerts ({turbineFamily})
                                    </span>
                                </div>
                                {recommendedCases.map((caseItem) => (
                                    <button
                                        key={caseItem.id}
                                        onClick={() => handleResultClick(caseItem)}
                                        className="w-full p-2.5 bg-red-500/5 hover:bg-red-500/10 rounded-lg border border-red-500/20 transition-all text-left group"
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                                            <div>
                                                <p className="text-xs text-slate-300 font-medium group-hover:text-red-300 transition-colors line-clamp-1">
                                                    {caseItem.symptom}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[9px] text-slate-500 font-mono">
                                                        {formatDistanceToNow(caseItem.dateOccurred, { addSuffix: true })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                                {recommendedCases.length === 0 && (
                                    <p className="text-[10px] text-slate-600 italic pl-2">No critical alerts for this unit type.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </GlassCard>
    );
};
