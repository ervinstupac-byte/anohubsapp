import React from 'react';

// Reusable komponenta za sekcije (ista kao u DigitalIntroduction za konzistenciju)
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

const ContractManagement: React.FC = () => {
    return (
        <div className="space-y-8 pb-8 max-w-5xl mx-auto">
            
            {/* HEADER */}
            <div className="text-center space-y-4 animate-fade-in-up">
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    Contract Management & <span className="text-cyan-400">Legal Risk</span>
                </h2>
                <p className="text-slate-400 text-lg max-w-3xl mx-auto leading-relaxed">
                    Ensuring technical standards are legally binding. We prevent the Execution Gap from becoming a legal liability.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 1. TEHNIČKA SPECIFIKACIJA (Lijeva strana) */}
                <Section title="The Technical Specification Mandate" delay={100} className="h-full">
                    <p className="text-slate-300 mb-6 leading-relaxed">
                        Introducing the <strong className="text-white">"Zero-Tolerance Specification Clause"</strong>. 
                        This mandate legally enforces:
                    </p>
                    <ul className="space-y-3 mb-6">
                        <li className="flex items-start space-x-3 text-slate-300">
                            <span className="text-cyan-400 mt-1">✓</span>
                            <span>The <strong className="text-cyan-300">0.05 mm/m</strong> precision standard.</span>
                        </li>
                        <li className="flex items-start space-x-3 text-slate-300">
                            <span className="text-cyan-400 mt-1">✓</span>
                            <span>Acoustic Baseline & RCFA protocols.</span>
                        </li>
                    </ul>

                    {/* CRITICAL RISK ALERT - Redizajniran */}
                    <div className="p-5 bg-red-900/20 border border-red-500/30 rounded-xl relative overflow-hidden group hover:bg-red-900/30 transition-colors">
                        <div className="absolute -right-4 -top-4 text-red-500/10 text-9xl font-black select-none">!</div>
                        <h4 className="font-bold text-red-400 flex items-center mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            CRITICAL RISK FACTOR
                        </h4>
                        <p className="text-slate-300 text-sm relative z-10">
                            Vague contractual language (e.g., "Industry Best Practice") is a primary source of the Execution Gap. 
                            <span className="block mt-2 font-medium text-white">AnoHub's metrics provide the legal clarity needed for enforcement.</span>
                        </p>
                    </div>
                </Section>

                {/* Desna strana - Sekcije 2 i 3 */}
                <div className="space-y-8">
                    <Section title="The Warranty Integrity Audit" delay={200}>
                        <div className="flex items-start space-x-4">
                            <div className="text-4xl">🛡️</div>
                            <div>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    A mandatory check for <strong className="text-white">Warranty Validity Risk</strong>. 
                                    We verify if the Digital Logbook is consistently updated, ensuring you have legal proof against any warranty claim denial.
                                </p>
                            </div>
                        </div>
                    </Section>

                    <Section title="Dispute Resolution & Blockchain" delay={300}>
                        <div className="flex items-start space-x-4">
                            <div className="text-4xl">⛓️</div>
                            <div>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    The <strong className="text-white">Digital Integrity Ledger</strong> serves as an unalterable record of all CRITICAL verification protocols (e.g., Final Alignment Data). 
                                    <span className="block mt-2 text-cyan-400 font-medium">Irrefutable evidence in legal disputes.</span>
                                </p>
                            </div>
                        </div>
                    </Section>
                </div>
            </div>

            {/* CTA SECTION - Futuristički gumb */}
            <div className="mt-12 text-center animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                <div className="inline-block p-[1px] rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500">
                    <div className="bg-slate-900 rounded-xl p-8 backdrop-blur-xl">
                        <h3 className="text-2xl font-bold text-white mb-2">Protect Your Capital</h3>
                        <p className="text-slate-400 mb-6">Audit your technical specifications against the Standard of Excellence.</p>
                        
                        <a 
                            href="mailto:info@anohubs.com?subject=Inquiry: Technical Specification Audit" 
                            className="inline-flex items-center px-8 py-4 bg-cyan-600 text-white font-bold rounded-lg shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:bg-cyan-500 hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:-translate-y-1 transition-all duration-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Audit Against AnoHub Standards
                        </a>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ContractManagement;