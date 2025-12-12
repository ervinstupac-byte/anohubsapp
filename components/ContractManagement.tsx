import React from 'react';
import { BackButton } from './BackButton';

const ContractManagement: React.FC = () => {
    return (
        <div className="animate-fade-in space-y-12 pb-12 max-w-5xl mx-auto">
            <BackButton text="Back to HUB" />
            
            {/* HERO SECTION */}
            <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    Contract & <span className="text-cyan-400">Legal Risk</span>
                </h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    The Execution Gap starts in the contract. If you don't legally mandate the 0.05 mm/m standard, you cannot enforce it on site.
                </p>
            </div>

            {/* THE TRAP VS THE SOLUTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* The Trap */}
                <div className="glass-panel p-8 rounded-2xl border-l-4 border-red-500 bg-gradient-to-br from-slate-900 to-red-950/20">
                    <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                        <span>⚠️</span> The "Industry Standard" Trap
                    </h3>
                    <p className="text-slate-300 mb-4 text-sm leading-relaxed">
                        Most HPP contracts use vague phrases like <em>"Installation according to ISO standards"</em> or <em>"Best industry practice."</em>
                    </p>
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-red-500/20">
                        <strong className="text-red-300 text-xs uppercase tracking-widest block mb-2">The Consequence:</strong>
                        <p className="text-slate-400 text-sm">
                            Contractors will default to the easiest tolerance (often 0.1 mm/m or worse). When bearings fail prematurely, 
                            <strong className="text-white"> you have no legal ground to claim warranty</strong> because they "met the standard."
                        </p>
                    </div>
                </div>

                {/* The Solution */}
                <div className="glass-panel p-8 rounded-2xl border-l-4 border-green-500 bg-gradient-to-br from-slate-900 to-green-950/20">
                    <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                        <span>⚖️</span> The Hydro-Prijatelj Clauses
                    </h3>
                    <p className="text-slate-300 mb-4 text-sm leading-relaxed">
                        We provide specific, non-negotiable text blocks to insert into your EPC or O&M contracts *before* signing.
                    </p>
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-green-500/20">
                        <strong className="text-green-300 text-xs uppercase tracking-widest block mb-2">The Protection:</strong>
                        <p className="text-slate-400 text-sm">
                            By defining "Success" as <strong className="text-white">verified 0.05 mm/m alignment</strong>, 
                            payment becomes conditional on quality, not just completion.
                        </p>
                    </div>
                </div>
            </div>

            {/* MANDATORY CLAUSES LIST */}
            <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white text-center">Mandatory Contract Clauses</h3>
                
                <div className="glass-panel p-6 rounded-xl border border-cyan-500/30 hover:border-cyan-500/60 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-bold text-cyan-400">Clause 1: The Precision Payment Trigger</h4>
                        <span className="bg-cyan-900/50 text-cyan-200 text-xs px-2 py-1 rounded border border-cyan-500/30">Financial</span>
                    </div>
                    <p className="text-slate-300 italic text-sm mb-3">
                        "Final payment for the mechanical installation phase is contingent upon the submission of a digital alignment report verifying shaft runout ≤ 0.05 mm/m."
                    </p>
                    <p className="text-xs text-slate-500">Prevents "rush jobs" at the end of the project.</p>
                </div>

                <div className="glass-panel p-6 rounded-xl border border-purple-500/30 hover:border-purple-500/60 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-bold text-purple-400">Clause 2: The Digital Evidence Mandate</h4>
                        <span className="bg-purple-900/50 text-purple-200 text-xs px-2 py-1 rounded border border-purple-500/30">Legal</span>
                    </div>
                    <p className="text-slate-300 italic text-sm mb-3">
                        "All critical torque values and pressure tests must be photo-documented and uploaded to the designated Integrity Ledger within 24 hours of execution."
                    </p>
                    <p className="text-xs text-slate-500">Eliminates the "filled out the logbook in the hotel room" phenomenon.</p>
                </div>

                <div className="glass-panel p-6 rounded-xl border border-yellow-500/30 hover:border-yellow-500/60 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-bold text-yellow-400">Clause 3: The RCFA Right</h4>
                        <span className="bg-yellow-900/50 text-yellow-200 text-xs px-2 py-1 rounded border border-yellow-500/30">Technical</span>
                    </div>
                    <p className="text-slate-300 italic text-sm mb-3">
                        "In the event of failure, the Owner reserves the right to independent Root Cause Failure Analysis (RCFA). If the root cause is determined to be an 'Execution Gap' deviation, the Warranty Period resets."
                    </p>
                    <p className="text-xs text-slate-500">Protects against recurring "symptom fixing" by the manufacturer.</p>
                </div>
            </div>

            {/* CTA */}
            <div className="mt-10 text-center p-8 bg-slate-900/50 border border-slate-700 rounded-2xl">
                <h3 className="text-2xl font-bold text-white mb-2">Audit Your Current Contract</h3>
                <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
                    Are you exposed? Send us your draft contract for a "Red Pen Review" to identify vague clauses before you sign.
                </p>
                <a 
                    href="mailto:ino@anohubs.com?subject=Request: Contract Review & Clause Injection" 
                    className="inline-flex items-center px-8 py-4 bg-slate-100 hover:bg-white text-slate-900 font-bold rounded-xl transition-transform hover:-translate-y-1 shadow-xl"
                >
                    <span className="mr-2">📄</span> Request Contract Review
                </a>
            </div>
        </div>
    );
};

export default ContractManagement;