import React from 'react';
import { Home, Leaf, Zap, Shield } from 'lucide-react';

interface FoundationOverviewProps {
    structural: {
        safetyFactor: number;
        status: 'SAFE' | 'MONITORING' | 'WARNING' | 'CRITICAL';
        upliftPressure: number;
        seismicActivity: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH';
    };
    environmental: {
        complianceScore: number; // %
        status: 'COMPLIANT' | 'WARNING' | 'VIOLATION';
        eflowCompliance: number; // %
        doCompliance: number; // %
        currentDO: number; // mg/L
    };
    electrical: {
        gridHealth: 'HEALTHY' | 'MONITORING' | 'WARNING' | 'CRITICAL';
        transformerStatus: 'NORMAL' | 'THERMAL_FAULT' | 'PARTIAL_DISCHARGE' | 'ARCING' | 'CRITICAL';
        relayAlarms: number;
        hotspotCount: number;
    };
}

export const FoundationOverview: React.FC<FoundationOverviewProps> = ({ structural, environmental, electrical }) => {
    // Calculate overall foundation health
    const getOverallStatus = (): 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL' => {
        if (
            structural.status === 'CRITICAL' ||
            environmental.status === 'VIOLATION' ||
            electrical.gridHealth === 'CRITICAL'
        ) {
            return 'CRITICAL';
        } else if (
            structural.status === 'WARNING' ||
            environmental.status === 'WARNING' ||
            electrical.gridHealth === 'WARNING'
        ) {
            return 'WARNING';
        } else if (
            structural.status === 'MONITORING' ||
            electrical.gridHealth === 'MONITORING'
        ) {
            return 'GOOD';
        } else {
            return 'EXCELLENT';
        }
    };

    const overallStatus = getOverallStatus();

    return (
        <div className="w-full bg-slate-950 p-6">
            <div className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-purple-400" />
                Triple Foundation Overview
            </div>

            {/* Overall Status Banner */}
            <div className={`mb-6 p-6 rounded-lg border-2 ${overallStatus === 'EXCELLENT' ? 'bg-emerald-950 border-emerald-500' :
                    overallStatus === 'GOOD' ? 'bg-blue-950 border-blue-500' :
                        overallStatus === 'WARNING' ? 'bg-amber-950 border-amber-500' :
                            'bg-red-950 border-red-500'
                }`}>
                <div className="text-center">
                    <div className="text-sm text-slate-400 mb-2">Overall Foundation Health</div>
                    <div className={`text-5xl font-bold ${overallStatus === 'EXCELLENT' ? 'text-emerald-300' :
                            overallStatus === 'GOOD' ? 'text-blue-300' :
                                overallStatus === 'WARNING' ? 'text-amber-300' :
                                    'text-red-300'
                        }`}>
                        {overallStatus}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* 1. Structural Safety */}
                <div className={`bg-slate-900 border-2 rounded-lg p-6 ${structural.status === 'SAFE' ? 'border-emerald-500' :
                        structural.status === 'MONITORING' ? 'border-blue-500' :
                            structural.status === 'WARNING' ? 'border-amber-500' :
                                'border-red-500'
                    }`}>
                    <div className="flex items-center gap-2 mb-4">
                        <Home className={`w-6 h-6 ${structural.status === 'SAFE' ? 'text-emerald-400' :
                                structural.status === 'MONITORING' ? 'text-blue-400' :
                                    structural.status === 'WARNING' ? 'text-amber-400' :
                                        'text-red-400'
                            }`} />
                        <div className="text-lg font-bold text-white">Structural Safety</div>
                    </div>

                    <div className="space-y-4">
                        <div className="text-center mb-4">
                            <div className="text-xs text-slate-400 mb-1">Safety Factor</div>
                            <div className={`text-4xl font-bold font-mono ${structural.safetyFactor >= 1.5 ? 'text-emerald-300' :
                                    structural.safetyFactor >= 1.2 ? 'text-amber-300' :
                                        'text-red-300'
                                }`}>
                                {structural.safetyFactor.toFixed(2)}
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Uplift Pressure</div>
                            <div className="text-xl font-mono text-cyan-300">
                                {structural.upliftPressure.toFixed(2)} bar
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Seismic Activity</div>
                            <div className={`text-lg font-bold ${structural.seismicActivity === 'NONE' ? 'text-emerald-400' :
                                    structural.seismicActivity === 'LOW' ? 'text-blue-400' :
                                        structural.seismicActivity === 'MODERATE' ? 'text-amber-400' :
                                            'text-red-400'
                                }`}>
                                {structural.seismicActivity}
                            </div>
                        </div>

                        <div className={`p-2 rounded text-center text-sm font-bold ${structural.status === 'SAFE' ? 'bg-emerald-950 text-emerald-300' :
                                structural.status === 'MONITORING' ? 'bg-blue-950 text-blue-300' :
                                    structural.status === 'WARNING' ? 'bg-amber-950 text-amber-300' :
                                        'bg-red-950 text-red-300'
                            }`}>
                            {structural.status}
                        </div>
                    </div>
                </div>

                {/* 2. Environmental Compliance */}
                <div className={`bg-slate-900 border-2 rounded-lg p-6 ${environmental.status === 'COMPLIANT' ? 'border-emerald-500' :
                        environmental.status === 'WARNING' ? 'border-amber-500' :
                            'border-red-500'
                    }`}>
                    <div className="flex items-center gap-2 mb-4">
                        <Leaf className={`w-6 h-6 ${environmental.status === 'COMPLIANT' ? 'text-emerald-400' :
                                environmental.status === 'WARNING' ? 'text-amber-400' :
                                    'text-red-400'
                            }`} />
                        <div className="text-lg font-bold text-white">Environmental Compliance</div>
                    </div>

                    <div className="space-y-4">
                        <div className="text-center mb-4">
                            <div className="text-xs text-slate-400 mb-1">Compliance Score</div>
                            <div className={`text-4xl font-bold font-mono ${environmental.complianceScore >= 95 ? 'text-emerald-300' :
                                    environmental.complianceScore >= 85 ? 'text-amber-300' :
                                        'text-red-300'
                                }`}>
                                {environmental.complianceScore.toFixed(0)}%
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">E-flow Compliance</div>
                            <div className="text-xl font-mono text-blue-300">
                                {environmental.eflowCompliance.toFixed(0)}%
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">DO Compliance</div>
                            <div className="text-xl font-mono text-cyan-300">
                                {environmental.doCompliance.toFixed(0)}%
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Current DO</div>
                            <div className={`text-xl font-mono ${environmental.currentDO >= 5 ? 'text-emerald-400' : 'text-red-400'
                                }`}>
                                {environmental.currentDO.toFixed(1)} mg/L
                            </div>
                        </div>

                        <div className={`p-2 rounded text-center text-sm font-bold ${environmental.status === 'COMPLIANT' ? 'bg-emerald-950 text-emerald-300' :
                                environmental.status === 'WARNING' ? 'bg-amber-950 text-amber-300' :
                                    'bg-red-950 text-red-300'
                            }`}>
                            {environmental.status}
                        </div>
                    </div>
                </div>

                {/* 3. Grid Connection Integrity */}
                <div className={`bg-slate-900 border-2 rounded-lg p-6 ${electrical.gridHealth === 'HEALTHY' ? 'border-emerald-500' :
                        electrical.gridHealth === 'MONITORING' ? 'border-blue-500' :
                            electrical.gridHealth === 'WARNING' ? 'border-amber-500' :
                                'border-red-500'
                    }`}>
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className={`w-6 h-6 ${electrical.gridHealth === 'HEALTHY' ? 'text-emerald-400' :
                                electrical.gridHealth === 'MONITORING' ? 'text-blue-400' :
                                    electrical.gridHealth === 'WARNING' ? 'text-amber-400' :
                                        'text-red-400'
                            }`} />
                        <div className="text-lg font-bold text-white">Grid Connection</div>
                    </div>

                    <div className="space-y-4">
                        <div className="text-center mb-4">
                            <div className="text-xs text-slate-400 mb-1">Transformer Status</div>
                            <div className={`text-2xl font-bold ${electrical.transformerStatus === 'NORMAL' ? 'text-emerald-300' :
                                    electrical.transformerStatus === 'PARTIAL_DISCHARGE' ? 'text-blue-300' :
                                        electrical.transformerStatus === 'THERMAL_FAULT' ? 'text-amber-300' :
                                            'text-red-300'
                                }`}>
                                {electrical.transformerStatus}
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Protection Relays</div>
                            <div className={`text-xl font-mono ${electrical.relayAlarms === 0 ? 'text-emerald-400' : 'text-red-400'
                                }`}>
                                {electrical.relayAlarms} Alarms
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded p-3">
                            <div className="text-xs text-slate-400 mb-1">Hotspots Detected</div>
                            <div className={`text-xl font-mono ${electrical.hotspotCount === 0 ? 'text-emerald-400' :
                                    electrical.hotspotCount < 3 ? 'text-amber-400' : 'text-red-400'
                                }`}>
                                {electrical.hotspotCount}
                            </div>
                        </div>

                        <div className={`p-2 rounded text-center text-sm font-bold ${electrical.gridHealth === 'HEALTHY' ? 'bg-emerald-950 text-emerald-300' :
                                electrical.gridHealth === 'MONITORING' ? 'bg-blue-950 text-blue-300' :
                                    electrical.gridHealth === 'WARNING' ? 'bg-amber-950 text-amber-300' :
                                        'bg-red-950 text-red-300'
                            }`}>
                            {electrical.gridHealth}
                        </div>
                    </div>
                </div>
            </div>

            {/* Foundation Integrity Summary */}
            <div className="mt-6 p-4 bg-slate-900 border border-purple-500 rounded-lg">
                <div className="text-sm font-bold text-purple-300 mb-2">Foundation Integrity Summary</div>
                <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                        <span className="text-slate-400">Physical:</span>
                        <span className={`ml-2 font-bold ${structural.status === 'SAFE' ? 'text-emerald-400' : 'text-amber-400'
                            }`}>
                            {structural.status}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-400">Legal:</span>
                        <span className={`ml-2 font-bold ${environmental.status === 'COMPLIANT' ? 'text-emerald-400' : 'text-amber-400'
                            }`}>
                            {environmental.status}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-400">Electrical:</span>
                        <span className={`ml-2 font-bold ${electrical.gridHealth === 'HEALTHY' ? 'text-emerald-400' : 'text-amber-400'
                            }`}>
                            {electrical.gridHealth}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
