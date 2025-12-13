import React from 'react';
import { useRisk } from '../contexts/RiskContext';

export const InterventionCTA: React.FC = () => {
    const { disciplineRiskScore } = useRisk();

    // Prag za prikazivanje intervencije (mora biti < 55 da se NE prikazuje, tj. prikazuje se ako je >= 55)
    // Ovdje je logika: Ako je score MANJI od 55, vrati null (ne prikazuj ništa).
    if (disciplineRiskScore < 55) {
        return null;
    }

    const mailtoLink = `mailto:ino@anohubs.com?subject=URGENT: Zero-Tolerance Audit Request (Risk Score: ${disciplineRiskScore})&body=SYSTEM ALERT: My current Discipline Risk Index score is ${disciplineRiskScore}, which indicates a CRITICAL level of systemic risk.\n\nI am requesting an immediate scheduling of a private, remote 'Zero-Tolerance Audit' to identify the Execution Gap and protect my asset's warranty.\n\nPlease provide next steps immediately.`;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] no-print animate-fade-in-up">
            {/* Gornji sjaj (Glow) */}
            <div className="absolute -top-10 left-0 right-0 h-20 bg-red-600/20 blur-3xl pointer-events-none animate-pulse"></div>
            
            <div className="bg-gradient-to-r from-red-950/95 via-slate-900/95 to-red-950/95 border-t border-red-500/50 backdrop-blur-xl p-4 sm:p-6 shadow-[0_-10px_40px_rgba(220,38,38,0.3)]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    
                    {/* LEFT: WARNING ICON & SCORE */}
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
                            <div className="bg-red-500/20 p-3 rounded-full border border-red-500 text-red-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>
                        
                        <div>
                            <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-1">System Integrity Critical</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-white text-lg font-bold">Risk Index:</span>
                                <span className="text-4xl font-mono font-black text-red-500">{disciplineRiskScore}</span>
                            </div>
                        </div>
                    </div>

                    {/* MIDDLE: MESSAGE */}
                    <div className="text-center md:text-left md:flex-grow md:px-8">
                        <h3 className="font-bold text-white text-lg mb-1">
                            Immediate Strategic Intervention Required
                        </h3>
                        <p className="text-sm text-slate-400">
                            Your project is highly vulnerable to the <span className="text-white">Execution Gap</span>. Warranty validation is at risk.
                        </p>
                    </div>

                    {/* RIGHT: ACTION BUTTON */}
                    <a
                        href={mailtoLink}
                        className="
                            flex-shrink-0 group relative px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg 
                            shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(220,38,38,0.6)]
                            whitespace-nowrap overflow-hidden flex items-center gap-2
                        "
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            BOOK ZERO-TOLERANCE AUDIT
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </span>
                        {/* Shine Effect */}
                        <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                    </a>

                </div>
            </div>
        </div>
    );
};