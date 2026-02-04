import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelemetryStore } from '../store/useTelemetryStore';
import { useAssetContext } from '../../../contexts/AssetContext'; // Added for orientation
import { useMaintenance } from '../../../contexts/MaintenanceContext';
import { useThermalGuardian } from '../../../hooks/useThermalGuardian';
import { VibrationExpert } from '../../../services/VibrationExpert';
import { Activity, AlertTriangle, ShieldCheck, Info, X, Zap, Maximize2 } from 'lucide-react';
import SovereignAuditAdapter from '../../../services/SovereignAuditAdapter';
import { GlassCard } from '../../../shared/components/ui/GlassCard';

// Instantiate services outside render
const vibrationExpert = new VibrationExpert();
const auditAdapter = new SovereignAuditAdapter();

export const VibrationAnalyzer: React.FC = () => {
    const { selectedAsset } = useAssetContext();

    // 1. Telemetry Data
    const rpm = useTelemetryStore(state => state.mechanical?.rpm ?? 500);
    const vib = useTelemetryStore(state => state.mechanical?.vibration ?? 2.5);
    const powerKW = useTelemetryStore(state => state.hydraulic?.powerKW ?? state.mechanical?.powerKW ?? 0);
    const flow = useTelemetryStore(state => state.hydraulic?.flow ?? 0); // m^3/s
    const head = useTelemetryStore(state => state.hydraulic?.head ?? 0); // m

    // 2. NC-130: Thermal Guardian Activation
    useThermalGuardian('UNIT-01 (Main)');

    // 3. NC-130: Maintenance Link (Static-Dynamic Correlation)
    const { logs } = useMaintenance();

    // Extract critical maintenance factors from logs
    const maintenanceFactors = useMemo(() => {
        const plumbnessLog = logs.find(l => l.commentBS.toLowerCase().includes('runout') || l.commentBS.toLowerCase().includes('plumbness'));

        return {
            shaftPlumbnessDeviation: plumbnessLog?.measuredValue || 0.02,
            bearingClearanceGap: 0.15
        };
    }, [logs]);

    const f0 = rpm / 60; // Fundamental frequency (Hz)
    const bladeCount = 13; // Typical Francis runner vanes
    const fBlade = f0 * bladeCount;

    // Tooltip State
    const [tooltip, setTooltip] = useState<{ x: number, y: number, text: string, title: string } | null>(null);
    const [showFFTModal, setShowFFTModal] = useState(false);

    // Expertise Logger
    const logExpertAccess = (topic: string) => {
        auditAdapter.persistWisdom({
            executiveSummary: `[PREDICTIVE] User accessed expert insight on ${topic}`,
            metadata: { topic, timestamp: new Date().toISOString() }
        }, 'UNIT-01');
    };

    // Synthetic FFT Spectrum Logic
    const spectrum = useMemo(() => {
        const points = [];
        for (let f = 0; f < 200; f += 2) {
            let amplitude = 0.5 + Math.random() * 0.5; // Noise floor
            const mechanicalPeak = 15 * Math.exp(-Math.pow(f - f0, 2) / 4);
            const hydraulicPeak = 10 * Math.exp(-Math.pow(f - fBlade, 2) / 4);
            const misalignmentPeak = 8 * Math.exp(-Math.pow(f - (f0 * 2), 2) / 4);
            amplitude += mechanicalPeak + hydraulicPeak + misalignmentPeak;
            points.push({ f, amp: amplitude });
        }
        return points;
    }, [f0, fBlade]);

    const maxAmp = spectrum.length ? Math.max(...spectrum.map(p => p.amp)) : 1;

    // Diagnostic Verdict Logic using the upgraded Expert
    const verdict = useMemo(() => {
        const expertInput = [
            { frequencyHz: f0, amplitudeMmS: spectrum.find(p => Math.abs(p.f - f0) < 2)?.amp || 0 },
            { frequencyHz: f0 * 2, amplitudeMmS: spectrum.find(p => Math.abs(p.f - (f0 * 2)) < 2)?.amp || 0 },
            { frequencyHz: fBlade, amplitudeMmS: spectrum.find(p => Math.abs(p.f - fBlade) < 2)?.amp || 0 }
        ];

        return vibrationExpert.checkFrequencyPeaks(expertInput, rpm, bladeCount, maintenanceFactors);
    }, [spectrum, rpm, bladeCount, maintenanceFactors]);

    // Efficiency calculation
    const rho = 1000;
    const g = 9.80665;
    const eta = (powerKW * 1000) / (rho * g * flow * head || 1);

    // NC-22: Orientation-based Thresholds
    const isVertical = selectedAsset?.specs?.turbineProfile?.orientation === 'VERTICAL';
    const thresholdLimit = isVertical
        ? 7.1  // ISO 10816-5 (Vertical - Group 4)
        : 4.5; // ISO 10816-3 (Horizontal - Group 1)

    // Status Logic
    const isThresholdBreached = vib > thresholdLimit;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4">

            {/* FFT MODAL (MOCKED) */}
            <AnimatePresence>
                {showFFTModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-4xl"
                        >
                            <GlassCard className="p-6 border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.2)]">
                                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-cyan-900/30 rounded border border-cyan-500/30">
                                            <Activity className="w-6 h-6 text-cyan-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-white uppercase tracking-widest">Deep Spectrum Analysis</h2>
                                            <p className="text-xs text-cyan-300 font-mono">10Hz - 200Hz HIGH RESOLUTION BAND</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowFFTModal(false)}
                                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        <X className="w-6 h-6 text-slate-400" />
                                    </button>
                                </div>
                                <div className="h-[400px] bg-slate-900/50 rounded-xl border border-white/5 flex items-center justify-center relative overflow-hidden">
                                    {/* MOCK CONTENT */}
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-20 pointer-events-none" />
                                    <div className="text-center">
                                        <Activity className="w-16 h-16 text-cyan-500/20 mx-auto mb-4 animate-pulse" />
                                        <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Real-time FFT Stream Active</p>
                                        <p className="text-cyan-400 font-bold text-lg mt-2">Connecting to Sovereign Cloud...</p>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end gap-2">
                                    <button className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded hover:bg-slate-700">EXPORT RAW CSV</button>
                                    <button className="px-4 py-2 bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold rounded hover:bg-cyan-600/30">RUN SIGNAL PROCESSING AI</button>
                                </div>
                            </GlassCard>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* FFT SPECTRUM CHART (8 Columns) */}
            <div className="lg:col-span-8 bg-slate-800 rounded-2xl border border-slate-700 p-6 flex flex-col gap-4 relative group">
                {/* Expand Overlay Hint */}
                <div onClick={() => setShowFFTModal(true)} className="absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10 hover:bg-white/5 rounded">
                    <Maximize2 className="w-4 h-4 text-slate-400" />
                </div>

                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <Activity className="w-4 h-4 text-slate-200" />
                            FFT Frequency Breakdown
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-mono text-slate-500 bg-black/30 px-1 rounded border border-white/5">
                                ISO {isVertical ? '10816-5 (Vertical)' : '10816-3 (Horizontal)'}
                            </span>
                            <span className={`text-[9px] font-bold ${isThresholdBreached ? 'text-red-400' : 'text-emerald-400'}`}>
                                LIMIT: {thresholdLimit} mm/s
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                            <span className="text-[9px] text-slate-400 uppercase font-black">1x RPM ({f0.toFixed(1)}Hz)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                            <span className="text-[9px] text-amber-400 uppercase font-black">2x RPM ({(f0 * 2).toFixed(1)}Hz)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-slate-400/70"></div>
                            <span className="text-[9px] text-slate-400 uppercase font-black">Blade Pass ({fBlade.toFixed(1)}Hz)</span>
                        </div>
                    </div>
                </div>

                <div className="relative h-64 w-full mt-4" onClick={() => setShowFFTModal(true)}>
                    <svg viewBox="0 0 400 150" className="w-full h-full preserve-3d cursor-crosshair">
                        {/* Grid */}
                        {[0, 25, 50, 75, 100].map(p => (
                            <line key={p} x1="0" y1={150 - (p * 1.5)} x2="400" y2={150 - (p * 1.5)} stroke="rgba(255,255,255,0.06)" strokeWidth="0.6" />
                        ))}

                        {/* ISO Limit Line */}
                        <line x1="0" y1={150 - (thresholdLimit / maxAmp) * 120} x2="400" y2={150 - (thresholdLimit / maxAmp) * 120} stroke={isThresholdBreached ? "#ef4444" : "#10b981"} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                        <text x="5" y={150 - (thresholdLimit / maxAmp) * 120 - 5} fill={isThresholdBreached ? "#ef4444" : "#10b981"} fontSize="8" fontFamily="monospace" opacity="0.8">ISO LIMIT</text>

                        {/* Spectrum Line */}
                        <motion.path
                            d={`M ${spectrum.map(p => `${(p.f / 200) * 400},${150 - (p.amp / maxAmp) * 120}`).join(' L ')}`}
                            fill="none"
                            stroke="#9CA3AF"
                            strokeWidth="2"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1 }}
                        />

                        {/* PREDICTIVE GHOST LINE (NC-11) */}
                        <motion.path
                            d={`M ${((150) / 200) * 400},${150 - (vib / maxAmp) * 120} L 400,${150 - ((vib * 1.5) / maxAmp) * 120}`}
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                            opacity="0.5"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, delay: 1 }}
                        />
                        <text x="380" y={150 - ((vib * 1.5) / maxAmp) * 120 - 10} fill="#ffffff" fontSize="8" fontFamily="monospace" opacity="0.7">
                            +10m PREDICTION
                        </text>

                        {/* Interactive Peaks (Hotspots) */}
                        {/* 1x RPM */}
                        <circle
                            cx={(f0 / 200) * 400}
                            cy={150 - ((spectrum.find(p => Math.abs(p.f - f0) < 2)?.amp || 0) / maxAmp) * 120}
                            r="6"
                            fill="transparent"
                            className="hover:fill-white/20 cursor-help"
                            onMouseEnter={(e) => {
                                setTooltip({ x: e.clientX, y: e.clientY, title: '1x Mean Runout', text: 'Fundamental frequency. High amplitude indicates Mass Unbalance.' });
                                logExpertAccess('1x RPM Unbalance');
                            }}
                            onMouseLeave={() => setTooltip(null)}
                        />

                        {/* 2x RPM (Misalignment) */}
                        <circle
                            cx={((f0 * 2) / 200) * 400}
                            cy={150 - ((spectrum.find(p => Math.abs(p.f - (f0 * 2)) < 2)?.amp || 0) / maxAmp) * 120}
                            r="6"
                            fill="transparent"
                            className="hover:fill-amber-500/20 cursor-help"
                            onMouseEnter={(e) => {
                                setTooltip({ x: e.clientX, y: e.clientY, title: '2x RPM Misalignment', text: 'Classic signature of Shaft Misalignment. Correlate with Coupling Bolt stress.' });
                                logExpertAccess('2x RPM Misalignment');
                            }}
                            onMouseLeave={() => setTooltip(null)}
                        />

                        {/* Blade Pass */}
                        <circle
                            cx={(fBlade / 200) * 400}
                            cy={150 - ((spectrum.find(p => Math.abs(p.f - fBlade) < 2)?.amp || 0) / maxAmp) * 120}
                            r="6"
                            fill="transparent"
                            className="hover:fill-white/20 cursor-help"
                            onMouseEnter={(e) => {
                                setTooltip({ x: e.clientX, y: e.clientY, title: 'Blade Pass Frequency', text: 'Hydraulic turbulence. Check Guide Vane opening and Runner End-Gaps.' });
                                logExpertAccess('Blade Pass Frequency');
                            }}
                            onMouseLeave={() => setTooltip(null)}
                        />

                    </svg>

                    {/* Tooltip Overlay */}
                    <AnimatePresence>
                        {tooltip && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                style={{ position: 'fixed', left: tooltip.x + 15, top: tooltip.y - 15 }}
                                className="z-50 bg-slate-900 border border-slate-600 p-3 rounded shadow-xl w-64 pointer-events-none"
                            >
                                <h4 className="text-xs font-bold text-cyan-400 uppercase mb-1 flex items-center gap-2">
                                    <Info className="w-3 h-3" /> {tooltip.title}
                                </h4>
                                <p className="text-[10px] text-slate-300 leading-tight">
                                    {tooltip.text}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2">
                    <span>0 Hz</span>
                    <span>50 Hz</span>
                    <span>100 Hz</span>
                    <span>150 Hz</span>
                    <span>200 Hz</span>
                </div>
            </div>

            {/* VERDICT BOX (4 Columns) */}
            <div className="lg:col-span-4 flex flex-col gap-4">
                <div className={`rounded-2xl border p-6 flex flex-col h-full justify-between transition-colors duration-500 ${verdict.danger ? 'bg-amber-500/8 border-amber-600/20' : 'bg-slate-700/40 border-slate-700/30'
                    }`}>
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <h4 className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Diagnostic Verdict</h4>
                            {verdict.danger ? <AlertTriangle className="w-4 h-4 text-amber-400" /> : <ShieldCheck className="w-4 h-4 text-slate-200" />}
                        </div>
                        <h2 className={`text-xl font-black uppercase tracking-tighter mb-2 ${verdict.danger ? 'text-amber-400' : 'text-cyan-400'
                            }`}>
                            {verdict.cause === 'Normal Spectral Signature' ? 'Vibrational Stability: Nominal' : verdict.cause}
                        </h2>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            {verdict.recommendation}
                        </p>
                    </div>

                    <div className="mt-8 space-y-4">
                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                            <span className="text-[10px] text-slate-500 font-black uppercase">Composite RMS</span>
                            <span className="text-sm font-mono text-white font-bold">{vib.toFixed(2)} mm/s</span>
                        </div>
                        <div className="flex gap-2">
                            {/* NC-130: Static Link Display */}
                            <div className="flex-1 flex flex-col bg-slate-700/30 p-3 rounded-lg border border-slate-700">
                                <span className="text-[10px] text-slate-400 uppercase font-black">Static Runout</span>
                                <span className={`text-sm font-mono font-bold ${maintenanceFactors.shaftPlumbnessDeviation > 0.05 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                    {maintenanceFactors.shaftPlumbnessDeviation}mm
                                </span>
                            </div>

                            <div className="flex-1 flex flex-col bg-slate-700/30 p-3 rounded-lg border border-slate-700">
                                <span className="text-[10px] text-slate-400 uppercase font-black">Efficiency</span>
                                <span className="text-sm font-mono text-white font-bold">{(eta * 100).toFixed(2)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
