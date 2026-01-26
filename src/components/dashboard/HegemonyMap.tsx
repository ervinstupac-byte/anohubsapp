import React from 'react';
import { Crown, TrendingUp, Zap, Trophy } from 'lucide-react';

interface HegemonyMapProps {
    plantData: {
        plantName: string;
        currentOutput: number; // MW
        capacity: number; // MW
        marketShare: number; // % of basin
        position: number; // Rank (1 = leader)
    };
    basinData: {
        totalOutput: number; // MW
        peakDemand: number; // MW
        competitors: Array<{
            name: string;
            output: number; // MW
            marketShare: number; // %
        }>;
    };
    marketMetrics: {
        revenueToday: number; // EUR
        profitMargin: number; // %
        marketPrice: number; // EUR/MWh
    };
}

export const HegemonyMap: React.FC<HegemonyMapProps> = ({ plantData, basinData, marketMetrics }) => {
    const isLeader = plantData.position === 1;
    const competitors = [...basinData.competitors].sort((a, b) => b.output - a.output);

    return (
        <div className="w-full bg-slate-950 p-6">
            <div className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Crown className={`w-6 h-6 ${isLeader ? 'text-amber-400' : 'text-slate-400'}`} />
                Basin Market Hegemony
            </div>

            {/* Leadership Status */}
            <div className={`mb-6 p-6 rounded-lg border-2 ${isLeader ? 'bg-amber-950 border-amber-500' : 'bg-slate-900 border-slate-700'
                }`}>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm text-slate-400 mb-1">Market Position</div>
                        <div className={`text-5xl font-bold ${isLeader ? 'text-amber-300' : 'text-slate-300'}`}>
                            #{plantData.position}
                        </div>
                        <div className="text-sm text-slate-500 mt-1">
                            {isLeader ? '👑 BASIN LEADER' : `${competitors[0].name} leads`}
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-sm text-slate-400 mb-1">Market Share</div>
                        <div className="text-5xl font-bold text-emerald-300">
                            {plantData.marketShare.toFixed(1)}%
                        </div>
                        <div className="text-sm text-slate-500 mt-1">
                            of basin capacity
                        </div>
                    </div>

                    {isLeader && (
                        <Trophy className="w-24 h-24 text-amber-400" />
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Basin Overview */}
                <div className="bg-slate-900 border border-purple-500 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-5 h-5 text-purple-400" />
                        <div className="text-lg font-bold text-purple-300">Basin Overview</div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-slate-400 text-sm">Total Basin Output</span>
                            <span className="text-white font-mono font-bold">{basinData.totalOutput.toFixed(0)} MW</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-slate-400 text-sm">Your Output</span>
                            <span className="text-emerald-400 font-mono font-bold">{plantData.currentOutput.toFixed(0)} MW</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-slate-400 text-sm">Peak Demand</span>
                            <span className="text-amber-400 font-mono font-bold">{basinData.peakDemand.toFixed(0)} MW</span>
                        </div>

                        {/* Capacity Bar */}
                        <div className="mt-4">
                            <div className="text-xs text-slate-400 mb-2">Your Utilization</div>
                            <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-blue-500"
                                    style={{ width: `${(plantData.currentOutput / plantData.capacity) * 100}%` }}
                                />
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                                {plantData.currentOutput.toFixed(0)} / {plantData.capacity.toFixed(0)} MW ({((plantData.currentOutput / plantData.capacity) * 100).toFixed(0)}%)
                            </div>
                        </div>
                    </div>
                </div>

                {/* Market Performance */}
                <div className="bg-slate-900 border border-emerald-500 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                        <div className="text-lg font-bold text-emerald-300">Market Performance</div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-slate-400 text-sm">Revenue Today</span>
                            <span className="text-emerald-400 font-mono font-bold">€{marketMetrics.revenueToday.toLocaleString()}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-slate-400 text-sm">Profit Margin</span>
                            <span className="text-blue-400 font-mono font-bold">{marketMetrics.profitMargin.toFixed(1)}%</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-slate-400 text-sm">Market Price</span>
                            <span className="text-purple-400 font-mono font-bold">€{marketMetrics.marketPrice.toFixed(2)}/MWh</span>
                        </div>

                        {/* Performance Indicator */}
                        <div className={`mt-4 p-3 rounded ${marketMetrics.profitMargin > 30 ? 'bg-emerald-950' : 'bg-blue-950'
                            }`}>
                            <div className={`text-center font-bold ${marketMetrics.profitMargin > 30 ? 'text-emerald-300' : 'text-blue-300'
                                }`}>
                                {marketMetrics.profitMargin > 30 ? '🔥 EXCEPTIONAL' : '✓ PROFITABLE'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Competitor Rankings */}
                <div className="col-span-2 bg-slate-900 border border-amber-500 rounded-lg p-4">
                    <div className="text-lg font-bold text-amber-300 mb-4">Competitive Landscape</div>

                    <div className="space-y-2">
                        {/* Your plant */}
                        <div className={`p-3 rounded border-2 ${isLeader ? 'bg-amber-950 border-amber-500' : 'bg-blue-950 border-blue-500'
                            }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`text-2xl font-bold ${isLeader ? 'text-amber-300' : 'text-blue-300'
                                        }`}>
                                        #{plantData.position}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">{plantData.plantName} (YOU)</div>
                                        <div className="text-xs text-slate-400">{plantData.currentOutput.toFixed(0)} MW</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-emerald-300">
                                        {plantData.marketShare.toFixed(1)}%
                                    </div>
                                    <div className="text-xs text-slate-500">market share</div>
                                </div>
                            </div>
                        </div>

                        {/* Competitors */}
                        {competitors.slice(0, 5).map((comp, idx) => (
                            <div key={idx} className="p-3 bg-slate-800 rounded">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="text-xl font-bold text-slate-400">
                                            #{idx + (isLeader ? 2 : 1)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-300">{comp.name}</div>
                                            <div className="text-xs text-slate-500">{comp.output.toFixed(0)} MW</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-slate-400">
                                            {comp.marketShare.toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Strategic Insights */}
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-950 to-blue-950 border border-purple-500 rounded-lg">
                <div className="text-sm font-bold text-purple-300 mb-2">Strategic Insights</div>
                <div className="grid grid-cols-2 gap-4 text-xs text-slate-300">
                    <div>
                        💡 To reach #1: Increase output by {isLeader ? '0' : (competitors[0].output - plantData.currentOutput).toFixed(0)} MW
                    </div>
                    <div>
                        📊 Market concentration: {(competitors.length > 0 ? (plantData.marketShare + competitors[0].marketShare) : plantData.marketShare).toFixed(0)}% (top 2)

                    </div>
                    <div>
                        ⚡ Your dominance: {isLeader ? 'ESTABLISHED' : 'CHALLENGER'}
                    </div>
                    <div>
                        🎯 Revenue opportunity: €{((basinData.peakDemand - plantData.currentOutput) * marketMetrics.marketPrice).toLocaleString()}/h
                    </div>
                </div>
            </div>
        </div>
    );
};
