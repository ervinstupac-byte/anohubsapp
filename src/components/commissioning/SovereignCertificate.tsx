import React from 'react';
import { ShieldCheck, Award, AlertOctagon } from 'lucide-react';
import { CommissioningState } from '../../lib/commissioning/WizardService';

interface SovereignCertificateProps {
    data: CommissioningState;
    timestamp?: string;
}

export const SovereignCertificate: React.FC<SovereignCertificateProps> = ({ data, timestamp = new Date().toISOString() }) => {
    const isPerfect = !data.hydraulic?.qualityViolation;

    return (
        <div className="relative w-full max-w-3xl mx-auto aspect-[1.414] bg-[#050505] p-8 md:p-12 text-center text-amber-50 shadow-2xl border-[16px] border-[#101010] overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-600 via-black to-black pointer-events-none" />

            {/* Border Details */}
            <div className="absolute top-4 left-4 right-4 bottom-4 border border-amber-500/30 pointer-events-none" />
            <div className="absolute top-6 left-6 right-6 bottom-6 border border-amber-500/20 pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 flex flex-col items-center gap-4 mb-8">
                <div className={`p-4 rounded-full border-2 ${isPerfect ? 'bg-amber-900/20 border-amber-500 text-amber-500' : 'bg-red-900/20 border-red-500 text-red-500'}`}>
                    {isPerfect ? <Award className="w-12 h-12" /> : <AlertOctagon className="w-12 h-12" />}
                </div>
                <h1 className="text-3xl font-serif tracking-widest text-amber-500 uppercase">Sovereign Systems</h1>
                <div className="h-px w-32 bg-amber-500/50" />
                <h2 className="text-xl font-light tracking-[0.2em] text-slate-300">CERTIFICATE OF COMMISSIONING</h2>
            </div>

            {/* Content Grid */}
            <div className="relative z-10 grid grid-cols-2 gap-8 text-left max-w-lg mx-auto font-mono text-sm leading-relaxed mb-12">

                {/* Milestone 1: Alignment */}
                <div className="space-y-1">
                    <p className="text-xs text-amber-500 uppercase tracking-wider">01. Alignment</p>
                    <p className="text-white">Deviation: <span className="text-amber-300">{data.alignment.plumbnessDeviation} mm/m</span></p>
                    <p className="text-slate-500 text-[10px]">LASER VERIFIED</p>
                </div>

                {/* Milestone 2: Bearings */}
                <div className="space-y-1">
                    <p className="text-xs text-amber-500 uppercase tracking-wider">02. Bearings</p>
                    <p className="text-white">Clearance: <span className="text-amber-300">{((data.bearings.clearanceTop + data.bearings.clearanceBottom) / 2).toFixed(3)} mm</span></p>
                    <p className="text-slate-500 text-[10px]">ASPERITY FREE</p>
                </div>

                {/* Milestone 3: Metallurgy */}
                <div className="space-y-1">
                    <p className="text-xs text-amber-500 uppercase tracking-wider">03. Metallurgy</p>
                    <p className="text-white">Runner: <span className="text-amber-300">{data.metallurgy.runnerMaterial}</span></p>
                    {data.metallurgy.ceramicCoatingApplied && (
                        <p className="text-cyan-400 text-[10px] flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> CERAMIC ARMORED</p>
                    )}
                </div>

                {/* Milestone 5: Hydraulic (The Trap) */}
                <div className="space-y-1">
                    <p className="text-xs text-amber-500 uppercase tracking-wider">05. Hydraulic Integrity</p>
                    <p className="text-white">Symmetry Gap: <span className={isPerfect ? "text-amber-300" : "text-red-500 font-bold"}>
                        {Math.abs((data.hydraulic?.guideVaneGapTopAvg || 0) - (data.hydraulic?.guideVaneGapBottomAvg || 0)).toFixed(3)} mm
                    </span></p>
                    {!isPerfect && <p className="text-red-500 text-[10px] font-bold">QUALITY VIOLATION</p>}
                </div>

            </div>

            {/* Footer / Signature */}
            <div className="relative z-10 grid grid-cols-2 gap-12 max-w-xl mx-auto mt-auto pt-8 border-t border-slate-800">
                <div className="text-left">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Unit Status</p>
                    <p className={`text-xl font-bold tracking-wider ${isPerfect ? 'text-cyan-400' : 'text-red-500'}`}>
                        {isPerfect ? 'BORN PERFECT' : 'RESTRICTED'}
                    </p>
                    <p className="text-[10px] text-slate-600 font-mono mt-1">{timestamp}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-4">Authorized Signature</p>
                    <div className="font-serif italic text-2xl text-amber-500/80 transform -rotate-2">
                        Monolit Architect
                    </div>
                    <div className="w-32 h-px bg-amber-500/30 mt-2" />
                </div>
            </div>

            {/* Watermark in QA Fail */}
            {!isPerfect && (
                <>
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none opacity-30 transform -rotate-12">
                        <h1 className="text-9xl font-black text-red-500 border-8 border-red-500 p-8 rounded-xl uppercase tracking-widest">
                            VIOLATION
                        </h1>
                    </div>

                    {/* NC-200: Intervention CTA */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 w-full max-w-sm">
                        <button
                            onClick={() => alert("INTERVENTION REQUEST SENT. \nThe Architect has been notified of this violation.")}
                            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black tracking-[0.2em] uppercase border-2 border-red-400 shadow-[0_0_20px_rgba(220,38,38,0.5)] animate-pulse flex items-center justify-center gap-3 transition-all hover:scale-105"
                        >
                            <AlertOctagon className="w-5 h-5" /> Request Architect Intervention
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
