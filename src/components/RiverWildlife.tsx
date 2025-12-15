import React, { useState } from 'react';
import { BackButton } from './BackButton.tsx';
// ISPRAVKA IMPORTA: Uvozimo hook izravno iz konteksta
import { useAssetContext } from '../contexts/AssetContext.tsx';

// --- DATA STRUCTURE ---
const sectionsData = [
    {
        id: 'fish_passage',
        icon: '🐟',
        title: 'Fish Passage Technologies',
        subtitle: 'Bio-Engineering for Migration',
        content: (
            <div className="space-y-6">
                <p className="text-slate-300 leading-relaxed font-light">
                    Modern technologies focus on safe, effective, and minimally stressful passage around dams to maintain biodiversity.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-900/40 p-5 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                        <h4 className="font-bold text-cyan-400 mb-2">Fish Ladders & Stairways</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">Pool-and-Weir or Denil channels with gradients (1:8 to 1:12) designed to guide fish without exhaustion.</p>
                    </div>
                    <div className="bg-slate-900/40 p-5 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                        <h4 className="font-bold text-cyan-400 mb-2">Fish Lifts & Elevators</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">Mechanical hoppers for high dams where ladders are impractical. Automated collection and release.</p>
                    </div>
                    <div className="bg-slate-900/40 p-5 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                        <h4 className="font-bold text-cyan-400 mb-2">Nature-Like Bypass</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">Man-made channels mimicking natural streams. The most ecologically effective, low-gradient solution.</p>
                    </div>
                    <div className="bg-slate-900/40 p-5 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                        <h4 className="font-bold text-cyan-400 mb-2">Fish-Friendly Turbines</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">Advanced designs (e.g. Alden) with fewer blades and wider gaps to reduce blade-strike mortality.</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'sediment_management',
        icon: '⛰️',
        title: 'Sediment & Erosion Control',
        subtitle: 'Protecting Reservoir Capacity & Equipment',
        content: (
            <div className="space-y-6">
                <p className="text-slate-300 font-light">
                    Dams trap sediment, reducing capacity and causing turbine abrasion. Proactive management is essential.
                </p>
                
                {/* Techniques Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-xl text-center border border-white/5">
                        <h4 className="font-bold text-white text-sm mb-1">Bypass Tunnels</h4>
                        <p className="text-[10px] text-slate-400">Diverting sediment-laden water during floods.</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-xl text-center border border-white/5">
                        <h4 className="font-bold text-white text-sm mb-1">Flushing</h4>
                        <p className="text-[10px] text-slate-400">Opening low-level outlets to clear accumulation.</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-xl text-center border border-white/5">
                        <h4 className="font-bold text-white text-sm mb-1">Watershed Mgmt</h4>
                        <p className="text-[10px] text-slate-400">Reforestation to reduce inflow at source.</p>
                    </div>
                </div>

                {/* WARNING BOXES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Visualization */}
                    <div className="p-5 border-l-2 border-amber-500 bg-amber-900/10 rounded-r-xl">
                        <h5 className="font-bold text-amber-400 text-sm mb-3 flex items-center gap-2">
                            <span>📊</span> Visualization
                        </h5>
                        <ul className="list-disc list-inside text-xs text-slate-300 space-y-2">
                            <li><strong className="text-amber-100">Bathymetric Surveys:</strong> Visualizing capacity loss.</li>
                            <li><strong className="text-amber-100">3D Wear Scans:</strong> Quantifying runner material loss.</li>
                        </ul>
                    </div>

                    {/* RCFA Critical */}
                    <div className="p-5 border-l-2 border-red-500 bg-red-900/10 rounded-r-xl">
                        <h5 className="font-bold text-red-400 text-sm mb-3 flex items-center gap-2">
                            <span>⚠️</span> RCFA Critical: Diagnosis
                        </h5>
                        <div className="space-y-2 text-xs text-slate-300">
                            <p><strong className="text-white">Abrasion (Symptom):</strong> Smooth, polished wear.</p>
                            <p><strong className="text-white">Cavitation (Root Cause):</strong> Pitted, spongy surface.</p>
                            <p className="italic text-red-300 mt-2 border-t border-red-500/20 pt-2">"Treating abrasion without fixing cavitation leads to recurring failure."</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'water_quality',
        icon: '💧',
        title: 'Water Quality & E-Flow',
        subtitle: 'The Ethical Mandate',
        content: (
            <div className="space-y-6">
                <p className="text-slate-300 font-light">
                    Maintaining natural flow regimes, temperature, and oxygen levels for downstream habitats.
                </p>
                <div className="space-y-4">
                    <div className="bg-gradient-to-r from-cyan-900/20 to-transparent p-5 rounded-xl border-l-4 border-cyan-500 relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="font-bold text-cyan-300 mb-2">Environmental Flow (E-flow)</h4>
                            <p className="text-sm text-slate-300 leading-relaxed">
                                The managed release of water to mimic natural variability. 
                                <br/><span className="text-white font-bold block mt-2">Mandate: Automatic, continuous measurement and digital documentation is non-negotiable.</span>
                            </p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-900/30 p-4 rounded-xl border border-white/5">
                            <h4 className="font-bold text-white text-sm mb-1">Aerating Turbines</h4>
                            <p className="text-xs text-slate-400">Venting turbines to increase dissolved oxygen levels.</p>
                        </div>
                        <div className="bg-slate-900/30 p-4 rounded-xl border border-white/5">
                            <h4 className="font-bold text-white text-sm mb-1">Selective Withdrawal</h4>
                            <p className="text-xs text-slate-400">Multi-level intakes to manage water temperature.</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'habitat_restoration',
        icon: '🌿',
        title: 'Habitat Restoration',
        subtitle: 'Beyond Mitigation',
        content: (
            <div className="space-y-4">
                <p className="text-slate-300 font-light">
                    Proactive measures to create a net positive environmental outcome.
                </p>
                <div className="space-y-3">
                    {[
                        { title: 'Gravel Augmentation', desc: 'Placing clean gravels for fish spawning habitats.' },
                        { title: 'Riparian Zone', desc: 'Re-planting native vegetation to stabilize banks and shade water.' },
                        { title: 'In-stream Structures', desc: 'Boulders and logs creating complex flow habitats.' }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-900/20 transition-colors">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-4 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                            <div>
                                <strong className="text-emerald-300 text-sm block mb-0.5">{item.title}</strong>
                                <span className="text-slate-400 text-xs">{item.desc}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }
];

// --- COMPONENTS ---

const EcoModule: React.FC<{ 
    item: typeof sectionsData[0]; 
    isOpen: boolean; 
    onClick: () => void;
    delay: number;
}> = ({ item, isOpen, onClick, delay }) => (
    <div 
        className={`
            group relative overflow-hidden rounded-2xl transition-all duration-500 animate-fade-in-up
            ${isOpen ? 'bg-slate-800/80 ring-1 ring-cyan-500/50 shadow-lg' : 'bg-slate-900/40 border border-white/5 hover:border-white/10 hover:bg-slate-800/60'}
            backdrop-blur-md
        `}
        style={{ animationDelay: `${delay}ms` }}
    >
        <button
            onClick={onClick}
            className="w-full flex justify-between items-center text-left p-6 transition-colors relative z-10"
        >
            <div className="flex items-center gap-5">
                <div className={`
                    text-3xl p-3 rounded-xl transition-all duration-300 shadow-inner
                    ${isOpen ? 'bg-cyan-500/20 text-cyan-300 scale-110' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white'}
                `}>
                    {item.icon}
                </div>
                <div>
                    <h3 className={`text-xl font-bold transition-colors ${isOpen ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                        {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 uppercase tracking-widest mt-1 font-medium">{item.subtitle}</p>
                </div>
            </div>
            
            <div className={`
                w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border
                ${isOpen ? 'bg-cyan-500 text-slate-900 rotate-180 border-cyan-400' : 'bg-transparent border-slate-700 text-slate-500 group-hover:border-slate-500'}
            `}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </button>
        
        <div className={`transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] overflow-hidden ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-6 pt-0">
                <div className="pt-6 border-t border-white/10 animate-fade-in">
                    {item.content}
                </div>
            </div>
        </div>
    </div>
);

// OVO JE JEDINA DEKLARACIJA I EKSPORT
export const RiverWildlife: React.FC = () => {
    const { selectedAsset } = useAssetContext();
    const [openSectionId, setOpenSectionId] = useState<string | null>('fish_passage');

    const handleToggleSection = (sectionId: string) => {
        setOpenSectionId(prevId => (prevId === sectionId ? null : sectionId));
    };
    
    return (
        <div className="space-y-8 pb-12 max-w-5xl mx-auto">
            
            {/* HERO HEADER */}
            <div className="relative text-center space-y-4 animate-fade-in-up">
                <div className="flex items-center justify-between absolute top-0 w-full px-4">
                    <BackButton text="Back to Hub" />
                </div>
                
                <div className="pt-12">
                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 drop-shadow-lg">
                        Ecological <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Engineering</span>
                    </h2>
                    
                    {selectedAsset && (
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono mb-4">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Applied Context: <span className="text-white font-bold">{selectedAsset.name}</span>
                        </div>
                    )}

                    <p className="text-slate-400 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
                        Non-negotiable technologies fulfilling the ethical mandate for Ecosystem Protection.
                    </p>
                </div>
            </div>

            {/* MANDATE BANNER */}
            <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 p-1 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/80 to-slate-900/80 backdrop-blur-md"></div>
                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center p-6 md:p-8 text-center md:text-left">
                    <div className="w-16 h-16 rounded-full bg-cyan-900/50 flex items-center justify-center text-4xl shadow-lg border border-cyan-500/30">
                        📜
                    </div>
                    <div className="flex-grow">
                        <h4 className="text-lg font-bold text-cyan-300 uppercase tracking-widest mb-2 flex items-center justify-center md:justify-start gap-2">
                            The Postulate of Ethics
                            <span className="h-px w-10 bg-cyan-500/50 hidden md:block"></span>
                        </h4>
                        <p className="text-slate-300 leading-relaxed font-light">
                            We do not just mitigate impact; we actively protect the ecosystem. 
                            <strong className="text-white font-bold block mt-1">Automatic E-Flow measurement is a core requirement of the Standard of Excellence.</strong>
                        </p>
                    </div>
                </div>
            </div>
            
            {/* MODULES */}
            <div className="space-y-4">
                {sectionsData.map((section, index) => (
                    <EcoModule
                        key={section.id}
                        item={section}
                        isOpen={openSectionId === section.id}
                        onClick={() => handleToggleSection(section.id)}
                        delay={200 + (index * 100)}
                    />
                ))}
            </div>

        </div>
    );
};