import React from 'react';
import { Factory, Droplet, Fuel, Clock } from 'lucide-react';

interface AutarkyDashboardProps {
    materials: {
        titanium: { available: number; runway: number }; // kg, months
        steel: { available: number; runway: number };
        bronze: { available: number; runway: number };
    };
    consumables: {
        oil: { volume: number; purity: number; runway: number }; // L, %, years
        h2: { volume: number; fillLevel: number; runway: number }; // Nm³, %, months
    };
    manufacturing: {
        printableComponents: number;
        printedTotal: number;
        materialUtilization: number; // %
    };
}

export const AutarkyDashboard: React.FC<AutarkyDashboardProps> = ({ materials, consumables, manufacturing }) => {
    // Calculate overall autarky score (weighted average of runways)
    const avgMaterialRunway = (materials.titanium.runway + materials.steel.runway + materials.bronze.runway) / 3;
    const avgConsumableRunway = ((consumables.oil.runway * 12) + consumables.h2.runway) / 2; // Convert oil years to months
    const overallRunwayMonths = (avgMaterialRunway + avgConsumableRunway) / 2;

    const autarkyScore = Math.min(100, (overallRunwayMonths / 24) * 100); // 24 months = 100%

    return (
        <div className="w-full bg-slate-950 p-6">
            <div className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Factory className="w-6 h-6 text-cyan-400" />
                Autarky Matrix - Material Independence
            </div>

            {/* Overall Autarky Score */}
            <div className={`mb-6 p-6 rounded-lg border-2 ${autarkyScore >= 75 ? 'bg-emerald-950 border-emerald-500' :
                    autarkyScore >= 50 ? 'bg-blue-950 border-blue-500' :
                        'bg-amber-950 border-amber-500'
                }`}>
                <div className="text-center">
                    <div className="text-sm text-slate-400 mb-2">Material Self-Sufficiency</div>
                    <div className={`text-6xl font-bold ${autarkyScore >= 75 ? 'text-emerald-300' :
                            autarkyScore >= 50 ? 'text-blue-300' :
                                'text-amber-300'
                        }`}>
                        {autarkyScore.toFixed(0)}%
                    </div>
                    <div className="text-sm text-slate-500 mt-2">
                        Resource Runway: {overallRunwayMonths.toFixed(0)} months
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* 3D Printing Materials */}
                <div className="bg-slate-900 border border-purple-500 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Factory className="w-5 h-5 text-purple-400" />
                        <div className="text-lg font-bold text-purple-300">Additive Manufacturing</div>
                    </div>

                    <div className="space-y-3">
                        {/* Titanium */}
                        <div className="bg-slate-800 rounded p-3">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-slate-400">Titanium Alloy</span>
                                <span className="text-lg font-bold text-purple-300 font-mono">
                                    {materials.titanium.available} kg
                                </span>
                            </div>
                            <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden mb-1">
                                <div
                                    className="absolute inset-y-0 left-0 bg-purple-500"
                                    style={{ width: `${Math.min(100, (materials.titanium.runway / 24) * 100)}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Runway</span>
                                <span className="text-purple-400 font-mono">{materials.titanium.runway} months</span>
                            </div>
                        </div>

                        {/* Stainless Steel */}
                        <div className="bg-slate-800 rounded p-3">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-slate-400">Stainless 316L</span>
                                <span className="text-lg font-bold text-cyan-300 font-mono">
                                    {materials.steel.available} kg
                                </span>
                            </div>
                            <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden mb-1">
                                <div
                                    className="absolute inset-y-0 left-0 bg-cyan-500"
                                    style={{ width: `${Math.min(100, (materials.steel.runway / 24) * 100)}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Runway</span>
                                <span className="text-cyan-400 font-mono">{materials.steel.runway} months</span>
                            </div>
                        </div>

                        {/* Bronze */}
                        <div className="bg-slate-800 rounded p-3">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-slate-400">Bronze</span>
                                <span className="text-lg font-bold text-amber-300 font-mono">
                                    {materials.bronze.available} kg
                                </span>
                            </div>
                            <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden mb-1">
                                <div
                                    className="absolute inset-y-0 left-0 bg-amber-500"
                                    style={{ width: `${Math.min(100, (materials.bronze.runway / 24) * 100)}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Runway</span>
                                <span className="text-amber-400 font-mono">{materials.bronze.runway} months</span>
                            </div>
                        </div>

                        {/* Manufacturing Stats */}
                        <div className="pt-3 border-t border-slate-700">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <div className="text-slate-500">Printable</div>
                                    <div className="text-white font-mono">{manufacturing.printableComponents}</div>
                                </div>
                                <div>
                                    <div className="text-slate-500">Printed</div>
                                    <div className="text-emerald-400 font-mono">{manufacturing.printedTotal}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Regenerative Systems */}
                <div className="bg-slate-900 border border-emerald-500 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Droplet className="w-5 h-5 text-emerald-400" />
                        <div className="text-lg font-bold text-emerald-300">Regenerative Systems</div>
                    </div>

                    <div className="space-y-3">
                        {/* Turbine Oil */}
                        <div className="bg-slate-800 rounded p-3">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-slate-400">Turbine Oil</span>
                                <span className="text-lg font-bold text-emerald-300 font-mono">
                                    {consumables.oil.volume} L
                                </span>
                            </div>
                            <div className="mb-2">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-500">Purity</span>
                                    <span className={`font-mono ${consumables.oil.purity >= 95 ? 'text-emerald-400' : 'text-amber-400'
                                        }`}>
                                        {consumables.oil.purity}%
                                    </span>
                                </div>
                                <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className={`absolute inset-y-0 left-0 ${consumables.oil.purity >= 95 ? 'bg-emerald-500' : 'bg-amber-500'
                                            }`}
                                        style={{ width: `${consumables.oil.purity}%` }}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Runway (with regen)</span>
                                <span className="text-emerald-400 font-mono">{consumables.oil.runway} years</span>
                            </div>
                        </div>

                        {/* Hydrogen */}
                        <div className="bg-slate-800 rounded p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Fuel className="w-4 h-4 text-blue-400" />
                                <span className="text-sm text-slate-400">Hydrogen Storage</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-lg font-bold text-blue-300 font-mono">
                                    {consumables.h2.volume} Nm³
                                </span>
                                <span className="text-sm text-blue-400">
                                    {consumables.h2.fillLevel}%
                                </span>
                            </div>
                            <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden mb-1">
                                <div
                                    className="absolute inset-y-0 left-0 bg-blue-500"
                                    style={{ width: `${consumables.h2.fillLevel}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Fuel cell runway</span>
                                <span className="text-blue-400 font-mono">{consumables.h2.runway} months</span>
                            </div>
                        </div>

                        {/* Molecular Regeneration */}
                        <div className="p-3 bg-gradient-to-r from-emerald-950 to-cyan-950 border border-emerald-500 rounded">
                            <div className="text-xs font-bold text-emerald-300 mb-1">
                                ♻️ Molecular Regeneration Active
                            </div>
                            <div className="text-xs text-slate-300">
                                Oil life: 5 → 20+ years | Cost savings: €18k/cycle
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resource Runway Timeline */}
                <div className="col-span-2 bg-slate-900 border border-blue-500 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-5 h-5 text-blue-400" />
                        <div className="text-lg font-bold text-blue-300">Resource Runway Timeline</div>
                    </div>

                    <div className="space-y-2">
                        <div className="grid grid-cols-4 gap-4 text-xs text-slate-400 font-bold">
                            <div>Resource</div>
                            <div>Current</div>
                            <div>Runway</div>
                            <div>Status</div>
                        </div>

                        {[
                            { name: 'Titanium Alloy', current: `${materials.titanium.available} kg`, runway: `${materials.titanium.runway} mo`, status: materials.titanium.runway > 12 ? 'SECURE' : 'REORDER' },
                            { name: 'Stainless Steel', current: `${materials.steel.available} kg`, runway: `${materials.steel.runway} mo`, status: materials.steel.runway > 12 ? 'SECURE' : 'REORDER' },
                            { name: 'Bronze', current: `${materials.bronze.available} kg`, runway: `${materials.bronze.runway} mo`, status: materials.bronze.runway > 12 ? 'SECURE' : 'REORDER' },
                            { name: 'Turbine Oil', current: `${consumables.oil.volume} L`, runway: `${consumables.oil.runway} yr`, status: 'INFINITE' },
                            { name: 'Hydrogen', current: `${consumables.h2.volume} Nm³`, runway: `${consumables.h2.runway} mo`, status: 'ON-DEMAND' },
                        ].map((resource, idx) => (
                            <div key={idx} className="grid grid-cols-4 gap-4 text-xs py-2 border-t border-slate-800">
                                <div className="text-white">{resource.name}</div>
                                <div className="text-slate-300 font-mono">{resource.current}</div>
                                <div className="text-blue-300 font-mono">{resource.runway}</div>
                                <div className={`font-bold ${resource.status === 'INFINITE' ? 'text-purple-400' :
                                        resource.status === 'ON-DEMAND' ? 'text-cyan-400' :
                                            resource.status === 'SECURE' ? 'text-emerald-400' : 'text-amber-400'
                                    }`}>
                                    {resource.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Autarky Status */}
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-950 to-emerald-950 border border-purple-500 rounded-lg">
                <div className="text-sm font-bold text-purple-300 mb-2">🏭 Absolute Autarky Status</div>
                <div className="grid grid-cols-3 gap-4 text-xs text-slate-300">
                    <div>
                        ⚙️ Can 3D print {manufacturing.printableComponents} critical components on-site
                    </div>
                    <div>
                        ♻️ Oil regeneration extends life 4× (20+ years vs 5 years)
                    </div>
                    <div>
                        ⚡ H2 produced on-demand during excess power periods
                    </div>
                </div>
            </div>
        </div>
    );
};
