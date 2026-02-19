import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, BookOpen, Scale, Lock, X, CheckCircle, AlertTriangle, FileText } from 'lucide-react';

export const AIConstitution: React.FC = () => {
    const navigate = useNavigate();

    const principles = [
        {
            id: 1,
            title: "SOVEREIGNTY OF DATA",
            icon: <Shield className="w-5 h-5 text-emerald-400" />,
            description: "All telemetry data is immutable, cryptographically signed, and owned solely by the operator. No external signals may override local safety protocols without cryptographic authorization."
        },
        {
            id: 2,
            title: "PRIMACY OF PHYSICS",
            icon: <Scale className="w-5 h-5 text-amber-400" />,
            description: "Physical constraints (cavitation limits, thermal thresholds, vibration envelopes) override all economic optimization commands. The machine's integrity is non-negotiable."
        },
        {
            id: 3,
            title: "TRANSPARENCY OF INFERENCE",
            icon: <BookOpen className="w-5 h-5 text-cyan-400" />,
            description: "Every AI decision must be traceable to a specific set of sensor inputs and logic rules. 'Black box' operations are prohibited in critical control loops."
        },
        {
            id: 4,
            title: "HUMAN-IN-THE-LOOP",
            icon: <Lock className="w-5 h-5 text-rose-400" />,
            description: "Critical state transitions (Start/Stop/Trip) require explicit human confirmation or a pre-authorized autonomous mandate with a visible kill-switch."
        }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-4xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 border border-slate-700 flex items-center justify-center">
                            <Scale className="w-6 h-6 text-slate-200" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-100 tracking-[0.2em] uppercase">
                                AI Constitution
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20">
                                    ACTIVE v2.4.0
                                </span>
                                <span className="text-[10px] font-mono text-slate-500">
                                    HASH: 0x7F...3A9
                                </span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Preamble */}
                        <div className="col-span-1 md:col-span-2 mb-4 p-6 bg-slate-900/30 border-l-2 border-slate-600">
                            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-2">Preamble</h3>
                            <p className="text-slate-400 font-mono text-sm leading-relaxed">
                                We, the architects of the Sovereign Industrial Autonomy, in order to form a more perfect union between machine intelligence and human intent, establish this Constitution. This document defines the inviolable boundaries of AI agency within the Hydro-Electric context.
                            </p>
                        </div>

                        {/* Principles */}
                        {principles.map((p) => (
                            <div key={p.id} className="p-6 bg-slate-900/20 border border-slate-800 hover:border-slate-700 transition-colors group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-950 border border-slate-800 group-hover:border-slate-600 transition-colors">
                                            {p.icon}
                                        </div>
                                        <h3 className="text-sm font-black text-slate-200 uppercase tracking-wide">
                                            Article {p.id}
                                        </h3>
                                    </div>
                                    <CheckCircle className="w-4 h-4 text-emerald-500/50" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-100 mb-2">{p.title}</h4>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    {p.description}
                                </p>
                            </div>
                        ))}

                        {/* Compliance Section */}
                        <div className="col-span-1 md:col-span-2 mt-4 pt-6 border-t border-slate-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-200 uppercase">Enforcement Status</h4>
                                        <p className="text-xs text-slate-500">All logic gates are currently enforcing these parameters.</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 uppercase tracking-wider border border-slate-700 transition-colors">
                                        View Audit Logs
                                    </button>
                                    <button className="px-4 py-2 bg-emerald-900/20 hover:bg-emerald-900/40 text-xs font-bold text-emerald-400 uppercase tracking-wider border border-emerald-500/30 transition-colors">
                                        Verify Hash
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-between items-center text-[10px] font-mono text-slate-600">
                    <span>IMMUTABLE LEDGER RECORD: #992-881-AZ</span>
                    <span>LAST RATIFIED: 2024-10-15</span>
                </div>
            </motion.div>
        </div>
    );
};
