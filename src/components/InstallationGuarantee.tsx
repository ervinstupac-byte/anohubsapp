import React, { useState, useEffect } from 'react';
import { BackButton } from './BackButton.tsx';
import { useRisk } from '../contexts/RiskContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx'; 
import { useAuth } from '../contexts/AuthContext.tsx'; // <--- NOVO: Auth
import { supabase } from '../services/supabaseClient.ts';
import { generateInstallationReport } from '../utils/pdfGenerator.ts';
import type { ProtocolSection, ProtocolStep, VerificationData, VerificationStatus } from '../types.ts';

const LOCAL_STORAGE_KEY_PROGRESS = 'installation-progress-v3';

// --- PROTOCOL DATA ---
const generalProtocol: ProtocolSection[] = [
    {
        id: 'gen1', title: 'Phase 1: Project Initiation',
        steps: [
            { id: 'g1.1', title: 'Global Quality Assurance', risk: 'Critical', details: ['Internet (min. 5 Mbit/s UPLOAD) and on-site cameras operational.', 'Daily reports submitted via cloud service.'] },
            { id: 'g1.2', title: 'Ethical and Legal Liability (HSE)', risk: 'Critical', details: ['Local personnel MUST NOT work without direct instructions from remote engineer.', 'Non-compliance results in IMMEDIATE SUSPENSION.'] },
        ]
    },
     {
        id: 'gen1.5', title: 'Phase 1.5: Initial Embedment',
        steps: [
            { id: 'g1.5.1', title: 'Alignment of Spiral Casing', risk: 'Critical', details: ['Verify centerline and level after first pour.', 'Cross-check alignment against 3D scan data.'] },
            { id: 'g1.5.2', title: 'Pressure Testing', risk: 'Critical', details: ['Hydrostatic pressure test before final pour.', 'White Glove inspection of interior.'] },
            { id: 'g1.5.3', title: 'Anchor Bolt Integrity', risk: 'High Risk', details: ['Verify torque and verticality of primary anchor bolts.'] },
        ]
    },
    {
        id: 'gen2', title: 'Phase 2: Site Verification',
        steps: [
            { id: 'g2.1', title: 'Documentation and Tools', risk: 'Standard', details: ['Verify all documentation is on-site.', 'Inspect and organize tools.'] },
            { id: 'g2.2', title: 'Equipment Handling', risk: 'High Risk', details: ['Inspect for transport damage BEFORE unloading.', 'Use certified lifting equipment.'] },
            { id: 'g2.3', title: 'Foundation Inspection', risk: 'Critical', details: ['Check foundation dimensions against drawings.', 'Ensure centerlines are clearly marked.'] },
        ]
    },
    {
        id: 'gen3.5', title: 'Phase 3.5: Electrical & Automation',
        steps: [
            { id: 'g3.5.1', title: 'Protection System Check', risk: 'Critical', details: ['Verify calibration of protection relays (HOAI standard).'] },
            { id: 'g3.5.2', title: 'Digital Twin Integrity', risk: 'Critical', details: ['Test data flow/latency from sensors to SCADA.'] },
            { id: 'g3.5.3', title: 'Documentation Audit', risk: 'High Risk', details: ['Final audit of electrical design to prevent M-E Synergy Gap.'] },
        ]
    },
    {
        id: 'gen4', title: 'Phase 4: Commissioning',
        steps: [
            { id: 'g4.1', title: 'Efficiency Tests', risk: 'Critical', details: ['Conduct efficiency and output power tests.'] },
            { id: 'g4.2', title: 'Acoustic Baseline FINAL', risk: 'Critical', details: ['Record post-commissioning Acoustic Fingerprint.'] },
            { id: 'g4.3', title: 'Operator Training', risk: 'High Risk', details: ['Formal, documented training of operator staff.'] },
        ]
    }
];

