import React, { useState } from 'react';
import { BackButton } from './BackButton';

const sectionsData = [
  {
    id: 'fish_passage',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM20.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0014 8v8a1 1 0 001.6.8l5.333-4z" />
      </svg>
    ),
    title: 'Fish Passage Technologies',
    content: (
      <>
        <p className="mb-4 text-slate-300">Ensuring upstream and downstream migration for aquatic species is critical for maintaining biodiversity. Modern technologies focus on safe, effective, and minimally stressful passage around dams.</p>
        <div className="space-y-3">
          <div>
            <h4 className="font-bold text-slate-100">Fish Ladders & Stairways</h4>
            <p className="text-slate-400 text-sm">A series of pools (Pool-and-Weir) or baffled channels (Denil) that allow fish to pass a dam. To prevent fatigue in species like salmon and trout, they are designed with gradients between 1:8 and 1:12, and flow is controlled to create an attractive current that guides fish without exhausting them.</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-100">Fish Lifts & Elevators</h4>
            <p className="text-slate-400 text-sm">A mechanical system where fish are attracted into a collection area (a hopper) which is then lifted over the dam and released. Effective for a wider variety of species and higher dams where ladders are impractical.</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-100">Nature-Like Bypass Channels</h4>
            <p className="text-slate-400 text-sm">A man-made channel designed to mimic a natural stream, providing a low-gradient, gentle path around the dam. This is often the most ecologically effective solution, though it requires more space.</p>
          </div>
           <div>
            <h4 className="font-bold text-slate-100">Fish-Friendly Turbines</h4>
            <p className="text-slate-400 text-sm">Advanced turbine designs (e.g., Alden turbine) with fewer, smoother blades, and wider gaps, significantly reducing blade-strike mortality for fish passing downstream through the powerhouse.</p>
          </div>
        </div>
      </>
    )
  },
  {
    id: 'sediment_management',
    icon: (
       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
    ),
    title: 'Sediment Management & Erosion Control',
    content: (
       <>
        <p className="mb-4 text-slate-300">Dams trap sediment, which reduces reservoir capacity and can cause severe abrasion damage to turbine components. Proactive management is essential for long-term sustainability.</p>
        <div className="space-y-3">
          <div>
            <h4 className="font-bold text-slate-100">Sediment Bypass Tunnels</h4>
            <p className="text-slate-400 text-sm">During high flow events, a tunnel is opened to divert sediment-laden water from upstream of the reservoir directly to the downstream river, mimicking natural sediment transport and protecting the turbine.</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-100">Flushing and Sluicing</h4>
            <p className="text-slate-400 text-sm">Controlled operations where low-level outlets in the dam are opened to flush accumulated sediments downstream. This requires careful management to avoid negative environmental impacts.</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-100">Watershed Management</h4>
            <p className="text-slate-400 text-sm">The most sustainable solution is to reduce sediment inflow at the source through practices like reforestation, terracing, and sustainable agriculture in the upstream catchment area.</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 border-l-4 border-yellow-400 bg-slate-900/50 rounded-r-lg">
            <h5 className="font-bold text-yellow-400">Visualization & Monitoring</h5>
            <p className="text-sm text-slate-400 mt-2">
                To truly understand and manage sediment impact, data visualization is key. Suggested methods include:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-sm text-slate-300">
                <li><strong>Bathymetric Survey Charts:</strong> Comparing surveys over time visually demonstrates the loss of reservoir capacity.</li>
                <li><strong>3D Wear Scans:</strong> High-resolution 3D scans of turbine runners before and after a season can quantify material loss and visualize wear patterns, helping to distinguish between abrasion and cavitation.</li>
            </ul>
        </div>

        <div className="mt-6 p-4 border-l-4 border-red-400 bg-slate-900/50 rounded-r-lg">
            <h5 className="font-bold text-red-400">RCFA Focus: Abrasion vs. Cavitation</h5>
            <p className="text-sm text-slate-400 mt-2">
                A critical error in diagnostics is to mistake cavitation damage for simple abrasion. Understanding the root cause is essential for effective maintenance.
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-sm text-slate-300">
                <li>
                    <strong className="text-slate-200">Symptom (Abrasion):</strong> The physical wearing away of surfaces by suspended particles like sand. Results in a smooth, polished appearance.
                </li>
                <li>
                    <strong className="text-slate-200">Root Cause (Cavitation):</strong> Occurs when low pressure causes water to vaporize. Bubbles collapse violently, generating micro-jets that pit and destroy the metal, resulting in a rough, "spongy" texture.
                </li>
                 <li>
                    <strong className="text-slate-200">The Destructive Synergy:</strong> Cavitation attacks the material's integrity first. The weakened, pitted surface is then easily eroded by abrasive particles. <strong>Treating only abrasion without addressing the hydraulic conditions causing cavitation will lead to recurring, costly failures.</strong>
                </li>
            </ul>
        </div>
      </>
    )
  },
  {
    id: 'water_quality',
    icon: (
       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Water Quality & Environmental Flow',
    content: (
        <>
        <p className="mb-4 text-slate-300">Maintaining the natural flow regime and water quality is crucial for downstream habitats. Hydropower operations can alter temperature, oxygen levels, and flow patterns.</p>
        <div className="space-y-3">
          <div>
            <h4 className="font-bold text-slate-100">Environmental Flow (E-flow)</h4>
            <p className="text-slate-400 text-sm">The managed release of water to mimic a river's natural variability. As per our Postulate of Ethics, **automatic, continuous measurement and documentation of E-Flow is a non-negotiable condition** for sustainable hydropower operation, not an optional addition.</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-100">Aerating Turbines & Spillways</h4>
            <p className="text-slate-400 text-sm">Techniques like turbine venting or modifying spillways to entrain air into the water as it is released. This increases dissolved oxygen levels, which can be depleted in deep reservoirs, to support aquatic life.</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-100">Selective Withdrawal Structures</h4>
            <p className="text-slate-400 text-sm">Intake structures built with multiple gates at different depths. This allows operators to select water from different reservoir layers to manage downstream water temperature, which is vital for temperature-sensitive species.</p>
          </div>
        </div>
      </>
    )
  },
   {
    id: 'habitat_restoration',
    icon: (
       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    title: 'Habitat Restoration & Enhancement',
    content: (
      <>
        <p className="mb-4 text-slate-300">Beyond mitigating impacts, modern hydropower projects often include proactive measures to restore and enhance local ecosystems, creating a net positive environmental outcome.</p>
        <div className="space-y-3">
          <div>
            <h4 className="font-bold text-slate-100">Gravel Augmentation</h4>
            <p className="text-slate-400 text-sm">The strategic placement of clean gravels downstream of a dam to create or improve spawning habitats for fish like salmon and trout, which are lost due to sediment trapping by the dam.</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-100">Riparian Zone Restoration</h4>
            <p className="text-slate-400 text-sm">Re-planting native trees and vegetation along riverbanks. This stabilizes the banks, reduces erosion, provides shade to cool the water, and creates habitat for both aquatic and terrestrial wildlife.</p>
          </div>
           <div>
            <h4 className="font-bold text-slate-100">In-stream Structure Enhancement</h4>
            <p className="text-slate-400 text-sm">Placement of boulders, large woody debris (logs), and other structures in the river channel to create complex habitats with varied flow velocities, providing resting and feeding areas for fish.</p>
          </div>
        </div>
      </>
    )
  }
];


const AccordionSection: React.FC<{ title: string; children: React.ReactNode; icon: React.ReactNode; isOpen: boolean; onClick: () => void }> = ({ title, children, icon, isOpen, onClick }) => (
    <div className="border border-slate-700 rounded-lg bg-slate-800/50 mb-4 overflow-hidden">
        <button
            onClick={onClick}
            className="w-full flex justify-between items-center text-left p-6 hover:bg-slate-700/50 transition-colors"
            aria-expanded={isOpen}
        >
            <div className="flex items-center">
                {icon}
                <h3 className="text-xl font-bold text-cyan-400">{title}</h3>
            </div>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-6 w-6 text-slate-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </button>
        {isOpen && (
            <div className="p-6 pt-0 animate-fade-in">
                {children}
            </div>
        )}
    </div>
);

const RiverWildlife: React.FC = () => {
  const [openSectionId, setOpenSectionId] = useState<string | null>(sectionsData[0]?.id ?? null);

  const handleToggleSection = (sectionId: string) => {
    setOpenSectionId(prevId => (prevId === sectionId ? null : sectionId));
  };
  
  return (
    <div className="animate-fade-in">
      <BackButton text="Back to HUB" />
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Ecological Engineering in Hydropower</h2>
        <p className="text-slate-400 mb-8">This hub provides the non-negotiable technologies required to fulfill our ethical mandate for Ecosystem Protection.</p>
      </div>

      <div className="p-4 bg-slate-900/50 border-l-4 border-cyan-400 rounded-r-lg mb-8">
        <h4 className="text-lg font-bold text-cyan-300">Hydro-Prijatelj Mandate: The Postulate of Ethics</h4>
        <p className="text-slate-300 mt-1 text-sm">Our Postulate of Ethics is non-negotiable. Adherence to these principles, especially the **automatic measurement and digital documentation of E-Flow**, is a core requirement of the Standard of Excellence. We do not just mitigate impact; we actively protect the ecosystem as a primary engineering goal.</p>
    </div>
      
      <div>
        {sectionsData.map(section => (
           <AccordionSection
            key={section.id}
            title={section.title}
            icon={section.icon}
            isOpen={openSectionId === section.id}
            onClick={() => handleToggleSection(section.id)}
          >
            {section.content}
          </AccordionSection>
        ))}
      </div>

    </div>
  );
};

export default RiverWildlife;