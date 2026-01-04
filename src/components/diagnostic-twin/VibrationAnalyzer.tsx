import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useProjectEngine } from '../../contexts/ProjectContext';
import { Activity, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';

export const VibrationAnalyzer: React.FC = () => {
    const { technicalState } = useProjectEngine();

    // Physical Parameters
    const rpm = technicalState.mechanical.rpm || 500;
    const vib = technicalState.mechanical.vibration || 2.5;
    const f0 = rpm / 60; // Fundamental frequency (Hz)
    const bladeCount = 13; // Typical Francis runner vanes
    const fBlade = f0 * bladeCount;

    // Synthetic FFT Spectrum Logic
    // We create a spectrum from 0 to 200 Hz
    const spectrum = useMemo(() => {
        const points = [];
        for (let f = 0; f < 200; f += 2) {
            let amplitude = 0.5 + Math.random() * 0.5; // Noise floor

            // Peak at 1x RPM (Mechanical Unbalance)
            const mechanicalPeak = 15 * Math.exp(-Math.pow(f - f0, 2) / 4);

            // Peak at Blade Pass Frequency (Hydraulic)
            const hydraulicPeak = 10 * Math.exp(-Math.pow(f - fBlade, 2) / 4);

            amplitude += mechanicalPeak + hydraulicPeak;
            points.push({ f, amp: amplitude });
        }
        return points;
    }, [f0, fBlade]);

    const maxAmp = Math.max(...spectrum.map(p => p.amp));

    // Diagnostic Verdict Logic
    const mechanicalUnbalanceRisk = spectrum.find(p => Math.abs(p.f - f0) < 2)?.amp || 0;
    const hydraulicTurbulenceRisk = spectrum.find(p => Math.abs(p.f - fBlade) < 2)?.amp || 0;

    const verdict = useMemo(() => {
        if (mechanicalUnbalanceRisk > 12 && mechanicalUnbalanceRisk > hydraulicTurbulenceRisk) {
            return {
                title: 'Mechanical Unbalance',
                message: 'Peak detected at 1x RPM. Suggests rotor misalignment or mass unbalance.',
                severity: 'WARNING' as const
            };
        }
        if (hydraulicTurbulenceRisk > 8) {
            return {
                title: 'Hydraulic Pressure Pulsations',
                message: 'Strong signal at Blade Pass Frequency (n*Z). Possible cavitation or guide vane turbulence.',
                severity: 'WARNING' as const
            };
        }
        return {
            title: 'Vibrational Stability: Nominal',
            message: 'Spectral peaks within industrial ISO 10816 limits.',
            severity: 'NOMINAL' as const
        };
    }, [mechanicalUnbalanceRisk, hydraulicTurbulenceRisk]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4">
            {/* FFT SPECTRUM CHART (8 Columns) */}
            <div className="lg:col-span-8 bg-slate-900/50 rounded-2xl border border-white/10 p-6 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-400" />
                        FFT Frequency Breakdown (10Hz - 200Hz)
                    </h3>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                            <span className="text-[9px] text-slate-400 uppercase font-black">1x RPM ({f0.toFixed(1)}Hz)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                            <span className="text-[9px] text-slate-400 uppercase font-black">Blade Pass ({fBlade.toFixed(1)}Hz)</span>
                        </div>
                    </div>
                </div>

                <div className="relative h-64 w-full mt-4">
                    <svg viewBox="0 0 400 150" className="w-full h-full preserve-3d">
                        {/* Grid */}
                        {[0, 25, 50, 75, 100].map(p => (
                            <line key={p} x1="0" y1={150 - (p * 1.5)} x2="400" y2={150 - (p * 1.5)} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                        ))}

                        {/* Spectrum Line */}
                        <motion.path
                            d={`M ${spectrum.map(p => `${(p.f / 200) * 400},${150 - (p.amp / maxAmp) * 120}`).join(' L ')}`}
                            fill="none"
                            stroke="url(#spectrumGrad)"
                            strokeWidth="2"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1 }}
                        />

                        <defs>
                            <linearGradient id="spectrumGrad" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#22d3ee" />
                                <stop offset="50%" stopColor="#818cf8" />
                                <stop offset="100%" stopColor="#c084fc" />
                            </linearGradient>
                        </defs>

                        {/* Peak Labels */}
                        <motion.circle
                            cx={(f0 / 200) * 400} cy={150 - (mechanicalUnbalanceRisk / maxAmp) * 120} r="3" fill="#22d3ee"
                            animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                        />
                        <motion.circle
                            cx={(fBlade / 200) * 400} cy={150 - (hydraulicTurbulenceRisk / maxAmp) * 120} r="3" fill="#c084fc"
                            animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                        />
                    </svg>
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
                <div className={`rounded-2xl border p-6 flex flex-col h-full justify-between transition-colors duration-500 ${verdict.severity === 'WARNING' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-cyan-500/10 border-cyan-500/30'
                    }`}>
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <h4 className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Diagnostic Verdict</h4>
                            {verdict.severity === 'WARNING' ? <AlertTriangle className="w-4 h-4 text-amber-500" /> : <ShieldCheck className="w-4 h-4 text-cyan-400" />}
                        </div>
                        <h2 className={`text-xl font-black uppercase tracking-tighter mb-2 ${verdict.severity === 'WARNING' ? 'text-amber-400' : 'text-cyan-400'
                            }`}>
                            {verdict.title}
                        </h2>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            {verdict.message}
                        </p>
                    </div>

                    <div className="mt-8 space-y-4">
                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                            <span className="text-[10px] text-slate-500 font-black uppercase">Composite RMS</span>
                            <span className="text-sm font-mono text-white font-bold">{vib.toFixed(2)} mm/s</span>
                        </div>
                        <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                            Export Waveform Data
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
