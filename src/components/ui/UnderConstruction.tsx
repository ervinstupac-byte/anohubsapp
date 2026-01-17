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
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">AnoHUB Operational Roadmap</h2>
                <p className="text-xs font-mono text-emerald-400 mb-6 tracking-widest uppercase animate-pulse">Syncing Future Logic: ACCESS_GRANTED</p>
                <p className="text-slate-400 mb-8 text-sm leading-relaxed">
                    Access Granted: <span className="text-emerald-400 font-bold uppercase">NC-5.6 Verified</span>.
                    This module is now open for engineering development and strategic planning.
                </p>
                <ModernButton onClick={navigateToHub} variant="primary" fullWidth className="bg-h-gold/10 border-h-gold/30 text-h-gold hover:bg-h-gold/20 transition-all uppercase tracking-widest font-bold">
                    Exit Sector
                </ModernButton>
            </GlassCard>
        </div>
    );
};
