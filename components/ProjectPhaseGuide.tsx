import React, { useState } from 'react';
import { BackButton } from './BackButton';
import { useNavigation } from '../contexts/NavigationContext';

// --- RICH DATA STRUCTURE (Tvoj originalni sadržaj) ---
const phasesData = [
    {
        id: 'planning',
        icon: '🔭',
        title: '1. Research & Planning',
        color: 'border-cyan-500',
        objectives: [
            'Confirm technical and economic feasibility.',
            'Secure financing and obtain key permits.',
            'Define project scope, budget, and timeline.'
        ],
        protocols: [
            { text: 'Feasibility Study', action: null },
            { text: 'Environmental Impact Assessment (EIA)', action: null },
            { text: 'Investor Briefing & Technical Review', action: 'investorBriefing' },
        ],
        risks: [
            'Inaccurate hydrological data (Production estimates).',
            'Permitting delays blocking construction start.',
            'Underestimation of CAPEX costs.',
        ],
        tools: ['HPP Power Calculator', 'Hydrological modeling (HEC-RAS)', 'LCOE analysis tools'],
        mandate: {
            title: "Hydro-Prijatelj's Mandate: Ethical KPI Checks",
            color: 'cyan',
            intro: 'To secure financing with integrity, your plan must be based on realism. These checks are non-negotiable.',
            items: [
                { title: "Hydrology & Risk", content: "Has the hydrological data been stress-tested (e.g., -20% flow)? Inaccurate data is the #1 financial threat." },
                { title: "Ecological Commitment", content: "Document the continuous, automatic maintenance of E-flow and its digital verification." },
                { title: "Life Cycle Cost (LCC)", content: "Include the cost of predictive maintenance (AI Monitoring) in the LCC analysis now, not later." }
            ]
        }
    },
    {
        id: 'construction',
        icon: '🏗️',
        title: '2. Construction & Assembly',
        color: 'border-blue-500',
        objectives: [
            'Execute within budget and deadlines.',
            'Ensure highest quality of assembly.',
            'Strict adherence to HSE standards.'
        ],
        protocols: [
            { text: 'Standard for Flawless Assembly', action: 'installationGuarantee' },
            { text: 'Laser shaft alignment (<0.05mm/m)', action: 'installationGuarantee' },
            { text: 'Digital QC protocols (3D scanning)', action: null },
        ],
        risks: [
            'The "Execution Gap" between plan and reality.',
            'Supply chain delays.',
            'Poor quality leading to premature failures.',
        ],
        tools: ['Laser alignment tools', 'Primavera / MS Project', '3D scanning equipment'],
        mandate: {
            title: "Hydro-Prijatelj's Mandate: Integrity Checks",
            color: 'yellow',
            intro: 'Discipline is not optional; it is the foundation of longevity.',
            items: [
                { title: "Precision Mandate", content: "The industry standard (0.1 mm/m) is insufficient. You must verify and document **0.05 mm/m**." },
                { title: "Documentation Mandate", content: "All bolt torques and alignment records must be digitally signed. No proof = No warranty." },
                { title: "Discipline Mandate", content: "Monitor the Execution Gap daily. Any deviation from the plan must be logged and approved." }
            ]
        }
    },
    {
        id: 'maintenance',
        icon: '⚙️',
        title: '3. Maintenance & Diagnostics',
        color: 'border-indigo-500',
        objectives: [
            'Maximize plant availability (>99%).',
            'Optimize performance and efficiency.',
            'Prevent catastrophic failures (Predictive).'
        ],
        protocols: [
            { text: 'Operational Risk Assessment', action: 'riskAssessment' },
            { text: 'Vibration "Fingerprint" Baseline', action: null },
            { text: 'Root Cause Failure Analysis (RCFA)', action: null },
        ],
        risks: [
            'Unplanned outages (Revenue loss).',
            'Cavitation/Erosion reducing efficiency.',
            'Catastrophic bearing/generator failure.',
        ],
        tools: ['Vibration analysis systems', 'Thermal imaging', 'AI Predictive Monitoring', 'Risk Tool'],
        mandate: {
            title: "Hydro-Prijatelj's Mandate: Diagnostic Ethics",
            color: 'red',
            intro: 'Do not treat symptoms; eliminate the root cause.',
            items: [
                { title: "The Cause (Symptom vs. Root)", content: "Are you treating the symptom (Abrasion) or the cause (Cavitation)?" },
                { title: "The Data (Observation vs. Evidence)", content: "Is this diagnosis based on human opinion or AI-driven acoustic evidence?" },
                { title: "The Ethics (Repair vs. Replace)", content: "Was the most sustainable solution (Repair) offered before recommending Replacement?" }
            ]
        }
    },
    {
        id: 'strategic',
        icon: '🧠',
        title: '4. Strategic Management',
        color: 'border-purple-500',
        objectives: [
            'Long-term Asset Performance Management.',
            'Culture of continuous improvement.',
            'Compliance with future regulations.'
        ],
        protocols: [
            { text: 'Standard of Excellence Implementation', action: 'standardOfExcellence' },
            { text: 'Life Cycle Cost (LCC) Analysis', action: null },
            { text: 'Digital Twin Strategy', action: 'digitalIntroduction' },
        ],
        risks: [
            'Technological obsolescence.',
            'Regulatory/Market changes.',
            'Loss of institutional knowledge.',
        ],
        tools: ['APM Platforms', 'Digital Twin Simulation', 'Knowledge Management Systems'],
        mandate: null
    }
];

// --- SUB-COMPONENTS ---

