// Particle Ferography Viewer - AI Visual Classification UI
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, AlertTriangle, CheckCircle, Microscope } from 'lucide-react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { ParticleAnalysisService, ParticleClassification } from '../services/ParticleAnalysisService';
// MIGRATED: From ProjectContext to specialized Store
import { useTelemetryStore } from '../features/telemetry/store/useTelemetryStore';

export const ParticleFerographyViewer: React.FC = () => {
    // MIGRATION: Consume mechanical data from TelemetryStore
    const { mechanical } = useTelemetryStore();

    // Fallback to sample data if no live data (or during migration gap)
    const particleData = mechanical?.particleAnalysis as ParticleClassification[] | undefined;

    const particles: ParticleClassification[] = particleData || [
        {
            particleType: 'BABBITT_FLAKE',
            confidence: 92,
            characteristics: {
                shape: 'FLAKY',
                appearance: 'SHINY',
                size: 15,
                count: 68
            },
            source: 'Babbitt bearing lining (bijeli metal)',
            severity: 'HIGH'
        },
        {
            particleType: 'FATIGUE_CHUNK',
            confidence: 88,
            characteristics: {
                shape: 'CHUNKY',
                appearance: 'DARK',
                size: 25,
                count: 42
            },
            source: 'Zamor materijala zupčanika ili vratila',
            severity: 'MEDIUM'
        },
        {
            particleType: 'CUTTING_WEAR',
            confidence: 75,
            characteristics: {
                shape: 'ANGULAR',
                appearance: 'SHINY',
                size: 8,
                count: 125
            },
            source: 'Normalno trošenje (run-in period)',
            severity: 'LOW'
        }
    ];

    const [selectedParticle, setSelectedParticle] = useState<ParticleClassification | null>(particles[0]);

    const babbittParticles = particles.filter(p => p.particleType === 'BABBITT_FLAKE');
    const fatigueParticles = particles.filter(p => p.particleType === 'FATIGUE_CHUNK');
    const totalParticles = particles.reduce((sum, p) => sum + p.characteristics.count, 0);

    const bearingTemp = mechanical?.bearingTemp || 0;
    const baselineTemp = 65; // °C
    const correlation = ParticleAnalysisService.correlateTempAndParticles(particles, bearingTemp, baselineTemp);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">
                    <span className="text-white">Particle</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 ml-2">
                        Ferography
                    </span>
                </h2>
                <p className="text-sm text-slate-400">
                    Visual Classification - Metal Wear Detection
                </p>
            </div>

            {/* AI Correlation Alert */}
            {correlation && (
                <GlassCard className="p-4 bg-red-950/20 border-2 border-red-500">
                    <p className="text-sm text-red-300 font-bold">{correlation}</p>
                </GlassCard>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
                <GlassCard className="p-4">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Total Particles</p>
                    <p className="text-3xl font-black text-white">{totalParticles}</p>
                    <p className="text-xs text-slate-500">detected in sample</p>
                </GlassCard>
                <GlassCard className="p-4 border-2 border-amber-500 bg-amber-950/20">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Babbitt Flakes</p>
                    <p className="text-3xl font-black text-amber-400">
                        {babbittParticles.reduce((sum, p) => sum + p.characteristics.count, 0)}
                    </p>
                    <p className="text-xs text-amber-300">⚠️ Bearing wear indicator</p>
                </GlassCard>
                <GlassCard className="p-4">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Fatigue Chunks</p>
                    <p className="text-3xl font-black text-white">
                        {fatigueParticles.reduce((sum, p) => sum + p.characteristics.count, 0)}
                    </p>
                    <p className="text-xs text-slate-500">Gear/shaft fatigue</p>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Particle List */}
                <div className="lg:col-span-1 space-y-3">
                    <h3 className="text-sm font-black text-white uppercase">Detected Particles</h3>
                    {particles.map((particle, index) => (
                        <ParticleCard
                            key={index}
                            particle={particle}
                            selected={selectedParticle === particle}
                            onClick={() => setSelectedParticle(particle)}
                        />
                    ))}

                    {/* Upload Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full px-4 py-3 bg-purple-500/20 border-2 border-purple-500/50 rounded-lg text-purple-400 font-bold flex items-center justify-center gap-2 hover:bg-purple-500/30 transition-colors"
                    >
                        <Upload className="w-4 h-4" />
                        Upload Microscope Image
                    </motion.button>
                </div>

                {/* Right: Particle Detail & Microscope View */}
                <div className="lg:col-span-2 space-y-4">
                    {selectedParticle ? (
                        <>
                            {/* Microscope View Simulation */}
                            <GlassCard className="p-6 bg-black/50">
                                <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border-2 border-purple-500/30 relative overflow-hidden flex items-center justify-center">
                                    <Microscope className="w-24 h-24 text-slate-700" />
                                    <div className="absolute top-4 right-4 bg-black/70 px-3 py-1 rounded text-xs text-purple-400 font-bold">
                                        400x Magnification
                                    </div>
                                    <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1 rounded text-xs text-white">
                                        {selectedParticle.particleType.replace('_', ' ')}
                                    </div>

                                    {/* Particle visualization */}
                                    <svg className="absolute inset-0 w-full h-full opacity-60">
                                        {selectedParticle.characteristics.shape === 'FLAKY' ? (
                                            // Flaky particles (irregular polygons)
                                            Array.from({ length: 12 }).map((_, i) => {
                                                const x = Math.random() * 100;
                                                const y = Math.random() * 100;
                                                const size = Math.random() * 3 + 2;
                                                return (
                                                    <polygon
                                                        key={i}
                                                        points={`${x},${y} ${x + size},${y + size / 2} ${x + size / 2},${y + size} ${x - size / 2},${y + size / 2}`}
                                                        fill={selectedParticle.characteristics.appearance === 'SHINY' ? '#fbbf24' : '#64748b'}
                                                        opacity={Math.random() * 0.5 + 0.5}
                                                    />
                                                );
                                            })
                                        ) : selectedParticle.characteristics.shape === 'CHUNKY' ? (
                                            // Chunky particles (irregular rectangles)
                                            Array.from({ length: 8 }).map((_, i) => {
                                                const x = Math.random() * 100;
                                                const y = Math.random() * 100;
                                                const w = Math.random() * 4 + 3;
                                                const h = Math.random() * 4 + 3;
                                                return (
                                                    <rect
                                                        key={i}
                                                        x={`${x}%`}
                                                        y={`${y}%`}
                                                        width={w}
                                                        height={h}
                                                        fill="#334155"
                                                        opacity={Math.random() * 0.4 + 0.6}
                                                    />
                                                );
                                            })
                                        ) : (
                                            // Angular particles (small triangles)
                                            Array.from({ length: 20 }).map((_, i) => {
                                                const x = Math.random() * 100;
                                                const y = Math.random() * 100;
                                                const size = Math.random() * 2 + 1;
                                                return (
                                                    <polygon
                                                        key={i}
                                                        points={`${x},${y} ${x + size},${y} ${x + size / 2},${y + size}`}
                                                        fill="#94a3b8"
                                                        opacity={Math.random() * 0.3 + 0.4}
                                                    />
                                                );
                                            })
                                        )}
                                    </svg>
                                </div>
                            </GlassCard>

                            {/* Particle Details */}
                            <GlassCard className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-black text-white mb-1">
                                            {selectedParticle.particleType.replace('_', ' ')}
                                        </h3>
                                        <p className="text-sm text-purple-400">{selectedParticle.source}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400 uppercase font-bold">Confidence Score</p>
                                        <p className="text-2xl font-black text-white">{selectedParticle.confidence}%</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Shape</p>
                                        <p className="text-sm text-white font-bold">{selectedParticle.characteristics.shape}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Appearance</p>
                                        <p className="text-sm text-white font-bold">{selectedParticle.characteristics.appearance}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Avg Size</p>
                                        <p className="text-sm text-white font-bold">{selectedParticle.characteristics.size} μm</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Count</p>
                                        <p className="text-sm text-white font-bold">{selectedParticle.characteristics.count}</p>
                                    </div>
                                </div>

                                {/* Severity Badge */}
                                <div className={`p-3 rounded-lg border-2 ${selectedParticle.severity === 'CRITICAL' ? 'border-red-500 bg-red-950/20' :
                                    selectedParticle.severity === 'HIGH' ? 'border-amber-500 bg-amber-950/20' :
                                        selectedParticle.severity === 'MEDIUM' ? 'border-orange-500 bg-orange-950/20' :
                                            'border-emerald-500 bg-emerald-950/20'
                                    }`}>
                                    <p className="text-xs font-bold uppercase text-slate-400 mb-1">Severity Assessment</p>
                                    <p className={`text-lg font-black ${selectedParticle.severity === 'CRITICAL' ? 'text-red-400' :
                                        selectedParticle.severity === 'HIGH' ? 'text-amber-400' :
                                            selectedParticle.severity === 'MEDIUM' ? 'text-orange-400' :
                                                'text-emerald-400'
                                        }`}>
                                        {selectedParticle.severity}
                                    </p>
                                </div>
                            </GlassCard>
                        </>
                    ) : (
                        <GlassCard className="p-12 text-center">
                            <Camera className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                            <p className="text-slate-400">Select a particle to view details</p>
                        </GlassCard>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper Component
const ParticleCard: React.FC<{
    particle: ParticleClassification;
    selected: boolean;
    onClick: () => void;
}> = ({ particle, selected, onClick }) => {
    const severityColors = {
        CRITICAL: 'border-red-500 bg-red-950/20',
        HIGH: 'border-amber-500 bg-amber-950/20',
        MEDIUM: 'border-orange-500 bg-orange-950/20',
        LOW: 'border-emerald-500 bg-emerald-950/20'
    };

    const Icon = particle.severity === 'LOW' ? CheckCircle : AlertTriangle;

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`w-full p-3 rounded-lg border-2 transition-all text-left ${selected ? severityColors[particle.severity] : 'border-slate-700/50 bg-slate-800/30'
                }`}
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">
                    {particle.particleType.replace('_', ' ')}
                </span>
                <Icon className={`w-4 h-4 ${particle.severity === 'CRITICAL' ? 'text-red-400' :
                    particle.severity === 'HIGH' ? 'text-amber-400' :
                        particle.severity === 'MEDIUM' ? 'text-orange-400' :
                            'text-emerald-400'
                    }`} />
            </div>
            <p className="text-xs text-slate-400">{particle.characteristics.count} particles</p>
            <p className="text-xs text-slate-500">{particle.characteristics.size} μm avg</p>
        </motion.button>
    );
};
