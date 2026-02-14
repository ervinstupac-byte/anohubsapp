import React from 'react';
import { GlassCard } from '../../shared/components/ui/GlassCard';

export const ForensicDeepDive: React.FC = () => {
    return (
        <div className="p-6">
            <GlassCard>
                <h2 className="text-2xl font-bold text-white mb-4">Forensic Deep Dive</h2>
                <p className="text-slate-400">Deep dive forensics module loaded.</p>
            </GlassCard>
        </div>
    );
};
