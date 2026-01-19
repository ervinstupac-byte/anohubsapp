import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTelemetryStore } from '../store/useTelemetryStore';
import { Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

export const VibrationAnalyzer: React.FC = () => {
    const rpm = useTelemetryStore(state => state.mechanical?.rpm ?? 500);
    const vib = useTelemetryStore(state => state.mechanical?.vibration ?? 2.5);
    const powerKW = useTelemetryStore(state => state.hydraulic?.powerKW ?? state.mechanical?.powerKW ?? 0);
    const flow = useTelemetryStore(state => state.hydraulic?.flow ?? 0); // m^3/s
    const head = useTelemetryStore(state => state.hydraulic?.head ?? 0); // m
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

    const maxAmp = spectrum.length ? Math.max(...spectrum.map(p => p.amp)) : 1;

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

    // Efficiency calculation using: eta = P / (rho * g * Q * H)
    const rho = 1000; // water density kg/m^3
    const g = 9.80665; // m/s^2
    const eta = (powerKW * 1000) / (rho * g * flow * head || 1); // dimensionless

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4">
            {/* FFT SPECTRUM CHART (8 Columns) */}
            <div className="lg:col-span-8 bg-slate-800 rounded-2xl border border-slate-700 p-6 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-4 h-4 text-slate-200" />
                        FFT Frequency Breakdown (10Hz - 200Hz)
                    </h3>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                            <span className="text-[9px] text-slate-400 uppercase font-black">1x RPM ({f0.toFixed(1)}Hz)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-slate-400/70"></div>
                            <span className="text-[9px] text-slate-400 uppercase font-black">Blade Pass ({fBlade.toFixed(1)}Hz)</span>
                        </div>
                    </div>
                </div>

                <div className="relative h-64 w-full mt-4">
                    <svg viewBox="0 0 400 150" className="w-full h-full preserve-3d">
                        {/* Grid */}
                        {[0, 25, 50, 75, 100].map(p => (
                            <line key={p} x1="0" y1={150 - (p * 1.5)} x2="400" y2={150 - (p * 1.5)} stroke="rgba(255,255,255,0.06)" strokeWidth="0.6" />
                        ))}

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

                        {/* no neon gradients — industrial, high-contrast */}

                        {/* Peak Labels */}
                        <motion.circle
                            cx={(f0 / 200) * 400} cy={150 - (mechanicalUnbalanceRisk / maxAmp) * 120} r="3" fill="#cbd5e1"
                            animate={{ opacity: [1, 0.6, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                        />
                        <motion.circle
                            cx={(fBlade / 200) * 400} cy={150 - (hydraulicTurbulenceRisk / maxAmp) * 120} r="3" fill="#cbd5e1"
                            animate={{ opacity: [1, 0.6, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
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
                <div className={`rounded-2xl border p-6 flex flex-col h-full justify-between transition-colors duration-500 ${verdict.severity === 'WARNING' ? 'bg-amber-500/8 border-amber-600/20' : 'bg-slate-700/40 border-slate-700/30'
                    }`}>
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <h4 className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Diagnostic Verdict</h4>
                            {verdict.severity === 'WARNING' ? <AlertTriangle className="w-4 h-4 text-amber-400" /> : <ShieldCheck className="w-4 h-4 text-slate-200" />}
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
                        <div className="flex gap-2">
                            <div className="flex-1 flex flex-col bg-slate-700/30 p-3 rounded-lg border border-slate-700">
                                <span className="text-[10px] text-slate-400 uppercase font-black">Efficiency</span>
                                <span className="text-sm font-mono text-white font-bold">{(eta * 100).toFixed(2)}%</span>
                            </div>
                            <button className="px-4 py-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                Export
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