const kaplanProtocol: ProtocolSection[] = [
    {
        id: 'kap1', title: 'Phase 1 & 2: Mechanical Assembly', steps: [
            { id: 'k1.1', title: 'Centerlines', risk: 'High Risk', details: ['Mark centerlines of draft tube and generator.'] },
            { id: 'k1.2', title: 'Draft Tube Welding', risk: 'Critical', details: ['Weld parts, grind seams smooth inside and out.'] },
            { id: 'k1.3', title: 'Runner Assembly', risk: 'High Risk', details: ['Install runner casing, check blade clearance.'] },
            { id: 'k1.4', title: 'Final Shaft Alignment', risk: 'Critical', validation: { type: 'number', condition: 'lessThanOrEqual', value: 0.05 }, details: ['Tighten bolts to 100% torque.', 'Measure alignment (Must be ≤ 0.05 mm/m).'], tooltip: "Precision Mandate: 0.05 mm/m is non-negotiable." },
        ]
    },
    {
        id: 'kap3', title: 'Phase 3: Post-Commissioning', steps: [
            { id: 'k3.1', title: 'Acoustic Baseline', risk: 'Critical', details: ['Record 7-day Acoustic Baseline.', 'Transfer data to AI Monitoring.'], tooltip: "Essential for detecting Cavitation before damage occurs." }
        ]
    }
];

const francisProtocol: ProtocolSection[] = [
    {
        id: 'fra1', title: 'Phase 1 & 2: Assembly', steps: [
             { id: 'f1.1', title: 'MIV Assembly', risk: 'High Risk', details: ['Inspect MIV components, bypass, and counterweights.'] },
             { id: 'f1.2', title: 'Shaft Seal', risk: 'Critical', details: ['Inspect seal parts, verify lubrication system.'] },
             { id: 'f1.3', title: 'Final Shaft Alignment', risk: 'Critical', validation: { type: 'number', condition: 'lessThanOrEqual', value: 0.05 }, details: ['Tighten bolts to 100% torque.', 'Measure alignment (Must be ≤ 0.05 mm/m).'] },
        ]
    },
     {
        id: 'fra3', title: 'Phase 3: Post-Commissioning', steps: [
            { id: 'fra3.1', title: 'Acoustic Baseline', risk: 'Critical', details: ['Record 7-day Acoustic Baseline.', 'Transfer data to AI Monitoring.'] }
        ]
    }
];

const peltonProtocol: ProtocolSection[] = [
    {
        id: 'pel1', title: 'Phase 1: Casing Alignment', steps: [
            { id: 'p1.1', title: 'Level Adjustment', risk: 'Critical', validation: { type: 'number', condition: 'lessThanOrEqual', value: 0.05 }, details: ['Use precision level (0.05mm/m) on generator flange.'] },
            { id: 'p1.2', title: 'Fixing Position', risk: 'Critical', details: ['Anchor casing to foundation chemically and mechanically.'] },
        ]
    },
    {
        id: 'pel2', title: 'Phase 2: Final Assembly', steps: [
            { id: 'p2.1', title: 'Jet Deflector', risk: 'Critical', details: ['Install deflector, test with compressed air.'] },
            { id: 'p2.2', title: 'System Integration', risk: 'High Risk', details: ['Connect hydraulic pipes, flush system.', 'Install sensors.'] },
        ]
    }
];

// --- HELPER COMPONENTS ---

