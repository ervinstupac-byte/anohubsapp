import React from 'react';
import { motion } from 'framer-motion';
import { useFrancisStore, FrancisComponentId } from '../store/useFrancisStore';
import { Gauge, Info, ShieldAlert } from 'lucide-react';

interface ComponentIntelligence {
    role: string;
    description: string;
    limits: { label: string; value: string }[];
}

const intelligenceData: Record<FrancisComponentId, ComponentIntelligence> = {
    generator: {
        role: 'Energy Transformation',
        description: 'Synchronous unit that converts 428.6 RPM mechanical torque into 142.5 MW of electrical power.',
        limits: [
            { label: 'Max Temperature', value: '110°C' },
            { label: 'Stator Voltage', value: '15.7 kV' }
        ]
    },
    miv: {
        role: 'Safety Isolation',
        description: 'Double-seal spherical valve designed to isolate the turbine from the penstock during maintenance or emergency.',
        limits: [
            { label: 'Seal Pressure', value: '85 Bar' },
            { label: 'Closure Time', value: '45.0s' }
        ]
    },
    spiral_case: {
        role: 'Flow Distribution',
        description: 'High-pressure casing that distributes water uniformly around the guide vanes to ensure balanced runner loading.',
        limits: [
            { label: 'Design Pressure', value: '120 Bar' },
            { label: 'Hydrostatic Test', value: '180 Bar' }
        ]
    },
    runner: {
        role: 'Kinetic Conversion',
        description: 'The "Heart" of the turbine. X-shape Francis design utilizing both reaction and impulse forces.',
        limits: [
            { label: 'Rated Head', value: '282 m' },
            { label: 'Max Thrust', value: '1200 kN' }
        ]
    },
    shaft_seal: {
        role: 'Leakage Prevention',
        description: 'Multi-stage radial packing system maintaining a precise water film to prevent high-pressure leakage into the machine hall.',
        limits: [
            { label: 'Leakoff Rate', value: '< 15 L/min' },
            { label: 'Seal Water Temp', value: '< 45°C' }
        ]
    },
    hpu: {
        role: 'Actuation Control',
        description: 'Hydraulic Power Unit generating the force required to modulate guide vanes and relief valves via high-pressure oil.',
        limits: [
            { label: 'System Pressure', value: '140 Bar' },
            { label: 'Tank Level', value: '> 65%' }
        ]
    },
    draft_tube: {
        role: 'Pressure Recovery',
        description: 'Diffuser section that converts residual kinetic energy of water leaving the runner back into static pressure.',
        limits: [
            { label: 'Max Vacuum', value: '-0.8 Bar' },
            { label: 'Start Level', value: '84.5 m' }
        ]
    },
    'insp-de-bearing': {
        role: 'Radial Support',
        description: 'Primary guide bearing maintaining rotor concentricity at the Drive End. Oil-lubricated pivoted pad design.',
        limits: [
            { label: 'Max Temp', value: '75°C' },
            { label: 'Clearance', value: '0.15 mm' }
        ]
    },
    'insp-nde-bearing': {
        role: 'Axial/Radial Support',
        description: 'Bottom combination bearing supporting total rotor weight (Thrust) and radial loads.',
        limits: [
            { label: 'Max Thrust Load', value: '180 Ton' },
            { label: 'Alarm Temp', value: '80°C' }
        ]
    },
    'insp-stator': {
        role: 'Power Generation',
        description: 'Stationary armature winding where voltage is induced by the rotating magnetic field.',
        limits: [
            { label: 'Insulation Class', value: 'F' },
            { label: 'Hotspot Limit', value: '120°C' }
        ]
    },
    'insp-rotor': {
        role: 'Magnetic Field Source',
        description: 'Rotating field poles excited by DC current to create the magnetic flux.',
        limits: [
            { label: 'Runaway Speed', value: '750 RPM' },
            { label: 'Air Gap', value: '14 mm' }
        ]
    },
    'insp-lube-oil': {
        role: 'Lubrication & Cooling',
        description: 'High-pressure oil circulation system for bearing film maintenance and heat removal.',
        limits: [
            { label: 'Supply Pressure', value: '6 Bar' },
            { label: 'Filter DP', value: '0.5 Bar' }
        ]
    }
};

export const MechanicalIntelligencePanel: React.FC = () => {
    const { activeAssetId } = useFrancisStore();

    // Default Empty State
    if (!activeAssetId) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50 p-6 text-center border border-dashed border-white/10 rounded-xl m-4">
                <Info className="w-8 h-8 mb-4 opacity-50" />
                <h3 className="text-xs font-black uppercase tracking-widest mb-1">System Standby</h3>
                <p className="text-[10px] font-mono">Select a component from the blueprint to view telemetry.</p>
            </div>
        );
    }

    const info = intelligenceData[activeAssetId as FrancisComponentId];
    if (!info) return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="h-full flex flex-col"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-cyan-500" />
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-300">Mechanical Intelligence</h2>
                </div>
                <div className="px-2 py-1 rounded bg-slate-800 border border-slate-700">
                    <span className="text-[10px] font-mono text-slate-400">ID: {activeAssetId.toUpperCase()}</span>
                </div>
            </div>

            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                {/* ROLE */}
                <section>
                    <div className="flex items-center gap-2 mb-3 text-cyan-400">
                        <Gauge className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Mechanical Role</span>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-xs text-white font-bold mb-2 uppercase tracking-tight text-cyan-500">{info.role}</p>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                            {info.description}
                        </p>
                    </div>
                </section>

                {/* DESIGN LIMITS */}
                <section>
                    <div className="flex items-center gap-2 mb-3 text-amber-400">
                        <ShieldAlert className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Design Boundaries</span>
                    </div>
                    <div className="space-y-2">
                        {info.limits.map((limit, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-950/40 rounded-lg border border-white/5">
                                <span className="text-[10px] text-slate-500 font-bold uppercase">{limit.label}</span>
                                <span className="text-xs font-mono text-amber-500 font-black">{limit.value}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </motion.div>
    );
};
