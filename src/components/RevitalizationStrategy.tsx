import React from 'react';

// Reusable Glass Section
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

const RevitalizationStrategy: React.FC = () => {
    return (
        <div className="space-y-8 pb-8 max-w-5xl mx-auto">
            
            {/* HEADER */}
            <div className="text-center space-y-4 animate-fade-in-up">
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    Asset <span className="text-cyan-400">Revitalization</span> & Obsolescence
                </h2>
                <p className="text-slate-400 text-lg max-w-3xl mx-auto leading-relaxed">
                    Data-driven decision making: Life extension vs. Replacement. Ensuring LCC Optimization by closing the M-E Synergy Gap.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* LEFT COLUMN: ANALYSIS & DECISION */}
                <div className="space-y-8">
                    <Section title="Life Extension Analysis (LEA)" delay={100}>
                        <p className="text-slate-300 mb-6 leading-relaxed">
                            We introduce the <strong className="text-white">Systemic Degradation Score</strong>. 
                            This integrates RCFA data, vibration deviations, and outage costs to determine if a component is truly at End-of-Life (EOL).
                        </p>
                        
                        <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-700/50 flex flex-col gap-4">
                            <div className="flex justify-between items-center text-sm text-slate-400">
                                <span>Decision Matrix:</span>
                                <span className="text-cyan-400 font-bold">LCC OPTIMIZATION</span>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1 bg-green-500/20 text-green-400 text-center py-2 rounded border border-green-500/30 text-sm font-bold">
                                    Refurbish
                                </div>
                                <div className="flex-1 bg-slate-700/30 text-slate-500 text-center py-2 rounded border border-slate-600 text-sm">
                                    vs
                                </div>
                                <div className="flex-1 bg-cyan-600/20 text-cyan-400 text-center py-2 rounded border border-cyan-500/30 text-sm font-bold">
                                    Replace
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-cyan-900/20 border-l-2 border-cyan-500 text-sm text-cyan-100 italic rounded-r-lg">
                            "A full replacement is only acceptable when systemic risk dictates it, not when the market demands it. Ethics first."
                        </div>
                    </Section>

                    <Section title="The Retrospective Digital Twin" delay={300}>
                        <div className="flex items-start space-x-4">
                            <div className="text-4xl p-2 bg-slate-800 rounded-lg">🧬</div>
                            <div>
                                <p className="text-slate-300 text-sm leading-relaxed mb-3">
                                    Mapping a Legacy Asset using <strong className="text-white">3D scanning & thermal imaging</strong>.
                                </p>
                                <p className="text-slate-400 text-xs">
                                    This is key for accurately modeling hydraulic improvements (e.g. new runners) and ensuring the new parts fit the old reality.
                                </p>
                            </div>
                        </div>
                    </Section>
                </div>

                {/* RIGHT COLUMN: RISKS & OBSOLESCENCE */}
                <div className="space-y-8">
                    <Section title="Obsolescence Risk Matrix" delay={200} className="h-full">
                        <p className="text-slate-300 mb-6 leading-relaxed">
                            A mandatory audit for tracking technological obsolescence, focusing primarily on <strong className="text-white">SCADA, Governors, and Protection Relays</strong>.
                        </p>

                        <div className="p-5 bg-red-900/20 border border-red-500/30 rounded-xl relative overflow-hidden group hover:bg-red-900/30 transition-colors">
                            <h4 className="font-bold text-red-400 flex items-center mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                CRITICAL: Documentation Gap
                            </h4>
                            <p className="text-slate-300 text-sm relative z-10">
                                The biggest risk is not hardware failure, but <strong className="text-white">Information Loss</strong>. 
                                When the original vendor support ends, and knowledge hasn't been transferred to a Digital Twin, you face a massive Execution Gap.
                            </p>
                        </div>

                        <ul className="mt-6 space-y-3">
                            <li className="flex items-center text-sm text-slate-300">
                                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                                Control Systems (5-10 yr cycle)
                            </li>
                            <li className="flex items-center text-sm text-slate-300">
                                <span className="w-2 h-2 bg-cyan-500 rounded-full mr-3"></span>
                                Mechanical Assets (30-50 yr cycle)
                            </li>
                            <li className="flex items-center text-sm text-slate-300">
                                <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                                The M-E Synergy Gap occurs here.
                            </li>
                        </ul>
                    </Section>
                </div>
            </div>

            {/* CTA SECTION */}
            <div className="mt-12 text-center animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                <div className="inline-block p-[1px] rounded-xl bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500">
                    <div className="bg-slate-900 rounded-xl p-8 backdrop-blur-xl">
                        <h3 className="text-2xl font-bold text-white mb-2">Retirement or Reinvention?</h3>
                        <p className="text-slate-400 mb-6">Schedule an audit to determine the future of your asset.</p>
                        
                        <a 
                            href="mailto:ino@anohubs.com?subject=Inquiry: Obsolescence Audit" 
                            className="inline-flex items-center px-8 py-4 bg-cyan-600 text-white font-bold rounded-lg shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:bg-cyan-500 hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:-translate-y-1 transition-all duration-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Schedule Obsolescence Audit
                        </a>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default RevitalizationStrategy;