// Strategic Planning Dashboard
// Pre-construction consulting & Procurement interface

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Truck, FileCheck, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { StrategicPlanningService, SiteParameters, Bid, REGULATORY_STEPS } from '../services/StrategicPlanningService';

export const StrategicPlanningDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'FEASIBILITY' | 'BIDS' | 'REGULATORY' | 'LOGISTICS'>('FEASIBILITY');

    // Mock Data State
    const [siteParams, setSiteParams] = useState<SiteParameters>({
        grossHead: 45, // m
        pipeLength: 1200, // m
        pipeDiameter: 1600, // mm
        pipeMaterial: 'GRP',
        waterQuality: 'CLEAN',
        ecologicalFlow: 0.5,
        flowDurationCurve: [
            { flow: 15, probability: 0 },
            { flow: 12, probability: 20 },
            { flow: 8, probability: 50 },
            { flow: 4, probability: 80 },
            { flow: 1, probability: 100 }
        ]
    });

    const [mockBid] = useState<Bid>({
        manufacturer: 'HydroTech Global',
        turbineType: 'kaplan',
        ratedPowerMW: 3.5,
        efficiencyAtBestPoint: 94.2,
        runnerDiameter: 2200,
        price: 2800000,
        guaranteedIncluded: true
    });

    // Calculations
    const feasibility = StrategicPlanningService.calculateFeasibility(siteParams);
    const bidEval = StrategicPlanningService.evaluateBid(mockBid, siteParams);

    return (
        <div className="min-h-screen p-6 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-black uppercase text-white tracking-tighter">
                    Strategic <span className="text-cyan-400">Planning</span>
                </h1>
                <p className="text-slate-400">Pre-construction Consulting & Procurement Engine</p>
            </div>

            {/* Navigation */}
            <div className="flex gap-4 mb-6 border-b border-slate-700 pb-1">
                <TabButton icon={Calculator} label="Hydraulic Feasibility" active={activeTab === 'FEASIBILITY'} onClick={() => setActiveTab('FEASIBILITY')} />
                <TabButton icon={DollarSign} label="Bid Evaluator" active={activeTab === 'BIDS'} onClick={() => setActiveTab('BIDS')} />
                <TabButton icon={FileCheck} label="Regulatory Roadmap" active={activeTab === 'REGULATORY'} onClick={() => setActiveTab('REGULATORY')} />
                <TabButton icon={Truck} label="Logistics" active={activeTab === 'LOGISTICS'} onClick={() => setActiveTab('LOGISTICS')} />
            </div>

            {/* CONTENT AREA */}
            <div className="grid grid-cols-12 gap-6">

                {/* === FEASIBILITY TAB === */}
                {activeTab === 'FEASIBILITY' && (
                    <>
                        <div className="col-span-12 lg:col-span-4 space-y-4">
                            <GlassCard className="p-6">
                                <h3 className="text-sm font-bold text-white uppercase mb-4">Site Parameters</h3>
                                <div className="space-y-3">
                                    <InputRow label="Gross Head (m)" value={siteParams.grossHead} unit="m" />
                                    <InputRow label="Pipe Length (m)" value={siteParams.pipeLength} unit="m" />
                                    <InputRow label="Diameter (mm)" value={siteParams.pipeDiameter} unit="mm" />
                                    <InputRow label="Eco Flow (m³/s)" value={siteParams.ecologicalFlow} unit="m³/s" />
                                </div>
                            </GlassCard>

                            <GlassCard className="p-6 bg-emerald-950/20 border-emerald-500/30">
                                <h3 className="text-sm font-bold text-emerald-400 uppercase mb-2">AI Recommendation</h3>
                                <div className="text-2xl font-black text-white mb-1">
                                    {feasibility.recommendedAggregates.count}x {feasibility.recommendedAggregates.type}
                                </div>
                                <p className="text-xs text-slate-300">
                                    {feasibility.recommendedAggregates.reasoning}
                                </p>
                            </GlassCard>
                        </div>

                        <div className="col-span-12 lg:col-span-8">
                            <GlassCard className="p-6 mb-4">
                                <h3 className="text-lg font-bold text-white mb-6">Hydraulic Calculation Results</h3>
                                <div className="grid grid-cols-3 gap-6 text-center">
                                    <MetricBox
                                        label="Net Head"
                                        value={feasibility.netHead.toFixed(2)}
                                        unit="m"
                                        subtext={`Loss: ${feasibility.frictionLoss.toFixed(2)}m (${((feasibility.frictionLoss / siteParams.grossHead) * 100).toFixed(1)}%)`}
                                    />
                                    <MetricBox
                                        label="Design Flow"
                                        value={feasibility.optimalFlow.toFixed(2)}
                                        unit="m³/s"
                                    />
                                    <MetricBox
                                        label="Annual Production"
                                        value={feasibility.annualProductionMWh.toFixed(0)}
                                        unit="MWh/yr"
                                        highlight
                                    />
                                </div>
                            </GlassCard>

                            {/* Flow Duration Curve Viz Placeholder */}
                            <GlassCard className="p-6 h-64 flex items-center justify-center bg-black/20">
                                <p className="text-slate-500 italic">Flow Duration Curve Visualization would go here</p>
                            </GlassCard>
                        </div>
                    </>
                )}

                {/* === BID EVALUATOR TAB === */}
                {activeTab === 'BIDS' && (
                    <>
                        <div className="col-span-12 lg:col-span-6">
                            <GlassCard className="p-6">
                                <h3 className="text-white font-bold mb-4">Manufacturer Offer</h3>
                                <div className="space-y-4 p-4 bg-slate-800/50 rounded-lg">
                                    <div className="flex justify-between"><span>Manufacturer:</span> <span className="font-bold text-white">{mockBid.manufacturer}</span></div>
                                    <div className="flex justify-between"><span>Type:</span> <span className="font-bold text-white uppercase">{mockBid.turbineType}</span></div>
                                    <div className="flex justify-between"><span>Efficiency:</span> <span className="font-bold text-white">{mockBid.efficiencyAtBestPoint}%</span></div>
                                    <div className="flex justify-between"><span>Price:</span> <span className="font-bold text-white">{mockBid.price.toLocaleString()} €</span></div>
                                </div>
                            </GlassCard>
                        </div>

                        <div className="col-span-12 lg:col-span-6">
                            <GlassCard className={`p-6 border-2 ${bidEval.score > 80 ? 'border-emerald-500' : 'border-amber-500'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-black uppercase text-white">AI Cross-Check</h3>
                                    <div className={`px-3 py-1 rounded font-bold text-xs ${bidEval.score > 80 ? 'bg-emerald-500 text-black' : 'bg-amber-500 text-black'}`}>
                                        SCORE: {bidEval.score}/100
                                    </div>
                                </div>

                                <div className="text-center py-4 mb-4">
                                    <div className="text-sm text-slate-400 uppercase font-bold">Recommendation</div>
                                    <div className={`text-4xl font-black ${bidEval.recommendation === 'SHORTLIST' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {bidEval.recommendation}
                                    </div>
                                </div>

                                {bidEval.risks.length > 0 && (
                                    <div className="space-y-2 mt-4">
                                        <div className="text-xs text-red-400 font-bold uppercase">Detected Risks</div>
                                        {bidEval.risks.map((risk, i) => (
                                            <div key={i} className="flex gap-2 items-start p-2 bg-red-950/20 rounded">
                                                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                                <p className="text-xs text-slate-300">{risk}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </GlassCard>
                        </div>
                    </>
                )}

                {/* === REGULATORY TAB === */}
                {activeTab === 'REGULATORY' && (
                    <div className="col-span-12">
                        <GlassCard className="p-8">
                            <h3 className="text-xl font-bold text-white mb-8 text-center">Project Regulatory Roadmap (Balkan Region)</h3>
                            <div className="relative">
                                {/* Timeline Line */}
                                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-700 -translate-y-1/2 z-0"></div>

                                <div className="flex justify-between relative z-10">
                                    {REGULATORY_STEPS.map((step, i) => (
                                        <div key={step.id} className="flex flex-col items-center group">
                                            <motion.div
                                                whileHover={{ scale: 1.1 }}
                                                className={`w-12 h-12 rounded-full border-4 flex items-center justify-center bg-slate-900 ${i < 2 ? 'border-emerald-500 text-emerald-500' : 'border-slate-600 text-slate-600'}`}
                                            >
                                                <span className="font-bold">{i + 1}</span>
                                            </motion.div>
                                            <div className="mt-4 text-center w-32">
                                                <p className={`text-sm font-bold ${i < 2 ? 'text-white' : 'text-slate-500'}`}>{step.name}</p>
                                                <p className="text-xs text-slate-500">{step.durationMonths} months</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-12 p-4 bg-amber-950/20 border border-amber-500/30 rounded flex items-center gap-3">
                                <AlertTriangle className="text-amber-400" />
                                <div>
                                    <p className="text-white font-bold text-sm">Inventory Block Active</p>
                                    <p className="text-slate-400 text-xs">Turbine orders are blocked until "Građevinska Dozvola" status is GREEN.</p>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper Components
const TabButton = ({ icon: Icon, label, active, onClick }: any) => (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${active ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-500 hover:text-white'}`}>
        <Icon className="w-4 h-4" />
        <span className="font-bold text-sm uppercase">{label}</span>
    </button>
);

const InputRow = ({ label, value, unit }: any) => (
    <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
        <span className="text-sm text-slate-400">{label}</span>
        <span className="text-sm font-bold text-white">{value} <span className="text-xs text-slate-500">{unit}</span></span>
    </div>
);

const MetricBox = ({ label, value, unit, subtext, highlight }: any) => (
    <div className={`p-4 rounded-lg border ${highlight ? 'border-cyan-500 bg-cyan-950/20' : 'border-slate-700 bg-slate-800/30'}`}>
        <div className="text-xs text-slate-400 uppercase font-bold mb-1">{label}</div>
        <div className="text-2xl font-black text-white">{value}</div>
        <div className="text-xs text-slate-500">{unit}</div>
        {subtext && <div className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-700/50">{subtext}</div>}
    </div>
);
