import React, { useState } from 'react';
import { BackButton } from './BackButton.tsx';
import { useAssetContext } from './AssetPicker.tsx'; // <--- ENTERPRISE CONTEXT

// --- DATA STRUCTURE ---
const sectionsData = [
  {
    id: 'fish_passage',
    icon: '🐟',
    title: 'Fish Passage Technologies',
    subtitle: 'Bio-Engineering for Migration',
    content: (
      <div className="space-y-6">
        <p className="text-slate-300 leading-relaxed">
            Modern technologies focus on safe, effective, and minimally stressful passage around dams to maintain biodiversity.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                <h4 className="font-bold text-cyan-400 mb-2">Fish Ladders & Stairways</h4>
                <p className="text-xs text-slate-400">Pool-and-Weir or Denil channels with gradients (1:8 to 1:12) designed to guide fish without exhaustion.</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                <h4 className="font-bold text-cyan-400 mb-2">Fish Lifts & Elevators</h4>
                <p className="text-xs text-slate-400">Mechanical hoppers for high dams where ladders are impractical. Automated collection and release.</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                <h4 className="font-bold text-cyan-400 mb-2">Nature-Like Bypass</h4>
                <p className="text-xs text-slate-400">Man-made channels mimicking natural streams. The most ecologically effective, low-gradient solution.</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                <h4 className="font-bold text-cyan-400 mb-2">Fish-Friendly Turbines</h4>
                <p className="text-xs text-slate-400">Advanced designs (e.g. Alden) with fewer blades and wider gaps to reduce blade-strike mortality.</p>
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
        <p className="text-slate-300">
            Dams trap sediment, reducing capacity and causing turbine abrasion. Proactive management is essential.
        </p>
        
        {/* Techniques Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-800 p-3 rounded-lg text-center">
                <h4 className="font-bold text-white text-sm">Bypass Tunnels</h4>
                <p className="text-[10px] text-slate-400 mt-1">Diverting sediment-laden water during floods.</p>
            </div>
            <div className="bg-slate-800 p-3 rounded-lg text-center">
                <h4 className="font-bold text-white text-sm">Flushing</h4>
                <p className="text-[10px] text-slate-400 mt-1">Opening low-level outlets to clear accumulation.</p>
            </div>
            <div className="bg-slate-800 p-3 rounded-lg text-center">
                <h4 className="font-bold text-white text-sm">Watershed Mgmt</h4>
                <p className="text-[10px] text-slate-400 mt-1">Reforestation to reduce inflow at source.</p>
            </div>
        </div>

        {/* WARNING BOXES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Visualization */}
            <div className="p-4 border-l-2 border-yellow-500 bg-yellow-900/10 rounded-r-xl">
                <h5 className="font-bold text-yellow-400 text-sm mb-2 flex items-center">
                    <span className="mr-2">📊</span> Visualization
                </h5>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                    <li><strong>Bathymetric Surveys:</strong> Visualizing capacity loss.</li>
                    <li><strong>3D Wear Scans:</strong> Quantifying runner material loss.</li>
                </ul>
            </div>

            {/* RCFA Critical */}
            <div className="p-4 border-l-2 border-red-500 bg-red-900/10 rounded-r-xl">
                <h5 className="font-bold text-red-400 text-sm mb-2 flex items-center">
                    <span className="mr-2">⚠️</span> RCFA Critical: Diagnosis
                </h5>
                <div className="space-y-2 text-xs text-slate-300">
                    <p><strong className="text-white">Abrasion (Symptom):</strong> Smooth, polished wear.</p>
                    <p><strong className="text-white">Cavitation (Root Cause):</strong> Pitted, spongy surface.</p>
                    <p className="italic text-red-300 mt-1">"Treating abrasion without fixing cavitation leads to recurring failure."</p>
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
         <p className="text-slate-300">
            Maintaining natural flow regimes, temperature, and oxygen levels for downstream habitats.
         </p>
         <div className="space-y-4">
            <div className="glass-panel p-4 rounded-xl border-l-4 border-cyan-500">
                <h4 className="font-bold text-cyan-300 mb-1">Environmental Flow (E-flow)</h4>
                <p className="text-sm text-slate-300">
                    The managed release of water to mimic natural variability. 
                    <br/><span className="text-white font-bold">Mandate:</span> Automatic, continuous measurement and digital documentation is non-negotiable.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/30 p-4 rounded-xl">
                    <h4 className="font-bold text-white text-sm">Aerating Turbines</h4>
                    <p className="text-xs text-slate-400 mt-1">Venting turbines to increase dissolved oxygen levels.</p>
                </div>
                <div className="bg-slate-900/30 p-4 rounded-xl">
                    <h4 className="font-bold text-white text-sm">Selective Withdrawal</h4>
                    <p className="text-xs text-slate-400 mt-1">Multi-level intakes to manage water temperature.</p>
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
        <p className="text-slate-300">
            Proactive measures to create a net positive environmental outcome.
        </p>
        <div className="space-y-2">
            {[
                { title: 'Gravel Augmentation', desc: 'Placing clean gravels for fish spawning habitats.' },
                { title: 'Riparian Zone', desc: 'Re-planting native vegetation to stabilize banks and shade water.' },
                { title: 'In-stream Structures', desc: 'Boulders and logs creating complex flow habitats.' }
            ].map((item, i) => (
                <div key={i} className="flex items-center p-3 bg-green-900/20 border border-green-500/20 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <div>
                        <strong className="text-green-300 text-sm block">{item.title}</strong>
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
        className={`glass-panel rounded-2xl overflow-hidden transition-all duration-500 animate-fade-in-up ${isOpen ? 'border-cyan-500/40 shadow-lg' : 'border-slate-700/50 hover:border-slate-600'}`}
        style={{ animationDelay: `${delay}ms` }}
    >
        <button
            onClick={onClick}
            className="w-full flex justify-between items-center text-left p-6 transition-colors"
        >
            <div className="flex items-center gap-4">
                <div className={`text-3xl p-3 rounded-xl transition-colors ${isOpen ? 'bg-cyan-900/30' : 'bg-slate-800'}`}>
                    {item.icon}
                </div>
                <div>
                    <h3 className={`text-xl font-bold transition-colors ${isOpen ? 'text-white' : 'text-slate-300'}`}>{item.title}</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">{item.subtitle}</p>
                </div>
            </div>
            
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-cyan-500 text-slate-900 rotate-180' : 'bg-slate-800 text-slate-400'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </button>
        
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-6 pt-0 border-t border-slate-700/50">
                <div className="pt-6 animate-fade-in">
                    {item.content}
                </div>
            </div>
        </div>
    </div>
);

const RiverWildlife: React.FC = () => {
  const { selectedAsset } = useAssetContext(); // <--- CONTEXT CONNECTION
  const [openSectionId, setOpenSectionId] = useState<string | null>('fish_passage');

  const handleToggleSection = (sectionId: string) => {
    setOpenSectionId(prevId => (prevId === sectionId ? null : sectionId));
  };
  
  return (
    <div className="space-y-8 pb-8 max-w-4xl mx-auto">
      
      {/* HEADER */}
      <div className="text-center space-y-4 animate-fade-in-up">
        <BackButton text="Back to Hub" />
        
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-4">
            Ecological <span className="text-cyan-400">Engineering</span>
        </h2>
        
        {/* CONTEXT BADGE */}
        {selectedAsset && (
            <div className="inline-block px-4 py-1 rounded-full bg-cyan-900/30 border border-cyan-500/50 text-cyan-300 text-sm font-mono mb-2">
                Applied Context: {selectedAsset.name}
            </div>
        )}

        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Non-negotiable technologies fulfilling the ethical mandate for Ecosystem Protection.
        </p>
      </div>

      {/* MANDATE BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-900/40 to-slate-900/40 border border-cyan-500/30 p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="text-4xl">📜</div>
            <div>
                <h4 className="text-lg font-bold text-cyan-300 uppercase tracking-wider mb-1">The Postulate of Ethics</h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                    We do not just mitigate impact; we actively protect the ecosystem. 
                    <strong className="text-white"> Automatic E-Flow measurement</strong> is a core requirement of the Standard of Excellence.
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

export default RiverWildlife;