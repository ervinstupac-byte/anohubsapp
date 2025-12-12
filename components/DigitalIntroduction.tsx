import React from 'react';

// Podaci su ostali isti, samo su sada ljepše prikazani
const principles = [
    {
        icon: '📄',
        title: 'Blueprint to Execution Mastery',
        description: 'Superior technical skill begins with an authoritative understanding of engineering documentation. We bridge the gap between the digital blueprint and the physical reality, eliminating a key source of the Execution Gap.'
    },
    {
        icon: '🎯',
        title: 'The Precision Mandate (0.05 mm/m)',
        description: "Our standard for laser shaft alignment is 0.05 mm/m. This non-negotiable precision is the foundation of asset longevity and the ultimate, ethical defense against the Execution Gap and chronic failures."
    },
    {
        icon: '💧',
        title: 'Systemic Fluid Dynamics Mastery',
        description: 'A deep, systemic understanding of hydraulic and lubrication systems—the lifeblood of the machine. Our expertise ensures LCC Optimization and protects the ecosystem from preventable failures.'
    }
];

const expertiseData = [
    { type: 'Francis', config: 'Horizontal & Vertical (e.g., Novaci II, III, IV)', power: 'Up to 9.6 MW per unit' },
    { type: 'Kaplan', config: 'Bulb, Pit, and Spiral Casing', power: 'From 224 kW to multi-MW units' },
    { type: 'Pelton', config: 'Horizontal & Vertical; 2, 3, 5, 6-jet configs', power: 'High-head applications of various scales' },
    { type: 'Complex Integration', config: 'Multiple turbine types on one site (e.g., HPP Dinč I-II)', power: 'Systemic optimization focus' }
];

// Modernizirana Sekcija s "Glass" efektom
const Section: React.FC<{ title: string; children: React.ReactNode; className?: string; delay?: number }> = ({ title, children, className, delay = 0 }) => (
    <div 
        className={`glass-panel rounded-2xl p-6 animate-fade-in-up ${className}`}
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className="flex items-center space-x-3 mb-6">
            <div className="h-8 w-1 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
            <h3 className="text-xl font-bold text-white tracking-wide">{title}</h3>
        </div>
        {children}
    </div>
);

const DigitalIntroduction: React.FC = () => {
  return (
    <div className="space-y-8 pb-8 max-w-5xl mx-auto">
      
      {/* HEADER SEKCIJA */}
      <div className="text-center space-y-4 animate-fade-in-up">
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Digital Introduction & <span className="text-cyan-400">Service Portfolio</span>
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            A summary of core competencies, global experience, and professional services in the hydropower sector.
        </p>
      </div>

      {/* CORE PRINCIPLES */}
      <Section title="Core Principles" delay={100}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {principles.map((p, i) => (
                <div key={i} className="group p-5 bg-slate-800/40 rounded-xl border border-slate-700/50 hover:border-cyan-500/30 hover:bg-slate-800/60 transition-all duration-300">
                    <div className="text-4xl mb-4 p-3 bg-slate-900/50 rounded-lg w-fit group-hover:scale-110 transition-transform">{p.icon}</div>
                    <h4 className="font-bold text-cyan-100 mb-2 group-hover:text-cyan-400 transition-colors">{p.title}</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">{p.description}</p>
                </div>
            ))}
        </div>
      </Section>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* GLOBAL REACH */}
          <Section title="Global Reach & Compliance" delay={200}>
            <div className="flex flex-col gap-6 h-full">
                <div className="text-center p-6 bg-gradient-to-br from-slate-900/80 to-slate-800/80 rounded-xl border border-slate-700/50">
                    <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">30+</p>
                    <p className="text-slate-200 font-medium text-lg">Countries on 4 continents</p>
                    <div className="w-16 h-1 bg-slate-700 mx-auto my-3"></div>
                    <p className="text-sm text-slate-500 italic">Proven adaptability to diverse technical standards</p>
                </div>

                <div className="flex-grow p-5 bg-yellow-900/10 border border-yellow-500/20 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-yellow-500 text-6xl">🛡️</div>
                    <h4 className="font-bold text-yellow-400 mb-2 flex items-center">
                        <span className="mr-2">⚠️</span> Safety First Protocol
                    </h4>
                    <p className="text-sm text-slate-300 leading-relaxed">
                        Our protocols comply with the highest international safety standards, with project experience in strictly regulated regions like <strong className="text-white">Norway, Sweden, and Switzerland</strong>.
                    </p>
                </div>
            </div>
          </Section>

          {/* EXPERTISE TABLE */}
          <Section title="Technical Expertise Matrix" delay={300}>
             <div className="overflow-hidden rounded-xl border border-slate-700/50">
                <table className="w-full text-sm text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900/80 text-cyan-400 uppercase text-xs tracking-wider">
                            <th className="p-4 font-semibold">Turbine Type</th>
                            <th className="p-4 font-semibold">Configuration</th>
                            <th className="p-4 font-semibold">Power Range</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {expertiseData.map((e, i) => (
                            <tr key={i} className="hover:bg-slate-800/50 transition-colors bg-slate-900/20">
                                <td className="p-4 font-bold text-white border-r border-slate-700/30">{e.type}</td>
                                <td className="p-4 text-slate-300">{e.config}</td>
                                <td className="p-4 text-slate-400 font-mono text-xs">{e.power}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </Section>
      </div>
    </div>
  );
};

export default DigitalIntroduction;