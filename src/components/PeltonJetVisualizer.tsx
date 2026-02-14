// Pelton Jet Visualizer - Multi-Nozzle Balance Analysis
// Shows acoustic analysis for each nozzle individually

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Radio, Play, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { PeltonJetSyncService, JetAnalysis } from '../services/PeltonJetSyncService';

import { EnhancedAsset } from '../models/turbine/types';

interface PeltonJetVisualizerProps {
    sessionId: string;
    asset: EnhancedAsset;
    onComplete: () => void;
}

export const PeltonJetVisualizer: React.FC<PeltonJetVisualizerProps> = ({ sessionId, asset, onComplete }) => {
    const [nozzleCount, setNozzleCount] = useState(asset.turbine_config.nozzle_count || 4);
    const [jetAnalyses, setJetAnalyses] = useState<JetAnalysis[]>([]);
    const [forceBalance, setForceBalance] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const analyzeJets = async () => {
        setIsAnalyzing(true);

        // Mock analysis for each nozzle
        const analyses: JetAnalysis[] = [];

        for (let i = 1; i <= nozzleCount; i++) {
            // Simulate acoustic data collection
            await new Promise(resolve => setTimeout(resolve, 500));

            const mockAcousticData = Array.from({ length: 1000 }, () => Math.random() * 100);

            // Add intentional variation to nozzle 3 (erosion simulation)
            const whistleBoost = i === 3 ? 3 : 0;
            const pressureVariation = i === 3 ? 0.95 : 1.0;

            const analysis = PeltonJetSyncService.analyzeJet(
                i,
                mockAcousticData.map(v => v + (i === 3 ? v * 0.5 : 0)), // Add noise to nozzle 3
                100 * pressureVariation, // bar
                75 // needle position %
            );

            // Manually adjust whistle index for demo
            if (i === 3) {
                analysis.acousticSignature.whistleIndex = 6.5;
                analysis.acousticSignature.impactPattern = 'ERODED';
                analysis.erosionLevel = 48;
            }

            analyses.push(analysis);
        }

        setJetAnalyses(analyses);

        // Calculate force balance
        const balance = PeltonJetSyncService.syncMultiNozzle(analyses, 1.2); // 1.2m runner radius
        setForceBalance(balance);

        setIsAnalyzing(false);
        onComplete();
    };

    const recommendations = jetAnalyses.length > 0 && forceBalance
        ? PeltonJetSyncService.generateRecommendations(jetAnalyses, forceBalance)
        : [];

    return (
        <GlassCard>
            <div className="mb-6">
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">
                    <span className="text-white">Pelton Jet</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 ml-2">
                        Sync Analysis
                    </span>
                </h3>
                <p className="text-sm text-slate-400">
                    Multi-nozzle balance and acoustic signature analysis
                </p>
            </div>

            {jetAnalyses.length === 0 ? (
                <div className="space-y-4">
                    {/* Nozzle Count Selector */}
                    <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                        <label className="block text-xs text-slate-400 uppercase font-bold mb-3">
                            Number of Nozzles
                        </label>
                        <div className="flex gap-2">
                            {[2, 4, 6].map(count => (
                                <button
                                    key={count}
                                    onClick={() => setNozzleCount(count)}
                                    className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all ${nozzleCount === count
                                        ? 'bg-cyan-500/30 text-cyan-400 border-2 border-cyan-500'
                                        : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:bg-slate-700/50'
                                        }`}
                                >
                                    {count} Jets
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Start Analysis */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={analyzeJets}
                        disabled={isAnalyzing}
                        className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-black uppercase text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                    >
                        {isAnalyzing ? (
                            <>
                                <Radio className="w-5 h-5 animate-spin" />
                                Analyzing Jets...
                            </>
                        ) : (
                            <>
                                <Play className="w-5 h-5" />
                                Start Jet Analysis
                            </>
                        )}
                    </motion.button>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Nozzle Cards Grid */}
                    <div className={`grid grid-cols-1 md:grid-cols-${Math.min(nozzleCount, 3)} gap-4`}>
                        {jetAnalyses.map(jet => (
                            <NozzleCard key={jet.nozzleId} analysis={jet} />
                        ))}
                    </div>

                    {/* Force Balance Summary */}
                    {forceBalance && (
                        <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                            <p className="text-sm font-bold text-white mb-4">Rotor Force Balance</p>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="text-center">
                                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Imbalance Ratio</p>
                                    <p className={`text-2xl font-black ${forceBalance.imbalanceRatio > 0.15 ? 'text-red-400' :
                                        forceBalance.imbalanceRatio > 0.08 ? 'text-amber-400' : 'text-emerald-400'
                                        }`}>
                                        {(forceBalance.imbalanceRatio * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Bearing Load Increase</p>
                                    <p className={`text-2xl font-black ${forceBalance.bearingLoadIncrease > 15 ? 'text-red-400' :
                                        forceBalance.bearingLoadIncrease > 8 ? 'text-amber-400' : 'text-emerald-400'
                                        }`}>
                                        +{forceBalance.bearingLoadIncrease.toFixed(0)}%
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Bearing Life Reduction</p>
                                    <p className="text-2xl font-black text-amber-400">
                                        {(forceBalance.predictedBearingWear / 1000).toFixed(0)}k hrs
                                    </p>
                                </div>
                            </div>

                            {/* Force Vector Diagram */}
                            <ForceVectorDiagram
                                nozzleForces={forceBalance.nozzleForces}
                                resultantForce={forceBalance.resultantForce}
                            />
                        </div>
                    )}

                    {/* Recommendations */}
                    {recommendations.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-bold text-white mb-2">🤖 Recommendations:</p>
                            {recommendations.map((rec, index) => (
                                <RecommendationCard key={index} recommendation={rec} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </GlassCard>
    );
};

// ===== HELPER COMPONENTS =====

const NozzleCard: React.FC<{ analysis: JetAnalysis }> = ({ analysis }) => {
    const { nozzleId, acousticSignature, erosionLevel } = analysis;

    const getStatusColor = () => {
        switch (acousticSignature.impactPattern) {
            case 'CLEAN': return { bg: 'bg-emerald-500/20', border: 'border-emerald-500', text: 'text-emerald-400' };
            case 'ERODED': return { bg: 'bg-amber-500/20', border: 'border-amber-500', text: 'text-amber-400' };
            case 'SAND_DAMAGE': return { bg: 'bg-red-500/20', border: 'border-red-500', text: 'text-red-400' };
        }
    };

    const colors = getStatusColor();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-lg border-2 ${colors.bg} ${colors.border}`}
        >
            <div className="flex items-center justify-between mb-3">
                <p className="text-lg font-black text-white">Nozzle {nozzleId}</p>
                {acousticSignature.impactPattern === 'CLEAN' ? (
                    <CheckCircle className={`w-5 h-5 ${colors.text}`} />
                ) : acousticSignature.impactPattern === 'ERODED' ? (
                    <AlertTriangle className={`w-5 h-5 ${colors.text}`} />
                ) : (
                    <XCircle className={`w-5 h-5 ${colors.text}`} />
                )}
            </div>

            <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                    <span className="text-slate-400">Pattern:</span>
                    <span className={`font-bold ${colors.text}`}>{acousticSignature.impactPattern}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Whistle Index:</span>
                    <span className="text-white font-bold">{acousticSignature.whistleIndex.toFixed(1)}/10</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Erosion:</span>
                    <span className="text-white font-bold">{erosionLevel.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Velocity:</span>
                    <span className="text-white font-bold">{analysis.jetVelocity.toFixed(1)} m/s</span>
                </div>
            </div>
        </motion.div>
    );
};

const ForceVectorDiagram: React.FC<{
    nozzleForces: number[];
    resultantForce: { magnitude: number; angle: number };
}> = ({ nozzleForces, resultantForce }) => {
    const centerX = 150;
    const centerY = 150;
    const radius = 100;

    const maxForce = Math.max(...nozzleForces);

    return (
        <div className="p-4 bg-slate-900/50 rounded-lg">
            <p className="text-xs text-slate-400 uppercase font-bold mb-2 text-center">Force Vector Diagram</p>
            <svg width="300" height="300" viewBox="0 0 300 300" className="mx-auto">
                {/* Reference circle */}
                <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="5,5" />

                {/* Individual nozzle force vectors */}
                {nozzleForces.map((force, i) => {
                    const angle = (i * (360 / nozzleForces.length) * Math.PI) / 180;
                    const length = (force / maxForce) * radius;
                    const x = centerX + Math.cos(angle - Math.PI / 2) * length;
                    const y = centerY + Math.sin(angle - Math.PI / 2) * length;

                    return (
                        <g key={i}>
                            <line
                                x1={centerX}
                                y1={centerY}
                                x2={x}
                                y2={y}
                                stroke="#06b6d4"
                                strokeWidth="2"
                                markerEnd="url(#arrowhead)"
                            />
                            <text
                                x={centerX + Math.cos(angle - Math.PI / 2) * (radius + 15)}
                                y={centerY + Math.sin(angle - Math.PI / 2) * (radius + 15)}
                                textAnchor="middle"
                                fill="#94a3b8"
                                fontSize="12"
                                fontWeight="bold"
                            >
                                {i + 1}
                            </text>
                        </g>
                    );
                })}

                {/* Resultant force vector */}
                {resultantForce.magnitude > 0 && (
                    <line
                        x1={centerX}
                        y1={centerY}
                        x2={centerX + Math.cos((resultantForce.angle - 90) * Math.PI / 180) * (resultantForce.magnitude / maxForce) * radius}
                        y2={centerY + Math.sin((resultantForce.angle - 90) * Math.PI / 180) * (resultantForce.magnitude / maxForce) * radius}
                        stroke="#f59e0b"
                        strokeWidth="4"
                        markerEnd="url(#arrowhead-orange)"
                    />
                )}

                {/* Center dot */}
                <circle cx={centerX} cy={centerY} r="4" fill="#ef4444" />

                {/* Arrow markers */}
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
                        <polygon points="0 0, 10 3, 0 6" fill="#06b6d4" />
                    </marker>
                    <marker id="arrowhead-orange" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
                        <polygon points="0 0, 10 3, 0 6" fill="#f59e0b" />
                    </marker>
                </defs>
            </svg>
            <p className="text-xs text-center text-slate-400 mt-2">
                <span className="text-cyan-400">Blue:</span> Individual forces |
                <span className="text-amber-400 ml-2">Orange:</span> Resultant
            </p>
        </div>
    );
};

const RecommendationCard: React.FC<{ recommendation: string }> = ({ recommendation }) => {
    const severity = recommendation.startsWith('🔴') ? 'CRITICAL' :
        recommendation.startsWith('🟡') ? 'WARNING' : 'INFO';

    const colors = {
        CRITICAL: { bg: 'bg-red-950/20', border: 'border-red-500/50', text: 'text-red-300' },
        WARNING: { bg: 'bg-amber-950/20', border: 'border-amber-500/50', text: 'text-amber-300' },
        INFO: { bg: 'bg-emerald-950/20', border: 'border-emerald-500/50', text: 'text-emerald-300' }
    };

    return (
        <div className={`p-3 rounded-lg border ${colors[severity].bg} ${colors[severity].border}`}>
            <p className={`text-xs ${colors[severity].text}`}>{recommendation}</p>
        </div>
    );
};
