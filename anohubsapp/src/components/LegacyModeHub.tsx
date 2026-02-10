// Legacy Mode Hub - Expert Knowledge Repository UI
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, Lightbulb, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { LegacyKnowledgeService, WTFCase, OldSchoolTip } from '../services/LegacyKnowledgeService';

export const LegacyModeHub: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<WTFCase[]>([]);
    const [selectedCase, setSelectedCase] = useState<WTFCase | null>(null);
    const [activeTab, setActiveTab] = useState<'SEARCH' | 'BROWSE' | 'TIPS'>('SEARCH');

    const handleSearch = () => {
        if (searchQuery.trim()) {
            const results = LegacyKnowledgeService.semanticSearch(searchQuery);
            setSearchResults(results);
            if (results.length > 0) {
                setSelectedCase(results[0]);
            }
        }
    };

    const allCases = LegacyKnowledgeService.getAllCases();
    const criticalCases = LegacyKnowledgeService.getCasesBySeverity('CRITICAL');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-black uppercase tracking-tighter mb-3">
                    <span className="text-white">Legacy Mode</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 ml-2">
                        Knowledge Repository
                    </span>
                </h1>
                <p className="text-slate-400">
                    15 godina terenskog iskustva - 'WTF' slučajevi i stara-škola savjeti
                </p>
            </div>

            {/* Semantic Search */}
            <GlassCard className="p-6 bg-gradient-to-br from-purple-950/30 to-pink-950/30 border-purple-500/30">
                <div className="flex items-center gap-3 mb-4">
                    <Search className="w-6 h-6 text-purple-400" />
                    <h3 className="text-lg font-black text-white">AI Semantic Search</h3>
                </div>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Opiši problem... npr. 'cijevi se trzaju', 'ležaj tiho otkazuje'"
                        className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSearch}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-bold text-white"
                    >
                        Pretraži Legacy
                    </motion.button>
                </div>
                {searchResults.length > 0 && (
                    <div className="mt-4">
                        <p className="text-sm text-purple-300">
                            🤖 Pronađeno {searchResults.length} podudaranje
                        </p>
                    </div>
                )}
            </GlassCard>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-700">
                <TabButton
                    icon={Search}
                    label="Search Results"
                    active={activeTab === 'SEARCH'}
                    onClick={() => setActiveTab('SEARCH')}
                    count={searchResults.length}
                />
                <TabButton
                    icon={BookOpen}
                    label="Browse All Cases"
                    active={activeTab === 'BROWSE'}
                    onClick={() => setActiveTab('BROWSE')}
                    count={allCases.length}
                />
                <TabButton
                    icon={Lightbulb}
                    label="Old School Tips"
                    active={activeTab === 'TIPS'}
                    onClick={() => setActiveTab('TIPS')}
                />
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Case List */}
                <div className="lg:col-span-1 space-y-3">
                    <h3 className="text-sm font-black text-white uppercase">
                        {activeTab === 'SEARCH' && 'Search Results'}
                        {activeTab === 'BROWSE' && 'All WTF Cases'}
                        {activeTab === 'TIPS' && 'Tips & Tricks'}
                    </h3>

                    {activeTab === 'SEARCH' && (
                        searchResults.length === 0 ? (
                            <GlassCard className="p-6 text-center">
                                <Search className="w-12 h-12 mx-auto mb-3 text-slate-500" />
                                <p className="text-slate-400 text-sm">Unesi upit za pretragu legacy baze</p>
                            </GlassCard>
                        ) : (
                            searchResults.map(wtfCase => (
                                <CaseCard
                                    key={wtfCase.id}
                                    case={wtfCase}
                                    selected={selectedCase?.id === wtfCase.id}
                                    onClick={() => setSelectedCase(wtfCase)}
                                />
                            ))
                        )
                    )}

                    {activeTab === 'BROWSE' && (
                        <>
                            <div className="mb-4">
                                <p className="text-xs text-red-400 uppercase font-bold mb-2">🔴 Critical Cases</p>
                                {criticalCases.map(wtfCase => (
                                    <CaseCard
                                        key={wtfCase.id}
                                        case={wtfCase}
                                        selected={selectedCase?.id === wtfCase.id}
                                        onClick={() => setSelectedCase(wtfCase)}
                                    />
                                ))}
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase font-bold mb-2">All Cases</p>
                                {allCases.filter(c => c.severity !== 'CRITICAL').slice(0, 10).map(wtfCase => (
                                    <CaseCard
                                        key={wtfCase.id}
                                        case={wtfCase}
                                        selected={selectedCase?.id === wtfCase.id}
                                        onClick={() => setSelectedCase(wtfCase)}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {activeTab === 'TIPS' && <TipsPanel />}
                </div>

                {/* Right: Case Details */}
                <div className="lg:col-span-2">
                    {selectedCase ? (
                        <CaseDetailView case={selectedCase} />
                    ) : (
                        <GlassCard className="p-12 text-center">
                            <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                            <p className="text-slate-400">Odaberi slučaj za detalje</p>
                        </GlassCard>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper Components
const TabButton: React.FC<{
    icon: React.ComponentType<any>;
    label: string;
    active: boolean;
    onClick: () => void;
    count?: number;
}> = ({ icon: Icon, label, active, onClick, count }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${active
                ? 'border-purple-500 text-white'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
    >
        <Icon className="w-4 h-4" />
        <span className="font-bold text-sm">{label}</span>
        {count !== undefined && (
            <span className="px-2 py-0.5 bg-purple-500/20 rounded text-xs text-purple-400">
                {count}
            </span>
        )}
    </button>
);

const CaseCard: React.FC<{
    case: WTFCase;
    selected: boolean;
    onClick: () => void;
}> = ({ case: wtfCase, selected, onClick }) => {
    const severityColors = {
        CRITICAL: 'border-red-500 bg-red-950/20',
        HIGH: 'border-amber-500 bg-amber-950/20',
        MEDIUM: 'border-orange-500 bg-orange-950/20',
        LOW: 'border-blue-500 bg-blue-950/20'
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`w-full p-3 rounded-lg border-2 transition-all text-left mb-2 ${selected ? severityColors[wtfCase.severity] : 'border-slate-700/50 bg-slate-800/30'
                }`}
        >
            <div className="flex items-start justify-between mb-2">
                <span className={`text-xs font-bold px-2 py-1 rounded ${wtfCase.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                        wtfCase.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-blue-500/20 text-blue-400'
                    }`}>
                    {wtfCase.id}
                </span>
                <span className="text-xs text-slate-500">
                    {wtfCase.timesEncountered}x encountered
                </span>
            </div>
            <p className="text-sm font-bold text-white mb-1">{wtfCase.component}</p>
            <p className="text-xs text-slate-400 line-clamp-2">{wtfCase.symptom}</p>
        </motion.button>
    );
};

const CaseDetailView: React.FC<{ case: WTFCase }> = ({ case: wtfCase }) => (
    <GlassCard className="p-6">
        <div className="flex items-start justify-between mb-4">
            <div>
                <h2 className="text-2xl font-black text-white mb-1">{wtfCase.id}</h2>
                <p className="text-sm text-purple-400">{wtfCase.component}</p>
            </div>
            <span className={`px-3 py-1 rounded font-bold ${wtfCase.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                    wtfCase.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-blue-400'
                }`}>
                {wtfCase.severity}
            </span>
        </div>

        {/* Symptom */}
        <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black text-white uppercase">Simptom</h3>
            </div>
            <p className="text-sm text-slate-300 bg-slate-900/50 p-4 rounded-lg">
                {wtfCase.symptom}
            </p>
        </div>

        {/* Wrong Diagnosis */}
        <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-black text-red-400 uppercase">❌ Pogrešna Dijagnoza</span>
            </div>
            <p className="text-sm text-slate-300 bg-red-950/20 border border-red-500/30 p-4 rounded-lg">
                {wtfCase.wrongDiagnosis}
            </p>
        </div>

        {/* Real Cause */}
        <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-black text-emerald-400 uppercase">Stvarni Uzrok</h3>
            </div>
            <p className="text-sm text-slate-300 bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-lg">
                {wtfCase.realCause}
            </p>
        </div>

        {/* Solution */}
        <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-black text-white uppercase">Rješenje (Korak-po-korak)</h3>
            </div>
            <div className="space-y-2">
                {wtfCase.solution.map((step, index) => (
                    <div key={index} className="flex gap-3">
                        <span className="text-sm font-bold text-purple-400">{index + 1}.</span>
                        <p className="text-sm text-slate-300 flex-1">{step}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
            <div>
                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Plant Location</p>
                <p className="text-sm text-white">{wtfCase.plantLocation || 'N/A'}</p>
            </div>
            <div>
                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Author</p>
                <p className="text-sm text-white">{wtfCase.author}</p>
            </div>
            <div>
                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Date Occurred</p>
                <p className="text-sm text-white">
                    {new Date(wtfCase.dateOccurred).toLocaleDateString('sr-Latn-BA')}
                </p>
            </div>
            <div>
                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Times Encountered</p>
                <p className="text-sm text-amber-400 font-bold">{wtfCase.timesEncountered}x</p>
            </div>
        </div>
    </GlassCard>
);

const TipsPanel: React.FC = () => {
    const kaplanTips = LegacyKnowledgeService.getTipsForProcedure('', 'kaplan');
    const francisTips = LegacyKnowledgeService.getTipsForProcedure('', 'francis');
    const generalTips = LegacyKnowledgeService.getTipsForProcedure('').filter(t => !t.turbineFamily);

    return (
        <div className="space-y-4">
            {[...kaplanTips, ...francisTips, ...generalTips].map(tip => (
                <TipCard key={tip.id} tip={tip} />
            ))}
        </div>
    );
};

const TipCard: React.FC<{ tip: OldSchoolTip }> = ({ tip }) => (
    <GlassCard className={`p-4 border-2 ${tip.criticality === 'MUST_FOLLOW' ? 'border-red-500 bg-red-950/20' :
            tip.criticality === 'RECOMMENDED' ? 'border-amber-500 bg-amber-950/20' :
                'border-blue-500 bg-blue-950/20'
        }`}>
        <div className="flex items-center gap-2 mb-2">
            <Lightbulb className={`w-4 h-4 ${tip.criticality === 'MUST_FOLLOW' ? 'text-red-400' :
                    tip.criticality === 'RECOMMENDED' ? 'text-amber-400' :
                        'text-blue-400'
                }`} />
            <span className={`text-xs font-bold uppercase ${tip.criticality === 'MUST_FOLLOW' ? 'text-red-400' :
                    tip.criticality === 'RECOMMENDED' ? 'text-amber-400' :
                        'text-blue-400'
                }`}>
                {tip.criticality.replace('_', ' ')}
            </span>
        </div>
        <p className="text-sm font-bold text-white mb-2">{tip.procedure}</p>
        <p className="text-sm text-purple-300 mb-2">💡 {tip.tip}</p>
        <p className="text-xs text-slate-400">{tip.rationale}</p>
    </GlassCard>
);
