import React from 'react';
import { GlassCard } from './GlassCard';
import { AlertTriangle, Box, FileText, Ban } from 'lucide-react';

interface ModuleFallbackProps {
    title: string;
    message?: string;
    icon?: 'Alert' | 'Box' | 'File' | 'Ban';
    onRetry?: () => void;
}

export const ModuleFallback: React.FC<ModuleFallbackProps> = ({
    title,
    message = "Module currently unavailable.",
    icon = 'Alert',
    onRetry
}) => {
    const getIcon = () => {
        switch (icon) {
            case 'Box': return <Box className="w-8 h-8 text-cyan-500/50" />;
            case 'File': return <FileText className="w-8 h-8 text-cyan-500/50" />;
            case 'Ban': return <Ban className="w-8 h-8 text-red-500/50" />;
            default: return <AlertTriangle className="w-8 h-8 text-amber-500/50" />;
        }
    };

    return (
        <GlassCard className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center border-dashed border-slate-700 bg-slate-900/20">
            <div className="p-4 bg-slate-900/50 rounded-2xl mb-4 border border-white/5">
                {getIcon()}
            </div>
            <h3 className="text-lg font-bold text-slate-300 mb-2">{title}</h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto mb-6">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-4 py-2 text-xs font-bold text-cyan-400 bg-cyan-950/30 border border-cyan-500/30 rounded-lg hover:bg-cyan-900/50 transition-colors uppercase tracking-wider"
                >
                    Retry Module
                </button>
            )}
        </GlassCard>
    );
};
