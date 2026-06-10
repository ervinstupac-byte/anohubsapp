import React from 'react';
import { Ruler, Zap, ShieldCheck, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FRANCIS_PATHS } from '../../routes/paths';

export const Manifesto: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-mono p-6 md:p-10 relative overflow-hidden">
            <div className="max-w-4xl mx-auto relative z-10 border border-slate-700 p-8 md:p-16 bg-slate-900 shadow-sm">
                {/* Header Section */}
                <div className="border-b border-slate-700 pb-10 mb-12">
                    <div className="flex justify-between items-end mb-4">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-500">AnoHUB - ASSET INTEGRITY</span>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-500">PROTOCOL INTERFACE v30.0</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-semibold uppercase tracking-tight mb-4">FORENSIC INTEGRITY</h1>
                    <div className="flex flex-col gap-2">
                        <p className="text-slate-400 text-lg">Asset Integrity Management & Forensic Engineering</p>
                        <p className="text-slate-500 text-sm">Establishing the global standard for hydro integrity. We eliminate the root causes of failure through precision field engineering and predictive forensics.</p>
                    </div>
                </div>

                <div className="space-y-12">
                    {/* Section 1: Precision Engineering */}
                    <div className="relative">
                        <div className="flex items-center gap-6 mb-4">
                            <div className="p-3 bg-slate-800 rounded border border-slate-700">
                                <Ruler className="w-6 h-6 text-slate-300" />
                            </div>
                            <h2 className="text-2xl font-semibold uppercase tracking-tight">0.05mm PRECISION</h2>
                        </div>
                        <div className="pl-12">
                            <p className="text-base leading-relaxed text-slate-300">
                                Most consultants treat hydro turbines like generic rotating assets. We understand the chaotic fluid dynamics, the cavitation risks, and the specific structural fatigue of Kaplan, Francis, and Pelton units.
                            </p>
                        </div>
                    </div>

                    {/* Section 2: Dynamic Risk Detection */}
                    <div className="relative">
                        <div className="flex items-center gap-6 mb-4">
                            <div className="p-3 bg-slate-800 rounded border border-slate-700">
                                <Zap className="w-6 h-6 text-slate-300" />
                            </div>
                            <h2 className="text-2xl font-semibold uppercase tracking-tight">48% DYNAMIC RISK DETECTION</h2>
                        </div>
                        <div className="pl-12">
                            <p className="text-base leading-relaxed text-slate-300">
                                ISO 9001 Certified Field Teams ready for deployment. Core Expertise: Turbine-Specific Intelligence, 24/7 Monitoring, 0% Tolerance.
                            </p>
                        </div>
                    </div>

                    {/* Section 3: Cultural Betrayal */}
                    <div className="relative">
                        <div className="flex items-center gap-6 mb-4">
                            <div className="p-3 bg-slate-800 rounded border border-slate-700">
                                <ShieldCheck className="w-6 h-6 text-slate-300" />
                            </div>
                            <h2 className="text-2xl font-semibold uppercase tracking-tight">ENGINEERING INTEGRITY</h2>
                        </div>
                        <div className="pl-12">
                            <p className="text-base leading-relaxed text-slate-300">
                                Why the 'Low-Bid' standard is essentially an engineered suicide pact. We expose the industry lies that prioritize short-term savings over long-term physics.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Technical Sidebar Inset */}
                <div className="mt-16 p-6 border border-slate-700 bg-slate-950/50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <div className="text-[9px] font-semibold uppercase text-slate-500 mb-1">24/7</div>
                            <div className="text-sm text-slate-300">Monitoring</div>
                        </div>
                        <div>
                            <div className="text-[9px] font-semibold uppercase text-slate-500 mb-1">0.05mm</div>
                            <div className="text-sm text-slate-300">Precision</div>
                        </div>
                        <div>
                            <div className="text-[9px] font-semibold uppercase text-slate-500 mb-1">ISO</div>
                            <div className="text-sm text-slate-300">Certified</div>
                        </div>
                        <div>
                            <div className="text-[9px] font-semibold uppercase text-slate-500 mb-1">0%</div>
                            <div className="text-sm text-slate-300">Tolerance</div>
                        </div>
                    </div>
                </div>

                {/* Footer and Return */}
                <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-slate-700 pt-10">
                    <div className="flex flex-col">
                        <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500">FIELD OPS // DIAGNOSTICS // INTELLIGENCE</div>
                    </div>
                    <button
                        onClick={() => navigate('/' + FRANCIS_PATHS.HUB)}
                        className="group flex items-center gap-4 px-8 py-3 border border-slate-600 font-semibold uppercase tracking-widest text-sm hover:bg-slate-800 transition-all"
                    >
                        <span className="relative z-10">RETURN TO DASHBOARD</span>
                        <ChevronRight className="w-4 h-4 relative z-10 group-hover:translate-x-2 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};
