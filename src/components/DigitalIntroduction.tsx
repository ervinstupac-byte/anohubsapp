import React, { useState } from 'react';
import { BackButton } from './BackButton.tsx';
import { useNavigation } from '../contexts/NavigationContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';

export const DigitalIntroduction: React.FC = () => {
    const { navigateTo } = useNavigation();
    const { showToast } = useToast();
    const [signed, setSigned] = useState(false);

    const handleSign = () => {
        setSigned(true);
        showToast('Standard of Excellence Accepted. Welcome to AnoHub.', 'success');
        // Mala pauza za efekt prije ulaska
        setTimeout(() => {
            navigateTo('hub');
        }, 1200);
    };

    return (
        <div className="animate-fade-in space-y-12 pb-12 max-w-5xl mx-auto">
            {!signed && <BackButton text="Exit" />}
            
            {/* HERO SECTION */}
            <div className="text-center space-y-6">
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                    The <span className="text-cyan-400">0.05 mm/m</span> Mandate
                </h2>
                <p className="text-slate-300 text-lg max-w-3xl mx-auto leading-relaxed">
                    AnoHub is not just a tool; it is an enforcement agency for the Standard of Excellence. 
                    We exist to eliminate the <strong className="text-red-400">Execution Gap</strong>—the silent killer of hydropower longevity.
                </p>
            </div>

            {/* DEFINITION BOX */}
            <div className="glass-panel p-8 rounded-2xl border-l-4 border-red-500 bg-gradient-to-r from-red-900/10 to-slate-900/50">
                <h3 className="text-xl font-bold text-red-400 mb-2 uppercase tracking-widest">The Enemy: The Execution Gap</h3>
                <p className="text-slate-300 leading-relaxed">
                    The "Execution Gap" is the critical divergence between a flawless engineering plan and the inconsistent reality of on-site implementation. 
                    It is born from a lack of discipline, vague contracts ("industry standard"), and undocumented deviations. 
                    <strong>Our mission is to close this gap to zero.</strong>
                </p>
            </div>

            {/* THE THREE POSTULATES */}
            <div className="space-y-8">
                <h3 className="text-2xl font-bold text-white text-center mb-8 uppercase tracking-widest">The Three Postulates</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Postulate 1: Precision */}
                    <div className="glass-panel p-6 rounded-2xl border-t-4 border-cyan-500 hover:bg-slate-800/80 transition-colors">
                        <div className="text-4xl mb-4">🎯</div>
                        <h4 className="text-xl font-bold text-cyan-400 mb-4">1. Precision</h4>
                        <p className="text-slate-300 text-sm mb-4">
                            Precision is a discipline. We reject the "0.1 mm/m" habit.
                        </p>
                        <ul className="list-disc list-inside text-xs text-slate-400 space-y-2">
                            <li><strong>0.05 mm/m Mandate:</strong> Non-negotiable for bearing longevity.</li>
                            <li><strong>Digital Verification:</strong> No alignment is valid without immutable proof.</li>
                            <li><strong>Zero Tolerance:</strong> "Good enough" is the enemy.</li>
                        </ul>
                    </div>

                    {/* Postulate 2: Risk */}
                    <div className="glass-panel p-6 rounded-2xl border-t-4 border-yellow-500 hover:bg-slate-800/80 transition-colors">
                        <div className="text-4xl mb-4">⚠️</div>
                        <h4 className="text-xl font-bold text-yellow-400 mb-4">2. Risk Mitigation</h4>
                        <p className="text-slate-300 text-sm mb-4">
                            Closing the "M-E Synergy Gap" between mechanics and control.
                        </p>
                        <ul className="list-disc list-inside text-xs text-slate-400 space-y-2">
                            <li><strong>Synergy Gap:</strong> SCADA must reflect mechanical reality.</li>
                            <li><strong>Supply Chain:</strong> Certified materials (EN 10204 3.1) only.</li>
                            <li><strong>Obsolescence:</strong> Proactive upgrades before failure.</li>
                        </ul>
                    </div>

                    {/* Postulate 3: Ethics */}
                    <div className="glass-panel p-6 rounded-2xl border-t-4 border-green-500 hover:bg-slate-800/80 transition-colors">
                        <div className="text-4xl mb-4">🛡️</div>
                        <h4 className="text-xl font-bold text-green-400 mb-4">3. Stewardship</h4>
                        <p className="text-slate-300 text-sm mb-4">
                            Respecting the investor's capital and the river's ecosystem.
                        </p>
                        <ul className="list-disc list-inside text-xs text-slate-400 space-y-2">
                            <li><strong>LCC Optimization:</strong> Repair over Replace when viable.</li>
                            <li><strong>Ecosystem:</strong> Continuous E-Flow measurement.</li>
                            <li><strong>Transparency:</strong> Full data disclosure.</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* ACTION AREA */}
            <div className="pt-8 flex flex-col items-center gap-6">
                {signed ? (
                    <div className="animate-scale-in text-center">
                        <div className="text-6xl mb-4">✅</div>
                        <h3 className="text-2xl font-bold text-white">MANDATE ACCEPTED</h3>
                        <p className="text-cyan-400 animate-pulse mt-2">Initializing Operations Hub...</p>
                    </div>
                ) : (
                    <>
                        <button 
                            onClick={handleSign}
                            className="group relative px-12 py-5 bg-cyan-600/20 border border-cyan-500 text-cyan-400 font-bold text-lg tracking-widest rounded-xl hover:bg-cyan-600 hover:text-white transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_40px_rgba(34,211,238,0.4)]"
                        >
                            I ACCEPT THE MANDATE
                        </button>

                        <div className="flex flex-col sm:flex-row gap-4 mt-4 opacity-70 hover:opacity-100 transition-opacity">
                            <a 
                                href="mailto:ino@anohubs.com?subject=Consultation Request" 
                                className="text-xs text-slate-400 hover:text-white border-b border-slate-600 hover:border-white pb-1"
                            >
                                🤝 Request Human Consultation
                            </a>
                            <span className="hidden sm:inline text-slate-600">|</span>
                            <a 
                                href="mailto:ino@anohubs.com?subject=Audit Inquiry" 
                                className="text-xs text-slate-400 hover:text-white border-b border-slate-600 hover:border-white pb-1"
                            >
                                📋 Audit Against Standards
                            </a>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};