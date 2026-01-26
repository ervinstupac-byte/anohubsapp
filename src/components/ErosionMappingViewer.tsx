// Erosion Mapping Viewer - AR Cavitation Tracking UI
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Map, TrendingUp, AlertCircle, Wrench } from 'lucide-react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { CavitationErosionService, ErosionAnalysis } from '../services/CavitationErosionService';

export const ErosionMappingViewer: React.FC = () => {
    const [analysis] = useState<ErosionAnalysis>({
        timestamp: Date.now(),
        assetId: 1001,
        turbineFamily: 'francis',
        operatingHours: 2190, // 3 months
        blades: [
            {
                bladeId: 1,
                surfaceArea: 1500,
                erosionPoints: Array.from({ length: 45 }).map((_, i) => ({
                    x: Math.random() * 300,
                    y: Math.random() * 200,
                    z: Math.random() * 2 + 0.5,
                    diameter: Math.random() * 3 + 1,
                    timestamp: Date.now()
                })),
                totalVolumeLost: 1250,
                massLoss: 9.8
            }
        ],
        totalMassLoss: 9.8,
        massLossRate: 35.2, // g/month
        erosionAcceleration: 45.3,
        currentMaterial: 'Martenzitni Cr13 čelik',
        recommendedMaterial: 'Stellite 6 (Co-Cr-W navarivanje)',
        recommendedAction: 'STELLITE_WELD',
        recommendedRegimeChange: {
            parameter: 'HEAD',
            currentValue: 100,
            recommendedValue: 95,
            expectedReduction: 15
        }
    });

    const recommendation = CavitationErosionService.generateRecommendation(analysis);
    const blade = analysis.blades[0];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">
                    <span className="text-white">Erosion</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 ml-2">
                        Mapping
                    </span>
                </h2>
                <p className="text-sm text-slate-400">
                    AR Camera - Cavitation Pitting Analysis
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
                <GlassCard className="p-4">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Mass Loss Rate</p>
                    <p className="text-3xl font-black text-white">{analysis.massLossRate.toFixed(1)}</p>
                    <p className="text-xs text-slate-500">g/month</p>
                </GlassCard>
                <GlassCard className={`p-4 ${analysis.erosionAcceleration > 30 ? 'border-2 border-red-500 bg-red-950/20' : ''
                    }`}>
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Acceleration</p>
                    <p className={`text-3xl font-black ${analysis.erosionAcceleration > 30 ? 'text-red-400' : 'text-white'}`}>
                        +{analysis.erosionAcceleration.toFixed(0)}%
                    </p>
                    <p className="text-xs text-red-300">⚠️ Ubrzava se</p>
                </GlassCard>
                <GlassCard className="p-4">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Total Pits</p>
                    <p className="text-3xl font-black text-white">{blade.erosionPoints.length}</p>
                    <p className="text-xs text-slate-500">detected on blade</p>
                </GlassCard>
                <GlassCard className="p-4">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Operating Hours</p>
                    <p className="text-3xl font-black text-white">{analysis.operatingHours}</p>
                    <p className="text-xs text-slate-500">since last scan</p>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: 3D Blade Map */}
                <GlassCard className="p-6">
                    <h3 className="text-sm font-black text-white uppercase mb-4">AR Blade Scan - Blade #{blade.bladeId}</h3>
                    <div className="aspect-[3/2] bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border-2 border-cyan-500/30 relative overflow-hidden">
                        {/* Blade outline */}
                        <svg className="absolute inset-0 w-full h-full">
                            {/* Blade profile (simplified) */}
                            <path
                                d="M 10,50 Q 80,30 150,50 T 290,50"
                                stroke="#334155"
                                strokeWidth="2"
                                fill="none"
                            />
                            <path
                                d="M 10,150 Q 80,130 150,150 T 290,150"
                                stroke="#334155"
                                strokeWidth="2"
                                fill="none"
                            />
                            <line x1="10" y1="50" x2="10" y2="150" stroke="#334155" strokeWidth="2" />
                            <line x1="290" y1="50" x2="290" y2="150" stroke="#334155" strokeWidth="2" />

                            {/* Erosion points (pits) */}
                            {blade.erosionPoints.map((pit, i) => {
                                const radius = (pit.z / 3) * 5; // Scale depth to visual size
                                const opacity = Math.min(pit.z / 2, 1);
                                // Normalize to blade area
                                const x = 10 + (pit.x / 300) * 280;
                                const y = 50 + (pit.y / 200) * 100;

                                return (
                                    <circle
                                        key={i}
                                        cx={x}
                                        cy={y}
                                        r={radius}
                                        fill="#ef4444"
                                        opacity={opacity}
                                        className="animate-pulse"
                                        style={{ animationDelay: `${i * 50}ms` }}
                                    />
                                );
                            })}
                        </svg>

                        {/* Legend */}
                        <div className="absolute bottom-2 left-2 bg-black/70 px-3 py-2 rounded text-xs space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500 opacity-40" />
                                <span className="text-slate-300">Shallow (&lt;1mm)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-red-500 opacity-70" />
                                <span className="text-slate-300">Medium (1-2mm)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-red-500" />
                                <span className="text-slate-300">Deep (&gt;2mm)</span>
                            </div>
                        </div>

                        <div className="absolute top-2 right-2 bg-black/70 px-3 py-1 rounded text-xs text-cyan-400 font-bold">
                            AR Point Cloud: {blade.erosionPoints.length} points
                        </div>
                    </div>
                </GlassCard>

                {/* Right: Material & Recommendations */}
                <div className="space-y-4">
                    {/* Current Material */}
                    <GlassCard className="p-4">
                        <p className="text-xs text-slate-400 uppercase font-bold mb-2">Current Material</p>
                        <p className="text-lg font-black text-white">{analysis.currentMaterial}</p>
                    </GlassCard>

                    {/* Recommended Action */}
                    <GlassCard className={`p-4 border-2 ${analysis.recommendedAction === 'STELLITE_WELD' ? 'border-red-500 bg-red-950/20' :
                        analysis.recommendedAction === 'REGIME_CHANGE' ? 'border-amber-500 bg-amber-950/20' :
                            'border-emerald-500 bg-emerald-950/20'
                        }`}>
                        <div className="flex items-center gap-2 mb-3">
                            <Wrench className={`w-5 h-5 ${analysis.recommendedAction === 'STELLITE_WELD' ? 'text-red-400' : 'text-amber-400'
                                }`} />
                            <p className="text-sm font-black text-white uppercase">Recommended Action</p>
                        </div>
                        <p className="text-2xl font-black text-white mb-2">
                            {analysis.recommendedAction?.replace('_', ' ')}
                        </p>
                        {analysis.recommendedMaterial && (
                            <p className="text-sm text-purple-300 mb-2">
                                Material: {analysis.recommendedMaterial}
                            </p>
                        )}
                        {analysis.recommendedRegimeChange && (
                            <div className="mt-3 p-3 bg-black/30 rounded">
                                <p className="text-xs text-slate-400 uppercase font-bold mb-2">Operational Change</p>
                                <p className="text-sm text-white">
                                    {analysis.recommendedRegimeChange.parameter}: {analysis.recommendedRegimeChange.currentValue} → {analysis.recommendedRegimeChange.recommendedValue}
                                </p>
                                <p className="text-xs text-emerald-300 mt-1">
                                    Expected erosion reduction: ~{analysis.recommendedRegimeChange.expectedReduction}%
                                </p>
                            </div>
                        )}
                    </GlassCard>

                    {/* ANO-AGENT Recommendation */}
                    <GlassCard className="p-4 bg-purple-950/20 border border-purple-500/30">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertCircle className="w-5 h-5 text-purple-400" />
                            <p className="text-sm font-black text-white uppercase">ANO-AGENT Analysis</p>
                        </div>
                        <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono">
                            {recommendation}
                        </pre>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};
