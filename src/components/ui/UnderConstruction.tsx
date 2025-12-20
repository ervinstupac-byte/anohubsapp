import React from 'react';
import { GlassCard } from './GlassCard';
import { ModernButton } from './ModernButton';
import { useNavigation } from '../../contexts/NavigationContext';

export const UnderConstruction: React.FC = () => {
    const { navigateToHub } = useNavigation();

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <GlassCard className="max-w-md text-center">
                <div className="text-6xl mb-6">🚧</div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Module Locked</h2>
                <p className="text-slate-400 mb-8 leading-relaxed">
                    This engineering protocol is currently being calibrated for Enterprise deployment.
                    Please return to the Command Center.
                </p>
                <ModernButton onClick={navigateToHub} variant="primary" fullWidth>
                    Return to Hub
                </ModernButton>
            </GlassCard>
        </div>
    );
};
