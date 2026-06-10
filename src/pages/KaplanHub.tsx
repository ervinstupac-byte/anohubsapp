import React, { useState } from 'react';
import { KaplanCamCurveLab } from '../components/KaplanCamCurveLab';
import { KaplanBladeTrunnionLab } from '../components/KaplanBladeTrunnionLab';
import { KaplanHubMonitoringLab } from '../components/KaplanHubMonitoringLab';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { Settings, Play, ShieldAlert, Award, FileText, Droplets } from 'lucide-react';

export const KaplanHub: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'cam' | 'trunnion' | 'hub'>('cam');

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-8 py-8">
            {/* Header info */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/30 p-5 rounded border border-slate-700">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 uppercase">
                            Agregat: Kaplan Adjustable Blade
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                            RPM: 150 | RATED: 12.5 MW
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-100 uppercase tracking-tight">
                        Kaplan Turbine Hub
                    </h1>
                    <p className="text-xs text-slate-400 font-sans">
                        3D vizuelizacija cam krive optimizacije odnosa lopatica i statorskog aparata, te analiza zamora blade trunniona.
                    </p>
                </div>
                
                <div className="flex gap-2">
                    <button 
                        onClick={() => setActiveTab('cam')}
                        className={`px-3.5 py-1.5 rounded text-xs font-bold font-mono transition-all border ${
                            activeTab === 'cam' ? 'bg-slate-700 text-slate-50 border-slate-600' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-50 hover:border-slate-600'
                        }`}
                    >
                        Cam Kriva (Cam Curve)
                    </button>
                    <button 
                        onClick={() => setActiveTab('trunnion')}
                        className={`px-3.5 py-1.5 rounded text-xs font-bold font-mono transition-all border ${
                            activeTab === 'trunnion' ? 'bg-slate-700 text-slate-50 border-slate-600' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-50 hover:border-slate-600'
                        }`}
                    >
                        Blade Trunnion Lab
                    </button>
                    <button 
                        onClick={() => setActiveTab('hub')}
                        className={`px-3.5 py-1.5 rounded text-xs font-bold font-mono transition-all border ${
                            activeTab === 'hub' ? 'bg-slate-700 text-slate-50 border-slate-600' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-50 hover:border-slate-600'
                        }`}
                    >
                        Hub Monitoring Lab
                    </button>
                </div>
            </div>

            {/* Quick Diagnostic Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <GlassCard className="p-4 border-slate-700 bg-slate-900/30 text-center">
                    <div className="text-[9px] text-slate-500 font-mono uppercase mb-1">Blade Angle Deviation</div>
                    <div className="text-sm font-semibold text-slate-100">0.12° (Unutar tolerancije)</div>
                    <div className="text-[10px] text-emerald-400 font-mono">OK status</div>
                </GlassCard>
                <GlassCard className="p-4 border-slate-700 bg-slate-900/30 text-center">
                    <div className="text-[9px] text-slate-500 font-mono uppercase mb-1">Oil Pressure Hub</div>
                    <div className="text-sm font-semibold text-slate-100">32.4 bar</div>
                    <div className="text-[10px] text-emerald-400 font-mono">OK status</div>
                </GlassCard>
                <GlassCard className="p-4 border-slate-700 bg-slate-900/30 text-center">
                    <div className="text-[9px] text-slate-500 font-mono uppercase mb-1">Guide Vane Position</div>
                    <div className="text-sm font-semibold text-slate-100">68.4% (Optimalno)</div>
                    <div className="text-[10px] text-emerald-400 font-mono">OK status</div>
                </GlassCard>
            </div>

            {/* Main Lab Content Area */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                
                {/* Left Area (Interactive Lab Module) - 2 cols on xl */}
                <div className="xl:col-span-2 space-y-4">
                    {activeTab === 'cam' && (
                        <div className="p-1 rounded bg-slate-900/30 border border-slate-700">
                            <KaplanCamCurveLab />
                        </div>
                    )}

                    {activeTab === 'trunnion' && (
                        <div className="p-1 rounded bg-slate-900/30 border border-slate-700">
                            <KaplanBladeTrunnionLab />
                        </div>
                    )}

                    {activeTab === 'hub' && (
                        <div className="p-1 rounded bg-slate-900/30 border border-slate-700">
                            <KaplanHubMonitoringLab />
                        </div>
                    )}
                </div>

                {/* Right Area (SOPs and Technical Details) - 1 col */}
                <div className="space-y-4">
                    {/* SOP Manuals */}
                    <GlassCard className="p-5 border-slate-700 bg-slate-900/30">
                        <h3 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400" />
                            Relevantni SOP priručnici
                        </h3>

                        <div className="space-y-3">
                            <div className="p-3 bg-slate-950 rounded border border-slate-700 space-y-1 hover:border-slate-600 transition-all cursor-pointer">
                                <div className="text-xs font-semibold text-slate-100">KAPLAN CO-RELATION RUNNING RULE</div>
                                <p className="text-[10px] text-slate-400">Pravila optimizacije relativnog ugla lopatica rotora i usmjerivača vode.</p>
                            </div>
                            <div className="p-3 bg-slate-950 rounded border border-slate-700 space-y-1 hover:border-slate-600 transition-all cursor-pointer">
                                <div className="text-xs font-semibold text-slate-100">HUB SEALING SYSTEM MAINTENANCE</div>
                                <p className="text-[10px] text-slate-400">Inspekcija zaptivki na glavčini rotora radi sprečavanja curenja ulja u rijeku.</p>
                            </div>
                            <div className="p-3 bg-slate-950 rounded border border-slate-700 space-y-1 hover:border-slate-600 transition-all cursor-pointer">
                                <div className="text-xs font-semibold text-slate-100">RUNNER BLADE TRUNNION FATIGUE AUDIT</div>
                                <p className="text-[10px] text-slate-400">Priručnik za ispitivanje zamora materijala rukavaca lopatica rotora bez demontaže.</p>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Safety checklist */}
                    <GlassCard className="p-5 border-slate-700 bg-slate-900/30">
                        <h3 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-red-500" />
                            Sigurnosne granice
                        </h3>

                        <div className="space-y-2 text-xs font-mono">
                            <div className="flex justify-between border-b border-slate-700 pb-1.5">
                                <span className="text-slate-400">Dozvoljeno odstupanje krive:</span>
                                <span className="text-amber-400 font-bold">0.5°</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-700 pb-1.5">
                                <span className="text-slate-400">Pritisak ulja u glavčini:</span>
                                <span className="text-slate-100">35.0 bar</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Aksijalni pomak limit:</span>
                                <span className="text-emerald-400">0.08 mm</span>
                            </div>
                        </div>
                    </GlassCard>
                </div>

            </div>
        </div>
    );
};
