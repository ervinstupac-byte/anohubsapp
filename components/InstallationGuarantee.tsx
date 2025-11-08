import React, { useState, useEffect } from 'react';
import { BackButton } from './BackButton';
import { useRisk } from '../contexts/RiskContext';
import type { ProtocolSection, ProtocolStep, VerificationData, VerificationStatus } from '../types';

const LOCAL_STORAGE_KEY_PROGRESS = 'installation-progress-v2';

// Protocol Data...
const generalProtocol: ProtocolSection[] = [
    {
        id: 'gen1', title: 'Phase 1: Project Initiation - Closing the Execution Gap Before It Opens',
        steps: [
            { id: 'g1.1', title: 'Global Quality Assurance (Remote Supervision)', risk: 'Critical', details: ['Internet (min. 5 Mbit/s UPLOAD) and on-site cameras are operational for remote monitoring to ensure ZERO Execution Gap.', 'Daily reports are submitted via cloud service (e.g., OneDrive) for real-time progress tracking.'] },
            { id: 'g1.2', title: 'Ethical and Legal Liability (HSE)', risk: 'Critical', details: ['Local personnel MUST NOT work without direct instructions from the remote GH-AT engineer.', 'Non-compliance with documentation or instructions results in IMMEDIATE SUSPENSION of work to protect all stakeholders.'] },
        ]
    },
     {
        id: 'gen1.5', title: 'Phase 1.5: Initial Embedment & Concreting - The Foundation of Precision',
        steps: [
            { id: 'g1.5.1', title: 'Alignment of Spiral Casing/Penstock', risk: 'Critical', details: ['Verify and document the centerline and level of all embedded steel after the first pour.', 'Cross-check alignment against 3D scan data to prevent civil rework and a foundational Execution Gap.'] },
            { id: 'g1.5.2', title: 'Pressure Testing & Internal Cleanliness', risk: 'Critical', details: ['Conduct hydrostatic pressure test (if applicable) before final pour.', 'Perform a final "White Glove" inspection of the spiral casing and draft tube interior to prevent damage upon commissioning.'] },
            { id: 'g1.5.3', title: 'Anchor Bolt Integrity', risk: 'High Risk', details: ['Verify installation and documentation of all primary anchor bolts (torque, verticality) before encapsulation.'] },
        ]
    },
    {
        id: 'gen2', title: 'Phase 2: Site and Equipment Verification - Discipline in Preparation',
        steps: [
            { id: 'g2.1', title: 'Documentation and Tools', risk: 'Standard', details: ['Verify all documentation is on-site: alignment protocols, packing lists, latest drawings.', 'Inspect and organize all tools according to the project tool list.'] },
            { id: 'g2.2', title: 'Equipment Handling and Storage', risk: 'High Risk', details: ['Inspect all equipment for transport damage BEFORE unloading.', 'Handle all components with certified, pre-inspected lifting equipment.', 'Store all opened equipment in a dry, protected area.'] },
            { id: 'g2.3', title: 'Foundation and Concrete Inspection', risk: 'Critical', details: ['Check foundation dimensions and levels against the "general arrangement drawing".', 'Ensure all centerlines are provided by the customer and clearly marked.'] },
        ]
    },
    {
        id: 'gen3.5', title: 'Phase 3.5: Electrical & Automation - Eliminating the M-E Synergy Gap',
        steps: [
            { id: 'g3.5.1', title: 'Protection System Check', risk: 'Critical', details: ['Verify the calibration and response time of generator protection relays (e.g., overcurrent) as per HOAI standard.'] },
            { id: 'g3.5.2', title: 'Digital Twin Data Integrity', risk: 'Critical', details: ['Test and document the data flow and accuracy (latency check) from all mechanical sensors (vibration, temp) to the SCADA system to guarantee reliable input for AI Monitoring.'] },
            { id: 'g3.5.3', title: 'Documentation Flawlessness', risk: 'High Risk', details: ['Final audit of all electrical design documentation. Errors in electrical design directly cause mechanical stress, creating the M-E Synergy Gap.'] },
        ]
    },
    {
        id: 'gen4', title: 'Phase 4: Commissioning & Final Guarantee - Proof of Excellence',
        steps: [
            { id: 'g4.1', title: 'Efficiency and Power Tests', risk: 'Critical', details: ['Conduct final efficiency (full/partial load) and output power tests to verify the contractual Performance Guarantee. This is the final validation of LCC promises.'] },
            { id: 'g4.2', title: 'Acoustic Baseline FINAL', risk: 'Critical', details: ['Record the final, post-commissioning Acoustic Baseline Fingerprint and store it with official completion documents (Digital Twin starting point for RCFA).'] },
            { id: 'g4.3', title: 'Operator Training & Knowledge Transfer', risk: 'High Risk', details: ['Formal, documented training of the operator staff. A signed protocol is mandatory to prevent a future Execution Gap in operational discipline.'] },
        ]
    }
];
const kaplanProtocol: ProtocolSection[] = [
    {
        id: 'kap1', title: 'Phase 1 & 2: Mechanical Assembly - Enforcing the Precision Mandate', steps: [
            { id: 'k1.1', title: 'Centerlines and Reference Lines', risk: 'High Risk', details: ['Mark centerlines of the draft tube elbow and generator on the 1st stage concrete.'] },
            { id: 'k1.2', title: 'Positioning and Welding the Draft Tube', risk: 'Critical', details: ['Position, align, and weld draft tube parts. All seams must be ground smooth inside and out.'] },
            { id: 'k1.3', title: 'Runner Casing & Drivetrain Assembly', risk: 'High Risk', details: ['Install runner casing and drivetrain, aligning centerlines.', 'Inspect and adjust runner blade clearance to be equal around the entire circumference.'] },
            { id: 'k1.4', title: 'Final Shaft Alignment', risk: 'Critical', validation: { type: 'number', condition: 'lessThanOrEqual', value: 0.05 }, details: ['Couple generator and turbine. Tighten bolts to 100% torque in sequence.', 'Measure final alignment. Value must be ≤ 0.05 mm/m.'], tooltip: "Precision Mandate: 0.05 mm/m is our non-negotiable standard for longevity and closing the Execution Gap." },
        ]
    },
    {
        id: 'kap3', title: 'Phase 3: Post-Commissioning & Handover - The Foundation of LCC Optimization', steps: [
            { id: 'k3.1', title: 'Acoustic Baseline & Data Transfer', risk: 'Critical', details: ['After successful commissioning, a 7-day Acoustic Baseline Fingerprint must be recorded.', 'Securely transfer data to the AI Monitoring platform. This is mandatory for the Digital Twin.'], tooltip: "Ignoring the Acoustic Baseline means reverting to reactive maintenance, where Cavitation (the Cause) is only discovered after irreversible damage (Erosion - the Symptom) has occurred, violating the Standard of Excellence." }
        ]
    }
];
const francisProtocol: ProtocolSection[] = [
    {
        id: 'fra1', title: 'Phase 1 & 2: Assembly - Closing the Execution Gap', steps: [
             { id: 'f1.1', title: 'MIV (Main Inlet Valve) Assembly', risk: 'High Risk', details: ['Inspect function and components of MIV, including bypass and counterweights.'] },
             { id: 'f1.2', title: 'Shaft Seal and Lubrication System', risk: 'Critical', details: ['Inspect all parts of the shaft seal before assembly.', 'Connect and verify the central lubrication system.'] },
             { id: 'f1.3', title: 'Final Shaft Alignment', risk: 'Critical', validation: { type: 'number', condition: 'lessThanOrEqual', value: 0.05 }, details: ['Couple generator and turbine. Tighten bolts to 100% torque in sequence.', 'Measure final alignment. Value must be ≤ 0.05 mm/m.'], tooltip: "Precision Mandate: 0.05 mm/m is our non-negotiable standard for longevity and closing the Execution Gap." },
        ]
    },
     {
        id: 'fra3', title: 'Phase 3: Post-Commissioning & Handover - The Foundation of LCC Optimization', steps: [
            { id: 'fra3.1', title: 'Acoustic Baseline & Data Transfer', risk: 'Critical', details: ['After successful commissioning, a 7-day Acoustic Baseline Fingerprint must be recorded.', 'Securely transfer data to the AI Monitoring platform. This is mandatory for the Digital Twin.'], tooltip: "Ignoring the Acoustic Baseline means reverting to reactive maintenance, where Cavitation (the Cause) is only discovered after irreversible damage (Erosion - the Symptom) has occurred, violating the Standard of Excellence." }
        ]
    }
];
const peltonProtocol: ProtocolSection[] = [
    {
        id: 'pel1', title: 'Phase 1: Casing Alignment and Fixation - The 0.05 mm/m Mandate', steps: [
            { id: 'p1.1', title: 'Height and Level Adjustment', risk: 'Critical', validation: { type: 'number', condition: 'lessThanOrEqual', value: 0.05 }, details: ['Use a precision machinist level (0.05mm/m) on four sides of the generator flange to ensure it is perfectly level.'], tooltip: "The geometric perfection of the foundation is a non-negotiable defense against the Execution Gap." },
            { id: 'p1.2', title: 'Fixing the Position', risk: 'Critical', details: ['Connect the casing to the foundation with chemicals and threaded anchor rods.', 'Weld T-profiles from casing supports to foundation plates to prevent movement during concreting.'] },
        ]
    },
    {
        id: 'pel2', title: 'Phase 2: Post-Concreting Assembly - Mitigating M-E Synergy Risk', steps: [
            { id: 'p2.1', title: 'Jet Deflector and Generator', risk: 'Critical', details: ['Install jet deflector and test function with compressed air.', 'Position and level the generator on the casing with jacking screws and shims.'] },
            { id: 'p2.2', title: 'System Integration', risk: 'High Risk', details: ['Connect all hydraulic pipes according to the schematic. Flush the system before final connection.', 'Install and inspect all mechanical and electrical sensors.'] },
        ]
    }
];
// ... end data