const StatusBadge: React.FC<{ status: VerificationStatus }> = ({ status }) => {
    let classes = "";
    let icon = "";
    
    switch (status) {
        case 'Verified': classes = "bg-green-500/20 text-green-400 border-green-500/50 shadow-[0_0_10px_rgba(74,222,128,0.2)]"; icon = "✓"; break;
        case 'Failed': classes = "bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(248,113,113,0.2)]"; icon = "⚠️"; break;
        case 'Reworked': classes = "bg-yellow-500/20 text-yellow-400 border-yellow-500/50 shadow-[0_0_10px_rgba(250,204,21,0.2)]"; icon = "🔄"; break;
        default: classes = "bg-slate-700/50 text-slate-400 border-slate-600"; icon = "○"; break;
    }

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 ${classes}`}>
            {icon} {status.toUpperCase()}
        </span>
    );
};

// --- MAIN COMPONENT ---

const InstallationGuarantee: React.FC = () => {
    const { showToast } = useToast();
    const { user } = useAuth(); // <--- KORISTIMO AUTH
    const [activeTab, setActiveTab] = useState<'General' | 'Kaplan' | 'Francis' | 'Pelton'>('General');
    const [isSyncing, setIsSyncing] = useState(false);
    
    const [progress, setProgress] = useState<Record<string, VerificationData>>(() => {
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PROGRESS);
            return saved ? JSON.parse(saved) : {};
        } catch { return {}; }
    });

    const { disciplineRiskScore, updateDisciplineRiskScore } = useRisk();
    const [modalState, setModalState] = useState<{ isOpen: boolean; step: ProtocolStep | null, sectionId: string | null }>({ isOpen: false, step: null, sectionId: null });

    // Save on every change
    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY_PROGRESS, JSON.stringify(progress));
    }, [progress]);

    const handleVerification = (stepId: string, data: Omit<VerificationData, 'status' | 'timestamp'>) => {
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
            showToast(`PROTOCOL FAILED! Risk Score +15. Correction required.`, 'error');
        } else if (status === 'Verified') {
            showToast('Protocol step verified successfully.', 'success');
        }

        setProgress(prev => ({...prev, [stepId]: { ...data, status, timestamp: new Date().toISOString() }}));
        if(riskPenalty > 0) updateDisciplineRiskScore(riskPenalty, 'add');
        setModalState({ isOpen: false, step: null, sectionId: null });
    };

    const handleResetAll = () => {
        if (window.confirm('RESET ALL PROTOCOLS? This action is irreversible.')) {
            setProgress({});
            updateDisciplineRiskScore(0, 'reset');
            localStorage.removeItem(LOCAL_STORAGE_KEY_PROGRESS);
            showToast('All protocol data has been reset.', 'info');
        }
    };

    // --- CLOUD SYNC LOGIC ---
    const handleSyncToCloud = async () => {
        setIsSyncing(true);
        try {
            // Izračunaj postotak završenosti
            const protocols = { General: generalProtocol, Kaplan: kaplanProtocol, Francis: francisProtocol, Pelton: peltonProtocol };
            const currentSteps = protocols[activeTab].flatMap(s => s.steps);
            const completedCount = currentSteps.filter(s => progress[s.id]?.status === 'Verified').length;
            const completion = Math.round((completedCount / currentSteps.length) * 100);

            const payload = {
                project_name: 'HPP-Project-Alpha', 
                engineer_id: user?.email || 'Anonymous', // <--- POVEZANO S KORISNIKOM
                turbine_type: activeTab,
                progress_data: progress, 
                risk_score: disciplineRiskScore,
                completion_percentage: completion
            };

            const { error } = await supabase.from('installation_audits').insert([payload]);

            if (error) throw error;

            showToast(`Installation audit synced to Cloud by ${user?.email || 'User'}.`, 'success');
        } catch (error: any) {
            console.error('Sync error:', error);
            showToast(`Failed to sync: ${error.message}`, 'error');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSendReport = () => {
        const protocols = { General: generalProtocol, Kaplan: kaplanProtocol, Francis: francisProtocol, Pelton: peltonProtocol };
        const currentProtocolData = protocols[activeTab];

        generateInstallationReport(progress, disciplineRiskScore, currentProtocolData);
        showToast('PDF Report Generated Successfully.', 'success');

        const subject = `Installation Protocol Report - Risk Score: ${disciplineRiskScore}`;
        const body = `Please find the attached Installation Report generated by AnoHUB.\n\nCurrent Risk Score: ${disciplineRiskScore}\n\n(Attach the downloaded PDF here)`;
        
        setTimeout(() => {
            window.location.href = `mailto:ino@anohubs.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        }, 1500);
    };

    const protocols = { General: generalProtocol, Kaplan: kaplanProtocol, Francis: francisProtocol, Pelton: peltonProtocol };
    const currentProtocol = protocols[activeTab];

    return (
        <div className="animate-fade-in space-y-8 pb-12 max-w-6xl mx-auto">
            <BackButton text="Back to Dashboard" />
            
            {/* HEADER */}
            <div className="text-center space-y-4 animate-fade-in-up">
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    Installation <span className="text-cyan-400">Standard</span>
                </h2>
                <div className="flex justify-center items-center gap-2 text-sm text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span>Cloud Sync Active</span>
                </div>
            </div>

            {/* HUD / CONTROL PANEL */}
            <div className="sticky top-4 z-20 glass-panel p-4 rounded-2xl border-cyan-500/20 shadow-2xl backdrop-blur-xl animate-fade-in-up" style={{animationDelay: '100ms'}}>
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    
                    {/* RISK SCORE DISPLAY */}
                    <div className="flex items-center gap-4 bg-slate-900/50 px-6 py-3 rounded-xl border border-slate-700">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
                            Risk Index
                        </div>
                        <div className={`text-4xl font-mono font-black ${disciplineRiskScore > 0 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                            {disciplineRiskScore}
                        </div>
                    </div>

                    {/* TABS */}
                    <div className="flex p-1 bg-slate-900/80 rounded-xl border border-slate-700 overflow-x-auto max-w-full no-scrollbar">
                        {(['General', 'Kaplan', 'Francis', 'Pelton'] as const).map(tab => (
                            <button 
                                key={tab} 
                                onClick={() => setActiveTab(tab)} 
                                className={`
                                    px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 whitespace-nowrap
                                    ${activeTab === tab 
                                        ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/25 scale-105' 
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'}
                                `}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex gap-2">
                        <button 
                            onClick={handleSyncToCloud}
                            disabled={isSyncing}
                            className="text-xs font-bold text-white bg-green-700 hover:bg-green-600 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                            {isSyncing ? 'Syncing...' : '☁️ SYNC'}
                        </button>
                        <button 
                            onClick={handleResetAll} 
                            className="text-xs font-bold text-red-400 hover:text-red-300 border border-red-500/30 px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors"
                        >
                            RESET
                        </button>
                    </div>
                </div>
            </div>

            {/* PROTOCOL LIST */}
            <div className="space-y-6">
                {currentProtocol.map((section, index) => (
                    <ProtocolSectionComponent 
                        key={section.id} 
                        section={section} 
                        progress={progress} 
                        onVerifyClick={setModalState}
                        delay={index * 100}
                    />
                ))}
            </div>

            {/* --- GENERATE PDF REPORT BUTTON --- */}
            <div className="mt-12 pt-8 border-t border-slate-700 text-center animate-fade-in-up">
                <div className="inline-block p-[1px] rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600">
                    <button 
                        onClick={handleSendReport}
                        className="px-10 py-4 bg-slate-900 text-white font-bold rounded-xl shadow-2xl hover:bg-slate-800 transition-all flex items-center gap-3 uppercase tracking-wider group"
                    >
                        <span className="text-xl group-hover:scale-110 transition-transform">📄</span> 
                        Generate Official Audit PDF
                    </button>
                </div>
                <p className="text-slate-500 text-sm mt-3">Downloads a signed PDF report and opens your email client.</p>
            </div>

            {/* VERIFICATION MODAL */}
            {modalState.isOpen && modalState.step && (
                <VerificationModal 
                    step={modalState.step}
                    sectionId={modalState.sectionId!}
                    onClose={() => setModalState({ isOpen: false, step: null, sectionId: null })}
                    onSubmit={handleVerification}
                />
            )}
        </div>
    );
};

// --- SUB-COMPONENT: PROTOCOL SECTION ---
const ProtocolSectionComponent: React.FC<{
    section: ProtocolSection,
    progress: Record<string, VerificationData>,
    onVerifyClick: (state: { isOpen: boolean, step: ProtocolStep, sectionId: string }) => void,
    delay: number
}> = ({ section, progress, onVerifyClick, delay }) => {
    const completedCount = section.steps.filter(s => progress[s.id]?.status === 'Verified' || progress[s.id]?.status === 'Reworked').length;
    const progressPercent = section.steps.length > 0 ? (completedCount / section.steps.length) * 100 : 0;
    const isComplete = progressPercent === 100;

    return (
        <div 
            className={`glass-panel rounded-2xl overflow-hidden animate-fade-in-up transition-all duration-500 ${isComplete ? 'border-green-500/30' : 'border-slate-700/50'}`}
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Section Header */}
            <div className="bg-slate-900/40 p-6 border-b border-slate-700/50 flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h3 className={`text-xl font-bold ${isComplete ? 'text-green-400' : 'text-white'}`}>{section.title}</h3>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="w-32 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-1000 ${isComplete ? 'bg-green-500' : 'bg-cyan-500'}`} style={{ width: `${progressPercent}%` }}></div>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">{completedCount}/{section.steps.length}</span>
                    </div>
                </div>
                {isComplete && <div className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30">SECTION COMPLETE</div>}
            </div>

            {/* Steps Grid */}
            <div className="p-6 grid grid-cols-1 gap-4">
                {section.steps.map(step => {
                    const verification = progress[step.id];
                    const status = verification?.status || 'Pending';
                    
                    return (
                        <div key={step.id} className="group bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 transition-all duration-300 hover:border-slate-600">
                            <div className="flex justify-between items-start gap-4">
                                <div className="space-y-2 flex-grow">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h4 className={`font-bold text-lg ${step.risk === 'Critical' ? 'text-red-200' : 'text-slate-100'}`}>{step.title}</h4>
                                        {step.risk === 'Critical' && <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/30 uppercase tracking-wide">Critical</span>}
                                    </div>
                                    <p className="text-sm text-slate-400 leading-relaxed">{step.details[0]}</p>
                                    
                                    {/* Tooltip hint if available */}
                                    {step.tooltip && (
                                        <p className="text-xs text-cyan-500/80 italic mt-1 flex items-center">
                                            <span className="mr-1">ℹ️</span> {step.tooltip}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col items-end gap-3 min-w-[100px]">
                                    <StatusBadge status={status} />
                                    <button 
                                        onClick={() => onVerifyClick({ isOpen: true, step, sectionId: section.id })} 
                                        className={`
                                            px-4 py-2 text-sm font-bold rounded-lg shadow-lg transition-all transform hover:-translate-y-1 active:scale-95 w-full
                                            ${status === 'Verified' 
                                                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                                                : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-cyan-500/25'}
                                        `}
                                    >
                                        {status === 'Pending' ? 'VERIFY' : 'UPDATE'}
                                    </button>
                                </div>
                            </div>
                            
                            {/* Verification Data Display (if exists) */}
                            {verification && (
                                <div className="mt-4 pt-3 border-t border-slate-700/30 flex items-center gap-4 text-xs font-mono text-slate-500">
                                    <span>Value: <span className="text-slate-300">{verification.value || 'N/A'}</span></span>
                                    <span>•</span>
                                    <span>{new Date(verification.timestamp).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: VERIFICATION MODAL ---
const VerificationModal: React.FC<{
    step: ProtocolStep,
    sectionId: string,
    onClose: () => void,
    onSubmit: (stepId: string, data: Omit<VerificationData, 'status' | 'timestamp'>) => void,
}> = ({ step, onClose, onSubmit }) => {
    const [value, setValue] = useState('');
    const [comment, setComment] = useState('');
    const [logbook, setLogbook] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = () => {
        if (step.risk === 'Critical' && !value) {
            showToast('CRITICAL PROTOCOL: A measured value is MANDATORY.', 'error');
            return;
        }
        onSubmit(step.id, { value, comment, logbookConfirmed: logbook });
    };

    const inputClass = "w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all duration-300 backdrop-blur-sm";

    return (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-600 shadow-2xl overflow-hidden animate-scale-in">
                
                {/* Modal Header */}
                <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700">
                    <h3 className="text-xl font-bold text-white mb-1">{step.title}</h3>
                    <p className="text-sm text-slate-400">Protocol Verification</p>
                </div>

                <div className="p-6 space-y-5">
                    {/* Instruction Box */}
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                        <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                            {step.details.map((d, i) => <li key={i}>{d}</li>)}
                        </ul>
                    </div>

                    {/* Inputs */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                            Measured Value {step.risk === 'Critical' && <span className="text-red-400">*</span>}
                        </label>
                        <input 
                            type="text" 
                            value={value} 
                            onChange={e => setValue(e.target.value)} 
                            className={inputClass}
                            placeholder={step.validation ? `Threshold: ${step.validation.condition === 'lessThanOrEqual' ? '≤' : '≥'} ${step.validation.value}` : 'Enter data point...'}
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Observations</label>
                        <textarea 
                            value={comment} 
                            onChange={e => setComment(e.target.value)} 
                            className={inputClass} 
                            rows={2}
                            placeholder="Optional notes..."
                        ></textarea>
                    </div>

                    <div className="flex items-center p-3 bg-cyan-900/20 rounded-lg border border-cyan-500/20">
                        <input 
                            type="checkbox" 
                            checked={logbook} 
                            onChange={e => setLogbook(e.target.checked)} 
                            className="w-5 h-5 rounded bg-slate-700 border-slate-500 text-cyan-500 focus:ring-cyan-500" 
                            id="logbookCheck"
                        />
                        <label htmlFor="logbookCheck" className="ml-3 text-sm text-cyan-200 cursor-pointer select-none">
                            Upload to Digital Integrity Ledger (Blockchain)
                        </label>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 text-slate-400 hover:text-white font-bold transition-colors">Cancel</button>
                    <button 
                        onClick={handleSubmit} 
                        className="px-8 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:shadow-cyan-500/30 hover:-translate-y-1 transition-all"
                    >
                        Sign & Verify
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstallationGuarantee;