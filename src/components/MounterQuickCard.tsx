import React, { useState } from 'react';
import { AssetNodeWithPassport } from '../models/MaintenanceChronicles';
import { Calendar, Wrench, TrendingUp, Info, FileText, Clock, ShieldAlert, CheckSquare, AlertTriangle, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../shared/components/ui/GlassCard';

/**
 * MOUNTER'S QUICK-CARD
 * 
 * Enhanced field-ready tool for technicians.
 * Features:
 * 1. Critical Safety Status (LOTO)
 * 2. Pre-Work Checklist
 * 3. The 3 Magic Numbers (Clearances, Torques, Schedule)
 * 4. Rapid Issue Reporting
 */

interface MounterQuickCardProps {
    asset: AssetNodeWithPassport;
    onClose: () => void;
}

export const MounterQuickCard: React.FC<MounterQuickCardProps> = ({ asset, onClose }) => {
    const [checklist, setChecklist] = useState({
        ppe: false,
        loto: false,
        tools: false,
        area: false
    });

    const passport = asset.passport;
    const clearances = passport.mechanicalSpecs.clearances;
    const torques = passport.mechanicalSpecs.boltTorques;
    const schedule = passport.maintenanceSchedule;

    const toggleCheck = (key: keyof typeof checklist) => {
        setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const allChecked = Object.values(checklist).every(Boolean);

    // Calculate days until next service
    const daysUntilService = Math.ceil(
        (new Date(schedule.nextServiceDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />
                
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-2xl max-h-[90vh] flex flex-col"
                >
                    <GlassCard className="flex-1 flex flex-col overflow-hidden border-cyan-500/30 shadow-[0_0_60px_rgba(6,182,212,0.2)] p-0">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-cyan-900/80 to-blue-900/80 p-5 border-b border-cyan-500/30 flex justify-between items-center shrink-0">
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-wide flex items-center gap-3">
                                    <Wrench className="w-6 h-6 text-cyan-400" />
                                    Mounter's Quick-Card
                                </h2>
                                <p className="text-cyan-200 text-xs mt-1 font-mono tracking-wider">
                                    {asset.path.toUpperCase()}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* SAFETY SECTION */}
                            <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse" />
                                    <h3 className="text-red-100 font-bold uppercase text-sm tracking-wider">Safety Protocols</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => toggleCheck('loto')}
                                        className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${checklist.loto ? 'bg-green-500/20 border-green-500/50' : 'bg-slate-800/50 border-slate-700 hover:border-red-400'}`}
                                    >
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${checklist.loto ? 'bg-green-500 border-green-500 text-black' : 'border-slate-500'}`}>
                                            {checklist.loto && <CheckCircle2 className="w-3.5 h-3.5" />}
                                        </div>
                                        <span className={`text-xs font-bold ${checklist.loto ? 'text-green-300' : 'text-slate-300'}`}>LOTO Verified</span>
                                    </button>
                                    <button 
                                        onClick={() => toggleCheck('ppe')}
                                        className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${checklist.ppe ? 'bg-green-500/20 border-green-500/50' : 'bg-slate-800/50 border-slate-700 hover:border-red-400'}`}
                                    >
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${checklist.ppe ? 'bg-green-500 border-green-500 text-black' : 'border-slate-500'}`}>
                                            {checklist.ppe && <CheckCircle2 className="w-3.5 h-3.5" />}
                                        </div>
                                        <span className={`text-xs font-bold ${checklist.ppe ? 'text-green-300' : 'text-slate-300'}`}>Full PPE Worn</span>
                                    </button>
                                </div>
                            </div>

                            {/* COMPONENT IDENTITY */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700">
                                    <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Component</span>
                                    <span className="text-white font-bold">{asset.name}</span>
                                </div>
                                <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700">
                                    <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Serial No.</span>
                                    <span className="text-amber-400 font-mono">{passport.identity.serialNumber}</span>
                                </div>
                            </div>

                            {/* THE 3 MAGIC NUMBERS */}
                            <div className="space-y-4">
                                {/* 1. CLEARANCES */}
                                {clearances && (
                                    <div className="relative group">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl opacity-20 group-hover:opacity-40 transition-opacity blur"></div>
                                        <div className="relative bg-slate-900 border border-blue-500/30 rounded-xl p-4">
                                            <div className="flex items-center gap-3 mb-3">
                                                <TrendingUp className="w-5 h-5 text-blue-400" />
                                                <h3 className="text-blue-100 font-black text-sm uppercase">1. Critical Clearances</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                {clearances.radial !== undefined && (
                                                    <div>
                                                        <p className="text-slate-500 text-[10px] uppercase mb-1">Radial</p>
                                                        <p className="text-2xl font-black text-white font-mono">{clearances.radial.toFixed(3)} <span className="text-sm text-slate-500">mm</span></p>
                                                    </div>
                                                )}
                                                {clearances.axial !== undefined && (
                                                    <div>
                                                        <p className="text-slate-500 text-[10px] uppercase mb-1">Axial</p>
                                                        <p className="text-2xl font-black text-white font-mono">{clearances.axial.toFixed(3)} <span className="text-sm text-slate-500">mm</span></p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 2. TORQUES */}
                                {torques && (
                                    <div className="relative group">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl opacity-20 group-hover:opacity-40 transition-opacity blur"></div>
                                        <div className="relative bg-slate-900 border border-amber-500/30 rounded-xl p-4">
                                            <div className="flex items-center gap-3 mb-3">
                                                <Wrench className="w-5 h-5 text-amber-400" />
                                                <h3 className="text-amber-100 font-black text-sm uppercase">2. Torque Specs</h3>
                                            </div>
                                            <div className="space-y-2">
                                                {torques.mountingBolts !== undefined && (
                                                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                                        <span className="text-slate-400 text-xs">Mounting Bolts</span>
                                                        <span className="text-xl font-black text-white font-mono">{torques.mountingBolts} <span className="text-sm text-slate-500">Nm</span></span>
                                                    </div>
                                                )}
                                                {torques.coverBolts !== undefined && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-slate-400 text-xs">Cover Bolts</span>
                                                        <span className="text-xl font-black text-white font-mono">{torques.coverBolts} <span className="text-sm text-slate-500">Nm</span></span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 3. SCHEDULE */}
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl opacity-20 group-hover:opacity-40 transition-opacity blur"></div>
                                    <div className="relative bg-slate-900 border border-emerald-500/30 rounded-xl p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Calendar className="w-5 h-5 text-emerald-400" />
                                            <h3 className="text-emerald-100 font-black text-sm uppercase">3. Service Schedule</h3>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-slate-500 text-[10px] uppercase mb-1">Next Due</p>
                                                <p className="text-lg font-bold text-white">{new Date(schedule.nextServiceDate).toLocaleDateString()}</p>
                                            </div>
                                            <div className={`px-3 py-1 rounded text-xs font-bold ${daysUntilService < 30 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                {daysUntilService} Days Remaining
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-5 border-t border-white/10 bg-slate-900/50 flex gap-3 shrink-0">
                            <button 
                                className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                                onClick={() => console.log('Reporting issue...')}
                            >
                                <AlertTriangle className="w-4 h-4" />
                                Report Issue
                            </button>
                            <button 
                                className={`flex-1 py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${allChecked ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}
                                disabled={!allChecked}
                                onClick={onClose}
                            >
                                <CheckSquare className="w-4 h-4" />
                                Complete & Close
                            </button>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
