import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, AlertCircle, BookOpen, ChevronRight, X, AlertTriangle } from 'lucide-react';
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
    CRITICAL: 'bg-status-error text-white border-status-error',
    HIGH: 'bg-status-warning text-black border-status-warning',
    MEDIUM: 'bg-status-info text-white border-status-info',
    LOW: 'bg-scada-muted text-white border-scada-border'
};

const severityBg: Record<string, string> = {
    CRITICAL: 'bg-status-error/10 border-status-error/20 hover:bg-status-error/20',
    HIGH: 'bg-status-warning/10 border-status-warning/20 hover:bg-status-warning/20',
    MEDIUM: 'bg-status-info/10 border-status-info/20 hover:bg-status-info/20',
    LOW: 'bg-scada-bg border-scada-border hover:bg-scada-panel'
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
        <div className="relative overflow-hidden bg-scada-panel border border-scada-border rounded-sm shadow-scada-card">
            {/* Header */}
            <div
                className="flex items-center justify-between p-4 border-b border-scada-border cursor-pointer hover:bg-scada-bg transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-sm bg-status-info/20 flex items-center justify-center border border-status-info/30">
                        <BookOpen className="w-5 h-5 text-status-info" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-scada-text uppercase tracking-wider font-header">
                            {t('dashboard.heritageSearch.title')}
                        </h3>
                        <p className="text-[10px] text-scada-muted font-mono uppercase">
                            Legacy Knowledge Base
                        </p>
                    </div>
                </div>
                <ChevronRight
                    className={`w-5 h-5 text-scada-muted transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
                />
            </div>

            {/* Expanded Interface */}
            {isExpanded && (
                <div className="p-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
                    {/* Search Input - High Contrast */}
                    <div className="relative group">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isSearching ? 'text-status-info animate-pulse' : 'text-scada-muted'}`} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t('dashboard.heritageSearch.placeholder', 'Search symptoms, codes...')}
                            className="w-full pl-10 pr-10 py-2 bg-scada-bg border border-scada-border rounded-sm text-scada-text text-sm font-mono placeholder:text-scada-muted focus:outline-none focus:border-status-info transition-all uppercase"
                        />
                        {query.length > 0 && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-scada-panel rounded-sm transition-colors"
                            >
                                <X className="w-4 h-4 text-scada-muted hover:text-scada-text" />
                            </button>
                        )}
                    </div>

                    {/* Results Area */}
                    <div className="space-y-2 min-h-[100px]">
                        {/* Loading State */}
                        {isSearching && (
                            <div className="text-center py-4">
                                <span className="text-xs text-status-info font-mono animate-pulse uppercase">Searching Archive...</span>
                            </div>
                        )}

                        {/* Valid Results */}
                        {!isSearching && results.length > 0 && (
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] uppercase font-bold text-scada-muted tracking-wider ml-1 font-mono">
                                    Matches Found ({results.length})
                                </span>
                                {results.map((caseItem) => (
                                    <button
                                        key={caseItem.id}
                                        onClick={() => handleResultClick(caseItem)}
                                        className={`w-full p-3 rounded-sm border text-left transition-all group relative overflow-hidden ${severityBg[caseItem.severity]}`}
                                    >
                                        <div className="flex items-start justify-between gap-3 relative z-10">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase border ${severityColors[caseItem.severity]}`}>
                                                        {caseItem.severity}
                                                    </span>
                                                    <span className="text-[10px] text-scada-muted font-mono tabular-nums">
                                                        {formatDistanceToNow(caseItem.dateOccurred, { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-scada-text font-medium line-clamp-2 leading-snug group-hover:text-status-info transition-colors font-mono">
                                                    {caseItem.symptom}
                                                </p>
                                                <div className="text-[10px] text-scada-muted mt-1.5 line-clamp-1 flex items-center gap-1 font-mono uppercase">
                                                    <BookOpen className="w-3 h-3" />
                                                    {caseItem.realCause}
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-scada-muted group-hover:text-status-info transition-colors flex-shrink-0 self-center" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* No Results Fallback */}
                        {!isSearching && debouncedQuery.length >= 2 && results.length === 0 && (
                            <div className="flex flex-col items-center justify-center p-6 bg-scada-bg rounded-sm border border-dashed border-scada-border text-center">
                                <AlertCircle className="w-8 h-8 text-scada-muted mb-2 opacity-50" />
                                <span className="text-sm text-scada-muted font-medium font-mono uppercase">
                                    {t('dashboard.heritageSearch.noResults', 'No exact matches found')}
                                </span>
                                <span className="text-[10px] text-scada-muted mt-1 max-w-[200px] font-mono">
                                    Try distinct keywords like "vibration" or "bearing".
                                </span>
                            </div>
                        )}

                        {/* Default / Recommended State */}
                        {!isSearching && debouncedQuery.length < 2 && (
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="w-3 h-3 text-status-error" />
                                    <span className="text-[9px] text-scada-muted font-bold uppercase tracking-wider font-mono">
                                        Active Critical Alerts ({turbineFamily})
                                    </span>
                                </div>
                                {recommendedCases.map((caseItem) => (
                                    <button
                                        key={caseItem.id}
                                        onClick={() => handleResultClick(caseItem)}
                                        className="w-full p-2.5 bg-status-error/5 hover:bg-status-error/10 rounded-sm border border-status-error/20 transition-all text-left group"
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-status-error animate-pulse flex-shrink-0" />
                                            <div>
                                                <p className="text-xs text-scada-text font-medium group-hover:text-status-error transition-colors line-clamp-1 font-mono">
                                                    {caseItem.symptom}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[9px] text-scada-muted font-mono tabular-nums">
                                                        {formatDistanceToNow(caseItem.dateOccurred, { addSuffix: true })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                                {recommendedCases.length === 0 && (
                                    <p className="text-[10px] text-scada-muted italic pl-2 font-mono">No critical alerts for this unit type.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
