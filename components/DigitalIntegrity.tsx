import React from 'react';

// Reusable Glass Section (Standardizirano)
const Section: React.FC<{ title: string; children: React.ReactNode; className?: string; delay?: number }> = ({ title, children, className, delay = 0 }) => (
    <div 
        className={`glass-panel rounded-2xl p-6 animate-fade-in-up ${className}`}
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className="flex items-center space-x-3 mb-6">
            <div className="h-8 w-1 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
            <h3 className="text-xl font-bold text-white tracking-wide">{title}</h3>
        </div>
        {children}
    </div>
);

const DigitalIntegrity: React.FC = () => {
    return (
        <div className="space-y-8 pb-8 max-w-5xl mx-auto">
            
            {/* HEADER */}
            <div className="text-center space-y-4 animate-fade-in-up">
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    Digital Integrity & <span className="text-cyan-400">Blockchain</span>
                </h2>
                <p className="text-slate-400 text-lg max-w-3xl mx-auto leading-relaxed">
                    Establishing the definitive, unalterable proof of compliance required to protect your warranty and close the Execution Gap.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* LEFT COLUMN: THE CORE CONCEPT */}
                <div className="space-y-8">
                    <Section title="The Immutable Protocol Mandate" delay={100}>
                        <p className="text-slate-300 mb-6 leading-relaxed">
                            Introducing the <strong className="text-white">'Digital Integrity Ledger'</strong>. 
                            Every time a CRITICAL protocol is digitally signed in AnoHub, that data point is instantly stored on an Immutable Ledger.
                        </p>
                        
                        <div className="space-y-3 bg-slate-900/40 p-4 rounded-xl border border-slate-700/50">
                            <div className="flex items-center justify-between text-sm text-slate-400 border-b border-slate-700 pb-2 mb-2">
                                <span>Example Data Block:</span>
                                <span className="text-cyan-500 font-mono text-xs">HASH: #8A2...9F1</span>
                            </div>
                            <ul className="space-y-2 text-sm text-cyan-100 font-mono">
                                <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>Final Shaft Alignment: 0.04 mm/m</li>
                                <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>Final Torque: Verified</li>
                                <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>E-Flow: Compliant</li>
                            </ul>
                        </div>
                    </Section>

                    {/* GLOWING CORE VALUE BOX */}
                    <div className="relative group animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                        <div className="relative glass-panel p-6 rounded-2xl border-cyan-500/30">
                            <h4 className="font-bold text-cyan-300 flex items-center mb-3">
                                <span className="text-2xl mr-3">⚖️</span>
                                Core Value: Irrefutable Proof
                            </h4>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                This eliminates data falsification, providing <strong className="text-white">irrefutable legal proof</strong> of technical discipline against any warranty denial claim. 
                                It is the ultimate defense against the Execution Gap.
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: AUDIT & AI */}
                <div className="space-y-8">
                    <Section title="Audit Trail for Non-Compliance" delay={300}>
                        <div className="flex items-start space-x-4">
                            <div className="text-4xl p-2 bg-slate-800 rounded-lg">🔍</div>
                            <div>
                                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                                    The Ledger also records all <strong className="text-red-400">CRITICAL Protocol Failures</strong> and subsequent <strong className="text-green-400">REWORK & VERIFY</strong> actions.
                                </p>
                                <p className="text-slate-400 text-xs italic">
                                    "Transparency builds trust. Showing how you fixed a problem is as important as preventing it."
                                </p>
                            </div>
                        </div>
                    </Section>

                    <Section title="Hydro-Prijatelj as Regulator" delay={400}>
                         <div className="flex items-start space-x-4">
                            <div className="text-4xl p-2 bg-slate-800 rounded-lg">🤖</div>
                            <div>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    The <strong className="text-cyan-400">Hydro-Prijatelj AI</strong> acts as the gatekeeper.
                                </p>
                                <div className="mt-3 p-3 bg-cyan-900/20 border-l-2 border-cyan-500 text-cyan-200 text-sm font-medium">
                                    "Hydro-Prijatelj ensures that only Immutably Verified Data can be used for final Commissioning Sign-Off."
                                </div>
                            </div>
                        </div>
                    </Section>
                </div>
            </div>

            {/* CTA SECTION */}
            <div className="mt-12 text-center animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                <div className="inline-block p-[1px] rounded-xl bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500">
                    <div className="bg-slate-900 rounded-xl p-8 backdrop-blur-xl">
                        <h3 className="text-2xl font-bold text-white mb-2">Secure Your Warranty</h3>
                        <p className="text-slate-400 mb-6">Adopt the Immutable Protocol and protect your assets forever.</p>
                        
                        <a 
                            href="mailto:info@anohubs.com?subject=Inquiry: Immutable Protocol Adoption" 
                            className="inline-flex items-center px-8 py-4 bg-cyan-600 text-white font-bold rounded-lg shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:bg-cyan-500 hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:-translate-y-1 transition-all duration-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Request Consultation
                        </a>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default DigitalIntegrity;