const MandateSection: React.FC<{ mandate: any }> = ({ mandate }) => {
    if (!mandate) return null;
    
    let colorClasses = '';
    switch(mandate.color) {
        case 'cyan': colorClasses = 'border-cyan-500 bg-cyan-900/20 text-cyan-100'; break;
        case 'yellow': colorClasses = 'border-yellow-500 bg-yellow-900/20 text-yellow-100'; break;
        case 'red': colorClasses = 'border-red-500 bg-red-900/20 text-red-100'; break;
        default: colorClasses = 'border-slate-500 bg-slate-800 text-slate-200';
    }

    return (
        <div className={`mt-6 p-5 border-l-4 rounded-r-xl ${colorClasses}`}>
            <h5 className="font-bold text-lg mb-2 flex items-center gap-2">
                <span className="text-2xl">🛡️</span> {mandate.title}
            </h5>
            <p className="text-sm opacity-80 mb-4 italic">{mandate.intro}</p>
            <ul className="space-y-3">
                {mandate.items.map((item: any, index: number) => (
                    <li key={index} className="bg-black/20 p-3 rounded-lg">
                        <strong className="block text-white text-sm mb-1" dangerouslySetInnerHTML={{ __html: item.title }}/>
                        <span className="text-sm opacity-90" dangerouslySetInnerHTML={{ __html: item.content }}/>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const ProjectPhaseGuide: React.FC = () => {
    const { navigateTo } = useNavigation();
    const [openSectionId, setOpenSectionId] = useState<string | null>('planning');

    const handleToggle = (id: string) => {
        setOpenSectionId(prev => prev === id ? null : id);
    };

    return (
        <div className="animate-fade-in space-y-8 pb-8 max-w-5xl mx-auto">
            
            {/* HEADER */}
            <div className="text-center space-y-4 animate-fade-in-up">
                <BackButton text="Back to HUB" />
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-4">
                    Project Phase <span className="text-cyan-400">Guide</span>
                </h2>
                <p className="text-slate-400 text-lg max-w-3xl mx-auto leading-relaxed">
                    The lifecycle of excellence: Enforcing Precision, Risk Mitigation, and Ethical LCC Optimization.
                </p>
            </div>

            {/* TIMELINE ACCORDION */}
            <div className="relative border-l-2 border-slate-700 ml-4 md:ml-6 space-y-8 py-4">
                {phasesData.map((phase, index) => {
                    const isOpen = openSectionId === phase.id;
                    return (
                        <div key={phase.id} className="relative pl-8 md:pl-12">
                            
                            {/* Timeline Dot */}
                            <div className={`absolute -left-[9px] top-6 w-4 h-4 rounded-full bg-slate-900 border-2 ${phase.color} shadow-[0_0_10px_currentColor] transition-all duration-300 ${isOpen ? 'scale-125 bg-white' : ''}`}></div>

                            <div 
                                className={`glass-panel rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? `border-l-4 ${phase.color} shadow-lg` : 'border-slate-700/50 hover:border-slate-600'}`}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <button
                                    onClick={() => handleToggle(phase.id)}
                                    className="w-full flex justify-between items-center text-left p-6 hover:bg-slate-800/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`text-3xl p-2 rounded-xl ${isOpen ? 'bg-white/10' : 'opacity-50'}`}>
                                            {phase.icon}
                                        </div>
                                        <div>
                                            <h3 className={`text-xl font-bold ${isOpen ? 'text-white' : 'text-slate-300'}`}>{phase.title}</h3>
                                            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">
                                                {isOpen ? 'Phase Active' : 'View Details'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${isOpen ? 'rotate-180 bg-white/10 text-white' : 'text-slate-500'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </button>

                                {/* CONTENT */}
                                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="p-6 pt-0 border-t border-slate-700/50">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                                            
                                            {/* LEFT COLUMN */}
                                            <div className="space-y-6">
                                                <div>
                                                    <h4 className="text-cyan-400 font-bold uppercase text-xs tracking-widest mb-3">Core Objectives</h4>
                                                    <ul className="space-y-2">
                                                        {phase.objectives.map((obj, i) => (
                                                            <li key={i} className="flex items-start text-sm text-slate-300">
                                                                <span className="text-cyan-500 mr-2">▹</span> {obj}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div>
                                                    <h4 className="text-cyan-400 font-bold uppercase text-xs tracking-widest mb-3">Key Protocols & Tools</h4>
                                                    <ul className="space-y-2">
                                                        {phase.protocols.map((proto, i) => (
                                                            <li key={i} className="flex items-center justify-between bg-slate-800/50 p-2 rounded border border-slate-700/50">
                                                                <span className="text-sm text-slate-200">{proto.text}</span>
                                                                {proto.action && (
                                                                    <button 
                                                                        onClick={() => navigateTo(proto.action as any)}
                                                                        className="text-[10px] bg-cyan-900/50 text-cyan-300 px-2 py-1 rounded hover:bg-cyan-600 hover:text-white transition-colors uppercase font-bold tracking-wider"
                                                                    >
                                                                        Open Tool
                                                                    </button>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                            {/* RIGHT COLUMN */}
                                            <div className="space-y-6">
                                                <div>
                                                    <h4 className="text-red-400 font-bold uppercase text-xs tracking-widest mb-3">Critical Risks</h4>
                                                    <ul className="space-y-2">
                                                        {phase.risks.map((risk, i) => (
                                                            <li key={i} className="flex items-start text-sm text-slate-400">
                                                                <span className="text-red-500 mr-2">⚠️</span> {risk}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                
                                                <div>
                                                    <h4 className="text-yellow-500 font-bold uppercase text-xs tracking-widest mb-3">Suggested Software</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {phase.tools.map((tool, i) => (
                                                            <span key={i} className="text-xs bg-yellow-900/20 text-yellow-200 px-2 py-1 rounded border border-yellow-700/30">
                                                                {tool}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* MANDATE SECTION */}
                                        <MandateSection mandate={phase.mandate} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProjectPhaseGuide;