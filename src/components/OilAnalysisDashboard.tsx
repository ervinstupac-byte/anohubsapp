// Oil Analysis Dashboard - Chemical Fingerprinting UI
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplet, AlertTriangle, CheckCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { OilAnalysisService, OilSample } from '../services/OilAnalysisService';

export const OilAnalysisDashboard: React.FC = () => {
    const [currentSample, setCurrentSample] = useState<OilSample>({
        sampleId: 'OIL-2025-001',
        timestamp: Date.now(),
        assetId: 'KAPLAN-001',
        location: 'BEARING_UPPER',
        viscosityIndex: 52,
        tan: 0.8,
        dielectricConstant: 2.3,
        waterContent: 180,
        particleCount: {
            size_4um: 2500,
            size_6um: 1200,
            size_14um: 320
        },
        metalContent: {
            iron: 35,
            copper: 12,
            lead: 8,
            tin: 15,
            aluminum: 5,
            chromium: 3
        }
    });

    const baseline: OilSample = {
        ...currentSample,
        timestamp: Date.now() - 6 * 30 * 24 * 60 * 60 * 1000, // 6 months ago
        viscosityIndex: 58,
        tan: 0.4,
        metalContent: { iron: 15, copper: 5, lead: 3, tin: 4, aluminum: 2, chromium: 1 }
    };

    const analysis = OilAnalysisService.analyzeOilSample(currentSample, baseline);
    const babbittTotal = currentSample.metalContent.tin + currentSample.metalContent.lead + currentSample.metalContent.copper;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">
                    <span className="text-white">Oil Analysis</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 ml-2">
                        Dashboard
                    </span>
                </h2>
                <p className="text-sm text-slate-400">
                    Chemical fingerprinting - Bearing Upper ({currentSample.sampleId})
                </p>
            </div>

            {/* Overall Health Card */}
            <GlassCard className={`p-6 border-2 ${analysis.overallHealth === 'EXCELLENT' ? 'border-emerald-500 bg-emerald-950/20' :
                analysis.overallHealth === 'GOOD' ? 'border-green-500 bg-green-950/20' :
                    analysis.overallHealth === 'FAIR' ? 'border-amber-500 bg-amber-950/20' :
                        analysis.overallHealth === 'POOR' ? 'border-orange-500 bg-orange-950/20' :
                            'border-red-500 bg-red-950/20'
                }`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-400 uppercase font-bold mb-1">Oil Health Status</p>
                        <p className="text-4xl font-black text-white">{analysis.overallHealth}</p>
                        <p className="text-sm text-slate-400 mt-1">
                            Estimated oil life: {(analysis.predictedOilLife / 730).toFixed(0)} months
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="relative w-24 h-24">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="40"
                                    stroke="#334155"
                                    strokeWidth="8"
                                    fill="none"
                                />
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="40"
                                    stroke={analysis.healthScore >= 70 ? '#10b981' : analysis.healthScore >= 50 ? '#f59e0b' : '#ef4444'}
                                    strokeWidth="8"
                                    fill="none"
                                    strokeDasharray={`${(analysis.healthScore / 100) * 251.2} 251.2`}
                                    className="transition-all duration-1000"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-black text-white">{analysis.healthScore}</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Health Score</p>
                    </div>
                </div>
            </GlassCard>

            {/* Chemical Parameters Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ChemicalParameter
                    label="Viscosity Index"
                    value={currentSample.viscosityIndex}
                    unit="cSt @ 40°C"
                    baseline={baseline.viscosityIndex}
                    standard={46}
                    icon={Droplet}
                    dangerIfBelow={40}
                />
                <ChemicalParameter
                    label="TAN"
                    value={currentSample.tan}
                    unit="mg KOH/g"
                    baseline={baseline.tan}
                    standard={0.5}
                    icon={AlertTriangle}
                    dangerIfAbove={2.0}
                />
                <ChemicalParameter
                    label="Dielectric Const."
                    value={currentSample.dielectricConstant}
                    unit=""
                    baseline={2.1}
                    standard={2.2}
                    icon={Droplet}
                    dangerIfAbove={2.5}
                />
                <ChemicalParameter
                    label="Water Content"
                    value={currentSample.waterContent}
                    unit="ppm"
                    baseline={50}
                    standard={200}
                    icon={Droplet}
                    dangerIfAbove={200}
                />
            </div>

            {/* Metal Content Chart */}
            <GlassCard className="p-6">
                <h3 className="text-lg font-black text-white mb-4">Metal Content (Wear Indicators)</h3>
                <div className="space-y-3">
                    <MetalBar label="Iron (Fe)" value={currentSample.metalContent.iron} max={150} critical={100} color="slate" />
                    <MetalBar label="Babbitt Total (Sn+Pb+Cu)" value={babbittTotal} max={100} critical={50} color="amber" />
                    <MetalBar label="Copper (Cu)" value={currentSample.metalContent.copper} max={50} critical={30} color="orange" />
                    <MetalBar label="Lead (Pb)" value={currentSample.metalContent.lead} max={50} critical={30} color="red" />
                    <MetalBar label="Tin (Sn)" value={currentSample.metalContent.tin} max={50} critical={30} color="yellow" />
                </div>
            </GlassCard>

            {/* AI Findings */}
            <GlassCard className="p-6">
                <h3 className="text-lg font-black text-white mb-4">🧪 Lab Analysis Findings</h3>
                <div className="space-y-3">
                    {analysis.findings.length === 0 ? (
                        <div className="text-center py-6">
                            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-emerald-400" />
                            <p className="text-emerald-300 font-bold">No issues detected</p>
                            <p className="text-xs text-slate-400">Oil in excellent condition</p>
                        </div>
                    ) : (
                        analysis.findings.map((finding, index) => (
                            <FindingCard key={index} finding={finding} />
                        ))
                    )}
                </div>
            </GlassCard>
        </div>
    );
};

