import React from 'react';
import { GlassCard } from './GlassCard';
import { ModernButton } from './ModernButton';
import { useNavigation } from '../../contexts/NavigationContext';

export const UnderConstruction: React.FC = () => {
    const { navigateToHub } = useNavigation();

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <GlassCard className="max-w-md text-center border-t-4 border-t-h-cyan">
                <div className="text-6xl mb-6 grayscale opacity-50">🛡️</div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Protocol Interface v3.0</h2>
                <p className="text-xs font-mono text-h-cyan mb-6 tracking-widest uppercase animate-pulse">Establishing Secure Connection...</p>
                <p className="text-slate-400 mb-8 text-sm leading-relaxed">
                    This engineering module is currently undergoing <span className="text-white font-bold">Protocol Calibration</span> for Enterprise deployment.
                    Access level 4 required for synchronization.
                </p>
                <ModernButton onClick={navigateToHub} variant="primary" fullWidth className="bg-h-cyan/20 border-h-cyan text-h-cyan hover:bg-h-cyan hover:text-white transition-all">
                    Return to command center
                </ModernButton>
            </GlassCard>
        </div>
    );
};
