import React from 'react';
import { BackButton } from './BackButton';

const DigitalIntroduction: React.FC = () => {
    return (
        <div className="animate-fade-in space-y-12 pb-12 max-w-5xl mx-auto">
            <BackButton text="Back to HUB" />
            
            {/* HERO SECTION */}
            <div className="text-center space-y-6">
                <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                    The <span className="text-cyan-400">0.05 mm/m</span> Mandate
                </h2>
                <p className="text-slate-300 text-lg max-w-3xl mx-auto leading-relaxed">
                    Hydro-Prijatelj is not just a consultancy; it is an enforcement agency for the Standard of Excellence. 
                    We exist to eliminate the <strong>Execution Gap</strong>—the silent killer of hydropower longevity.
                </p>
            </div>

            {/* DEFINITION BOX */}
            <div className="glass-panel p-8 rounded-2xl border-l-4 border-red-500 bg-gradient-to-r from-red-900/20 to-slate-900/50">
                <h3 className="text-xl font-bold text-red-400 mb-2 uppercase tracking-widest">The Enemy: The Execution Gap</h3>
                <p className="text-slate-300 leading-relaxed">
                    The "Execution Gap" is the critical divergence between a flawless engineering plan and the inconsistent reality of on-site implementation. 
                    It is born from a lack of discipline, vague contracts ("industry standard"), and undocumented deviations. 
                    <strong>Our mission is to close this gap to zero.</strong>
                </p>
            </div>

            {/* THE THREE POSTULATES */}
            <div className="space-y-8">
                <h3 className="text-2xl font-bold text-white text-center mb-8">The Three Postulates of Hydro-Prijatelj</h3>

                {/* Postulate 1: Precision */}
                <div className="glass-panel p-8 rounded-2xl border-t-4 border-cyan-500 hover:bg-slate-800/80 transition-colors">
                    <div className="flex items-start gap-4">
                        <div className="text-4xl">🎯</div>
                        <div>
                            <h4 className="text-xl font-bold text-cyan-400 mb-2">1. The Postulate of Precision</h4>
                            <p className="text-slate-300 mb-4">
                                Precision is not a goal; it is a discipline. The industry often accepts 0.1 mm/m alignment. We reject this.
                            </p>
                            <ul className="list-disc list-inside text-sm text-slate-400 space-y-2">
                                <li><strong>The 0.05 mm/m Mandate:</strong> Shaft alignment must meet this tolerance to guarantee bearing longevity.</li>
                                <li><strong>Digital Verification:</strong> No alignment is valid without a digitally signed, immutable record.</li>
                                <li><strong>Zero Tolerance:</strong> "Good enough" is the enemy of excellence. Deviations must be corrected, not just noted.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Postulate 2: Risk */}
                <div className="glass-panel p-8 rounded-2xl border-t-4 border-yellow-500 hover:bg-slate-800/80 transition-colors">
                    <div className="flex items-start gap-4">
                        <div className="text-4xl">⚠️</div>
                        <div>
                            <h4 className="text-xl font-bold text-yellow-400 mb-2">2. The Postulate of Risk Mitigation</h4>
                            <p className="text-slate-300 mb-4">
                                Risk is systemic, not just mechanical. We focus on the "M-E Synergy Gap"—the friction between Mechanical reality and Electrical control.
                            </p>
                            <ul className="list-disc list-inside text-sm text-slate-400 space-y-2">
                                <li><strong>The M-E Synergy Gap:</strong> Ensuring the SCADA system accurately reflects mechanical stress (vibration, heat).</li>
                                <li><strong>Supply Chain Integrity:</strong> Mandating certified materials (EN 10204 3.1) to prevent counterfeit failure.</li>
                                <li><strong>Obsolescence Management:</strong> Proactive upgrades of control systems before vendor support ends.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Postulate 3: Ethics */}
                <div className="glass-panel p-8 rounded-2xl border-t-4 border-green-500 hover:bg-slate-800/80 transition-colors">
                    <div className="flex items-start gap-4">
                        <div className="text-4xl">🛡️</div>
                        <div>
                            <h4 className="text-xl font-bold text-green-400 mb-2">3. The Postulate of Ethics & LCC</h4>
                            <p className="text-slate-300 mb-4">
                                True engineering excellence respects both the investor's capital and the river's ecosystem.
                            </p>
                            <ul className="list-disc list-inside text-sm text-slate-400 space-y-2">
                                <li><strong>LCC Optimization:</strong> We prioritize "Repair" over "Replace" whenever scientifically viable to reduce Lifecycle Costs.</li>
                                <li><strong>Ecosystem Protection:</strong> Automatic, continuous measurement of Environmental Flow (E-Flow) is a non-negotiable operational requirement.</li>
                                <li><strong>Transparency:</strong> Full disclosure of all diagnostic data to the asset owner.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA BUTTONS (FIXED EMAIL) */}
            <div className="flex flex-col sm:flex-row justify-center gap-6 pt-12">
                <a 
                    href="mailto:ino@anohubs.com?subject=Request Consultation: Zero-Tolerance Audit" 
                    className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg hover:-translate-y-1 transition-all text-center flex items-center justify-center gap-2"
                >
                    <span>🤝</span> Request Consultation
                </a>
                <a 
                    href="mailto:ino@anohubs.com?subject=Inquiry: Audit Against AnoHub Standards" 
                    className="px-8 py-4 bg-slate-800 border border-slate-600 hover:border-white text-white font-bold rounded-xl hover:-translate-y-1 transition-all text-center flex items-center justify-center gap-2"
                >
                    <span>📋</span> Audit Against Standards
                </a>
            </div>
        </div>
    );
};

export default DigitalIntroduction;