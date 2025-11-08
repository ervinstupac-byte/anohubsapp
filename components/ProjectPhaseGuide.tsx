import React, { useState } from 'react';
import { BackButton } from './BackButton.tsx';
import { useNavigation } from '../contexts/NavigationContext.tsx';

const phasesData = [
    {
        id: 'planning',
        icon: '🔭',
        title: '1. Research & Planning',
        objectives: [
            'Confirm the technical and economic feasibility of the project.',
            'Secure financing and obtain key permits.',
            'Define the project scope, budget, and timeline.'
        ],
        protocols: [
            { text: 'Feasibility Study', action: null },
            { text: 'Environmental Impact Assessment (EIA)', action: null },
            { text: 'Investor Briefing & Technical Review (KPI)', action: 'investorBriefing' },
        ],
        risks: [
            'Inaccurate hydrological data leads to incorrect production estimates.',
            'Delays in obtaining permits block the start of construction.',
            'Underestimation of costs (CAPEX) threatens financial stability.',
        ],
        tools: ['HPP Power Calculator Tool', 'Hydrological modeling software (e.g., HEC-RAS)', 'Financial modeling and LCOE analysis tools'],
        mandate: {
            title: "Hydro-Prijatelj's Mandate: Three Ethical KPI Checks for Investors",
            color: 'cyan',
            intro: 'To secure financing with integrity, your plan must be based on realism, not optimism. These checks are non-negotiable.',
            items: [
                { title: "1. Hydrology & Risk (The Transparency Demand):", content: "Has the hydrological data been subjected to a stress test (worst-case scenario: e.g., 20% lower flow) to ensure the LCOE remains viable? The risk of inaccurate data is the project's biggest financial threat." },
                { title: "2. Ecological Commitment (The E-Flow Guarantee):", content: "The plan must document the continuous, automatic maintenance of the minimal ecological flow (E-flow) and the system for its digital verification, fulfilling our ethical mandate for Ecosystem Protection." },
                { title: "3. Life Cycle Cost - LCC (The Realism Mandate):", content: "Require an LCC analysis that specifically includes the cost of proactive, predictive maintenance (AI/Acoustic Monitoring). This is a foundational step for true LCC Optimization and avoids unrealistic O&M cost projections." }
            ]
        }
    },
    {
        id: 'construction',
        icon: '🏗️',
        title: '2. Construction & Assembly',
        objectives: [
            'Execute the project within the specified budget and deadlines.',
            'Ensure the highest quality of construction and assembly.',
            'Strict adherence to HSE (Health, Safety, Environment) standards.'
        ],
        protocols: [
            { text: 'Standard for Flawless Assembly', action: 'installationGuarantee' },
            { text: 'Laser shaft alignment (<0.05mm/m)', action: 'installationGuarantee' },
            { text: 'Digital QC protocols (3D scanning)', action: null },
        ],
        risks: [
            'The gap between plan and execution ("Execution Gap") causes systemic errors.',
            'Supply chain issues (equipment delays).',
            'Poor quality of work leading to premature failures.',
        ],
        tools: ['Laser alignment tools', 'Project management software (e.g., Primavera)', '3D scanning equipment for digital verification'],
        mandate: {
            title: "Hydro-Prijatelj's Mandate: Three Non-Negotiable Checks for Integrity",
            color: 'yellow',
            intro: 'Discipline is not optional; it is the foundation of longevity. These checks are absolute requirements.',
            items: [
                { title: "1. Precision Mandate (The 'Swiss Watch' Standard):", content: "The industry standard of 0.1 mm/m is insufficient. You must verify and document an alignment of **0.05 mm/m**. This is the requirement for achieving the precision that guarantees decades of stable operation and closes a critical Execution Gap." },
                { title: "2. Documentation Mandate (Warranty Integrity):", content: "Before final sign-off, all bolt torques and alignment records must be digitally signed and stored. Failure to provide this immutable proof of precision **voids the manufacturer's warranty** and creates a massive Execution Gap liability." },
                { title: "3. Discipline Mandate (Closing the Execution Gap):", content: "Monitor the **Execution Gap**—the difference between the approved plan and the realized on-site work—daily. Implement a mandatory 'Plan-Do-Check-Act' meeting at the start of each shift. Any deviation must be logged, explained, and approved." }
            ]
        }
    },
    {
        id: 'maintenance',
        icon: '⚙️',
        title: '3. Maintenance & Diagnostics',
        objectives: [
            'Maximize plant availability and reliability (>99%).',
            'Optimize performance and efficiency.',
            'Prevent catastrophic failures through predictive maintenance.'
        ],
        protocols: [
            { text: 'Operational Risk Assessment', action: 'riskAssessment' },
            { text: 'Vibration "Fingerprint" Baseline Recording', action: null },
            { text: 'Root Cause Failure Analysis (RCFA)', action: null },
        ],
        risks: [
            'Unplanned outages cause significant production losses.',
            'Cavitation and erosion reduce turbine efficiency and lifespan.',
            'Catastrophic failure of bearings or generator insulation.',
        ],
        tools: [
            'Advanced vibration analysis systems', 'Thermal imaging cameras',
            'SCADA systems with predictive analytics (AI Monitoring)', 'Internal Risk Assessment Tool'
        ],
        mandate: {
            title: "Hydro-Prijatelj's Mandate: Three Diagnostic Questions for RCFA",
            color: 'red',
            intro: 'Do not treat symptoms; eliminate the root cause. Before any intervention, you must answer these questions to ensure ethical LCC Optimization.',
            items: [
                { title: "1. The Cause (Symptom vs. Root):", content: "Is the current solution treating the physical symptom (e.g., replacing a part due to **Abrasion**), or is it addressing the primary cause (**Cavitation**) to prevent a recurring Execution Gap in maintenance?" },
                { title: "2. The Data (Observation vs. Evidence):", content: "Is this diagnosis based on a human observation, or on **AI-driven acoustic data (e.g., cavitation signatures)** integrated from the SCADA system?" },
                { title: "3. The Ethics (Repair vs. Replace):", content: "Was the most cost-effective and sustainable solution for **LCC Optimization** (e.g., advanced welding/repair) offered before immediately recommending a full replacement of the component?" }
            ]
        }
    },
    {
        id: 'strategic',
        icon: '🧠',
        title: '4. Strategic Management',
        objectives: [
            'Long-term Asset Performance Management (APM).',
            'Implementation of a culture of continuous improvement.',
            'Ensuring compliance with future technological and regulatory changes.'
        ],
        protocols: [
            { text: 'Implementation of the Standard of Excellence', action: 'standardOfExcellence' },
            { text: 'Life Cycle Cost (LCC) Analysis', action: null },
            { text: 'Digital Twin Strategy', action: 'standardOfExcellence' },
        ],
        risks: [
            'Technological obsolescence of equipment and control systems.',
            'Changes in market conditions and regulations.',
            'Loss of institutional knowledge with the departure of experienced staff.',
        ],
        tools: ['Asset Performance Management (APM) platforms', 'Digital Twin simulation software', 'Knowledge Management Systems']
    }
];