// Helper Components
const ChemicalParameter: React.FC<{
    label: string;
    value: number;
    unit: string;
    baseline: number;
    standard: number;
    icon: React.ComponentType<any>;
    dangerIfAbove?: number;
    dangerIfBelow?: number;
}> = ({ label, value, unit, baseline, standard, icon: Icon, dangerIfAbove, dangerIfBelow }) => {
    const isDanger = (dangerIfAbove && value > dangerIfAbove) || (dangerIfBelow && value < dangerIfBelow);
    const change = ((value - baseline) / baseline) * 100;

    return (
        <GlassCard className={`p-4 ${isDanger ? 'border-2 border-red-500 bg-red-950/20' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${isDanger ? 'text-red-400' : 'text-amber-400'}`} />
                <p className="text-xs text-slate-400 uppercase font-bold">{label}</p>
            </div>
            <p className="text-2xl font-black text-white">{value.toFixed(value < 10 ? 2 : 1)}</p>
            <p className="text-xs text-slate-500">{unit}</p>
            <div className="flex items-center gap-1 mt-2">
                {change > 0 ? <TrendingUp className="w-3 h-3 text-red-400" /> : <TrendingDown className="w-3 h-3 text-emerald-400" />}
                <span className={`text-xs font-bold ${change > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {change > 0 ? '+' : ''}{change.toFixed(0)}%
                </span>
            </div>
        </GlassCard>
    );
};

const MetalBar: React.FC<{
    label: string;
    value: number;
    max: number;
    critical: number;
    color: string;
}> = ({ label, value, max, critical, color }) => {
    const percentage = Math.min((value / max) * 100, 100);
    const isCritical = value > critical;

    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-300">{label}</span>
                <span className={`text-xs font-bold ${isCritical ? 'text-red-400' : 'text-white'}`}>
                    {value} ppm {isCritical && '⚠️'}
                </span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden relative">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    className={`h-full ${isCritical ? 'bg-red-500' : `bg-${color}-500`}`}
                />
                {/* Critical threshold line */}
                <div
                    className="absolute top-0 h-full w-0.5 bg-amber-400"
                    style={{ left: `${(critical / max) * 100}%` }}
                />
            </div>
        </div>
    );
};

const FindingCard: React.FC<{ finding: any }> = ({ finding }) => {
    const severityColors = {
        CRITICAL: 'border-red-500 bg-red-950/20 text-red-300',
        WARNING: 'border-amber-500 bg-amber-950/20 text-amber-300',
        INFO: 'border-blue-500 bg-blue-950/20 text-blue-300'
    };

    return (
        <div className={`p-4 rounded-lg border ${severityColors[finding.severity as keyof typeof severityColors]}`}>
            <div className="flex items-start gap-2 mb-2">
                <span className="text-xs font-bold px-2 py-1 rounded bg-black/30">
                    {finding.category}
                </span>
                <p className="text-sm font-bold flex-1">{finding.message}</p>
            </div>
            <p className="text-xs opacity-80 ml-2">💡 {finding.recommendation}</p>
        </div>
    );
};
