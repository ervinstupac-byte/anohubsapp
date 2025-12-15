import React from 'react';
import { BackButton } from './BackButton.tsx'; // <--- DODANO
import { turbineDetailData } from '../data/turbineDetailData.ts';
import type { TurbineDetail as TurbineDetailType, TurbineComponent } from '../data/turbineDetailData.ts';

interface TurbineDetailProps {
    turbineKey: string;
}

// --- HELPER: CRITICALITY BADGE ---
const CriticalityBadge: React.FC<{ level: 'High' | 'Medium' | 'Low' }> = ({ level }) => {
    let style = '';
    let icon = '';
    
    switch (level) {
        case 'High': 
            style = 'bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(248,113,113,0.3)]'; 
            icon = '⚠️ CRITICAL';
            break;
        case 'Medium': 
            style = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'; 
            icon = '⚡ ATTENTION';
            break;
        case 'Low': 
            style = 'bg-green-500/20 text-green-400 border-green-500/50'; 
            icon = '✓ STANDARD';
            break;
    }

    return (
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${style}`}>
            {icon}
        </span>
    );
};

// --- COMPONENT CARD ---
const ComponentCard: React.FC<TurbineComponent> = ({ name, description, criticality }) => (
    <div className={`
        group relative p-5 rounded-xl border transition-all duration-300 hover:-translate-y-1
        ${criticality === 'High' 
            ? 'bg-gradient-to-br from-slate-900/80 to-red-900/10 border-red-500/30 hover:border-red-500/60' 
            : 'bg-slate-800/40 border-slate-700/50 hover:border-cyan-500/40 hover:bg-slate-800/60'}
    `}>
        <div className="flex justify-between items-start mb-3">
            <h4 className={`text-lg font-bold ${criticality === 'High' ? 'text-white' : 'text-slate-200'}`}>
                {name}
            </h4>
            <CriticalityBadge level={criticality} />
        </div>
        
        <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
            {description}
        </p>

        {/* Decorative Corner */}
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-slate-600 rounded-br-lg group-hover:border-cyan-500 transition-colors"></div>
    </div>
);

// --- MAIN COMPONENT ---
const TurbineDetail: React.FC<TurbineDetailProps> = ({ turbineKey }) => {
    const data: TurbineDetailType | undefined = turbineDetailData[turbineKey];

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center p-8 glass-panel rounded-2xl border-red-500/30">
                <div className="text-4xl mb-4">🚫</div>
                <h3 className="text-xl font-bold text-white mb-2">System Data Not Found</h3>
                <p className="text-slate-400">Configuration parameters for <span className="text-cyan-400 font-mono">'{turbineKey}'</span> are missing from the database.</p>
                <div className="mt-6">
                    <BackButton text="Return to Design Studio" />
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in pb-8 max-w-7xl mx-auto space-y-8">
            <BackButton text="Back to Design Studio" />
            
            {/* HEADER */}
            <div className="text-center space-y-4 animate-fade-in-up">
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight uppercase">
                    <span className="text-cyan-400">{turbineKey}</span> Specification
                </h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                    Technical breakdown of critical subsystems and LCC vulnerabilities.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* MECHANICAL COLUMN */}
                <div className="space-y-4 animate-slide-in-left">
                    <div className="flex items-center gap-3 mb-2 p-3 bg-cyan-900/20 rounded-lg border border-cyan-500/20">
                        <span className="text-2xl">⚙️</span>
                        <div>
                            <h3 className="text-lg font-bold text-cyan-300 uppercase tracking-wider">Mechanical Systems</h3>
                            <p className="text-xs text-cyan-200/60">Rotating Parts & Hydraulics</p>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        {data.mechanical.map((comp) => (
                            <ComponentCard key={comp.name} {...comp} />
                        ))}
                    </div>
                </div>

                {/* ELECTRICAL COLUMN */}
                <div className="space-y-4 animate-slide-in-right" style={{ animationDelay: '100ms' }}>
                    <div className="flex items-center gap-3 mb-2 p-3 bg-purple-900/20 rounded-lg border border-purple-500/20">
                        <span className="text-2xl">⚡</span>
                        <div>
                            <h3 className="text-lg font-bold text-purple-300 uppercase tracking-wider">Electrical Components</h3>
                            <p className="text-xs text-purple-200/60">Generator & Control</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {data.electrical.map((comp) => (
                            <ComponentCard key={comp.name} {...comp} />
                        ))}
                    </div>
                </div>

            </div>
            
            {/* FOOTER NOTE */}
            <div className="text-center pt-8 border-t border-slate-800">
                <p className="text-xs text-slate-500 font-mono">
                    * Criticality assessment based on statistical failure rates and LCC impact analysis.
                </p>
            </div>
        </div>
    );
};

export default TurbineDetail;