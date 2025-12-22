/**
 * Executive Command Bridge Dashboard
 * Unified real-time dashboard integrating ALL AnoHUB modules
 */

import React, { useState, useMemo } from 'react';
import { useProjectEngine } from '../../contexts/ProjectContext';
import { ExpertDiagnosisEngine } from '../../services/ExpertDiagnosisEngine';
import { HPPHealthDial } from './HPPHealthDial';
import { FinancialRiskTicker, calculateFinancialRisk } from './FinancialRiskTicker';
import { ServiceCountdown, ServiceItem } from './ServiceCountdown';

type ViewMode = 'ENGINEERING' | 'EXECUTIVE';

export const ExecutiveDashboard: React.FC = () => {
    const {
        technicalState,
        aiDiagnosis,
        financials
    } = useProjectEngine();

    const [viewMode, setViewMode] = useState<ViewMode>('EXECUTIVE');

    // Real-time Health Score calculation
    const healthScore = useMemo(() => {
        if (!technicalState.assetIdentity) {
            return {
                overall: 100,
                breakdown: {
                    thermal: 100,
                    mechanical: 100,
                    hydraulic: 100,
                    sensory: 100
                }
            };
        }

        const diagnostics = ExpertDiagnosisEngine.runDiagnostics(
            technicalState.assetIdentity,
            technicalState.site.temperature,
            'OIL',  // Default lubrication
            50      // Default rotor weight
        );

        return ExpertDiagnosisEngine.calculateHealthScore(diagnostics);
    }, [technicalState.assetIdentity, technicalState.site.temperature]);

    // Real-time Financial Risk calculation
    const financialRisk = useMemo(() => {
        const criticalFindingsCount = technicalState.aiDiagnosis.findings.filter(
            f => f.severity === 'CRITICAL'
        ).length;

        return calculateFinancialRisk(
            healthScore.overall,
            criticalFindingsCount,
            technicalState.financials.electricityPriceEURperMWh,
            10  // Rated power MW - should come from asset identity
        );
    }, [
        healthScore.overall,
        technicalState.aiDiagnosis.findings,
        technicalState.financials.electricityPriceEURperMWh
    ]);

    // Real-time Service Items from Oil Life Clock
    const serviceItems: ServiceItem[] = useMemo(() => {
        if (!technicalState.assetIdentity?.fluidIntelligence) {
            return [];
        }

        const items: ServiceItem[] = [];
        const fluid = technicalState.assetIdentity.fluidIntelligence;

        // Oil Change countdown
        if (fluid.oilSystem) {
            const hoursRemaining = fluid.oilSystem.changeIntervalHours - fluid.oilSystem.currentHours;
            items.push({
                name: 'Oil Change',
                hoursRemaining: Math.max(0, hoursRemaining),
                maxHours: fluid.oilSystem.changeIntervalHours,
                urgency: hoursRemaining < 200 ? 'CRITICAL'
                    : hoursRemaining < 500 ? 'HIGH'
                        : hoursRemaining < 1000 ? 'MEDIUM'
                            : 'LOW'
            });
        }

        // Filter replacement countdown
        if (fluid.filterSystem) {
            const deltaPPercent = (fluid.filterSystem.deltaPBar / fluid.filterSystem.deltaPAlarmBar) * 100;
            const estimatedHoursRemaining = Math.round((100 - deltaPPercent) * 20); // Rough estimate

            items.push({
                name: 'Filter Replacement',
                hoursRemaining: Math.max(0, estimatedHoursRemaining),
                maxHours: 2000,
                urgency: fluid.filterSystem.filterClogged ? 'CRITICAL'
                    : deltaPPercent > 80 ? 'HIGH'
                        : deltaPPercent > 60 ? 'MEDIUM'
                            : 'LOW'
            });
        }

        return items;
    }, [technicalState.assetIdentity]);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-[#2dd4bf] via-emerald-400 to-blue-500 bg-clip-text text-transparent">
                    Command Bridge
                </h1>
                <p className="text-slate-400 text-lg">
                    Real-time asset health monitoring and predictive analytics
                </p>
            </div>

            {/* View Switcher */}
            <div className="mb-8">
                <div className="flex gap-2 bg-slate-900 border border-slate-700 rounded-lg p-1 max-w-md">
                    <button
                        onClick={() => setViewMode('ENGINEERING')}
                        className={`flex-1 py-3 px-6 rounded font-bold transition-all ${viewMode === 'ENGINEERING'
                                ? 'bg-[#2dd4bf] text-black shadow-lg shadow-[#2dd4bf]/30'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        🔧 Engineering View
                    </button>
                    <button
                        onClick={() => setViewMode('EXECUTIVE')}
                        className={`flex-1 py-3 px-6 rounded font-bold transition-all ${viewMode === 'EXECUTIVE'
                                ? 'bg-[#2dd4bf] text-black shadow-lg shadow-[#2dd4bf]/30'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        💼 Executive View
                    </button>
                </div>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-12 gap-6">
                {/* Health Dial - Always visible */}
                <div className="col-span-12 lg:col-span-4">
                    <HPPHealthDial
                        healthScore={healthScore.overall}
                        breakdown={healthScore.breakdown}
                    />
                </div>

                {/* Financial Risk - Executive View Only */}
                {viewMode === 'EXECUTIVE' && (
                    <div className="col-span-12 lg:col-span-8">
                        <FinancialRiskTicker risk={financialRisk} />
                    </div>
                )}

                {/* Engineering Details - Engineering View Only */}
                {viewMode === 'ENGINEERING' && technicalState.assetIdentity && (
                    <div className="col-span-12 lg:col-span-8">
                        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Technical Parameters</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <div className="text-slate-400">Orientation</div>
                                    <div className="text-white font-mono">
                                        {technicalState.assetIdentity.machineConfig.orientation}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-slate-400">Transmission</div>
                                    <div className="text-white font-mono">
                                        {technicalState.assetIdentity.machineConfig.transmissionType}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-slate-400">Rated Power</div>
                                    <div className="text-white font-mono">
                                        {technicalState.assetIdentity.machineConfig.ratedPowerMW} MW
                                    </div>
                                </div>
                                <div>
                                    <div className="text-slate-400">Lubrication</div>
                                    <div className="text-white font-mono">
                                        {technicalState.assetIdentity.machineConfig.lubricationType}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Service Countdown */}
                <div className="col-span-12 lg:col-span-5">
                    <ServiceCountdown items={serviceItems} />
                </div>

                {/* AI Findings Summary */}
                <div className="col-span-12 lg:col-span-7">
                    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">AI Analysis Summary</h3>
                            {technicalState.aiDiagnosis.unverifiedCount > 0 && (
                                <span className="px-3 py-1 bg-yellow-950/30 border border-yellow-500/30 rounded text-yellow-400 text-sm font-bold">
                                    {technicalState.aiDiagnosis.unverifiedCount} Needs Verification
                                </span>
                            )}
                        </div>

                        {technicalState.aiDiagnosis.findings.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                <span className="text-4xl mb-2 block">✨</span>
                                <p>No AI findings yet. System is monitoring.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {technicalState.aiDiagnosis.findings.slice(0, 3).map((finding) => (
                                    <div
                                        key={finding.id}
                                        className="bg-slate-800 border border-slate-600 rounded p-4"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">🤖</span>
                                                <span className="font-bold text-white">{finding.analysisType}</span>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${finding.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400'
                                                    : finding.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400'
                                                        : finding.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400'
                                                            : 'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                {finding.severity}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-300 line-clamp-2">
                                            {finding.aiDiagnosis}
                                        </p>
                                        <div className="mt-2 text-xs text-slate-400">
                                            Confidence: {finding.confidenceScore}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Stats */}
            <div className="mt-8 grid grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                    <div className="text-slate-400 text-sm mb-1">Total Measurements</div>
                    <div className="text-2xl font-bold text-[#2dd4bf]">
                        {technicalState.maintenanceHistory.measurements.size}
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                    <div className="text-slate-400 text-sm mb-1">Precision Logs</div>
                    <div className="text-2xl font-bold text-[#2dd4bf]">
                        {technicalState.maintenanceHistory.engineeringLog.measurements.length}
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                    <div className="text-slate-400 text-sm mb-1">AI Findings</div>
                    <div className="text-2xl font-bold text-[#2dd4bf]">
                        {technicalState.aiDiagnosis.findings.length}
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                    <div className="text-slate-400 text-sm mb-1">System Uptime</div>
                    <div className="text-2xl font-bold text-emerald-400">
                        {technicalState.financials.targetAvailability}%
                    </div>
                </div>
            </div>
        </div>
    );
};
