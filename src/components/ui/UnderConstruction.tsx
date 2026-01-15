import React from 'react';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { ModernButton } from '../../shared/components/ui/ModernButton';
import { useNavigation } from '../../contexts/NavigationContext';

export const UnderConstruction: React.FC = () => {
    const { navigateToHub } = useNavigation();

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <GlassCard className="max-w-md text-center border-t-4 border-t-h-gold">
                <div className="text-6xl mb-6 grayscale opacity-50">👁️</div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Operational Roadmap</h2>
                <p className="text-xs font-mono text-h-gold mb-6 tracking-widest uppercase animate-pulse">Syncing Future Logic...</p>
                <p className="text-slate-400 mb-8 text-sm leading-relaxed">
                    Access Restricted: <span className="text-white font-bold uppercase">Level 5 Credentials Required</span>.
                    This module is encrypted for authorized operational personnel only.
                </p>
                <ModernButton onClick={navigateToHub} variant="primary" fullWidth className="bg-h-gold/10 border-h-gold/30 text-h-gold hover:bg-h-gold/20 transition-all uppercase tracking-widest font-bold">
                    Exit Sector
                </ModernButton>
            </GlassCard>
        </div>
    );
};
