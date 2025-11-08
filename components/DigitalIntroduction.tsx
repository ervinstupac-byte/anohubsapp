import React from 'react';
import { BackButton } from './BackButton';

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

const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div className={`bg-slate-800/50 border border-slate-700 rounded-xl p-6 ${className}`}>
        <h3 className="text-xl font-bold text-cyan-400 mb-4">{title}</h3>
        {children}
    </div>
);

const DigitalIntroduction: React.FC = () => {
  return (
    <div className="animate-fade-in space-y-8">
      <BackButton text="Back to HUB" />
      <div className='text-center'>
        <h2 className="text-3xl font-bold text-white mb-2">Digital Introduction & Service Portfolio</h2>
        <p className="text-slate-400 mb-8">A summary of core competencies, global experience, and professional services in the hydropower sector.</p>
      </div>

      <Section title="Core Principles">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {principles.map((p, i) => (
                <div key={i} className="text-center p-4 bg-slate-900/40 rounded-lg">
                    <div className="text-4xl mb-3">{p.icon}</div>
                    <h4 className="font-bold text-slate-100">{p.title}</h4>
                    <p className="text-sm text-slate-400 mt-1">{p.description}</p>
                </div>
            ))}
        </div>
      </Section>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Section title="Global Reach & Safety Compliance">
            <div className="text-center p-4 bg-slate-900/40 rounded-lg mb-6">
                <p className="text-4xl font-bold text-cyan-400">30+</p>
                <p className="text-slate-300">Countries on 4 continents</p>
                <p className="text-xs text-slate-500">Proven adaptability to diverse technical and cultural standards</p>
            </div>
             <div className="p-4 bg-slate-900/40 rounded-lg border-l-4 border-yellow-400">
                <h4 className="font-bold text-yellow-300">Safety First</h4>
                <p className="text-sm text-slate-300 mt-1">Our protocols are compliant with the highest international safety standards, with proven project experience in stringently regulated regions such as **Norway, Sweden, and Switzerland**.</p>
            </div>
          </Section>

          <Section title="Technical Expertise Matrix">
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-900/50 text-xs text-cyan-300 uppercase">
                        <tr>
                            <th className="p-3">Turbine Type</th>
                            <th className="p-3">Example Configuration</th>
                            <th className="p-3">Power Range</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expertiseData.map((e, i) => (
                            <tr key={i} className="border-b border-slate-700">
                                <td className="p-3 font-semibold text-slate-200">{e.type}</td>
                                <td className="p-3 text-slate-400">{e.config}</td>
                                <td className="p-3 text-slate-300">{e.power}</td>
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