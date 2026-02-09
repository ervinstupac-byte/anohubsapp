import React from 'react';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { AlertTriangle, Droplet, Gauge } from 'lucide-react';

export interface ThrustHealthData {
    oilFilmThickness: number; // μm
    padSymmetry: number; // °C std dev
    status: 'TRUSTED' | 'LUBRICATION_CRISIS' | 'SOVEREIGN_TRIP';
    lastUpdate: string;
}

export const ThrustHealthWidget: React.FC<{ data?: ThrustHealthData }> = ({ data }) => {
    if (!data) {
        return (
            <GlassCard className="p-3 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-slate-700/50">
                <div className="flex items-center gap-2 mb-2">
                    <Gauge className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-400">Thrust Bearing</span>
                </div>
                <div className="text-center text-slate-500 text-xs">
                    No Data
                </div>
            </GlassCard>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'TRUSTED': return 'text-green-400';
            case 'LUBRICATION_CRISIS': return 'text-yellow-400';
            case 'SOVEREIGN_TRIP': return 'text-red-400';
            default: return 'text-slate-400';
        }
    };

    const getStatusBg = (status: string) => {
        switch (status) {
            case 'TRUSTED': return 'bg-green-500/10 border-green-500/20';
            case 'LUBRICATION_CRISIS': return 'bg-yellow-500/10 border-yellow-500/20';
            case 'SOVEREIGN_TRIP': return 'bg-red-500/10 border-red-500/20';
            default: return 'bg-slate-700/50';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'SOVEREIGN_TRIP': return AlertTriangle;
            default: return Droplet;
        }
    };

    const StatusIcon = getStatusIcon(data.status);

    return (
        <GlassCard className="p-3 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-slate-400">Thrust Bearing</span>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBg(data.status)} ${getStatusColor(data.status)}`}>
                    {data.status.replace('_', ' ')}
                </div>
            </div>

            <div className="space-y-3">
                {/* Oil Film Thickness */}
                <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Oil Film Thickness</span>
                    <span className={`text-sm font-mono ${data.oilFilmThickness <= 12 ? 'text-red-400' : data.oilFilmThickness <= 20 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {data.oilFilmThickness.toFixed(1)} μm
                    </span>
                </div>

                {/* Pad Symmetry */}
                <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Pad Symmetry (σ)</span>
                    <span className={`text-sm font-mono ${data.padSymmetry >= 12 ? 'text-red-400' : data.padSymmetry >= 5 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {data.padSymmetry.toFixed(1)}°C
                    </span>
                </div>

                {/* Visual Indicator */}
                <div className="flex items-center justify-center pt-2">
                    <div className="relative">
                        <StatusIcon className={`w-8 h-8 ${getStatusColor(data.status)} ${data.status === 'SOVEREIGN_TRIP' ? 'animate-pulse' : ''}`} />
                        {data.status === 'SOVEREIGN_TRIP' && (
                            <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping" />
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-700/50">
                <div className="text-xs text-slate-500">
                    Last: {new Date(data.lastUpdate).toLocaleTimeString()}
                </div>
            </div>
        </GlassCard>
    );
};
