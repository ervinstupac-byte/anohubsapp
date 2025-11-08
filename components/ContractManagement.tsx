import React from 'react';
import { BackButton } from './BackButton';

const ContractManagement: React.FC = () => {
    return (
        <div className="animate-fade-in space-y-8">
            <BackButton text="Back to HUB" />
            <div className='text-center'>
                <h2 className="text-3xl font-bold text-white mb-2">Contract Management & Legal Risk Mitigation</h2>
                <p className="text-slate-400 mb-8 max-w-3xl mx-auto">Ensuring technical standards are legally binding and that the Execution Gap does not create legal liability.</p>
            </div>

            <div className="space-y-6">
                {/* Section 1 */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-cyan-400 mb-3">1. The Technical Specification Mandate</h3>
                    <p className="text-slate-300 mb-4">Introducing the **"Zero-Tolerance Specification Clause"**. This clause mandates the legal inclusion of the **0.05 mm/m** precision standard and the **Acoustic Baseline/RCFA protocol** into all vendor contracts, ensuring technical discipline is legally required.</p>
                    <div className="p-4 bg-slate-900/50 border-l-4 border-red-500 rounded-r-lg">
                        <h4 className="font-bold text-red-400">CRITICAL Risk Factor:</h4>
                        <p className="text-slate-300 mt-1 text-sm">Vague contractual language (e.g., "Industry Best Practice") is a primary source of the Execution Gap. AnoHub's measurable technical metrics provide the clarity needed for legal enforcement.</p>
                    </div>
                </div>

                {/* Section 2 */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-cyan-400 mb-3">2. The Warranty Integrity Audit</h3>
                    <p className="text-slate-300">A mandatory audit checklist focused on **Warranty Validity Risk**. This checks if the **Digital Logbook** is consistently updated and verified, ensuring the client has legal proof against a warranty claim denial due to poor documentation (the Execution Gap liability).</p>
                </div>

                {/* Section 3 */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-cyan-400 mb-3">3. Dispute Resolution & Legal Documentation</h3>
                    <p className="text-slate-300">The **Digital Integrity Ledger** (Blockchain concept) maintains a secure, unalterable record of all CRITICAL verification protocols (e.g., Final Alignment Data). This serves as **irrefutable evidence** in legal disputes, protecting your project from unsubstantiated claims.</p>
                </div>
            </div>

            <div className="mt-10 text-center p-6 bg-cyan-900/50 border border-cyan-500 rounded-lg">
                <h3 className="text-2xl font-bold text-white mb-3">Protect Your Capital. Audit Your Technical Specifications.</h3>
                <a href="mailto:info@anohubs.com?subject=Inquiry: Technical Specification Audit" className="inline-block px-8 py-3 bg-cyan-600 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-500 transition-colors transform hover:scale-105">
                    Audit Against AnoHub Standards
                </a>
            </div>
        </div>
    );
};
export default ContractManagement;