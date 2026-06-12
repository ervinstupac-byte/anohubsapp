import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, Shield, Zap, Activity, Target, ChevronRight,
    RefreshCw, Play, Pause, BarChart2, AlertTriangle, CheckCircle
} from 'lucide-react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { BackButton } from './BackButton';

// ─── Type definitions (mirrors MultiAgentSwarm.ts without importing it
//     directly to avoid async issues in this synchronous UI context) ────────
type AgentRecommendation = 'INCREASE_LOAD' | 'DECREASE_LOAD' | 'MAINTAIN' | 'SHUTDOWN';

interface AgentVoteUI {
    agentId: string;
    recommendation: AgentRecommendation;
    confidence: number;
    expectedValue: number;
    reasoning: string;
}

interface NashEquilibriumUI {
    decision: AgentRecommendation;
    targetLoad: number;
    consensusScore: number;
    tradeoffs: { profitImpact: number; wearImpact: number; gridImpact: number };
}

interface SwarmContext {
    currentLoad: number;
    marketPrice: number;
    rul: number;
    gridFrequency: number;
    waterAvailability: number;
}

// ─── Pure logic (extracted from MultiAgentSwarm.ts for synchronous UI use) ──
function profitMaximizerVote(ctx: SwarmContext): Omit<AgentVoteUI, 'agentId'> {
    const revenue = ctx.currentLoad * ctx.marketPrice;
    const potentialRevenue = Math.min(ctx.currentLoad * 1.1, 50) * ctx.marketPrice;
    let recommendation: AgentRecommendation;
    let expectedValue: number;
    if (ctx.marketPrice > 80) {
        recommendation = 'INCREASE_LOAD';
        expectedValue = potentialRevenue - revenue;
    } else if (ctx.marketPrice < 40) {
        recommendation = 'DECREASE_LOAD';
        expectedValue = revenue * 0.9 - revenue;
    } else {
        recommendation = 'MAINTAIN';
        expectedValue = 0;
    }
    return { recommendation, confidence: 0.9, expectedValue, reasoning: `Market price: €${ctx.marketPrice.toFixed(2)}/MWh` };
}

function assetGuardianVote(ctx: SwarmContext): Omit<AgentVoteUI, 'agentId'> {
    let recommendation: AgentRecommendation;
    let expectedValue: number;
    if (ctx.rul < 720) {
        recommendation = 'DECREASE_LOAD';
        expectedValue = 100;
    } else if (ctx.rul > 2160) {
        recommendation = 'INCREASE_LOAD';
        expectedValue = -50;
    } else {
        recommendation = 'MAINTAIN';
        expectedValue = 0;
    }
    return { recommendation, confidence: 0.85, expectedValue, reasoning: `RUL: ${ctx.rul}h (${(ctx.rul / 24).toFixed(0)}d remaining)` };
}

function gridStabilizerVote(ctx: SwarmContext): Omit<AgentVoteUI, 'agentId'> {
    let recommendation: AgentRecommendation;
    let expectedValue: number;
    if (ctx.gridFrequency < 49.9) {
        recommendation = 'INCREASE_LOAD';
        expectedValue = 200;
    } else if (ctx.gridFrequency > 50.1) {
        recommendation = 'DECREASE_LOAD';
        expectedValue = 150;
    } else {
        recommendation = 'MAINTAIN';
        expectedValue = 0;
    }
    return { recommendation, confidence: 0.95, expectedValue, reasoning: `Grid freq: ${ctx.gridFrequency.toFixed(3)} Hz` };
}

