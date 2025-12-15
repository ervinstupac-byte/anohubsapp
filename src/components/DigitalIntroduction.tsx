import React, { useState } from 'react';
import { BackButton } from './BackButton.tsx';
import { useNavigation } from '../contexts/NavigationContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { GlassCard } from './ui/GlassCard.tsx'; // <--- UI Kit
import { ModernButton } from './ui/ModernButton.tsx'; // <--- UI Kit

export const DigitalIntroduction: React.FC = () => {
    const { navigateTo } = useNavigation();
    const { showToast } = useToast();
    const [signed, setSigned] = useState(false);

    const handleSign = () => {
        setSigned(true);
        showToast('Standard of Excellence Accepted. Welcome to AnoHub.', 'success');
        setTimeout(() => {
            navigateTo('hub');
        }, 1200);
    };

    return (
        <div className="animate-fade-in space-y-12 pb-12 max-w-5xl mx-auto">
            {!signed && <div className="absolute top-0 left-0"><BackButton text="Exit" /></div>}
            
            {/* HERO SECTION */}
            <div className="text-center space-y-6 pt-12">
                <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-2xl">
                    The <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">0.05 mm/m</span> Mandate
                </h2>
                <p className="text-slate-400 text-xl max-w-3xl mx-auto leading-relaxed font-light">
                    AnoHub is not just a tool; it is an enforcement agency for the Standard of Excellence. 
                    We exist to eliminate the <strong className="text-white font-bold">Execution Gap</strong>—the silent killer of hydropower longevity.
                </p>
            </div>

            {/* DEFINITION BOX */}
            <GlassCard className="p-10 border-l-8 border-l-red-500 bg-gradient-to-r from-red-950/30 to-slate-900/50">
                <h3 className="text-2xl font-bold text-red-500 mb-4 uppercase tracking-widest flex items-center gap-3">
                    <span className="text-3xl">⚠️</span> The Enemy: The Execution Gap
                </h3>
                <p className="text-slate-300 text-lg leading-relaxed font-light">
                    The "Execution Gap" is the critical divergence between a flawless engineering plan and the inconsistent reality of on-site implementation. 
                    It is born from a lack of discipline, vague contracts ("industry standard"), and undocumented deviations. 
                    <strong className="text-white font-bold block mt-4">Our mission is to close this gap to zero.</strong>
                </p>
            </GlassCard>

            {/* THE THREE POSTULATES */}
            <div className="space-y-8">
                <div className="flex items-center gap-4 justify-center">
                    <div className="h-px w-20 bg-slate-700"></div>
                    <h3 className="text-2xl font-bold text-white text-center uppercase tracking-[0.2em]">The Three Postulates</h3>
                    <div className="h-px w-20 bg-slate-700"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Postulate 1: Precision */}
                    <GlassCard className="border-t-4 border-t-cyan-500 hover:-translate-y-2 transition-transform duration-300">
                        <div className="text-5xl mb-6 p-4 bg-cyan-900/20 rounded-2xl inline-block text-cyan-400">🎯</div>
                        <h4 className="text-2xl font-bold text-white mb-4">1. Precision</h4>
                        <p className="text-slate-400 text-sm mb-6 font-medium">
                            Precision is a discipline. We reject the "0.1 mm/m" habit.
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-start text-xs text-slate-300"><span className="text-cyan-500 mr-2">●</span><span><strong>0.05 mm/m Mandate:</strong> Non-negotiable for bearing longevity.</span></li>
                            <li className="flex items-start text-xs text-slate-300"><span className="text-cyan-500 mr-2">●</span><span><strong>Digital Verification:</strong> Immutable proof required.</span></li>
                            <li className="flex items-start text-xs text-slate-300"><span className="text-cyan-500 mr-2">●</span><span><strong>Zero Tolerance:</strong> "Good enough" is the enemy.</span></li>
                        </ul>
                    </GlassCard>

                    {/* Postulate 2: Risk */}
                    <GlassCard className="border-t-4 border-t-amber-500 hover:-translate-y-2 transition-transform duration-300">
                        <div className="text-5xl mb-6 p-4 bg-amber-900/20 rounded-2xl inline-block text-amber-400">⚠️</div>
                        <h4 className="text-2xl font-bold text-white mb-4">2. Risk Mitigation</h4>
                        <p className="text-slate-400 text-sm mb-6 font-medium">
                            Closing the "M-E Synergy Gap" between mechanics and control.
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-start text-xs text-slate-300"><span className="text-amber-500 mr-2">●</span><span><strong>Synergy Gap:</strong> SCADA must reflect mechanical reality.</span></li>
                            <li className="flex items-start text-xs text-slate-300"><span className="text-amber-500 mr-2">●</span><span><strong>Supply Chain:</strong> Certified materials (EN 10204 3.1) only.</span></li>
                            <li className="flex items-start text-xs text-slate-300"><span className="text-amber-500 mr-2">●</span><span><strong>Obsolescence:</strong> Proactive upgrades before failure.</span></li>
                        </ul>
                    </GlassCard>

                    {/* Postulate 3: Ethics */}
                    <GlassCard className="border-t-4 border-t-emerald-500 hover:-translate-y-2 transition-transform duration-300">
                        <div className="text-5xl mb-6 p-4 bg-emerald-900/20 rounded-2xl inline-block text-emerald-400">🛡️</div>
                        <h4 className="text-2xl font-bold text-white mb-4">3. Stewardship</h4>
                        <p className="text-slate-400 text-sm mb-6 font-medium">
                            Respecting the investor's capital and the river's ecosystem.
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-start text-xs text-slate-300"><span className="text-emerald-500 mr-2">●</span><span><strong>LCC Optimization:</strong> Repair over Replace when viable.</span></li>
                            <li className="flex items-start text-xs text-slate-300"><span className="text-emerald-500 mr-2">●</span><span><strong>Ecosystem:</strong> Continuous E-Flow measurement.</span></li>
                            <li className="flex items-start text-xs text-slate-300"><span className="text-emerald-500 mr-2">●</span><span><strong>Transparency:</strong> Full data disclosure.</span></li>
                        </ul>
                    </GlassCard>
                </div>
            </div>

            {/* ACTION AREA */}
            <div className="pt-12 flex flex-col items-center gap-8 border-t border-slate-800 mt-12">
                {signed ? (
                    <div className="animate-scale-in text-center p-8 bg-emerald-900/20 border border-emerald-500/50 rounded-3xl">
                        <div className="text-7xl mb-6">✅</div>
                        <h3 className="text-3xl font-black text-white uppercase tracking-tight">Mandate Accepted</h3>
                        <p className="text-emerald-400 font-mono mt-2 animate-pulse">Initializing Operations Hub...</p>
                    </div>
                ) : (
                    <>
                        <ModernButton
                            onClick={handleSign}
                            variant="primary"
                            className="px-12 py-5 text-xl shadow-cyan-500/30"
                        >
                            I ACCEPT THE MANDATE
                        </ModernButton>

                        <div className="flex flex-col sm:flex-row gap-8 opacity-60 hover:opacity-100 transition-opacity">
                            <a 
                                href="mailto:ino@anohubs.com?subject=Consultation Request" 
                                className="text-xs text-slate-400 hover:text-white uppercase tracking-widest font-bold border-b border-transparent hover:border-white pb-1 transition-all"
                            >
                                🤝 Request Consultation
                            </a>
                            <span className="hidden sm:inline text-slate-700">|</span>
                            <a 
                                href="mailto:ino@anohubs.com?subject=Audit Inquiry" 
                                className="text-xs text-slate-400 hover:text-white uppercase tracking-widest font-bold border-b border-transparent hover:border-white pb-1 transition-all"
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