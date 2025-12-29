import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from './ui/GlassCard.tsx';
import { ModernButton } from './ui/ModernButton.tsx';
import { useMaintenance } from '../contexts/MaintenanceContext.tsx';

/**
 * Toolbox Launchpad
 * 
 * Clean, utility-focused dashboard that provides quick access to real engineering tools.
 * NO fake data, NO simulations, NO marketing fluff.
 * 
 * Philosophy: "If it's not true, don't show it."
 */
export const ToolboxLaunchpad: React.FC = () => {
    const navigate = useNavigate();
    const { tasks } = useMaintenance();

    // Get latest manual log entry (user-entered only)
    const latestTask = tasks && tasks.length > 0 ? tasks[0] : null;

    const calculators = [
        { id: 'bolt-torque', name: 'Bolt Torque Calculator', icon: '🔩', path: '/bolt-torque' },
        { id: 'shaft-alignment', name: 'Shaft Alignment', icon: '🔄', path: '/shaft-alignment' },
        { id: 'hydraulic', name: 'Hydraulic Calculator', icon: '🚰', path: '/hydraulic-maintenance' },
    ];

    const designTools = [
        { id: 'hpp-builder', name: 'HPP Design Studio', icon: '⚡', path: '/hpp-builder', description: 'Real physics calculations for hydropower plant design' },
    ];

    const operations = [
        { id: 'logbook', name: 'Maintenance Logbook', icon: '📝', path: '/logbook', description: 'Manual maintenance log entries' },
        { id: 'structural', name: 'Structural Integrity', icon: '🏗️', path: '/structural-integrity', description: 'Structural analysis tools' },
    ];

    const knowledge = [
        { id: 'sop', name: 'SOPs & Procedures', icon: '🛠️', path: '/shadow-engineer', description: 'Standard Operating Procedures' },
        { id: 'library', name: 'Technical Library', icon: '📚', path: '/library', description: 'Documentation and resources' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* HEADER */}
                <div className="text-center mb-12">
                    <h1 className="text-6xl font-black text-white tracking-tighter mb-4">
                        AnoHUB <span className="text-cyan-400">Toolbox</span>
                    </h1>
                    <p className="text-slate-400 text-lg font-mono">
                        Professional Utilities for Hydropower Engineering Teams
                    </p>
                </div>

                {/* CALCULATORS */}
                <section>
                    <h2 className="text-2xl font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-3">
                        <span className="w-1 h-8 bg-cyan-500 rounded"></span>
                        Engineering Calculators
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {calculators.map(calc => (
                            <GlassCard
                                key={calc.id}
                                title={calc.name}
                                className="hover:scale-105 transition-transform cursor-pointer"
                                onClick={() => navigate(calc.path)}
                            >
                                <div className="flex flex-col items-center justify-center py-8">
                                    <span className="text-6xl mb-4">{calc.icon}</span>
                                    <ModernButton variant="secondary" className="w-full">
                                        Open Calculator
                                    </ModernButton>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </section>

                {/* DESIGN TOOLS */}
                <section>
                    <h2 className="text-2xl font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-3">
                        <span className="w-1 h-8 bg-emerald-500 rounded"></span>
                        Design Tools
                    </h2>
                    <div className="grid grid-cols-1 gap-6">
                        {designTools.map(tool => (
                            <GlassCard
                                key={tool.id}
                                title={tool.name}
                                className="hover:scale-[1.02] transition-transform cursor-pointer border-l-4 border-l-emerald-500"
                                onClick={() => navigate(tool.path)}
                            >
                                <div className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-6">
                                        <span className="text-7xl">{tool.icon}</span>
                                        <div>
                                            <p className="text-slate-300 text-lg mb-2">{tool.description}</p>
                                            <p className="text-sm text-slate-500">Real physics • Authentic calculations</p>
                                        </div>
                                    </div>
                                    <ModernButton variant="primary" className="px-8">
                                        Launch Studio →
                                    </ModernButton>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </section>

                {/* OPERATIONS */}
                <section>
                    <h2 className="text-2xl font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-3">
                        <span className="w-1 h-8 bg-amber-500 rounded"></span>
                        Operations
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {operations.map(op => (
                            <GlassCard
                                key={op.id}
                                title={op.name}
                                className="hover:scale-105 transition-transform cursor-pointer"
                                onClick={() => navigate(op.path)}
                            >
                                <div className="p-4">
                                    <div className="flex items-center gap-4 mb-4">
                                        <span className="text-5xl">{op.icon}</span>
                                        <div className="flex-1">
                                            <p className="text-slate-300">{op.description}</p>
                                            {op.id === 'logbook' && latestTask && (
                                                <p className="text-sm text-cyan-400 mt-2">
                                                    Latest: Recent entry
                                                </p>
                                            )}
                                            {op.id === 'logbook' && !latestTask && (
                                                <p className="text-sm text-slate-500 mt-2">
                                                    No entries yet. Start logging your work.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <ModernButton variant="secondary" className="w-full">
                                        Open →
                                    </ModernButton>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </section>

                {/* KNOWLEDGE */}
                <section>
                    <h2 className="text-2xl font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-3">
                        <span className="w-1 h-8 bg-indigo-500 rounded"></span>
                        Knowledge Base
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {knowledge.map(item => (
                            <GlassCard
                                key={item.id}
                                title={item.name}
                                className="hover:scale-105 transition-transform cursor-pointer"
                                onClick={() => navigate(item.path)}
                            >
                                <div className="flex items-center gap-4 p-4">
                                    <span className="text-5xl">{item.icon}</span>
                                    <div className="flex-1">
                                        <p className="text-slate-300">{item.description}</p>
                                    </div>
                                    <ModernButton variant="secondary">
                                        View →
                                    </ModernButton>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </section>

                {/* FOOTER NOTE */}
                <div className="text-center py-12">
                    <p className="text-slate-500 text-sm font-mono">
                        Authentic engineering tools • No simulations • Real calculations only
                    </p>
                </div>
            </div>
        </div>
    );
};