function computeNash(votes: AgentVoteUI[], ctx: SwarmContext): NashEquilibriumUI {
    const weights = new Map<string, number>();
    for (const vote of votes) {
        const w = vote.confidence * Math.abs(vote.expectedValue + 1);
        weights.set(vote.recommendation, (weights.get(vote.recommendation) || 0) + w);
    }
    let bestRec: AgentRecommendation = 'MAINTAIN';
    let maxW = 0;
    for (const [rec, w] of weights.entries()) {
        if (w > maxW) { maxW = w; bestRec = rec as AgentRecommendation; }
    }
    let targetLoad = ctx.currentLoad;
    if (bestRec === 'INCREASE_LOAD') targetLoad = Math.min(ctx.currentLoad * 1.1, 50);
    if (bestRec === 'DECREASE_LOAD') targetLoad = ctx.currentLoad * 0.9;
    if (bestRec === 'SHUTDOWN') targetLoad = 0;

    const totalW = Array.from(weights.values()).reduce((s, v) => s + v, 0);
    const consensusScore = totalW > 0 ? maxW / totalW : 1;

    const profit = votes.find(v => v.agentId === 'PROFIT_MAXIMIZER');
    const asset = votes.find(v => v.agentId === 'ASSET_GUARDIAN');
    const grid = votes.find(v => v.agentId === 'GRID_STABILIZER');

    return {
        decision: bestRec,
        targetLoad,
        consensusScore,
        tradeoffs: {
            profitImpact: profit?.expectedValue || 0,
            wearImpact: asset?.expectedValue || 0,
            gridImpact: grid?.expectedValue || 0,
        }
    };
}

// ─── Sub-components ─────────────────────────────────────────────────────────
const RECOMMENDATION_STYLES: Record<AgentRecommendation, { border: string; text: string; bg: string; label: string }> = {
    INCREASE_LOAD: { border: 'border-emerald-500/60', text: 'text-emerald-400', bg: 'bg-emerald-500/10', label: '▲ INCREASE LOAD' },
    DECREASE_LOAD: { border: 'border-amber-500/60', text: 'text-amber-400', bg: 'bg-amber-500/10', label: '▼ DECREASE LOAD' },
    MAINTAIN:      { border: 'border-cyan-500/40',   text: 'text-cyan-400',   bg: 'bg-cyan-500/10',   label: '● MAINTAIN' },
    SHUTDOWN:      { border: 'border-red-500/60',    text: 'text-red-400',    bg: 'bg-red-500/10',    label: '■ SHUTDOWN' },
};

