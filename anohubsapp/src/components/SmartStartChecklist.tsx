// Smart Start Checklist UI
// Mobile-first Interface for the Field Engineer

import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertOctagon, Activity, FlaskConical, CheckCircle2, ChevronRight, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './ui/GlassCard';
import { SmartStartService, CheckItem } from '../services/SmartStartService';

export const SmartStartChecklist: React.FC = () => {
    const [checks, setChecks] = useState<CheckItem[]>([]);
    const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());

    useEffect(() => {
        // Load checks for Turbine 2 (Kaplan)
        setChecks(SmartStartService.generateChecklist('T2-KAPLAN'));
    }, []);

    const toggleAck = (id: string) => {
        const newAck = new Set(acknowledged);
        if (newAck.has(id)) newAck.delete(id);
        else newAck.add(id);
        setAcknowledged(newAck);
    };

    const allCriticalAck = checks
        .filter(c => c.category === 'CRITICAL_WARNING')
        .every(c => acknowledged.has(c.id));

    return (
        <div className="p-4 max-w-md mx-auto bg-black min-h-screen text-white font-sans">
            {/* Header */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 mb-6 backdrop-blur-md sticky top-4 z-50 shadow-2xl">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                        <ShieldCheck className="text-emerald-400" /> Smart Start
                    </h2>
                    <div className="text-[10px] font-mono bg-black/50 px-2 py-1 rounded text-slate-400">
                        PIT Kaplan (Agregat 2)
                    </div>
                </div>
                <div className="flex gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-500 border border-amber-800">STBY: 92 Days</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">Temp: 12°C</span>
                </div>
            </div>

            <div className="space-y-6 pb-20">
                {/* SECTION 1: CRITICAL LEGACY WARNINGS */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase px-2">
                        <AlertOctagon className="w-4 h-4" /> Legacy Triggers (Must Resolve)
                    </div>

                    {checks.filter(c => c.category === 'CRITICAL_WARNING').map(item => (
                        <div key={item.id} onClick={() => toggleAck(item.id)} className={`p-4 rounded-lg border-l-4 transition-all cursor-pointer ${acknowledged.has(item.id) ? 'bg-slate-900 border-emerald-500 opacity-60' : 'bg-red-950/30 border-red-500 hover:bg-red-900/40'}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-red-100 text-sm mb-1">{item.label}</h4>
                                    <p className="text-xs text-red-300 mb-2">{item.actionRequired}</p>
                                    {item.value && <span className="text-[10px] font-mono bg-red-950 px-1.5 py-0.5 rounded text-red-400">{item.value}</span>}
                                </div>
                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${acknowledged.has(item.id) ? 'bg-emerald-500 border-emerald-500' : 'border-red-500'}`}>
                                    {acknowledged.has(item.id) && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* SECTION 2: TECHNICAL & LAB */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase px-2">
                        <Activity className="w-4 h-4" /> Real-Time & Lab Checks
                    </div>

                    {checks.filter(c => c.category !== 'CRITICAL_WARNING').map(item => (
                        <div key={item.id} className="p-3 bg-slate-900/50 rounded border border-slate-700 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.category === 'LAB_MATERIAL' ? 'bg-purple-900/30 text-purple-400' : 'bg-cyan-900/30 text-cyan-400'}`}>
                                    {item.category === 'LAB_MATERIAL' ? <FlaskConical size={14} /> : <Activity size={14} />}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-200">{item.label}</div>
                                    <div className="text-[10px] text-slate-500">{item.value}</div>
                                </div>
                            </div>
                            {item.status === 'OK' ? (
                                <CheckCircle2 className="text-emerald-500 w-4 h-4" />
                            ) : (
                                <AlertOctagon className="text-amber-500 w-4 h-4" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* FLOATING ACTION BUTTON */}
            <div className="fixed bottom-6 left-0 right-0 px-6">
                <button
                    disabled={!allCriticalAck}
                    className={`w-full py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl transition-all ${allCriticalAck ? 'bg-emerald-500 hover:bg-emerald-400 text-black' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                >
                    <Play fill="currentColor" />
                    {allCriticalAck ? 'Initiate Turbine Start' : 'Resolve Critical Warnings'}
                </button>
            </div>
        </div>
    );
};
