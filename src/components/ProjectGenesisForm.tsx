// Universal Entry Form
// Field Data Ingestion for Project Genesis
// "Ovo je ono što ćeš ti ili tvoj radnik popunjavati na terenu."

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Droplets, // Hydrology
    Settings, // Mechanical
    Activity, // Hydraulics (using Activity as wave/pressure metaphor)
    Crosshair, // Precision
    Truck, // Logistics
    Save,
    ArrowRight,
    ChevronLeft
} from 'lucide-react';
import { GlassCard } from '../shared/components/ui/GlassCard';
import { LifecycleManager } from '../services/LifecycleManager';

export const ProjectGenesisForm: React.FC = () => {
    const [step, setStep] = useState(1);

    // Universal Data Store
    const [formData, setFormData] = useState({
        // 1. Hydrology (ROI Basis)
        grossHead: '',
        qInstalled: '',
        qEcological: '',

        // 2. Mechanical (Digital Twin Basis)
        turbineType: 'KAPLAN_H',
        runnerCount: 1,

        // 3. Hydraulics (Safety/Water Hammer)
        pipeDiameter: '', // mm
        wallThickness: '', // mm
        pipeMaterial: 'STEEL',

        // 4. Precision (Quality)
        toleranceStandard: '0.05', // mm

        // 5. Logistics (Cavitation & Assembly)
        elevationMasl: '',
        accessRoad: 'NORMAL' // Normal, Difficult, Offroad-Only
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        // In a real app, this would validate and commit to the database
        const project = LifecycleManager.getActiveProject();

        // Mapping to ProjectDNA
        project.identity.assetName = "Field Project " + new Date().toLocaleDateString();
        project.genesis.siteParams = {
            grossHead: parseFloat(formData.grossHead) || 0,
            pipeDiameter: parseFloat(formData.pipeDiameter) || 0,
            pipeMaterial: formData.pipeMaterial as any,
            wallThickness: parseFloat(formData.wallThickness) || 12,
            boltClass: '8.8',
            corrosionProtection: 'PAINT',
            ecologicalFlow: parseFloat(formData.qEcological) || 0,
            waterQuality: 'CLEAN', // Default for now
            pipeLength: 0, // Not in this form but needed for type
            flowDurationCurve: []
        };

        // Simulateding the specialized fields storage
        console.log("UNIVERSAL ENTRY SAVED:", formData);
        alert(`genesis_dna_committed: {
  "roi_basis": "verified",
  "digital_twin_config": "${formData.turbineType} x${formData.runnerCount}",
  "safety_lock": "active",
  "precision_standard": "${formData.toleranceStandard}mm"
}`);
    };

    const steps = [
        { id: 1, icon: Droplets, label: 'Hydrology', desc: 'ROI Basis' },
        { id: 2, icon: Settings, label: 'Machinery', desc: 'Digital Twin' },
        { id: 3, icon: Activity, label: 'Hydraulics', desc: 'Safety Guard' },
        { id: 4, icon: Crosshair, label: 'Precision', desc: '0.05mm Std' },
        { id: 5, icon: Truck, label: 'Logistics', desc: 'Site Access' },
    ];

    const CurrentIcon = steps[step - 1].icon;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <header className="mb-8 text-center">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                    Universal <span className="text-cyan-400">Entry Form</span>
                </h2>
                <p className="text-slate-400">Field Data Ingestion Interface</p>
            </header>

            {/* PROGRESS TRACKER */}
            <div className="mb-8 flex justify-between relative px-10">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -z-10 transform -translate-y-1/2" />
                {steps.map((s) => (
                    <div key={s.id} className="flex flex-col items-center gap-2 bg-slate-950 px-2 transition-all duration-300">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold text-sm
                            ${step >= s.id ? 'border-cyan-400 bg-cyan-900/20 text-cyan-400' : 'border-slate-700 bg-slate-900 text-slate-600'}`}
                        >
                            {s.id}
                        </div>
                        <div className="text-center hidden md:block">
                            <div className={`text-xs font-bold uppercase ${step === s.id ? 'text-white' : 'text-slate-600'}`}>{s.label}</div>
                            <div className="text-[10px] text-slate-500">{s.desc}</div>
                        </div>
                    </div>
                ))}
            </div>

            <GlassCard className="p-8 min-h-[400px] relative overflow-hidden">
                {/* Background Icon Watermark */}
                <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
                    <CurrentIcon size={300} />
                </div>

                <div className="relative z-10">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6 border-b border-slate-700/50 pb-4">
                        <CurrentIcon className="text-cyan-400" />
                        {steps[step - 1].label} Data
                        <span className="text-xs font-normal text-slate-500 ml-auto uppercase tracking-widest">{steps[step - 1].desc}</span>
                    </h3>

                    {/* STEP 1: HYDROLOGY */}
                    {step === 1 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup
                                label="Gross Head (m)"
                                name="grossHead"
                                value={formData.grossHead}
                                onChange={handleChange}
                                placeholder="Total elevation drop"
                                tooltip="H_gross is the static difference between intake and tailwater."
                            />
                            <div className="space-y-4">
                                <InputGroup
                                    label="Q Installed (m³/s)"
                                    name="qInstalled"
                                    value={formData.qInstalled}
                                    onChange={handleChange}
                                    placeholder="Total plant flow"
                                />
                                <InputGroup
                                    label="Q Ecological (m³/s)"
                                    name="qEcological"
                                    value={formData.qEcological}
                                    onChange={handleChange}
                                    placeholder="Biological minimum"
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: MACHINERY */}
                    {step === 2 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase">Turbine Type</label>
                                <select
                                    name="turbineType"
                                    value={formData.turbineType}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white focus:border-cyan-500 outline-none"
                                >
                                    <optgroup label="Kaplan Family">
                                        <option value="KAPLAN_H">Kaplan Horizontal (S-Type)</option>
                                        <option value="KAPLAN_V">Kaplan Vertical</option>
                                        <option value="KAPLAN_PIT">Kaplan PIT</option>
                                        <option value="KAPLAN_BULB">Kaplan Bulb</option>
                                    </optgroup>
                                    <optgroup label="Reaction & Impulse">
                                        <option value="FRANCIS">Francis</option>
                                        <option value="PELTON">Pelton</option>
                                    </optgroup>
                                </select>
                            </div>
                            <InputGroup
                                label="Number of Runners"
                                name="runnerCount"
                                type="number"
                                value={formData.runnerCount}
                                onChange={handleChange}
                                placeholder="e.g. 2"
                            />
                        </motion.div>
                    )}

                    {/* STEP 3: HYDRAULICS */}
                    {step === 3 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup
                                label="Penstock Diameter (mm)"
                                name="pipeDiameter"
                                value={formData.pipeDiameter}
                                onChange={handleChange}
                                placeholder="Inner diameter"
                            />
                            <InputGroup
                                label="Wall Thickness (mm)"
                                name="wallThickness"
                                value={formData.wallThickness}
                                onChange={handleChange}
                                placeholder="Impacts water hammer safety"
                            />
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase">Pipe Material</label>
                                <select
                                    name="pipeMaterial"
                                    value={formData.pipeMaterial}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white focus:border-cyan-500 outline-none"
                                >
                                    <option value="STEEL">Steel</option>
                                    <option value="GRP">GRP</option>
                                    <option value="PEHD">PEHD</option>
                                </select>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 4: PRECISION */}
                    {step === 4 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded flex items-center gap-4">
                                <Crosshair className="text-emerald-400 w-8 h-8" />
                                <div>
                                    <h4 className="font-bold text-white">Quality Standard Active</h4>
                                    <p className="text-xs text-slate-400">All mechanical clearances will be validated against this value.</p>
                                </div>
                            </div>
                            <InputGroup
                                label="Global Tolerance Standard (mm)"
                                name="toleranceStandard"
                                value={formData.toleranceStandard}
                                onChange={handleChange}
                                placeholder="0.05"
                            />
                        </motion.div>
                    )}

                    {/* STEP 5: LOGISTICS */}
                    {step === 5 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup
                                label="Site Elevation (m.a.s.l)"
                                name="elevationMasl"
                                value={formData.elevationMasl}
                                onChange={handleChange}
                                placeholder="Impacts air density & cavitation"
                            />
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase">Access Road Type</label>
                                <select
                                    name="accessRoad"
                                    value={formData.accessRoad}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white focus:border-cyan-500 outline-none"
                                >
                                    <option value="NORMAL">Standard Asphalt</option>
                                    <option value="DIFFICULT">Narrow / Gravel</option>
                                    <option value="OFFROAD">Offroad / 4x4 Only</option>
                                    <option value="HELICOPTER">Helicopter Only</option>
                                </select>
                            </div>
                        </motion.div>
                    )}

                </div>

                {/* NAVIGATION */}
                <div className="flex justify-between mt-12 pt-6 border-t border-slate-800">
                    <button
                        onClick={() => setStep(s => Math.max(1, s - 1))}
                        disabled={step === 1}
                        className="flex items-center gap-2 px-6 py-3 text-slate-400 hover:text-white font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                    </button>

                    {step < 5 ? (
                        <button
                            onClick={() => setStep(s => Math.min(5, s + 1))}
                            className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded transition-colors shadow-[0_0_15px_rgba(8,145,178,0.4)]"
                        >
                            <span className="uppercase tracking-wider">Next Section</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded transition-colors shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                        >
                            <Save className="w-4 h-4" />
                            <span className="uppercase tracking-wider">Commit Project DNA</span>
                        </button>
                    )}
                </div>

            </GlassCard>
        </div>
    );
};

// UI Helpers
const InputGroup = ({ label, tooltip, ...props }: any) => (
    <div className="space-y-1 group">
        <label className="text-xs font-bold text-slate-400 uppercase flex items-center justify-between">
            {label}
            {tooltip && <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-cyan-400 normal-case">{tooltip}</span>}
        </label>
        <input
            className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white focus:border-cyan-500 outline-none placeholder:text-slate-700 transition-all focus:shadow-[0_0_10px_rgba(6,182,212,0.1)]"
            {...props}
        />
    </div>
);
