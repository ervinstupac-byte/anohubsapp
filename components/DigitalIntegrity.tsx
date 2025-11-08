import React from 'react';
import { BackButton } from './BackButton';

const DigitalIntegrity: React.FC = () => {
    return (
        <div className="animate-fade-in space-y-8">
            <BackButton text="Back to HUB" />
            <div className='text-center'>
                <h2 className="text-3xl font-bold text-white mb-2">Digital Integrity: Blockchain & Immutable Records</h2>
                <p className="text-slate-400 mb-8 max-w-3xl mx-auto">Establishing the definitive, unalterable proof of compliance required to protect your warranty and close the Execution Gap against legal liability.</p>
            </div>
            
            <div className="space-y-6">
                {/* Section 1 */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-cyan-400 mb-3">1. The Immutable Protocol Mandate</h3>
                    <p className="text-slate-300 mb-4">Introducing the **'Digital Integrity Ledger'**. Every time a CRITICAL protocol (e.g., Final Shaft Alignment @ **0.05 mm/m**, Final Torque of Anchor Bolts, E-Flow Measurement) is digitally signed/verified in the AnoHub, that data point is instantly stored on an Immutable Ledger (Blockchain concept).</p>
                    <div className="p-4 bg-slate-900/50 border-l-4 border-cyan-400 rounded-r-lg">
                        <h4 className="font-bold text-cyan-300">Core Value: Irrefutable Proof</h4>
                        <p className="text-slate-300 mt-1 text-sm">This eliminates the possibility of data falsification, providing **irrefutable legal proof** of technical discipline against any warranty denial claim. It is the ultimate defense against the Execution Gap.</p>
                    </div>
                </div>

                {/* Section 2 */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-cyan-400 mb-3">2. Audit Trail for Non-Compliance</h3>
                    <p className="text-slate-300">The Ledger also records all **CRITICAL Protocol Failures** and subsequent **REWORK & VERIFY** actions. This provides a transparent, auditable history of the client's commitment to fixing the Execution Gap, demonstrating discipline and due diligence.</p>
                </div>

                {/* Section 3 */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-cyan-400 mb-3">3. Hydro-Prijatelj as Regulator</h3>
                    <p className="text-slate-300">The Hydro-Prijatelj AI acts as the gatekeeper: "Hydro-Prijatelj ensures that only **Immutably Verified Data** can be used for final Commissioning Sign-Off." This makes the digital record the single source of truth for project completion.</p>
                </div>
            </div>
            
            <div className="mt-10 text-center p-6 bg-cyan-900/50 border border-cyan-500 rounded-lg">
                <h3 className="text-2xl font-bold text-white mb-3">Secure Your Warranty. Adopt the Immutable Protocol Now.</h3>
                <a href="mailto:info@anohubs.com?subject=Inquiry: Immutable Protocol Adoption" className="inline-block px-8 py-3 bg-cyan-600 text-white font-bold rounded-lg shadow-lg hover:bg-cyan-500 transition-colors transform hover:scale-105">
                    Request Consultation
                </a>
            </div>
        </div>
    );
};
export default DigitalIntegrity;