const MandateSection: React.FC<{ mandate: typeof phasesData[0]['mandate'] }> = ({ mandate }) => {
    if (!mandate) return null;
    const colors = {
        cyan: 'border-cyan-400 text-cyan-300',
        yellow: 'border-yellow-400 text-yellow-300',
        red: 'border-red-400 text-red-300',
    };
    const colorClass = colors[mandate.color as keyof typeof colors] || colors.cyan;

    return (
        <div className={`mt-6 p-4 border-l-4 bg-slate-900/50 rounded-r-lg ${colorClass}`}>
            <h5 className={`font-bold text-lg`}>
                {mandate.title}
            </h5>
            <p className="text-sm text-slate-400 mt-2 mb-4">{mandate.intro}</p>
            <ul className="space-y-3 text-sm">
                {mandate.items.map((item, index) => (
                    <li key={index}>
                        <strong className="text-slate-200 block" dangerouslySetInnerHTML={{ __html: item.title }}/>
                        <span className="text-slate-300" dangerouslySetInnerHTML={{ __html: item.content }}/>
                    </li>
                ))}
            </ul>
        </div>
    );
};


const AccordionSection: React.FC<{ 
    phase: typeof phasesData[0]; 
    isOpen: boolean; 
    onClick: () => void;
}> = ({ phase, isOpen, onClick }) => {
    const { navigateTo } = useNavigation();

    return (
        <div className="border border-slate-700 rounded-lg bg-slate-800/50 mb-4 overflow-hidden">
            <button
                onClick={onClick}
                className="w-full flex justify-between items-center text-left p-6 hover:bg-slate-700/50 transition-colors"
                aria-expanded={isOpen}
            >
                <div className="flex items-center">
                    <span className="text-3xl mr-4">{phase.icon}</span>
                    <h3 className="text-xl font-bold text-cyan-400">{phase.title}</h3>
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
                <div className="p-6 pt-0 text-slate-300 space-y-6 animate-fade-in">
                    {/* Key Objectives */}
                    <div>
                        <h4 className="font-bold text-slate-100 mb-2">Key Objectives</h4>
                        <ul className="list-disc list-inside space-y-1 text-slate-400">
                            {phase.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
                        </ul>
                    </div>
                    {/* Main Protocols */}
                    <div>
                        <h4 className="font-bold text-slate-100 mb-2">Main Protocols</h4>
                        <ul className="list-disc list-inside space-y-1 text-slate-400">
                            {phase.protocols.map((proto, i) => (
                                <li key={i}>
                                    {proto.text}
                                    {proto.action && (
                                        <button onClick={() => navigateTo(proto.action as any)} className="ml-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline">(Open Tool)</button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                    {/* Critical Risk Points */}
                    <div>
                        <h4 className="font-bold text-red-400 mb-2">Critical Risk Points</h4>
                        <ul className="list-disc list-inside space-y-1 text-slate-400">
                            {phase.risks.map((risk, i) => <li key={i}>{risk}</li>)}
                        </ul>
                    </div>
                     {/* Suggested Tools */}
                    <div>
                        <h4 className="font-bold text-yellow-400 mb-2">Suggested Tools</h4>
                        <ul className="list-disc list-inside space-y-1 text-slate-400">
                            {phase.tools.map((tool, i) => <li key={i}>{tool}</li>)}
                        </ul>
                    </div>
                    
                    <MandateSection mandate={phase.mandate} />
                </div>
            )}
        </div>
    );
}

const ProjectPhaseGuide: React.FC = () => {
    const [openSectionId, setOpenSectionId] = useState<string | null>(phasesData[0]?.id ?? null);

    const handleToggleSection = (sectionId: string) => {
        setOpenSectionId(prevId => (prevId === sectionId ? null : sectionId));
    };

    return (
        <div className="animate-fade-in">
            <BackButton text="Back to HUB" />
            <div className="text-center mb-8">
                <p className="mt-2 text-xl text-slate-400 max-w-3xl mx-auto">
                    Expand each project phase to view detailed protocols, objectives, and tools.
                </p>
            </div>

            {/* Accordion */}
            <div>
                {phasesData.map(phase => (
                    <AccordionSection 
                        key={phase.id}
                        phase={phase}
                        isOpen={openSectionId === phase.id}
                        onClick={() => handleToggleSection(phase.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default ProjectPhaseGuide;