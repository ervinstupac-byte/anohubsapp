import React from 'react';
import { BackButton } from './BackButton';

const DigitalIntegrity: React.FC = () => {
    return (
        <div className="animate-fade-in space-y-12 pb-12 max-w-5xl mx-auto">
            <BackButton text="Back to HUB" />
            
            {/* HERO SECTION */}
            <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    Digital Integrity & <span className="text-purple-400">Blockchain</span>
                </h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    The immutable ledger. Moving from "Trust me" to "Here is the cryptographic proof."
                </p>
            </div>

            {/* CONCEPT VISUALIZATION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="glass-panel p-6 rounded-2xl">
                    <div className="text-4xl mb-3">📸</div>
                    <h4 className="font-bold text-white">1. Capture</h4>
                    <p className="text-xs text-slate-400 mt-1">Technician takes a photo of the torque wrench reading or alignment screen.</p>
                </div>
                <div className="flex items-center justify-center text-slate-600">
                    <svg className="w-8 h-8 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
                <div className="glass-panel p-6 rounded-2xl border border-purple-500/50 bg-purple-900/10">
                    <div className="text-4xl mb-3">🔐</div>
                    <h4 className="font-bold text-white">2. Hash & Time-stamp</h4>
                    <p className="text-xs text-slate-400 mt-1">Data is converted to a SHA-256 hash and anchored to the blockchain.</p>
                </div>
                <div className="flex items-center justify-center text-slate-600">
                    <svg className="w-8 h-8 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
                <div className="glass-panel p-6 rounded-2xl border border-green-500/50 bg-green-900/10">
                    <div className="text-4xl mb-3">🛡️</div>
                    <h4 className="font-bold text-white">3. Immutable Proof</h4>
                    <p className="text-xs text-slate-400 mt-1">The record cannot be deleted, altered, or backdated. It is legal evidence.</p>
                </div>
            </div>

            {/* DEEP DIVE SECTION */}
            <div className="glass-panel p-8 rounded-2xl border-l-4 border-purple-500">
                <div className="flex items-start gap-4">
                    <div className="text-3xl mt-1">⛓️</div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-3">Why a Paper Logbook is a Liability</h3>
                        <p className="text-slate-300 leading-relaxed mb-4">
                            In a warranty dispute involving millions of Euros, a paper logbook is weak evidence. It can be lost, coffee-stained, or (as often happens) filled out days after the actual work was done ("pencil whipping").
                        </p>
                        <p className="text-slate-300 leading-relaxed">
                            <strong>The "Execution Gap" thrives in the shadows of bad documentation.</strong> If you cannot prove that the alignment was 0.05 mm/m on the day of installation, the manufacturer can claim it drifted due to "improper operation," voiding your warranty.
                        </p>
                    </div>
                </div>
            </div>

            {/* BENEFITS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
                    <h4 className="text-green-400 font-bold uppercase tracking-widest text-sm mb-2">The Liability Shield</h4>
                    <p className="text-sm text-slate-400">
                        When a component fails, the first question is "Was it installed correctly?" With Digital Integrity, you send a link to the ledger entry. 
                        The discussion ends, and the <strong>manufacturer's liability begins</strong>.
                    </p>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
                    <h4 className="text-cyan-400 font-bold uppercase tracking-widest text-sm mb-2">Resale Value</h4>
                    <p className="text-sm text-slate-400">
                        An asset with a complete, verified digital history ("Digital Twin Passport") is worth significantly more during due diligence for acquisition or refinancing.
                    </p>
                </div>
            </div>

            {/* CTA */}
            <div className="text-center pt-8">
                <div className="inline-block p-[1px] rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600">
                    <div className="bg-slate-900 rounded-xl p-8 backdrop-blur-xl">
                        <h3 className="text-2xl font-bold text-white mb-2">Secure Your Asset's History</h3>
                        <p className="text-slate-400 mb-6">Deploy the AnoHUB Digital Integrity Ledger for your project.</p>
                        
                        <a 
                            href="mailto:ino@anohubs.com?subject=Inquiry: Digital Integrity Ledger Deployment" 
                            className="inline-flex items-center px-8 py-4 bg-purple-600 text-white font-bold rounded-lg shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:bg-purple-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:-translate-y-1 transition-all duration-300"
                        >
                            <span className="mr-2">🚀</span> Deploy Integrity Ledger
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DigitalIntegrity;