const AGENT_META = [
    { id: 'PROFIT_MAXIMIZER', label: 'Profit Maximizer', icon: TrendingUp, color: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
    { id: 'ASSET_GUARDIAN',   label: 'Asset Guardian',   icon: Shield,      color: 'text-cyan-400',   glow: 'shadow-cyan-500/20' },
    { id: 'GRID_STABILIZER',  label: 'Grid Stabilizer',  icon: Zap,         color: 'text-amber-400',  glow: 'shadow-amber-500/20' },
];

function AgentCard({ meta, vote, isActive }: { meta: typeof AGENT_META[0]; vote: AgentVoteUI | null; isActive: boolean }) {
    const Icon = meta.icon;
    const style = vote ? RECOMMENDATION_STYLES[vote.recommendation] : null;
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative rounded-xl border bg-slate-900/60 p-5 transition-all duration-500
                ${style ? style.border : 'border-slate-700/50'}
                ${isActive ? `shadow-lg ${meta.glow}` : ''}
            `}
        >
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-2.5 rounded-lg border border-slate-700/50 bg-slate-800/80 ${meta.color}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{meta.label}</p>
                    {isActive && <span className="text-[9px] font-mono text-emerald-400 tracking-wider">● COMPUTING</span>}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {vote ? (
                    <motion.div key={vote.recommendation} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className={`rounded-lg ${style!.bg} border ${style!.border} px-3 py-2 mb-3`}>
                            <p className={`text-sm font-black font-mono tracking-widest ${style!.text}`}>{style!.label}</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Confidence</span>
                                <span className={`font-mono font-bold ${meta.color}`}>{(vote.confidence * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5">
                                <motion.div
                                    className={`h-1.5 rounded-full bg-gradient-to-r ${meta.color === 'text-emerald-400' ? 'from-emerald-600 to-emerald-400' : meta.color === 'text-cyan-400' ? 'from-cyan-600 to-cyan-400' : 'from-amber-600 to-amber-400'}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${vote.confidence * 100}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                />
                            </div>
                            <p className="text-[10px] text-slate-500 font-mono mt-1">{vote.reasoning}</p>
                            <div className="flex justify-between text-xs pt-1">
                                <span className="text-slate-500">Expected Value</span>
                                <span className={`font-mono font-bold ${vote.expectedValue >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {vote.expectedValue >= 0 ? '+' : ''}{vote.expectedValue.toFixed(1)} €/h
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="idle" className="space-y-2 animate-pulse">
                        <div className="h-8 bg-slate-800 rounded-lg" />
                        <div className="h-3 bg-slate-800 rounded w-3/4" />
                        <div className="h-3 bg-slate-800 rounded w-1/2" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function SliderInput({ label, value, min, max, step, unit, onChange, accentColor }: {
    label: string; value: number; min: number; max: number; step: number;
    unit: string; onChange: (v: number) => void; accentColor: string;
}) {
    const pct = ((value - min) / (max - min)) * 100;
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
                <span className={`text-sm font-black font-mono ${accentColor}`}>{value}{unit}</span>
            </div>
            <div className="relative">
                <input
                    type="range"
                    min={min} max={max} step={step} value={value}
                    onChange={e => onChange(parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{
                        background: `linear-gradient(to right, rgba(6,182,212,0.8) ${pct}%, rgba(51,65,85,0.5) ${pct}%)`
                    }}
                />
            </div>
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export const SwarmDashboard: React.FC = () => {
    const [ctx, setCtx] = useState<SwarmContext>({
        currentLoad: 35,
        marketPrice: 65,
        rul: 1500,
        gridFrequency: 50.0,
        waterAvailability: 45,
    });

    const [autoRun, setAutoRun] = useState(false);
    const [simStep, setSimStep] = useState(0);
    const [computingAgent, setComputingAgent] = useState<string | null>(null);
    const [revealedVotes, setRevealedVotes] = useState<AgentVoteUI[]>([]);
    const [equilbrium, setEquilibrium] = useState<NashEquilibriumUI | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [history, setHistory] = useState<Array<{ decision: AgentRecommendation; load: number; ts: number }>>([]);

    const allVotes: AgentVoteUI[] = useMemo(() => [
        { agentId: 'PROFIT_MAXIMIZER', ...profitMaximizerVote(ctx) },
        { agentId: 'ASSET_GUARDIAN',   ...assetGuardianVote(ctx) },
        { agentId: 'GRID_STABILIZER',  ...gridStabilizerVote(ctx) },
    ], [ctx]);

    const runSwarm = useCallback(async () => {
        if (isRunning) return;
        setIsRunning(true);
        setRevealedVotes([]);
        setEquilibrium(null);

        // Sequentially "reveal" each agent vote with a delay for drama
        for (let i = 0; i < AGENT_META.length; i++) {
            setComputingAgent(AGENT_META[i].id);
            await new Promise(r => setTimeout(r, 500));
            setRevealedVotes(prev => [...prev, allVotes[i]]);
            setComputingAgent(null);
            await new Promise(r => setTimeout(r, 200));
        }

        await new Promise(r => setTimeout(r, 400));
        const eq = computeNash(allVotes, ctx);
        setEquilibrium(eq);
        setHistory(prev => [{ decision: eq.decision, load: eq.targetLoad, ts: Date.now() }, ...prev.slice(0, 7)]);
        setIsRunning(false);
    }, [allVotes, ctx, isRunning]);

    // Auto-run simulation
    useEffect(() => {
        if (!autoRun) return;
        const interval = setInterval(() => {
            // Drift market price and grid freq slightly
            setCtx(prev => ({
                ...prev,
                marketPrice: Math.max(20, Math.min(200, prev.marketPrice + (Math.random() - 0.5) * 10)),
                gridFrequency: Math.max(49.5, Math.min(50.5, prev.gridFrequency + (Math.random() - 0.5) * 0.08)),
            }));
            setSimStep(s => s + 1);
        }, 2000);
        return () => clearInterval(interval);
    }, [autoRun]);

    useEffect(() => {
        if (autoRun && !isRunning) { runSwarm(); }
    }, [simStep, autoRun]);

    const nash = equilbrium;
    const nashStyle = nash ? RECOMMENDATION_STYLES[nash.decision] : null;

    return (
        <div className="pb-16 max-w-7xl mx-auto px-4 md:px-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 rounded">MULTI-AGENT SYSTEM</span>
                        <span className={`text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded border ${autoRun ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-slate-500 border-slate-700'}`}>
                            {autoRun ? '● AUTO-SIM ACTIVE' : '○ MANUAL'}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-100 tracking-tight">
                        Swarm Intelligence <span className="text-cyan-400">Lab</span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Three autonomous agents vote. Nash Equilibrium decides.
                    </p>
                </div>
                <BackButton text="Back to Hub" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* ── Left column: Controls ── */}
                <div className="xl:col-span-1 space-y-4">
                    <GlassCard title="System Context" subtitle="Drag sliders to simulate conditions" icon={<Activity className="w-5 h-5" />}>
                        <div className="space-y-5">
                            <SliderInput label="Current Load" value={ctx.currentLoad} min={0} max={50} step={0.5} unit=" MW" onChange={v => setCtx(p => ({ ...p, currentLoad: v }))} accentColor="text-slate-100" />
                            <SliderInput label="Market Price" value={ctx.marketPrice} min={20} max={200} step={1} unit=" €/MWh" onChange={v => setCtx(p => ({ ...p, marketPrice: v }))} accentColor={ctx.marketPrice > 80 ? 'text-emerald-400' : ctx.marketPrice < 40 ? 'text-red-400' : 'text-slate-100'} />
                            <SliderInput label="RUL" value={ctx.rul} min={0} max={5000} step={50} unit="h" onChange={v => setCtx(p => ({ ...p, rul: v }))} accentColor={ctx.rul < 720 ? 'text-red-400' : ctx.rul > 2160 ? 'text-emerald-400' : 'text-amber-400'} />
                            <SliderInput label="Grid Frequency" value={ctx.gridFrequency} min={49.5} max={50.5} step={0.01} unit=" Hz" onChange={v => setCtx(p => ({ ...p, gridFrequency: v }))} accentColor={Math.abs(ctx.gridFrequency - 50) > 0.1 ? 'text-red-400' : 'text-emerald-400'} />
                            <SliderInput label="Water Availability" value={ctx.waterAvailability} min={0} max={100} step={1} unit=" m³/s" onChange={v => setCtx(p => ({ ...p, waterAvailability: v }))} accentColor="text-cyan-400" />
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={runSwarm}
                                disabled={isRunning}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 rounded-xl font-bold text-sm transition-all disabled:opacity-40"
                            >
                                {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                {isRunning ? 'Computing...' : 'Run Swarm'}
                            </button>
                            <button
                                onClick={() => setAutoRun(a => !a)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-bold text-sm transition-all
                                    ${autoRun ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'}`}
                            >
                                {autoRun ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                {autoRun ? 'Stop' : 'Auto'}
                            </button>
                        </div>
                    </GlassCard>

                    {/* Decision History */}
                    {history.length > 0 && (
                        <GlassCard title="Decision History" subtitle="Last 8 equilibria" icon={<BarChart2 className="w-4 h-4" />}>
                            <div className="space-y-2">
                                {history.map((h, i) => {
                                    const s = RECOMMENDATION_STYLES[h.decision];
                                    return (
                                        <div key={h.ts} className={`flex items-center justify-between px-3 py-2 rounded-lg ${s.bg} border ${s.border} opacity-${100 - i * 10}`}>
                                            <span className={`text-xs font-mono font-bold ${s.text}`}>{s.label}</span>
                                            <span className="text-xs text-slate-400 font-mono">{h.load.toFixed(1)} MW</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </GlassCard>
                    )}
                </div>

                {/* ── Middle column: Agent Cards ── */}
                <div className="xl:col-span-1 space-y-4">
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500 px-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block animate-pulse" />
                        Active Agents ({AGENT_META.length})
                    </div>
                    {AGENT_META.map(meta => {
                        const vote = revealedVotes.find(v => v.agentId === meta.id) || null;
                        return (
                            <AgentCard
                                key={meta.id}
                                meta={meta}
                                vote={vote}
                                isActive={computingAgent === meta.id}
                            />
                        );
                    })}
                </div>

                {/* ── Right column: Nash Equilibrium Output ── */}
                <div className="xl:col-span-1 space-y-4">
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500 px-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                        Nash Equilibrium
                    </div>
                    <AnimatePresence mode="wait">
                        {nash ? (
                            <motion.div
                                key={nash.decision + nash.targetLoad}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="space-y-4"
                            >
                                {/* Main Decision */}
                                <div className={`rounded-xl border p-6 ${nashStyle!.bg} ${nashStyle!.border}`}>
                                    <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">Final Decision</p>
                                    <p className={`text-2xl font-black tracking-wider ${nashStyle!.text}`}>{nashStyle!.label}</p>
                                    <div className="mt-4 flex items-end gap-1">
                                        <span className="text-4xl font-black text-slate-100 font-mono">{nash.targetLoad.toFixed(1)}</span>
                                        <span className="text-slate-400 pb-1">MW target</span>
                                    </div>
                                    <div className="mt-3">
                                        <p className="text-[10px] text-slate-500 mb-1 font-mono uppercase">Consensus Score</p>
                                        <div className="w-full bg-slate-800/60 rounded-full h-2">
                                            <motion.div
                                                className="h-2 rounded-full bg-gradient-to-r from-cyan-600 to-cyan-400"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${nash.consensusScore * 100}%` }}
                                                transition={{ duration: 0.8 }}
                                            />
                                        </div>
                                        <p className={`text-sm font-black font-mono mt-1 ${nash.consensusScore > 0.6 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                            {(nash.consensusScore * 100).toFixed(0)}% agreement
                                        </p>
                                    </div>
                                </div>

                                {/* Tradeoffs */}
                                <GlassCard title="Tradeoff Analysis" subtitle="Impact per agent objective">
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Revenue Impact', value: nash.tradeoffs.profitImpact, icon: TrendingUp, color: 'text-emerald-400', unit: '€/h' },
                                            { label: 'RUL Impact',     value: nash.tradeoffs.wearImpact,   icon: Shield,      color: 'text-cyan-400',   unit: 'h' },
                                            { label: 'Grid Stability', value: nash.tradeoffs.gridImpact,   icon: Zap,         color: 'text-amber-400',  unit: 'pts' },
                                        ].map(item => {
                                            const Icon = item.icon;
                                            return (
                                                <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-700/40 last:border-0">
                                                    <div className="flex items-center gap-2">
                                                        <Icon className={`w-4 h-4 ${item.color}`} />
                                                        <span className="text-xs text-slate-400">{item.label}</span>
                                                    </div>
                                                    <span className={`text-sm font-black font-mono ${item.value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {item.value >= 0 ? '+' : ''}{item.value.toFixed(1)} {item.unit}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </GlassCard>

                                {/* Conflict detection */}
                                {nash.consensusScore < 0.5 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/40 bg-amber-500/10"
                                    >
                                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-bold text-amber-300">Low Consensus Detected</p>
                                            <p className="text-[10px] text-amber-400/70 mt-1">Agents strongly disagree. Consider reviewing inputs — competing objectives may need operator override.</p>
                                        </div>
                                    </motion.div>
                                )}
                                {nash.consensusScore >= 0.75 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex items-start gap-3 p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10"
                                    >
                                        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-bold text-emerald-300">Strong Consensus</p>
                                            <p className="text-[10px] text-emerald-400/70 mt-1">All agents are broadly aligned. High-confidence decision — safe to act on directive.</p>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div key="idle" className="rounded-xl border border-slate-700/40 bg-slate-900/40 p-10 flex flex-col items-center justify-center gap-4 text-center">
                                <div className="w-14 h-14 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center">
                                    <Target className="w-7 h-7 text-slate-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-400">Awaiting Swarm Execution</p>
                                    <p className="text-xs text-slate-600 mt-1">Press "Run Swarm" to initiate the multi-agent decision process.</p>
                                </div>
                                <button onClick={runSwarm} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 text-xs font-bold hover:bg-cyan-500/20 transition-all">
                                    <Play className="w-3.5 h-3.5" /> Run Swarm
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