const InstallationGuarantee: React.FC = () => {
    // ... states
    const [openSection, setOpenSection] = useState<string | null>('gen1');
    const [activeTab, setActiveTab] = useState<'General' | 'Kaplan' | 'Francis' | 'Pelton'>('General');
    const [progress, setProgress] = useState<Record<string, VerificationData>>({});
    const { disciplineRiskScore, updateDisciplineRiskScore } = useRisk();
    const [modalState, setModalState] = useState<{ isOpen: boolean; step: ProtocolStep | null, sectionId: string | null }>({ isOpen: false, step: null, sectionId: null });

    // ... useEffects for loading/saving data
    useEffect(() => {
        try {
            const savedProgress = localStorage.getItem(LOCAL_STORAGE_KEY_PROGRESS);
            if (savedProgress) setProgress(JSON.parse(savedProgress));
        } catch (error) { console.error("Failed to load data", error); }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY_PROGRESS, JSON.stringify(progress));
        } catch (error) { console.error("Failed to save data", error); }
    }, [progress]);

    const handleVerification = (stepId: string, data: Omit<VerificationData, 'status'>) => {
        const step = modalState.step;
        let status: VerificationStatus = 'Verified';
        let riskPenalty = 0;

        if (step?.risk === 'Critical' && step.validation) {
            const numericValue = parseFloat(data.value);
            if (isNaN(numericValue)) {
                status = 'Failed';
            } else if (step.validation.condition === 'lessThanOrEqual' && numericValue > step.validation.value) {
                status = 'Failed';
            } else if (step.validation.condition === 'greaterThanOrEqual' && numericValue < step.validation.value) {
                status = 'Failed';
            }
        }
        
        const existingStatus = progress[stepId]?.status;
        if (status === 'Failed' && existingStatus !== 'Failed' && existingStatus !== 'Reworked') {
            riskPenalty = 15;
            alert(`PROTOCOL FAILED. This non-compliance automatically increases the Systemic Risk Score by +15 points due to increased Execution Gap liability and potential warranty invalidation.`);
        }

        setProgress(prev => ({...prev, [stepId]: { ...data, status, timestamp: new Date().toISOString() }}));
        if(riskPenalty > 0) updateDisciplineRiskScore(riskPenalty, 'add');
        setModalState({ isOpen: false, step: null, sectionId: null });
    };

    const markForRework = (stepId: string) => {
        setProgress(prev => ({ ...prev, [stepId]: { ...prev[stepId], status: 'Reworked' } }));
        alert("This CRITICAL protocol is now marked for rework. The remote expert will be notified. You cannot complete this phase until this is resolved.");
    };

    const openVerificationModal = (step: ProtocolStep, sectionId: string) => {
        setModalState({ isOpen: true, step, sectionId });
    };

    const handleResetAll = () => {
        if (window.confirm('Are you sure you want to reset ALL progress and the risk score? This cannot be undone.')) {
            setProgress({});
            updateDisciplineRiskScore(0, 'reset');
        }
    };

    const protocols = { General: generalProtocol, Kaplan: kaplanProtocol, Francis: francisProtocol, Pelton: peltonProtocol };
    const currentProtocol = protocols[activeTab];
    
    // ... Render logic follows, using states and handlers
    return (
        <div className="animate-fade-in">
          {/* Header and Tabs */}
           <BackButton text="Back to HUB" />
            <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2">Hydropower Plant Installation Standard</h2>
                <p className="text-slate-400 mb-8">A dynamic, accountability-driven tool for enforcing the Standard of Excellence during assembly.</p>
            </div>
            
            <div className="sticky top-0 bg-slate-800 py-4 z-10 no-print">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                     <div className="text-center sm:text-left">
                        <p className="text-sm uppercase tracking-wider text-red-400">Discipline Risk Index</p>
                        <p className="text-4xl font-bold text-white">{disciplineRiskScore}</p>
                     </div>
                     <button onClick={handleResetAll} className="px-3 py-2 text-xs bg-red-800 text-red-300 border border-red-600 rounded-md hover:bg-red-700">Reset All Progress</button>
                </div>
                <div className="flex space-x-2 border-b border-slate-700 pb-2 overflow-x-auto">
                   {(['General', 'Kaplan', 'Francis', 'Pelton'] as const).map(tab => 
                       <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-semibold rounded-md whitespace-nowrap ${activeTab === tab ? 'bg-cyan-600' : 'bg-slate-700 hover:bg-slate-600'}`}>
                           {tab} Protocol
                       </button>
                   )}
                </div>
            </div>
            
            {/* Accordion Sections */}
             <div className="space-y-4 mt-6">
                {currentProtocol.map(section => (
                    <ProtocolSectionComponent 
                        key={section.id} 
                        section={section} 
                        progress={progress}
                        onVerifyClick={openVerificationModal}
                    />
                ))}
            </div>

            {/* Verification Modal */}
            {modalState.isOpen && modalState.step && modalState.sectionId &&
                <VerificationModal 
                    step={modalState.step}
                    sectionId={modalState.sectionId}
                    onClose={() => setModalState({ isOpen: false, step: null, sectionId: null })}
                    onSubmit={handleVerification}
                />
            }
        </div>
    );
};

// ... ProtocolSectionComponent and VerificationModal sub-components would be defined here
// This is a placeholder for brevity as the logic is complex
const ProtocolSectionComponent: React.FC<{
    section: ProtocolSection,
    progress: Record<string, VerificationData>,
    onVerifyClick: (step: ProtocolStep, sectionId: string) => void,
}> = ({ section, progress, onVerifyClick }) => {
    const [isOpen, setIsOpen] = useState(true);

    const completedCount = section.steps.filter(s => progress[s.id]?.status === 'Verified' || progress[s.id]?.status === 'Reworked').length;
    const progressPercent = section.steps.length > 0 ? (completedCount / section.steps.length) * 100 : 0;
    
    const riskStyles = {
        'Critical': 'border-red-500/50 text-red-300',
        'High Risk': 'border-yellow-500/50 text-yellow-300',
        'Standard': 'border-blue-500/50 text-blue-300'
    };
    
    const statusStyles = {
        'Verified': 'bg-green-500/20 text-green-300 border-green-500/50',
        'Failed': 'bg-red-500/20 text-red-300 border-red-500/50',
        'Reworked': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
        'Pending': 'bg-slate-600/50 text-slate-400 border-slate-500/50'
    };

    return (
        <div className="border border-slate-700 rounded-lg bg-slate-800/50">
            {/* Header */}
            <div className="w-full flex justify-between items-center text-left p-4">
                <div>
                    <h3 className="text-lg font-bold text-cyan-400">{section.title}</h3>
                    <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2"><div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${progressPercent}%` }}></div></div>
                </div>
            </div>
            {/* Steps */}
            <div className="p-4 border-t border-slate-700 space-y-3">
                {section.steps.map(step => {
                    const verification = progress[step.id];
                    const status = verification?.status || 'Pending';
                    return (
                        <div key={step.id} className="p-3 bg-slate-900/50 rounded-lg">
                            <div className="flex justify-between items-start gap-2">
                                <div className="flex-grow">
                                    <h4 className={`font-semibold ${step.risk === 'Critical' ? 'text-red-300' : 'text-slate-100'}`}>{step.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                       {step.risk && <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${riskStyles[step.risk]}`}>{step.risk}</span>}
                                       <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${statusStyles[status]}`}>{status}</span>
                                    </div>
                                </div>
                                <button onClick={() => onVerifyClick(step, section.id)} className="px-3 py-1.5 text-sm font-semibold bg-cyan-700 hover:bg-cyan-600 rounded">
                                    {status === 'Pending' ? 'Verify' : 'Update'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const VerificationModal: React.FC<{
    step: ProtocolStep,
    sectionId: string,
    onClose: () => void,
    onSubmit: (stepId: string, data: Omit<VerificationData, 'status'>) => void,
}> = ({ step, sectionId, onClose, onSubmit }) => {
    const [value, setValue] = useState('');
    const [comment, setComment] = useState('');
    const [logbook, setLogbook] = useState(false);

    const handleSubmit = () => {
        if (step.risk === 'Critical' && !value) {
            alert('A measured value is mandatory for CRITICAL protocols.');
            return;
        }
        onSubmit(step.id, { value, comment, logbookConfirmed: logbook });
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 w-full max-w-md">
                <h3 className="text-lg font-bold mb-1">{step.title}</h3>
                <p className="text-sm text-slate-400 mb-4">{step.details.join(' ')}</p>
                
                <div>
                    <label className="block text-sm font-medium mb-1">Measured Value {step.risk === 'Critical' && <span className="text-red-400">*</span>}</label>
                    <input type="text" value={value} onChange={e => setValue(e.target.value)} className="w-full bg-slate-700 p-2 rounded" placeholder={step.validation ? `e.g., must be <= ${step.validation.value}` : 'e.g., 0.04 mm/m'}/>
                </div>
                <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Comment/Observation</label>
                    <textarea value={comment} onChange={e => setComment(e.target.value)} className="w-full bg-slate-700 p-2 rounded" rows={2}></textarea>
                </div>
                 <div className="mt-4">
                    <label className="flex items-center">
                        <input type="checkbox" checked={logbook} onChange={e => setLogbook(e.target.checked)} className="h-4 w-4 rounded bg-slate-700 text-cyan-500" />
                        <span className="ml-2 text-sm">Data uploaded to Cloud Logbook</span>
                    </label>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-600 rounded">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-cyan-600 rounded">Verify & Sign</button>
                </div>
            </div>
        </div>
    );
};

export default InstallationGuarantee;