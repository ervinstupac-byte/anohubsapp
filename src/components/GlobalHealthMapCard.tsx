/**
 * GLOBAL HEALTH MAP
 * The Ant's Dashboard - Visual Station Health Overview
 * 
 * Shows the entire station at a glance with color-coded health indicators:
 * - Green: Happy parts (HEALTHY)
 * - Yellow: Needs attention (WARNING)
 * - Orange: Problem detected (ALARM)
 * - Red: Angry parts (CRITICAL)
 */

import React from 'react';
import { Activity, AlertTriangle, CheckCircle, XCircle, Zap, Waves, Building2, Cpu } from 'lucide-react';
import type { GlobalHealthMap, SystemHealth } from '../services/GlobalHealthDashboard';

interface GlobalHealthMapProps {
    healthMap: GlobalHealthMap;
    onSystemClick?: (system: SystemHealth) => void;
}

export function GlobalHealthMapCard({ healthMap, onSystemClick }: GlobalHealthMapProps) {

    /**
     * Get color class based on health status
     */
    const getHealthColor = (status: SystemHealth['healthStatus']): string => {
        switch (status) {
            case 'HEALTHY': return 'bg-emerald-500/20 border-emerald-500 text-emerald-400';
            case 'WARNING': return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
            case 'ALARM': return 'bg-orange-500/20 border-orange-500 text-orange-400';
            case 'CRITICAL': return 'bg-red-500/20 border-red-500 text-red-400';
        }
    };

    /**
     * Get icon for system type
     */
    const getSystemIcon = (type: SystemHealth['systemType']) => {
        switch (type) {
            case 'TURBINE': return Activity;
            case 'GENERATOR': return Zap;
            case 'TRANSFORMER': return Zap;
            case 'CIVIL': return Building2;
            case 'CONTROL': return Cpu;
            case 'HYDRAULIC': return Waves;
            default: return Activity;
        }
    };

    /**
     * Get overall status icon
     */
    const getOverallIcon = () => {
        switch (healthMap.overallHealth) {
            case 'HEALTHY': return <CheckCircle className="w-8 h-8 text-emerald-400" />;
            case 'DEGRADED': return <AlertTriangle className="w-8 h-8 text-yellow-400" />;
            case 'CRITICAL': return <XCircle className="w-8 h-8 text-red-400" />;
        }
    };

    /**
     * Get overall status color
     */
    const getOverallColor = () => {
        switch (healthMap.overallHealth) {
            case 'HEALTHY': return 'text-emerald-400 border-emerald-500';
            case 'DEGRADED': return 'text-yellow-400 border-yellow-500';
            case 'CRITICAL': return 'text-red-400 border-red-500';
        }
    };

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    {getOverallIcon()}
                    <div>
                        <h2 className="text-xl font-bold text-white">Global Health Map</h2>
                        <p className="text-sm text-slate-400">{healthMap.stationName}</p>
                    </div>
                </div>
                <div className={`text-right border-l-4 pl-3 ${getOverallColor()}`}>
                    <div className="text-2xl font-bold">{healthMap.overallHealth}</div>
                    <div className="text-xs opacity-70">Overall Status</div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-900/50 rounded p-3 text-center">
                    <div className="text-2xl font-bold text-white">{healthMap.totalSystems}</div>
                    <div className="text-xs text-slate-400">Total Systems</div>
                </div>
                <div className="bg-emerald-500/10 rounded p-3 text-center border border-emerald-500/30">
                    <div className="text-2xl font-bold text-emerald-400">{healthMap.healthySystems}</div>
                    <div className="text-xs text-emerald-400/70">Healthy</div>
                </div>
                <div className="bg-yellow-500/10 rounded p-3 text-center border border-yellow-500/30">
                    <div className="text-2xl font-bold text-yellow-400">{healthMap.degradedSystems}</div>
                    <div className="text-xs text-yellow-400/70">Degraded</div>
                </div>
                <div className="bg-red-500/10 rounded p-3 text-center border border-red-500/30">
                    <div className="text-2xl font-bold text-red-400">{healthMap.criticalSystems}</div>
                    <div className="text-xs text-red-400/70">Critical</div>
                </div>
            </div>

            {/* Visual System Map */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">SYSTEM STATUS MAP</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {healthMap.systems.map((system, index) => {
                        const Icon = getSystemIcon(system.systemType);
                        const isTopPriority = index === 0;

                        return (
                            <button
                                key={system.systemId}
                                onClick={() => onSystemClick?.(system)}
                                className={`
                  relative p-4 rounded-lg border-2 transition-all hover:scale-105 hover:shadow-lg
                  ${getHealthColor(system.healthStatus)}
                  ${isTopPriority ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800' : ''}
                `}
                            >
                                {isTopPriority && (
                                    <div className="absolute -top-2 -right-2 bg-white text-slate-900 text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                                        #1 URGENT
                                    </div>
                                )}

                                <Icon className="w-8 h-8 mx-auto mb-2" />

                                <div className="text-xs font-semibold mb-1">{system.systemName}</div>
                                <div className="text-[10px] opacity-70 mb-2">{system.systemType}</div>

                                <div className="flex items-center justify-center gap-1 text-xs">
                                    <div className="font-bold">{system.priorityScore.toFixed(0)}</div>
                                    <div className="text-[10px] opacity-50">pts</div>
                                </div>

                                {system.activeIssues.length > 0 && (
                                    <div className="mt-2 text-[10px] opacity-80">
                                        {system.activeIssues.length} issue{system.activeIssues.length > 1 ? 's' : ''}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Top Priority System */}
            {healthMap.mostUrgent && (
                <div className="mb-6 p-4 bg-red-500/10 border-2 border-red-500 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <h3 className="text-sm font-bold text-red-400">MOST URGENT SYSTEM</h3>
                    </div>
                    <div className="text-base font-bold text-white mb-1">
                        {healthMap.mostUrgent.systemName}
                    </div>
                    <div className="text-sm text-slate-300 mb-2">
                        {healthMap.mostUrgent.recommendedAction}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-slate-900/50 rounded p-2">
                            <div className="text-slate-400">Safety</div>
                            <div className="text-white font-bold">
                                {healthMap.mostUrgent.priorityBreakdown.safetyRisk.toFixed(0)}/50
                            </div>
                        </div>
                        <div className="bg-slate-900/50 rounded p-2">
                            <div className="text-slate-400">Production</div>
                            <div className="text-white font-bold">
                                {healthMap.mostUrgent.priorityBreakdown.productionImpact.toFixed(0)}/30
                            </div>
                        </div>
                        <div className="bg-slate-900/50 rounded p-2">
                            <div className="text-slate-400">Asset</div>
                            <div className="text-white font-bold">
                                {healthMap.mostUrgent.priorityBreakdown.assetHealth.toFixed(0)}/20
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recommendations */}
            {healthMap.recommendations.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-slate-300 mb-2">RECOMMENDED ACTIONS</h3>
                    <div className="space-y-2">
                        {healthMap.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold mt-0.5">
                                    {index + 1}
                                </div>
                                <div className="text-slate-300">{rec}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-slate-700">
                <h4 className="text-xs font-semibold text-slate-400 mb-2">HEALTH LEGEND</h4>
                <div className="flex flex-wrap gap-3 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="text-slate-400">Healthy (Happy)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-slate-400">Warning (Attention)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span className="text-slate-400">Alarm (Problem)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-slate-400">Critical (Angry)</span>
                    </div>
                </div>
            </div>

            {/* Timestamp */}
            <div className="mt-4 text-center text-xs text-slate-500">
                Last updated: {healthMap.timestamp.toLocaleString()}
            </div>
        </div>
    );
}

/**
 * Compact version for sidebar or dashboard
 */
export function GlobalHealthMapMini({ healthMap }: { healthMap: GlobalHealthMap }) {
    const getOverallColor = () => {
        switch (healthMap.overallHealth) {
            case 'HEALTHY': return 'text-emerald-400';
            case 'DEGRADED': return 'text-yellow-400';
            case 'CRITICAL': return 'text-red-400';
        }
    };

    return (
        <div className="bg-slate-800/30 border border-slate-700 rounded p-3">
            <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-slate-400">STATION HEALTH</div>
                <div className={`text-sm font-bold ${getOverallColor()}`}>
                    {healthMap.overallHealth}
                </div>
            </div>

            <div className="flex gap-2">
                <div className="flex-1 bg-emerald-500/20 rounded p-2 text-center">
                    <div className="text-lg font-bold text-emerald-400">{healthMap.healthySystems}</div>
                    <div className="text-[10px] text-emerald-400/70">OK</div>
                </div>
                <div className="flex-1 bg-yellow-500/20 rounded p-2 text-center">
                    <div className="text-lg font-bold text-yellow-400">{healthMap.degradedSystems}</div>
                    <div className="text-[10px] text-yellow-400/70">WARN</div>
                </div>
                <div className="flex-1 bg-red-500/20 rounded p-2 text-center">
                    <div className="text-lg font-bold text-red-400">{healthMap.criticalSystems}</div>
                    <div className="text-[10px] text-red-400/70">CRIT</div>
                </div>
            </div>

            {healthMap.mostUrgent && (
                <div className="mt-2 pt-2 border-t border-slate-700">
                    <div className="text-[10px] text-slate-500 mb-1">MOST URGENT:</div>
                    <div className="text-xs font-semibold text-white truncate">
                        {healthMap.mostUrgent.systemName}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                        Priority: {healthMap.mostUrgent.priorityScore.toFixed(0)}/100
                    </div>
                </div>
            )}
        </div>
    );
}
