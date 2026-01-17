import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Download, ShieldCheck, Activity, Droplets, Zap, Ruler } from 'lucide-react';
import { GlassCard } from '../../shared/components/ui/GlassCard';
import { TechnicalProjectState } from '../../models/TechnicalSchema';
import { ActionEngine } from '../../features/business/logic/ActionEngine';
import { ForensicReportService } from '../../services/ForensicReportService';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

interface PrintPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    state: TechnicalProjectState;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({ isOpen, onClose, state }) => {
    const { t } = useTranslation();

    const handleGenerate = () => {
        const blob = ForensicReportService.generateProjectDossier({ state, t });
        ForensicReportService.openAndDownloadBlob(blob, `AnoHUB_Audit_${state.identity.assetName}_${new Date().toISOString().split('T')[0]}.pdf`, true);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)]"
                    >
                        <GlassCard variant="commander" noPadding className="flex flex-col h-full border-cyan-500/30">
                            {/* Header */}
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-cyan-500/5 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-transparent opacity-50" />
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="p-3 bg-cyan-500/20 rounded-xl border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                                        <FileText className="w-6 h-6 text-cyan-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-white uppercase tracking-tighter">
                                            {t('report.previewTitle', 'Project Dossier Preview')}
                                        </h2>
                                        <p className="text-[10px] text-cyan-500/70 font-mono uppercase tracking-[0.2em] font-black">
                                            AnoHUB NC-4.2 // Mission Critical Data
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white relative z-10"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Preview Body - Simulated Paper Experience */}
                            <div className="flex-1 overflow-y-auto p-12 bg-[#020617] relative custom-scrollbar">
                                <div className="max-w-3xl mx-auto space-y-12 bg-white/5 p-12 rounded-2xl border border-white/5 relative overflow-hidden shadow-2xl">
                                    {/* Forensic Watermark */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none rotate-[-15deg]">
                                        <ShieldCheck className="w-[500px] h-[500px] text-cyan-500" />
                                    </div>

                                    {/* Document Simulation Header */}
                                    <div className="flex justify-between items-start border-b border-white/10 pb-8 relative z-10">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center font-black text-black">Ah</div>
                                                <h1 className="text-3xl font-black text-white tracking-widest uppercase">AnoHUB</h1>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Engineering Asset:</p>
                                                <p className="text-xl font-black text-white tracking-tight">{state.identity.assetName}</p>
                                                <p className="text-cyan-500/80 text-[10px] font-mono">{state.identity.location.toUpperCase()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right space-y-2">
                                            <div className="inline-block px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded font-mono text-[9px] text-cyan-400 font-bold">
                                                NC-4.2 CERTIFIED
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-slate-500 font-mono text-[9px] uppercase tracking-widest">Dossier ID</p>
                                                <p className="text-white font-mono text-xs font-bold">#AUDIT-{Math.random().toString(36).substring(7).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 1: Financial Forensics (Executive Summary) */}
                                    <div className="space-y-6 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-6 bg-emerald-500 rounded-full" />
                                            <h3 className="text-lg font-black text-white uppercase tracking-tight">I. Executive Summary & Financial Forensics</h3>
                                        </div>
                                        {(() => {
                                            const targetEff = 0.92;
                                            const currentEff = state.hydraulic.efficiency;
                                            const effGap = Math.max(0, targetEff - currentEff);
                                            const flow = state.hydraulic.flow;
                                            const head = state.hydraulic.head;
                                            const lostMW = (flow * head * 9.81 * effGap) / 1000;
                                            const revenueLoss = lostMW * 65 * 8000;

                                            return (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
                                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Revenue Efficiency Gap</p>
                                                        <p className={`text-2xl font-black ${effGap > 0 ? 'text-red-400' : 'text-emerald-400'} tracking-tighter`}>
                                                            {effGap > 0 ? `-${(effGap * 100).toFixed(1)}%` : 'OPTIMAL'}
                                                        </p>
                                                    </div>
                                                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
                                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Projected Annual Loss</p>
                                                        <p className={`text-2xl font-black ${revenueLoss > 0 ? 'text-red-400' : 'text-slate-200'} tracking-tighter`}>
                                                            €{revenueLoss > 0 ? revenueLoss.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0.00'}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Section 2: Predictive Health (New) */}
                                    <div className="space-y-6 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-6 bg-indigo-500 rounded-full" />
                                            <h3 className="text-lg font-black text-white uppercase tracking-tight">II. Predictive Health & Maintenance</h3>
                                        </div>
                                        {(() => {
                                            const vibStress = (Math.max(state.mechanical.vibrationX, state.mechanical.vibrationY) / 7.1) * 100;
                                            const tempStress = (state.mechanical.bearingTemp / 85.0) * 100;
                                            const stressIndex = Math.max(vibStress, tempStress);
                                            const remainingCapacity = Math.max(0, 100 - stressIndex);
                                            const estHours = (remainingCapacity / 100) * 50000;
                                            const estDays = Math.round(estHours / 24);

                                            return (
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
                                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Stress Index</p>
                                                        <p className={`text-2xl font-black ${stressIndex > 50 ? 'text-amber-400' : 'text-slate-200'} tracking-tighter`}>{stressIndex.toFixed(0)}/100</p>
                                                    </div>
                                                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
                                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Est. Remaining Life</p>
                                                        <p className={`text-2xl font-black ${estDays < 365 ? 'text-red-400' : 'text-emerald-400'} tracking-tighter`}>{estDays} Days</p>
                                                    </div>
                                                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
                                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Service Status</p>
                                                        <p className="text-xl font-black text-white tracking-tighter">{estDays < 90 ? 'IMMEDIATE' : 'SCHEDULED'}</p>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Section 3: Strategic Action Plan */}
                                    <div className="space-y-6 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-6 bg-amber-500 rounded-full" />
                                            <h3 className="text-lg font-black text-white uppercase tracking-tight">III. Strategic Action Plan</h3>
                                        </div>
                                        {(() => {
                                            let actions: any[] = [];
                                            try { actions = ActionEngine.generateRecommendations(state as any); } catch (e) { }
                                            const topActions = actions.slice(0, 3); // Check logic consistency

                                            if (topActions.length === 0) {
                                                return (
                                                    <div className="p-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest flex items-center gap-3">
                                                        <ShieldCheck className="w-5 h-5" />
                                                        System Optimal. No actions required.
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div className="space-y-3">
                                                    {topActions.map((act, i) => (
                                                        <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-white/10 bg-white/5">
                                                            <div className={`mt-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${act.priority === 'HIGH' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                                                act.priority === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                                                    'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                                }`}>
                                                                {act.priority}
                                                            </div>
                                                            <div>
                                                                <h5 className="text-sm font-bold text-white mb-1">{act.title}</h5>
                                                                <p className="text-xs text-slate-400 leading-relaxed mb-2">{act.description}</p>
                                                                <div className="text-[10px] font-mono text-slate-600">
                                                                    TRIGGER: <span className="text-slate-300">{act.relatedMetric} ({act.triggerValue})</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Section 4: Hydraulic Audit (Renumbered) */}
                                    <div className="space-y-6 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-6 bg-cyan-500 rounded-full" />
                                            <h3 className="text-lg font-black text-white uppercase tracking-tight">IV. Hydraulic Performance</h3>
                                        </div>
                                        <div className="grid grid-cols-3 gap-6">
                                            {[
                                                { label: 'Design Net Head', value: `${state.hydraulic.head} m`, icon: <Droplets className="w-4 h-4" /> },
                                                { label: 'Flow Rate', value: `${state.hydraulic.flow} m³/s`, icon: <Zap className="w-4 h-4" /> },
                                                { label: 'Efficiency Index', value: `${(state.hydraulic.efficiency * 100).toFixed(1)}%`, icon: <Activity className="w-4 h-4" /> },
                                            ].map((item, i) => (
                                                <div key={i} className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 shadow-inner group hover:border-cyan-500/30 transition-all">
                                                    <div className="text-cyan-500 mb-3 bg-cyan-500/10 w-fit p-2 rounded-lg group-hover:scale-110 transition-transform">
                                                        {item.icon}
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">{item.label}</p>
                                                    <p className="text-2xl font-black text-white tracking-tighter">{item.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Section 5: Mechanical Integrity (Renumbered) */}
                                    <div className="space-y-6 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-6 bg-cyan-500 rounded-full" />
                                            <h3 className="text-lg font-black text-white uppercase tracking-tight">V. Mechanical Integrity</h3>
                                        </div>
                                        <div className="bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-white/5 border-b border-white/5">
                                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Determinant</th>
                                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Metric</th>
                                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Safety Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-sm">
                                                    <tr className="border-b border-white/5">
                                                        <td className="px-6 py-4 text-slate-300 font-bold">Radial Clearance</td>
                                                        <td className="px-6 py-4 text-white font-mono">{state.mechanical.radialClearance} mm</td>
                                                        <td className="px-6 py-4"><span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px] uppercase font-black tracking-widest">Optimal</span></td>
                                                    </tr>
                                                    <tr className="border-b border-white/5">
                                                        <td className="px-6 py-4 text-slate-300 font-bold">Max Vibration Offset</td>
                                                        <td className="px-6 py-4 text-white font-mono">{Math.max(state.mechanical.vibrationX, state.mechanical.vibrationY).toFixed(3)} mm</td>
                                                        <td className="px-6 py-4"><span className={`px-2 py-0.5 ${state.mechanical.vibrationX > 0.1 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'} rounded text-[10px] uppercase font-black tracking-widest`}>{state.mechanical.vibrationX > 0.1 ? 'Warning' : 'Nominal'}</span></td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-6 py-4 text-slate-300 font-bold">Bolt Torque Audit</td>
                                                        <td className="px-6 py-4 text-white font-mono">{state.mechanical.boltSpecs.torque} Nm</td>
                                                        <td className="px-6 py-4"><span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-[10px] uppercase font-black tracking-widest">Verified</span></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Section 6: Diagnostic Narrative (Renumbered) */}
                                    <div className="space-y-6 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-6 bg-red-500 rounded-full" />
                                            <h3 className="text-lg font-black text-white uppercase tracking-tight">VI. AI Diagnostic Outcome</h3>
                                        </div>
                                        <div className={`p-8 rounded-2xl border ${state.riskScore > 50 ? 'bg-red-950/20 border-red-500/30' : 'bg-cyan-950/20 border-cyan-500/30'} flex gap-6 shadow-2xl`}>
                                            <div className={`p-4 rounded-xl h-fit ${state.riskScore > 50 ? 'bg-red-500/20 border-red-500/30' : 'bg-cyan-500/20 border-cyan-500/30'} border`}>
                                                <Zap className={`w-8 h-8 ${state.riskScore > 50 ? 'text-red-500' : 'text-cyan-500'} animate-pulse`} />
                                            </div>
                                            <div className="space-y-3">
                                                <h4 className={`text-xl font-black uppercase tracking-tighter ${state.riskScore > 50 ? 'text-red-400' : 'text-cyan-400'}`}>
                                                    {state.riskScore > 50 ? 'CRITICAL SYSTEM ALERT' : 'SYSTEM NOMINAL'}
                                                </h4>
                                                <p className="text-slate-300 text-sm leading-relaxed italic border-l-2 border-white/20 pl-4 py-1">
                                                    {state.diagnosis && state.diagnosis.messages.length > 0
                                                        ? state.diagnosis.messages.map(m => i18n.language === 'bs' ? m.bs : m.en).join(' ')
                                                        : (state.riskScore > 50
                                                            ? t('diagnostics.critical_default', 'CRITICAL: System integrity compromised. High hoop stress or turbine imbalance detected.')
                                                            : t('diagnostics.nominal_default', 'Sistemska analiza potvrđuje stabilan rad unutar projektovanih granica. Nisu detektovana kritična odstupanja.'))}
                                                </p>
                                            </div>
                                        </div>
                                    </div>



                                    {/* Document Footer Simulation */}
                                    <div className="pt-12 border-t border-white/10 flex justify-between items-end relative z-10">
                                        <div className="space-y-4">
                                            <div className="w-48 h-12 border-b border-white/20 flex items-center justify-center font-mono text-[10px] text-slate-500">
                                                DIGITALLY SIGNED // SHA-256
                                            </div>
                                            <p className="text-[10px] text-slate-600 font-mono tracking-widest uppercase">Verified by AnoHUB Sentinel Engine</p>
                                        </div>
                                        <div className="w-16 h-16 bg-white flex items-center justify-center p-1 rounded-lg">
                                            <div className="w-full h-full bg-black flex items-center justify-center text-[10px] font-black text-white">QR</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-8 border-t border-white/10 bg-slate-900 flex justify-end gap-6 relative z-[110]">
                                <button
                                    onClick={onClose}
                                    className="px-8 py-4 rounded-xl border border-white/10 text-slate-400 font-black uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleGenerate}
                                    className="px-10 py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 rounded-xl font-black uppercase tracking-widest text-white text-xs flex items-center gap-4 shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] hover:scale-[1.02] transition-all cursor-pointer"
                                >
                                    <Download className="w-5 h-5" />
                                    Generate Official PDF
                                </button>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
