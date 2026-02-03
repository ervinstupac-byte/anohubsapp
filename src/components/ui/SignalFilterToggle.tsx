/**
 * SIGNAL FILTER TOGGLE
 * Professional RAW/FILTERED toggle for demonstrating signal integrity.
 * Part of NC-400: Professional Witness UI
 */

import React from 'react';
import { Activity, Zap } from 'lucide-react';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { FilterType } from '../../utils/SignalFilter';

interface SignalFilterToggleProps {
    compact?: boolean;
    className?: string;
}

export const SignalFilterToggle: React.FC<SignalFilterToggleProps> = ({
    compact = false,
    className = ''
}) => {
    const isFilteredMode = useTelemetryStore(state => state.isFilteredMode);
    const filterType = useTelemetryStore(state => state.filterType);
    const toggleFilteredMode = useTelemetryStore(state => state.toggleFilteredMode);
    const setFilterType = useTelemetryStore(state => state.setFilterType);

    const handleToggle = () => {
        toggleFilteredMode();
    };

    const handleFilterTypeChange = (type: FilterType) => {
        setFilterType(type);
        if (type !== 'NONE' && !isFilteredMode) {
            toggleFilteredMode();
        }
    };

    if (compact) {
        return (
            <button
                onClick={handleToggle}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${isFilteredMode
                        ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                        : 'bg-slate-800 border border-slate-600 text-slate-400 hover:border-slate-500'
                    } ${className}`}
            >
                {isFilteredMode ? <Zap className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                {isFilteredMode ? `FILTERED (${filterType})` : 'RAW'}
            </button>
        );
    }

    return (
        <div className={`bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-lg p-3 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isFilteredMode ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`} />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Signal Integrity
                    </span>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${isFilteredMode
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-slate-700 text-slate-400'
                    }`}>
                    {isFilteredMode ? 'ACTIVE' : 'BYPASSED'}
                </span>
            </div>

            {/* Toggle Pills */}
            <div className="flex bg-slate-800/50 rounded-lg p-1 gap-1">
                <button
                    onClick={() => {
                        if (isFilteredMode) toggleFilteredMode();
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${!isFilteredMode
                            ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                >
                    <Activity className="w-3.5 h-3.5" />
                    Raw Data
                </button>
                <button
                    onClick={() => {
                        if (!isFilteredMode) toggleFilteredMode();
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${isFilteredMode
                            ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                >
                    <Zap className="w-3.5 h-3.5" />
                    Filtered ({filterType})
                </button>
            </div>

            {/* Filter Type Selector (when filtered) */}
            {isFilteredMode && (
                <div className="mt-3 flex items-center gap-2">
                    <span className="text-[9px] text-slate-500 uppercase">Filter:</span>
                    <div className="flex gap-1">
                        {(['SMA', 'EMA'] as FilterType[]).map(type => (
                            <button
                                key={type}
                                onClick={() => handleFilterTypeChange(type)}
                                className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${filterType === type
                                        ? 'bg-cyan-500 text-black'
                                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                    <span className="text-[9px] text-slate-600 ml-auto">
                        {filterType === 'EMA' ? 'α=0.3' : '5-pt window'}
                    </span>
                </div>
            )}

            {/* Status Line */}
            <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isFilteredMode ? 'bg-cyan-400' : 'bg-amber-400'}`} />
                <span className="text-[9px] text-slate-500">
                    {isFilteredMode
                        ? 'Gauges display smoothed values • RCA uses raw peaks'
                        : 'Displaying raw PLC values with jitter'
                    }
                </span>
            </div>
        </div>
    );
};

export default SignalFilterToggle;
