// Commissioning Mode Dashboard - Entry Point
// Main UI for accessing all commissioning features

import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Zap, Play, BookOpen } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { CommissioningWizard } from './CommissioningWizard';
import { useAssetContext } from '../contexts/AssetContext';
import { useCommissioning } from '../contexts/CommissioningContext';

export const CommissioningModeDashboard: React.FC = () => {
    const { selectedAsset } = useAssetContext();
    const { activeSession, isCommissioningMode, startCommissioningMode, exitCommissioningMode } = useCommissioning();

    if (!selectedAsset) {
        return (
            <GlassCard className="max-w-4xl mx-auto text-center py-12">
                <Settings className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                <p className="text-slate-400">Please select an asset to begin commissioning</p>
            </GlassCard>
        );
    }

    if (!isCommissioningMode) {
        return (
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-3">
                        <span className="text-white">Commissioning</span>
                        <span className="text-cyan-400 font-bold ml-2">{(selectedAsset as any)?.turbine_family?.toUpperCase()}</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 ml-2">
                            Mode
                        </span>
                    </h1>
                    <p className="text-slate-400">
                        Initial machine pairing and baseline recording system
                    </p>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <FeatureCard
                        icon={Zap}
                        title="Baseline Fingerprinting"
                        description="Record turbine's 'healthy state' at 5 load levels (0%, 25%, 50%, 75%, 100%)"
                        features={[
                            'Acoustic signature capture',
                            'Vibration baseline recording',
                            'Temperature & pressure profiles',
                            'Cavitation index mapping'
                        ]}
                    />
                    <FeatureCard
                        icon={Settings}
                        title="0.05 mm Alignment Wizard"
                        description="Interactive shaft centering with real-time runout diagram"
                        features={[
                            'Bluetooth dial indicator support',
                            'Polar runout visualization',
                            'Shaft sag auto-compensation',
                            'ISO standard validation'
                        ]}
                    />
                    <FeatureCard
                        icon={Play}
                        title="Hydro-Static Test"
                        description="Pressure drop analysis to detect micro-cracks and air"
                        features={[
                            'Real-time pressure monitoring',
                            'Linear regression analysis',
                            'Micro-crack detection',
                            'ANO-Agent diagnosis'
                        ]}
                    />
                    <FeatureCard
                        icon={BookOpen}
                        title="Special Measurements"
                        description="Laser tracker geometry import and efficiency gap analysis"
                        features={[
                            'Multi-format import (CSV/FARO/LEICA)',
                            'Blueprint comparison',
                            'Efficiency gap calculation',
                            'ROI analysis for reconstruction'
                        ]}
                    />
                </div>

                {(selectedAsset as any).turbine_family === 'PELTON' && (
                    <GlassCard className="p-6 bg-gradient-to-br from-purple-950/30 to-pink-950/30 border-purple-500/30">
                        <div className="flex items-center gap-3 mb-3">
                            <Zap className="w-6 h-6 text-purple-400" />
                            <p className="text-lg font-black text-white">Pelton-Specific Feature</p>
                        </div>
                        <p className="text-sm text-slate-300 mb-2">
                            <strong>Multi-Nozzle Jet Sync:</strong> Individual acoustic analysis of each nozzle to detect erosion, sand damage, and rotor force imbalance.
                        </p>
                        <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                            <li>Whistle Index calculation (0-10 scale)</li>
                            <li>Force vector balance diagram</li>
                            <li>Bearing load increase prediction</li>
                        </ul>
                    </GlassCard>
                )}

                {/* Start Button */}
                <div className="text-center">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={startCommissioningMode}
                        className="px-12 py-5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-xl font-black uppercase text-white text-lg flex items-center gap-3 mx-auto hover:shadow-2xl hover:shadow-cyan-500/50 transition-all"
                    >
                        <Play className="w-6 h-6" />
                        Start Commissioning for {selectedAsset.name}
                    </motion.button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <CommissioningWizard
                asset={selectedAsset as any}
                onComplete={(session) => {
                    alert('✅ Commissioning Complete! Session saved.');
                    exitCommissioningMode();
                }}
            />
        </div>
    );
};

// ===== HELPER COMPONENTS =====

const FeatureCard: React.FC<{
    icon: React.ComponentType<any>;
    title: string;
    description: string;
    features: string[];
}> = ({ icon: Icon, title, description, features }) => (
    <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-3">
            <Icon className="w-8 h-8 text-cyan-400" />
            <h3 className="text-xl font-black text-white">{title}</h3>
        </div>
        <p className="text-sm text-slate-400 mb-4">{description}</p>
        <ul className="space-y-2">
            {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-xs text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    {feature}
                </li>
            ))}
        </ul>
    </GlassCard>
);
