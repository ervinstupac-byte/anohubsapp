import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck, Zap, ChevronRight, Lock, Printer } from 'lucide-react';
import { WizardService, CommissioningState, MilestoneResult } from '../../lib/commissioning/WizardService';
import { useMaintenance } from '../../contexts/MaintenanceContext';
import { useTelemetryStore } from '../../features/telemetry/store/useTelemetryStore';
import { SovereignCertificate } from './SovereignCertificate';

// Steps: 0: Intro, 1: Alignment, 2: Bearings, 3: Metallurgy, 4: Electrical, 5: Hydraulic, 6: Certificate
const STEPS = [
    { id: 'INTRO', title: 'Commissioning Protocol' },
    { id: 'ALIGNMENT', title: 'Laser Alignment' },
    { id: 'BEARINGS', title: 'Bearing Clearances' },
    { id: 'METALLURGY', title: 'Runner Metallurgy' },
    { id: 'ELECTRICAL', title: 'Insulation Resistance' },
    { id: 'HYDRAULIC', title: 'Hydraulic Tightness' }, // Step 5
    { id: 'CERTIFICATE', title: 'Sovereign Validation' }
];

export const CommissioningWizard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<CommissioningState>({
        alignment: { plumbnessDeviation: 0.02, reshimmed: false },
        bearings: { clearanceTop: 0.15, clearanceBottom: 0.15, clearanceLeft: 0.15, clearanceRight: 0.15, asperityDetected: false },
        metallurgy: { runnerMaterial: '13Cr4Ni', ceramicCoatingApplied: false },
        electrical: { insulationResistance: 500, stabilizationTimeSeconds: 60 },
        hydraulic: { guideVaneGapTopAvg: 0.0, guideVaneGapBottomAvg: 0.0, qualityViolation: false } // NC-160
    });
    const [validationResult, setValidationResult] = useState<MilestoneResult | null>(null);

    // Sync with Maintenance Logs for "Baseline" persistence (NC-150 Requirement)
    const { createLogEntry } = useMaintenance();

    // NC-300: DNA Link - Persist baseline to telemetry store for RCA Engine
    const setBaselineFromWizard = useTelemetryStore(state => state.setBaselineFromWizard);

    const handleNext = async () => {
        let result: MilestoneResult = { success: true, message: 'Ready' };

        // GATEKEEPER LOGIC
        if (currentStep === 1) result = WizardService.validateAlignment(formData.alignment);
        if (currentStep === 2) result = WizardService.validateBearings(formData.bearings);
        if (currentStep === 3) result = WizardService.validateMetallurgy(formData.metallurgy);
        if (currentStep === 4) result = WizardService.validateElectrical(formData.electrical);

        // STEP 5: THE HYDRAULIC TRAP
        if (currentStep === 5) {
            result = WizardService.validateHydraulic(formData.hydraulic);
        }

        setValidationResult(result);

        if (result.success) {
            // Finalize Persistence on last step transition
            if (currentStep === 5) { // Transitioning TO Certificate (Step 6)
                try {
                    // NC-300: Establish DNA Link - Persist baseline to telemetry store
                    setBaselineFromWizard(formData);

                    // Inject "Baseline" into Maintenance Logs
                    await createLogEntry('COMMISSIONING_BASELINE', {
                        technician: 'Sovereign Wizard',
                        commentBS: `Baseline Established: ${WizardService.generateCertificate(formData)}`,
                        measuredValue: 100, // Concept score
                        taskId: 'COMMISSIONING_BASELINE'
                    });
                } catch (e) {
                    console.error("Failed to persist baseline", e);
                }
            }
            setCurrentStep(prev => prev + 1);
        }
    };

    // TRAP LOGIC: Allow forcing past hydraulic error, but mark with SHAME.
    const forceProceedHydraulic = () => {
        setFormData(prev => ({
            ...prev,
            hydraulic: {
                guideVaneGapTopAvg: prev.hydraulic?.guideVaneGapTopAvg || 0,
                guideVaneGapBottomAvg: prev.hydraulic?.guideVaneGapBottomAvg || 0,
                qualityViolation: true
            }
        }));
        setValidationResult({ success: true, message: "Quality Violation Accepted.", werkmeisterTip: "You have chosen compromise. It will be recorded." });
        setTimeout(() => setCurrentStep(prev => prev + 1), 1000); // 1s delay to feel the shame
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-950">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <ShieldCheck className="text-cyan-400" /> Monolit Commissioning Wizard
                        </h2>
                        <p className="text-xs text-slate-400 font-mono mt-1">PROTOCOL NC-150 // UNIT BIRTH CERTIFICATE</p>
                    </div>
                    <div className="flex items-center gap-1">
                        {STEPS.map((step, idx) => (
                            <div key={step.id} className={`h-1.5 w-8 rounded-full ${idx <= currentStep ? 'bg-cyan-500' : 'bg-slate-700'}`} />
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8 overflow-y-auto">

                    {currentStep === 0 && (
                        <div className="text-center space-y-6 py-12">
                            <ShieldCheck className="w-24 h-24 text-cyan-500 mx-auto opacity-80" />
                            <h3 className="text-2xl font-bold text-white">Ready to commission Unit-01?</h3>
                            <p className="text-slate-400 max-w-lg mx-auto">
                                This wizard enforces the "Architect's Standard". You cannot proceed if tolerances are not met.
                                The resulting data will form the <strong>Genetic Baseline</strong> for the RCA Engine.
                            </p>
                            <button onClick={() => setCurrentStep(1)} className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold uppercase tracking-wider transition-colors">
                                Initialize Protocol
                            </button>
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2">1. Laser Alignment (The Laser Gate)</h3>
                            <div className="bg-slate-800 p-6 rounded-lg border border-slate-600">
                                <label className="block text-sm font-bold text-slate-400 mb-2">Plumbness Deviation (mm/m)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.alignment.plumbnessDeviation}
                                    onChange={e => setFormData({ ...formData, alignment: { ...formData.alignment, plumbnessDeviation: parseFloat(e.target.value) } })}
                                    className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded focus:border-cyan-500 outline-none font-mono text-lg"
                                />
                                <p className="text-xs text-slate-500 mt-2">Max allowed: 0.05 mm/m</p>
                            </div>
                            <WerkmeisterTip text="Use the 4-point star torque pattern on the anchor bolts. Thermal growth will NOT fix a bad cold alignment." />
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2">2. Bearing Clearances (The Feeler Gauge Gate)</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {['Top', 'Bottom', 'Left', 'Right'].map(pos => (
                                    <div key={pos} className="bg-slate-800 p-4 rounded border border-slate-600">
                                        <label className="text-xs font-bold text-slate-400 uppercase">{pos} Clearance (mm)</label>
                                        <input
                                            type="number" step="0.01"
                                            value={(formData.bearings as any)[`clearance${pos}`]}
                                            onChange={e => setFormData({ ...formData, bearings: { ...formData.bearings, [`clearance${pos}`]: parseFloat(e.target.value) } })}
                                            className="w-full bg-slate-900 border-none text-white p-2 mt-1 rounded font-mono"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-3 bg-slate-800 p-4 rounded border border-slate-600">
                                <input
                                    type="checkbox"
                                    checked={formData.bearings.asperityDetected}
                                    onChange={e => setFormData({ ...formData, bearings: { ...formData.bearings, asperityDetected: e.target.checked } })}
                                    className="w-5 h-5 accent-red-500"
                                />
                                <span className="text-white font-bold">Asperity/Roughness Detected on Babbitt?</span>
                            </div>
                            <WerkmeisterTip text="A single scratch on the Babbitt now is a wiped bearing in 6 months. Do not accept 'it will bed in'." />
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2">3. Metallurgy (The Ceramic Gate)</h3>
                            <div className="bg-slate-800 p-6 rounded-lg border border-slate-600">
                                <label className="block text-sm font-bold text-slate-400 mb-2">Runner Material</label>
                                <select
                                    value={formData.metallurgy.runnerMaterial}
                                    onChange={e => setFormData({ ...formData, metallurgy: { ...formData.metallurgy, runnerMaterial: e.target.value as any } })}
                                    className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded"
                                >
                                    <option value="13Cr4Ni">Stainless Steel (13Cr4Ni)</option>
                                    <option value="Cast Steel">Cast Steel (Require Coating)</option>
                                    <option value="Bronze">Bronze (Require Coating)</option>
                                </select>
                            </div>

                            {(formData.metallurgy.runnerMaterial === 'Cast Steel' || formData.metallurgy.runnerMaterial === 'Bronze') && (
                                <div className="bg-red-900/20 border border-red-500/50 p-4 rounded animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="flex items-center gap-3 mb-2">
                                        <AlertTriangle className="text-red-500" />
                                        <span className="text-red-200 font-bold">Soft Material Detected. Protection Mandatory.</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={formData.metallurgy.ceramicCoatingApplied}
                                            onChange={e => setFormData({ ...formData, metallurgy: { ...formData.metallurgy, ceramicCoatingApplied: e.target.checked } })}
                                            className="w-5 h-5 accent-cyan-500"
                                        />
                                        <span className="text-white">Confirmed Application of Ceramic Coating (&gt;300µm)</span>
                                    </div>
                                </div>
                            )}
                            <WerkmeisterTip text="Carbon steel in a high-head Francis is suicide. If you don't coat it now, you'll be welding it in December." />
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2">4. Electrical (The Megger Gate)</h3>
                            <div className="bg-slate-800 p-6 rounded-lg border border-slate-600 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 mb-2">Insulation Resistance (MΩ)</label>
                                    <input
                                        type="number"
                                        value={formData.electrical.insulationResistance}
                                        onChange={e => setFormData({ ...formData, electrical: { ...formData.electrical, insulationResistance: parseFloat(e.target.value) } })}
                                        className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded font-mono text-lg"
                                    />
                                </div>
                                <div className="pt-4 border-t border-slate-700">
                                    <label className="block text-sm font-bold text-slate-400 mb-2">Stabilization Time (Seconds)</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range" min="0" max="120"
                                            value={formData.electrical.stabilizationTimeSeconds}
                                            onChange={e => setFormData({ ...formData, electrical: { ...formData.electrical, stabilizationTimeSeconds: parseInt(e.target.value) } })}
                                            className="flex-1 accent-cyan-500"
                                        />
                                        <span className="font-mono text-2xl text-cyan-400 w-16 text-right">{formData.electrical.stabilizationTimeSeconds}s</span>
                                    </div>
                                </div>
                            </div>
                            <WerkmeisterTip text="The reading passes at 100MΩ, but only if it is STABLE for 60 seconds. Capacitance discharge takes time." />
                        </div>
                    )}


                    {/* STEP 5: HYDRAULIC TRAP (NC-160) */}
                    {currentStep === 5 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2">5. Hydraulic Tightness (The Trap)</h3>

                            <div className="bg-slate-800 p-6 rounded-lg border border-slate-600 space-y-4">
                                <p className="text-sm text-slate-400 mb-2">Measure the guide vane end-gaps at closed position.</p>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">AVG. TOP GAP (mm)</label>
                                        <input
                                            type="number" step="0.01"
                                            value={formData.hydraulic?.guideVaneGapTopAvg || 0}
                                            onChange={e => setFormData({
                                                ...formData,
                                                hydraulic: { guideVaneGapTopAvg: parseFloat(e.target.value), guideVaneGapBottomAvg: formData.hydraulic?.guideVaneGapBottomAvg || 0, qualityViolation: false }
                                            })}
                                            className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded font-mono text-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">AVG. BOTTOM GAP (mm)</label>
                                        <input
                                            type="number" step="0.01"
                                            value={formData.hydraulic?.guideVaneGapBottomAvg || 0}
                                            onChange={e => setFormData({
                                                ...formData,
                                                hydraulic: { guideVaneGapBottomAvg: parseFloat(e.target.value), guideVaneGapTopAvg: formData.hydraulic?.guideVaneGapTopAvg || 0, qualityViolation: false }
                                            })}
                                            className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded font-mono text-lg"
                                        />
                                    </div>
                                </div>
                            </div>

                            <WerkmeisterTip text="If the bottom gap is tighter, you are hanging on the bushing. If the top is tighter, you have a levitation risk. They must be equal." />
                        </div>
                    )}

                    {/* STEP 6: CERTIFICATE */}
                    {currentStep === 6 && (
                        <div className="flex flex-col items-center gap-6">
                            <SovereignCertificate data={formData} />

                            <div className="flex justify-center gap-4 mt-4 w-full print:hidden">
                                <button onClick={onClose} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded font-bold">
                                    Return to HMI
                                </button>
                                <button onClick={() => window.print()} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold flex items-center gap-2">
                                    <Printer className="w-4 h-4" /> Print Certificate
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Validation Error Message */}
                    {validationResult && !validationResult.success && currentStep !== 6 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 bg-red-900/20 border-l-4 border-red-500 p-4 animate-in fade-in slide-in-from-bottom-2">
                            <h4 className="text-red-400 font-bold flex items-center gap-2">
                                <Lock className="w-4 h-4" /> Gatekeeper Alert: {validationResult.message}
                            </h4>
                            <p className="text-red-200 mt-1 uppercase text-xs tracking-wider">TOLERANCE EXCEEDED</p>
                            <p className="text-red-300/70 text-sm mt-2 italic">"{validationResult.werkmeisterTip}"</p>

                            {/* THE TRAP BUTTON: Only visible for Step 5 (Hydraulic) errors */}
                            {currentStep === 5 && (
                                <button
                                    onClick={forceProceedHydraulic}
                                    className="mt-4 px-4 py-2 bg-red-800 hover:bg-red-700 text-white text-xs font-bold uppercase rounded flex items-center gap-2 border border-red-500/50"
                                >
                                    <AlertTriangle className="w-3 h-3" /> Force Proceed (Log Violation)
                                </button>
                            )}
                        </motion.div>
                    )}

                </div>

                {/* Footer Controls */}
                {currentStep > 0 && currentStep < 6 && (
                    <div className="p-6 border-t border-slate-700 bg-slate-900 flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Werkmeister's Tip</span>
                            {/* Tips are rendered in the step logic above for context */}
                        </div>
                        <button
                            onClick={handleNext}
                            className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                        >
                            Confirm & Next <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const WerkmeisterTip: React.FC<{ text: string }> = ({ text }) => (
    <div className="mt-6 flex items-start gap-3 bg-amber-900/10 border border-amber-500/30 p-4 rounded">
        <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block mb-1">Werkmeister Field Note</span>
            <p className="text-sm text-amber-200 italic leading-snug">"{text}"</p>
        </div>
    </div>
);
