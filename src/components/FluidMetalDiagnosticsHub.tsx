// Fluid & Metal Diagnostics Hub - Main Container
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplet, Microscope, Map, Shield } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { OilAnalysisDashboard } from './OilAnalysisDashboard';
import { ParticleFerographyViewer } from './ParticleFerographyViewer';
import { ErosionMappingViewer } from './ErosionMappingViewer';
import { GalvanicCorrosionMonitor } from './GalvanicCorrosionMonitor';

type DiagnosticView = 'OIL_ANALYSIS' | 'PARTICLE_FERRO' | 'EROSION_MAP' | 'CORROSION_MONITOR';

export const FluidMetalDiagnosticsHub: React.FC = () => {
    const [activeView, setActiveView] = useState<DiagnosticView>('OIL_ANALYSIS');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-black uppercase tracking-tighter mb-3">
                    <span className="text-white">Fluid & Metal</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 ml-2">
                        Diagnostics
                    </span>
                </h1>
                <p className="text-slate-400">
                    Dubinska analiza habanja materijala i degradacije fluida
                </p>
            </div>

            {/* Navigation Tabs */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <NavTab
                    icon={Droplet}
                    label="Oil Analysis"
                    description="Chemical Fingerprinting"
                    active={activeView === 'OIL_ANALYSIS'}
                    onClick={() => setActiveView('OIL_ANALYSIS')}
                />
                <NavTab
                    icon={Microscope}
                    label="Particle Ferography"
                    description="AI Metal Classification"
                    active={activeView === 'PARTICLE_FERRO'}
                    onClick={() => setActiveView('PARTICLE_FERRO')}
                />
                <NavTab
                    icon={Map}
                    label="Erosion Mapping"
                    description="AR Cavitation Tracking"
                    active={activeView === 'EROSION_MAP'}
                    onClick={() => setActiveView('EROSION_MAP')}
                />
                <NavTab
                    icon={Shield}
                    label="Corrosion Monitor"
                    description="Galvanic Protection"
                    active={activeView === 'CORROSION_MONITOR'}
                    onClick={() => setActiveView('CORROSION_MONITOR')}
                />
            </div>

            {/* Content Area */}
            <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {activeView === 'OIL_ANALYSIS' && <OilAnalysisDashboard />}
                {activeView === 'PARTICLE_FERRO' && <ParticleFerographyViewer />}
                {activeView === 'EROSION_MAP' && <ErosionMappingViewer />}
                {activeView === 'CORROSION_MONITOR' && <GalvanicCorrosionMonitor />}
            </motion.div>
        </div>
    );
};

// Navigation Tab Component
const NavTab: React.FC<{
    icon: React.ComponentType<any>;
    label: string;
    description: string;
    active: boolean;
    onClick: () => void;
}> = ({ icon: Icon, label, description, active, onClick }) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`p-4 rounded-lg border-2 transition-all text-left ${active
            ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500'
            : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
            }`}
    >
        <Icon className={`w-8 h-8 mb-2 ${active ? 'text-amber-400' : 'text-slate-500'}`} />
        <p className={`text-sm font-black ${active ? 'text-white' : 'text-slate-400'}`}>{label}</p>
        <p className={`text-xs ${active ? 'text-amber-300' : 'text-slate-500'}`}>{description}</p>
    </motion.button>
);


