import React, { useState, useMemo } from 'react';
import { GlassCard } from './ui/GlassCard.tsx';
import { StatCard } from './ui/StatCard.tsx';
import { BackButton } from './BackButton.tsx';
import { ModernButton } from './ui/ModernButton.tsx';
import { useProjectEngine } from '../contexts/ProjectContext.tsx'; // Connected



const BOLT_GRADES: Record<string, number> = {
    '8.8': 640,
    '10.9': 940,
    '12.9': 1080
};

const MACHINE_PARTS = [
    { id: 'coupling', name: 'Shaft Coupling', bolts: 12, size: 'M36', grade: '10.9', length: 250 },
    { id: 'cover', name: 'Turbine Cover', bolts: 24, size: 'M24', grade: '8.8', length: 180 },
    { id: 'bearing', name: 'Bearing Housing', bolts: 8, size: 'M30', grade: '10.9', length: 200 }
];

export const BoltTorqueCalculator: React.FC = () => {
    const { technicalState } = useProjectEngine(); // Use Central State
    const [selectedPartId, setSelectedPartId] = useState(MACHINE_PARTS[0].id);
    const [measuredElongation, setMeasuredElongation] = useState<number>(0);

    const activePart = useMemo(() =>
        MACHINE_PARTS.find(p => p.id === selectedPartId) || MACHINE_PARTS[0]
        , [selectedPartId]);

    const calculations = useMemo(() => {
        // Extract diameter from size (e.g., "M36" -> 36)
        // If technicalState has updated bolt specs, use them, otherwise fallback to static
        const projectBoltSize = technicalState.mechanical.boltSpecs.diameter;
        const isDefault = selectedPartId === 'coupling'; // Assuming coupling uses project standard

        // Logic: Use Project Context specs if valid, else static list
        const d = isDefault && projectBoltSize ? projectBoltSize : parseInt(activePart.size.replace('M', ''));
        const gradeYield = BOLT_GRADES[activePart.grade];

        // Target Stress = 75% of Yield
        const targetStress = gradeYield * 0.75;

        // Area (Stress Area - simplified)
        const area = Math.PI * Math.pow(d * 0.9, 2) / 4;

        // Target Force (N)
        const targetForce = targetStress * area;

        // Target Torque (Nm) - Formula: T = K * d * F
        // K (Nut factor) ~ 0.18 for lubricated bolts
        const targetTorque = 0.18 * (d / 1000) * targetForce;

        // Target Elongation (mm) - Formula: dL = (F * L) / (A * E)
        // E (Young's Modulus) = 210,000 MPa
        const eModulus = 210000;
        const targetElongation = (targetForce * activePart.length) / (area * eModulus);

        return {
            torque: Math.round(targetTorque),
            force: (targetForce / 1000).toFixed(1), // kN
            elongation: targetElongation.toFixed(3),
            isElongationOk: Math.abs(measuredElongation - targetElongation) < 0.05
        };
    }, [activePart, measuredElongation]);

    // Star Pattern helper
    const starSteps = useMemo(() => {
        const count = activePart.bolts;
        const steps = [];
        let current = 1;
        const used = new Set();

        while (used.size < count) {
            steps.push(current);
            used.add(current);
            // Move to opposite side
            current = ((current + (count / 2) - 1) % count) + 1;
            if (used.has(current)) {
                // If already used, move to adjacent
                current = (current % count) + 1;
                while (used.has(current) && used.size < count) {
                    current = (current % count) + 1;
                }
            }
        }
        return steps;
    }, [activePart.bolts]);

    return (
        <div className="animate-fade-in space-y-8 pb-12">
            <div className="flex justify-between items-center bg-slate-900/40 p-6 rounded-3xl border border-white/5 backdrop-blur-xl">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-widest uppercase mb-1">Bolt <span className="text-cyan-400">Torque</span></h2>
                    <p className="text-slate-400 text-sm font-light italic">Precision Tension & Elongation Control.</p>
                </div>
                <BackButton text="Back to Hub" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT: PART SELECTOR & SPECS */}
                <div className="space-y-6">
                    <GlassCard title="Machine Component">
                        <select
                            value={selectedPartId}
                            onChange={(e) => setSelectedPartId(e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white font-bold mb-6"
                        >
                            {MACHINE_PARTS.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>

                        <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Bolt Size</span>
                                <span className="text-white font-mono font-bold">{activePart.size}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Material Grade</span>
                                <span className="text-cyan-400 font-bold">{activePart.grade}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Total Bolts</span>
                                <span className="text-white">{activePart.bolts}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Grip Length</span>
                                <span className="text-white">{activePart.length} mm</span>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard title="Dynamic Results" className="border-l-4 border-l-cyan-500">
                        <div className="space-y-6">
                            <StatCard label="Target Torque" value={calculations.torque.toString()} unit="Nm" />
                            <StatCard label="Preload Force" value={calculations.force} unit="kN" />
                        </div>
                    </GlassCard>
                </div>

                {/* MIDDLE: TIGHTENING SEQUENCE */}
                <div className="lg:col-span-1 space-y-6">
                    <GlassCard title="Star Sequence Pattern">
                        <div className="aspect-square relative flex items-center justify-center">
                            {/* SVG Circle and Bolts */}
                            <svg viewBox="0 0 200 200" className="w-full h-full p-4 overflow-visible">
                                <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
                                {Array.from({ length: activePart.bolts }).map((_, i) => {
                                    const angle = (i * 360) / activePart.bolts - 90;
                                    const rad = (angle * Math.PI) / 180;
                                    const x = 100 + 75 * Math.cos(rad);
                                    const y = 100 + 75 * Math.sin(rad);
                                    const stepIndex = starSteps.indexOf(i + 1);

                                    return (
                                        <g key={i}>
                                            <circle
                                                cx={x} cy={y} r="8"
                                                className="fill-slate-900 stroke-cyan-500/30 stroke-2"
                                            />
                                            <text
                                                x={x} y={y} dy=".3em"
                                                textAnchor="middle"
                                                className="text-[6px] fill-cyan-400 font-black"
                                                style={{ fontSize: '6px' }}
                                            >
                                                {i + 1}
                                            </text>
                                            {/* Step label */}
                                            <circle cx={x + 10} cy={y - 10} r="5" className="fill-cyan-500" />
                                            <text x={x + 10} y={y - 10} dy=".3em" textAnchor="middle" className="text-[4px] fill-black font-bold" style={{ fontSize: '4px' }}>
                                                {stepIndex + 1}
                                            </text>
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>
                        <div className="grid grid-cols-4 gap-2 mt-4">
                            {starSteps.map((step, idx) => (
                                <div key={idx} className="bg-slate-950 border border-white/10 rounded p-2 text-center">
                                    <div className="text-[8px] text-slate-500 font-bold uppercase">Bolt</div>
                                    <div className="text-xs text-white font-black">{step}</div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>

                {/* RIGHT: HYDRAULIC TENSIONER CHECK */}
                <div className="space-y-6">
                    <GlassCard title="Hydraulic Tensioning" className="border-t-4 border-t-amber-500">
                        <p className="text-[10px] text-slate-400 mb-6 uppercase tracking-widest font-bold">Micrometer Verification (±0.05mm)</p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] text-slate-500 font-black uppercase mb-2 block">Target Elongation (mm)</label>
                                <div className="text-2xl font-mono font-black text-white">{calculations.elongation}</div>
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <label className="text-[10px] text-amber-500 font-black uppercase mb-2 block">Measured Value (mm)</label>
                                <input
                                    type="number"
                                    step="0.001"
                                    value={measuredElongation}
                                    onChange={(e) => setMeasuredElongation(parseFloat(e.target.value))}
                                    className="w-full bg-slate-950 border border-amber-500/20 rounded-xl px-4 py-3 text-white font-mono text-xl"
                                />
                            </div>

                            <div className={`mt-6 p-4 rounded-2xl border ${calculations.isElongationOk ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'} flex items-center gap-4`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${calculations.isElongationOk ? 'bg-emerald-500 text-black' : 'bg-red-500 text-white'}`}>
                                    {calculations.isElongationOk ? '✓' : '⚠'}
                                </div>
                                <div>
                                    <div className={`text-xs font-black uppercase ${calculations.isElongationOk ? 'text-emerald-400' : 'text-red-500'}`}>
                                        {calculations.isElongationOk ? 'Precision Verified' : 'Out of Tolerance'}
                                    </div>
                                    <p className="text-[10px] text-slate-500">Required: {calculations.elongation} ± 0.05mm</p>
                                </div>
                            </div>

                            <ModernButton variant="primary" className="w-full">Audit & Sign-Off</ModernButton>
                        </div>
                    </GlassCard>

                    <GlassCard title="Ano-Agent Advice">
                        <div className="flex gap-4">
                            <div className="text-2xl pt-1">🤖</div>
                            <p className="text-xs text-slate-400 leading-relaxed italic">
                                "Always use a cross-bolt pattern for the turbine cover. Lubricate the threads with Molykote for accurate torque-to-tension conversion."
                            </p>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};
